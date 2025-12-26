from rest_framework import generics, filters, status
from rest_framework.decorators import api_view, permission_classes, parser_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.exceptions import NotFound
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from .models import NannyProfile
from .serializer import NannyProfileSerializer
from bookings.models import Booking
from reviews.models import Review
from django.db.models import Q, Avg
import json

class NannyListView(generics.ListAPIView):
    """
    Vista para listar todas las niñeras verificadas.
    
    Filtrado por:
    - search: Busca en nombre, apellido y descripción
    - max_rate: Filtra por tarifa máxima por hora
    - min_experience: Filtra por años mínimos de experiencia
    - verified: Filtra por niñeras verificadas (por defecto True)
    - ordering: Ordena por tarifa, calificación o años de experiencia
    """
    serializer_class = NannyProfileSerializer
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['user__first_name', 'user__last_name', 'description']
    ordering_fields = ['hourly_rate', 'rating_avg', 'experience_years']

    def get_queryset(self):
        queryset = NannyProfile.objects.all().select_related('user')
        
        # Filtro por verificación (por defecto solo verificadas)
        verified = self.request.query_params.get('verified', 'true')
        if verified.lower() in ['true', '1', 'yes']:
            queryset = queryset.filter(verified=True)
        
        # Filtro por tarifa máxima
        max_rate = self.request.query_params.get('max_rate', None)
        if max_rate:
            try:
                queryset = queryset.filter(hourly_rate__lte=float(max_rate))
            except ValueError:
                pass
        
        # Filtro por experiencia mínima
        min_experience = self.request.query_params.get('min_experience', None)
        if min_experience:
            try:
                queryset = queryset.filter(experience_years__gte=int(min_experience))
            except ValueError:
                pass
        
        return queryset

class NannyDetailView(generics.RetrieveAPIView):
    """Vista para obtener los detalles de una niñera específica."""
    queryset = NannyProfile.objects.filter(verified=True)
    serializer_class = NannyProfileSerializer
    
    def get_object(self):
        try:
            return super().get_object()
        except NannyProfile.DoesNotExist:
            raise NotFound("Niñera no encontrada o no verificada.")


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def nanny_dashboard(request):
    """Endpoint para obtener datos del dashboard de la niñera."""
    try:
        # Verificar que el usuario tiene rol de niñera
        if request.user.role != 'nanny':
            return Response(
                {'error': 'Solo las niñeras pueden acceder a este dashboard'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Obtener o crear el perfil de niñera
        try:
            nanny = NannyProfile.objects.get(user=request.user)
        except NannyProfile.DoesNotExist:
            # Crear perfil automáticamente si no existe
            nanny = NannyProfile.objects.create(
                user=request.user,
                experience_years=0,
                hourly_rate=10000,  # Tarifa por defecto
                description='',
                verified=False
            )
        
        from datetime import datetime, timedelta
        from django.utils import timezone
        
        # Bookings activos
        active_bookings = Booking.objects.filter(
            nanny=nanny.user,
            status__in=['pending', 'confirmed']
        ).count()
        
        # Bookings completados
        completed_bookings = Booking.objects.filter(
            nanny=nanny.user,
            status='completed'
        ).count()
        
        # Rating promedio
        reviews = Review.objects.filter(nanny=nanny)
        avg_rating = reviews.aggregate(Avg('rating'))['rating__avg'] or 0
        
        # Próximas reservas
        upcoming_bookings = Booking.objects.filter(
            nanny=nanny.user,
            status__in=['pending', 'confirmed']
        ).order_by('start_time')[:5].values(
            'id', 'parent__first_name', 'parent__last_name',
            'start_time', 'end_time', 'status'
        )
        
        # Reseñas recientes
        recent_reviews = reviews.order_by('-created_at')[:5].values(
            'id', 'rating', 'comment', 'parent__first_name',
            'created_at'
        )
        
        # Calcular ingresos reales basados en horas trabajadas
        completed_bookings_query = Booking.objects.filter(
            nanny=nanny.user,
            status='completed'
        ).select_related('parent')
        
        # Ingresos totales
        total_earnings = 0
        for booking in completed_bookings_query:
            if booking.start_time and booking.end_time:
                hours = (booking.end_time - booking.start_time).total_seconds() / 3600
                total_earnings += hours * nanny.hourly_rate
        
        # Ingresos del mes actual
        now = timezone.now()
        start_of_month = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        this_month_bookings = completed_bookings_query.filter(
            start_time__gte=start_of_month
        )
        
        this_month_earnings = 0
        for booking in this_month_bookings:
            if booking.start_time and booking.end_time:
                hours = (booking.end_time - booking.start_time).total_seconds() / 3600
                this_month_earnings += hours * nanny.hourly_rate
        
        # Desglose mensual completo (todo el historial)
        # Obtener fecha del primer booking
        first_booking = completed_bookings_query.order_by('start_time').first()
        
        monthly_earnings = []
        if first_booking and first_booking.start_time:
            # Calcular desde el primer mes con bookings hasta hoy
            start_date = first_booking.start_time.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
            current_month = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
            
            # Iterar mes por mes
            month_cursor = current_month
            months_data = []
            
            while month_cursor >= start_date:
                month_end = (month_cursor.replace(day=28) + timedelta(days=4)).replace(day=1) - timedelta(seconds=1)
                
                month_bookings = completed_bookings_query.filter(
                    start_time__gte=month_cursor,
                    start_time__lte=month_end
                )
                
                month_total = 0
                month_booking_count = 0
                for booking in month_bookings:
                    if booking.start_time and booking.end_time:
                        hours = (booking.end_time - booking.start_time).total_seconds() / 3600
                        month_total += hours * nanny.hourly_rate
                        month_booking_count += 1
                
                months_data.append({
                    'month': month_cursor.strftime('%B %Y'),  # Incluir año para mayor claridad
                    'amount': int(month_total),
                    'bookings': month_booking_count
                })
                
                # Retroceder un mes
                if month_cursor.month == 1:
                    month_cursor = month_cursor.replace(year=month_cursor.year - 1, month=12)
                else:
                    month_cursor = month_cursor.replace(month=month_cursor.month - 1)
            
            # Invertir para tener orden cronológico (más antiguo primero)
            monthly_earnings = list(reversed(months_data))
        
        dashboard_data = {
            'nanny': {
                'name': f"{request.user.first_name} {request.user.last_name}".strip() or request.user.username,
                'avatar': ''.join([
                    (request.user.first_name[0].upper() if request.user.first_name else 'N'),
                    (request.user.last_name[0].upper() if request.user.last_name else 'N')
                ]),
                'memberSince': nanny.user.date_joined.isoformat(),
                'rating': float(avg_rating),
                'hourlyRate': nanny.hourly_rate,
            },
            'stats': {
                'activeBookings': active_bookings,
                'completedBookings': completed_bookings,
                'totalReviews': reviews.count(),
                'avgRating': float(avg_rating),
            },
            'upcomingBookings': list(upcoming_bookings),
            'recentReviews': list(recent_reviews),
            'earnings': {
                'thisMonth': int(this_month_earnings),
                'total': int(total_earnings),
                'monthly': monthly_earnings,
            }
        }
        
        return Response(dashboard_data, status=status.HTTP_200_OK)
        
    except Exception as e:
        import traceback
        return Response(
            {
                'error': f'Error en dashboard: {str(e)}',
                'traceback': traceback.format_exc()
            },
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET', 'PUT', 'PATCH'])
@permission_classes([IsAuthenticated])
@parser_classes([MultiPartParser, FormParser, JSONParser])
def nanny_profile(request):
    """
    Endpoint para obtener y actualizar el perfil de niñera.
    GET: Obtiene el perfil completo
    PUT/PATCH: Actualiza el perfil (soporta multipart/form-data para archivos)
    """
    try:
        # Verificar que el usuario tiene rol de niñera
        if request.user.role != 'nanny':
            return Response(
                {'error': 'Solo las niñeras pueden acceder a este perfil'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Obtener o crear el perfil de niñera
        try:
            nanny = NannyProfile.objects.get(user=request.user)
        except NannyProfile.DoesNotExist:
            # Crear perfil automáticamente si no existe
            nanny = NannyProfile.objects.create(
                user=request.user,
                experience_years=0,
                hourly_rate=10000,
                description='',
                verified=False
            )
        
        if request.method == 'GET':
            serializer = NannyProfileSerializer(nanny)
            return Response(serializer.data, status=status.HTTP_200_OK)
        
        elif request.method in ['PUT', 'PATCH']:
            partial = request.method == 'PATCH'
            
            # Debug: Ver qué datos llegan
            print("=== DEBUG NANNY PROFILE UPDATE ===")
            print("request.data:", dict(request.data))
            print("request.FILES:", dict(request.FILES))
            print("Content-Type:", request.content_type)
            
            # Preparar datos para el serializer, convirtiendo valores numéricos
            data_to_update = {}
            for key, value in request.data.items():
                print(f"Processing {key}: {value} (type: {type(value)})")
                
                # Convertir valores numéricos apropiadamente
                if key in ['hourly_rate', 'experience_years']:
                    try:
                        # Asegurar que sea un entero positivo
                        converted = int(value) if value != '' else 0
                        data_to_update[key] = max(0, converted)  # No permitir negativos
                    except (ValueError, TypeError) as e:
                        print(f"Error converting {key}: {e}")
                        data_to_update[key] = 0
                elif key == 'age':
                    try:
                        data_to_update[key] = int(value) if value not in ['', None] else None
                    except (ValueError, TypeError):
                        data_to_update[key] = None
                elif key in ['first_name', 'last_name', 'description', 'certifications']:
                    # Asegurar que sean strings
                    data_to_update[key] = str(value) if value is not None else ''
                else:
                    data_to_update[key] = value
            
            # Agregar archivos si existen
            if request.FILES:
                data_to_update.update(request.FILES)
            
            print("data_to_update después de procesar:", data_to_update)
            
            try:
                serializer = NannyProfileSerializer(nanny, data=data_to_update, partial=partial)
                
                if serializer.is_valid():
                    updated_profile = serializer.save()
                    print("Perfil actualizado exitosamente:", updated_profile.id)
                    return Response(serializer.data, status=status.HTTP_200_OK)
                
                print("Serializer errors:", serializer.errors)
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            except Exception as serializer_error:
                print(f"Error en serializer: {str(serializer_error)}")
                import traceback
                print(traceback.format_exc())
                raise
    
    except Exception as e:
        import traceback
        return Response(
            {
                'error': f'Error al actualizar perfil: {str(e)}',
                'traceback': traceback.format_exc()
            },
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def verify_nanny(request, nanny_id):
    """
    Endpoint para verificar una niñera.
    Solo accesible para administradores.
    """
    # Verificar que el usuario es admin
    if not request.user.is_staff:
        return Response(
            {'error': 'Solo los administradores pueden verificar niñeras'},
            status=status.HTTP_403_FORBIDDEN
        )
    
    try:
        nanny = NannyProfile.objects.get(id=nanny_id)
        nanny.verified = True
        nanny.save()
        
        serializer = NannyProfileSerializer(nanny)
        return Response({
            'message': f'Niñera {nanny.user.username} verificada exitosamente',
            'data': serializer.data
        }, status=status.HTTP_200_OK)
    
    except NannyProfile.DoesNotExist:
        return Response(
            {'error': 'Niñera no encontrada'},
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        return Response(
            {'error': f'Error al verificar niñera: {str(e)}'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def unverify_nanny(request, nanny_id):
    """
    Endpoint para quitar verificación a una niñera.
    Solo accesible para administradores.
    """
    # Verificar que el usuario es admin
    if not request.user.is_staff:
        return Response(
            {'error': 'Solo los administradores pueden quitar verificaciones'},
            status=status.HTTP_403_FORBIDDEN
        )
    
    try:
        nanny = NannyProfile.objects.get(id=nanny_id)
        nanny.verified = False
        nanny.save()
        
        serializer = NannyProfileSerializer(nanny)
        return Response({
            'message': f'Verificación de {nanny.user.username} removida',
            'data': serializer.data
        }, status=status.HTTP_200_OK)
    
    except NannyProfile.DoesNotExist:
        return Response(
            {'error': 'Niñera no encontrada'},
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        return Response(
            {'error': f'Error al quitar verificación: {str(e)}'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
