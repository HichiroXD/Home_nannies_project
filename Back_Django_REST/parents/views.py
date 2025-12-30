from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import api_view, permission_classes, parser_classes
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
import logging
from .models import ParentProfile, Child
from .serializer import ParentProfileSerializer, ChildSerializer, ChildCreateUpdateSerializer

logger = logging.getLogger(__name__)


class ParentProfileDetailView(generics.RetrieveUpdateAPIView):
    """Vista para ver y actualizar el perfil de padre del usuario autenticado"""
    serializer_class = ParentProfileSerializer
    permission_classes = [IsAuthenticated]
    
    def get_object(self):
        return self.request.user.parent_profile


@api_view(['GET', 'PUT', 'PATCH'])
@permission_classes([IsAuthenticated])
@parser_classes([MultiPartParser, FormParser, JSONParser])
def parent_profile(request):
    """
    Endpoint para obtener y actualizar el perfil de padre.
    GET: Obtiene el perfil completo
    PUT/PATCH: Actualiza el perfil (soporta multipart/form-data para archivos)
    """
    try:
        parent = ParentProfile.objects.get(user=request.user)
    except ParentProfile.DoesNotExist:
        return Response(
            {'error': 'No tienes un perfil de padre'},
            status=status.HTTP_404_NOT_FOUND
        )
    
    if request.method == 'GET':
        serializer = ParentProfileSerializer(parent)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    elif request.method in ['PUT', 'PATCH']:
        partial = request.method == 'PATCH'
        
        # Preparar datos para el serializer
        data_to_update = {}
        for key, value in request.data.items():
            # Saltar archivos, se manejarán después desde request.FILES
            if key == 'profile_photo':
                continue
                
            # Extraer el primer elemento si viene como lista
            if isinstance(value, list) and len(value) > 0:
                value = value[0]
            elif isinstance(value, list):
                value = ''
            
            # Convertir children_count apropiadamente
            if key == 'children_count':
                try:
                    data_to_update[key] = int(value) if value != '' else 1
                except (ValueError, TypeError):
                    data_to_update[key] = 1
            # Ignorar campos que pertenecen al usuario (se manejan aparte)
            elif key in ['first_name', 'last_name']:
                setattr(request.user, key, value)
            # Limpiar phone si está vacío para evitar error de validación
            elif key == 'phone':
                if value == '' or value == 'null' or value == 'undefined' or value is None:
                    data_to_update[key] = None
                else:
                    data_to_update[key] = value
            else:
                data_to_update[key] = value
        
        # Guardar cambios del usuario
        try:
            request.user.save()
        except Exception as e:
            logger.error(f"Error guardando usuario: {str(e)}")
            return Response(
                {'error': 'Error al actualizar información del usuario'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
        
        # Agregar archivos si existen
        if request.FILES:
            for key, file in request.FILES.items():
                if isinstance(file, list) and len(file) > 0:
                    data_to_update[key] = file[0]
                else:
                    data_to_update[key] = file
        
        serializer = ParentProfileSerializer(parent, data=data_to_update, partial=partial)
        
        if serializer.is_valid():
            try:
                serializer.save()
                logger.info(f"Perfil de padre actualizado: {request.user.username}")
                return Response(serializer.data, status=status.HTTP_200_OK)
            except Exception as e:
                logger.error(f"Error al guardar perfil: {str(e)}")
                return Response(
                    {'error': 'Error al guardar el perfil'}, 
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )
        
        logger.error(f"Errores de validación en perfil de padre: {serializer.errors}")
        error_detail = {
            'errors': serializer.errors,
            'message': 'Error de validación en los campos',
            'fields': list(serializer.errors.keys())
        }
        return Response(error_detail, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def parent_dashboard(request):
    """
    Endpoint para obtener datos del dashboard de padre.
    Retorna: perfil, hijos, bookings, estadísticas y actividades
    """
    try:
        from bookings.models import Booking
        from nannies.models import NannyProfile
        from .models import Child
        from datetime import datetime
        from django.utils import timezone
        
        # Obtener perfil de padre
        try:
            parent = ParentProfile.objects.get(user=request.user)
        except ParentProfile.DoesNotExist:
            return Response(
                {'error': 'No tienes un perfil de padre'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Obtener hijos
        children = Child.objects.filter(parent=parent)
        kids_data = []
        for child in children:
            kids_data.append({
                'id': child.id,
                'name': child.name,
                'age': child.age,
                'gender': child.gender,
                'image': None,
                'interests': []
            })
        
        # Obtener bookings - El modelo Booking usa User directamente, no ParentProfile
        bookings = Booking.objects.filter(parent=request.user).order_by('-created_at')
        bookings_data = []
        for booking in bookings[:10]:
            bookings_data.append({
                'id': booking.id,
                'nannyName': booking.nanny.get_full_name() or booking.nanny.username,
                'nannyImage': None,
                'date': booking.start_time.strftime('%Y-%m-%d'),
                'startTime': booking.start_time.strftime('%H:%M'),
                'endTime': booking.end_time.strftime('%H:%M'),
                'kids': [child.name for child in children],
                'status': booking.status,
                'rating': None,
            })
        
        # Calcular estadísticas
        total_bookings = bookings.count()
        active_bookings = bookings.filter(status__in=['pending', 'confirmed']).count()
        upcoming_bookings = bookings.filter(
            status='confirmed',
            start_time__gt=timezone.now()
        ).count()
        
        # Calcular gasto total
        total_spent = 0.0
        for booking in bookings.filter(status='completed'):
            try:
                nanny_profile = NannyProfile.objects.get(user=booking.nanny)
                hours = (booking.end_time - booking.start_time).total_seconds() / 3600
                total_spent += hours * (nanny_profile.hourly_rate or 0)
            except NannyProfile.DoesNotExist:
                pass
        
        # Construir respuesta
        data = {
            'user': {
                'name': request.user.get_full_name() or request.user.username,
                'avatar': request.user.first_name[:2].upper() if request.user.first_name else 'PA',
                'memberSince': parent.created_at.strftime('%Y-%m-%d'),
            },
            'stats': {
                'totalSpent': total_spent,
                'activeBookings': active_bookings,
                'upcomingBookings': upcoming_bookings,
                'savedNannies': 0,
            },
            'kids': kids_data,
            'bookings': bookings_data,
            'payments': [],
            'activities': [],
        }
        
        return Response(data, status=status.HTTP_200_OK)
        
    except Exception as e:
        logger.error(f"Error en parent_dashboard: {str(e)}")
        import traceback
        logger.error(traceback.format_exc())
        return Response(
            {'error': f'Error al cargar dashboard: {str(e)}'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


# ============================================
# CRUD DE CHILDREN (HIJOS)
# ============================================

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def children_list_create(request):
    """
    GET: Lista todos los hijos del padre autenticado
    POST: Crea un nuevo hijo para el padre autenticado
    """
    try:
        parent = ParentProfile.objects.get(user=request.user)
    except ParentProfile.DoesNotExist:
        return Response(
            {'error': 'No tienes un perfil de padre'},
            status=status.HTTP_404_NOT_FOUND
        )
    
    if request.method == 'GET':
        children = Child.objects.filter(parent=parent).order_by('age')
        serializer = ChildSerializer(children, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    elif request.method == 'POST':
        serializer = ChildCreateUpdateSerializer(data=request.data)
        if serializer.is_valid():
            # Asignar automáticamente el parent del usuario autenticado
            serializer.save(parent=parent)
            logger.info(f"Hijo creado para {request.user.username}: {serializer.data['name']}")
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        
        logger.error(f"Error al crear hijo: {serializer.errors}")
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET', 'PUT', 'PATCH', 'DELETE'])
@permission_classes([IsAuthenticated])
def child_detail(request, child_id):
    """
    GET: Obtiene los detalles de un hijo específico
    PUT/PATCH: Actualiza la información de un hijo
    DELETE: Elimina un hijo
    """
    try:
        parent = ParentProfile.objects.get(user=request.user)
    except ParentProfile.DoesNotExist:
        return Response(
            {'error': 'No tienes un perfil de padre'},
            status=status.HTTP_404_NOT_FOUND
        )
    
    try:
        child = Child.objects.get(id=child_id, parent=parent)
    except Child.DoesNotExist:
        return Response(
            {'error': 'Hijo no encontrado o no tienes permiso para acceder'},
            status=status.HTTP_404_NOT_FOUND
        )
    
    if request.method == 'GET':
        serializer = ChildSerializer(child)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    elif request.method in ['PUT', 'PATCH']:
        partial = request.method == 'PATCH'
        serializer = ChildCreateUpdateSerializer(child, data=request.data, partial=partial)
        if serializer.is_valid():
            serializer.save()
            logger.info(f"Hijo actualizado: {child.name} (ID: {child.id})")
            # Retornar con todos los campos incluyendo parent
            response_serializer = ChildSerializer(child)
            return Response(response_serializer.data, status=status.HTTP_200_OK)
        
        logger.error(f"Error al actualizar hijo: {serializer.errors}")
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    elif request.method == 'DELETE':
        child_name = child.name
        child.delete()
        logger.info(f"Hijo eliminado: {child_name} (ID: {child_id})")
        return Response(
            {'message': f'Hijo {child_name} eliminado correctamente'},
            status=status.HTTP_204_NO_CONTENT
        )
