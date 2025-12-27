from django.core.mail import send_mail
from django.contrib.sites.shortcuts import get_current_site
from django.contrib.auth import authenticate
from django.contrib.auth.tokens import default_token_generator
from django.urls import reverse
from django.utils.decorators import method_decorator
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes, force_str
from django.template.loader import render_to_string
from django.views.decorators.csrf import csrf_exempt
from django.conf import settings
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAdminUser, AllowAny
from rest_framework.pagination import PageNumberPagination
from rest_framework.throttling import AnonRateThrottle, UserRateThrottle
from rest_framework_simplejwt.tokens import RefreshToken
from .models import User
from .serializer import RegisterSerializer, UserSerializer, UserListSerializer, LoginSerializer
from .tokens import account_activation_token


# Rate limiting classes para proteger endpoints sensibles
class LoginRateThrottle(AnonRateThrottle):
    """
    Rate limit para login: 5 intentos por minuto para usuarios anónimos.
    Protege contra ataques de fuerza bruta.
    """
    rate = '5/minute'


class RegisterRateThrottle(AnonRateThrottle):
    """
    Rate limit para registro: 3 registros por hora para prevenir spam.
    """
    rate = '3/hour'

# Vista para registrar nuevos usuarios
@method_decorator(csrf_exempt, name='dispatch')
class RegisterView(generics.CreateAPIView):
    """
    Vista para registrar nuevos usuarios.
    
    POST:
    - Crea un nuevo usuario con rol (parent o nanny)
    - El usuario se crea sin verificar
    - Envía un correo con enlace de verificación
    - El enlace es válido por 24 horas
    
    Rate Limiting:
    - 3 registros por hora para prevenir spam y cuentas falsas masivas
    - Retorna 429 Too Many Requests si se excede el límite
    """
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]
    throttle_classes = [RegisterRateThrottle]

    def perform_create(self, serializer):
        # Se crea el usuario, pero no verificado
        user = serializer.save(is_verified=False, pending_verification=True)

        # Generar token de verificación
        token = default_token_generator.make_token(user)
        uid = urlsafe_base64_encode(force_bytes(user.pk))
        verify_url = f"{settings.FRONTEND_URL}/verify/{uid}/{token}/"

        # Enviar correo (falla silenciosamente en desarrollo si no hay SMTP configurado)
        try:
            send_mail(
                subject="Verifica tu cuenta en Home Nannies",
                message=f"Hola {user.username}, haz clic en el siguiente enlace para verificar tu cuenta:\n\n{verify_url}\n\nGracias por unirte a Home Nannies!",
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[user.email],
                fail_silently=False,
            )
        except Exception as e:
            # Log el error pero no fallar el registro
            import logging
            logger = logging.getLogger(__name__)
            logger.warning(f"Error enviando correo de verificación a {user.email}: {str(e)}")
            # En desarrollo con console backend, esto puede fallar pero no importa

        return user

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            self.perform_create(serializer)
            return Response(
                {"detail": "✅ Usuario registrado. Revisa tu correo para verificar tu cuenta."},
                status=status.HTTP_201_CREATED
            )
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)    

# Vista para login de usuarios
class LoginView(APIView):
    """
    Vista para autenticación de usuarios.
    
    POST:
    - Autentica con username y password
    - Retorna tokens JWT (access y refresh)
    - Solo funciona si la cuenta está verificada
    - Retorna 401 si credenciales son inválidas
    - Retorna 403 si la cuenta no está verificada
    
    Rate Limiting:
    - 5 intentos por minuto para prevenir ataques de fuerza bruta
    - Retorna 429 Too Many Requests si se excede el límite
    """
    permission_classes = [AllowAny]
    throttle_classes = [LoginRateThrottle]
    serializer_class = LoginSerializer

    def post(self, request):
        from .models import LoginHistory
        
        serializer = self.serializer_class(data=request.data)
        serializer.is_valid(raise_exception=True)

        username = serializer.validated_data["username"]
        password = serializer.validated_data["password"]
        
        # Obtener información del request
        ip_address = request.META.get('HTTP_X_FORWARDED_FOR', request.META.get('REMOTE_ADDR', ''))
        if ip_address:
            ip_address = ip_address.split(',')[0].strip()
        user_agent = request.META.get('HTTP_USER_AGENT', '')
        
        user = authenticate(username=username, password=password)

        if user is None or not user.is_active:
            # Registrar intento fallido
            try:
                failed_user = User.objects.filter(username=username).first()
                if failed_user:
                    LoginHistory.objects.create(
                        user=failed_user,
                        ip_address=ip_address or '0.0.0.0',
                        user_agent=user_agent,
                        login_successful=False,
                        failure_reason="Credenciales inválidas o usuario inactivo"
                    )
            except Exception as e:
                print(f"Error al registrar login fallido: {e}")
            
            return Response({"detail": "Credenciales inválidas"}, status=status.HTTP_401_UNAUTHORIZED)

        if not user.is_verified:
            # Registrar intento fallido por cuenta no verificada
            LoginHistory.objects.create(
                user=user,
                ip_address=ip_address or '0.0.0.0',
                user_agent=user_agent,
                login_successful=False,
                failure_reason="Cuenta no verificada"
            )
            return Response({"detail": "Cuenta no verificada"}, status=status.HTTP_403_FORBIDDEN)

        # Registrar login exitoso
        try:
            LoginHistory.objects.create(
                user=user,
                ip_address=ip_address or '0.0.0.0',
                user_agent=user_agent,
                login_successful=True
            )
            # Actualizar último IP del usuario
            user.last_login_ip = ip_address
            user.save(update_fields=['last_login_ip'])
        except Exception as e:
            print(f"Error al registrar login exitoso: {e}")

        refresh = RefreshToken.for_user(user)
        return Response({
            "refresh": str(refresh),
            "access": str(refresh.access_token),
            "username": user.username,
            "role": user.role
        })
    
# Perfil del usuario autenticado
class UserMeView(APIView):
    """
    Vista para obtener y actualizar el perfil del usuario autenticado.
    
    GET:
    - Retorna los datos del usuario autenticado
    
    PUT:
    - Actualiza solo email y username del usuario
    - Solo puede actualizar su propio perfil
    """
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)

    def put(self, request):
        allowed_fields = {"email", "username"}
        update_data = {k: v for k, v in request.data.items() if k in allowed_fields}
        serializer = UserSerializer(request.user, data=update_data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# Vista para listar todos los usuarios y gestión de usuarios (solo para administradores)
class UserListView(generics.ListAPIView):
    """
    Vista para listar todos los usuarios (solo administradores).
    Incluye paginación para manejar grandes cantidades de usuarios.
    """
    queryset = User.objects.all().order_by('id')
    serializer_class = UserListSerializer
    permission_classes = [IsAdminUser]
    pagination_class = PageNumberPagination

class UserDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    Vista para administradores para gestionar usuarios.
    
    GET: Obtiene detalles de un usuario
    PUT/PATCH: Actualiza datos de un usuario
    DELETE: Elimina un usuario
    
    Nota: Solo accesible por administradores
    """
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAdminUser]

# Vista para verificar el email del usuario
class VerifyEmailView(APIView):
    """
    Vista para verificar la cuenta de un usuario mediante email.
    
    GET:
    - Valida el token de verificación
    - Marca la cuenta como verificada
    - Retorna 200 si es exitoso
    - Retorna 400 si el enlace es inválido o expiró
    """
    permission_classes = [AllowAny]

    def get(self, request, uidb64, token):
        try:
            uid = force_str(urlsafe_base64_decode(uidb64))
            user = User.objects.get(pk=uid)
        except (TypeError, ValueError, OverflowError, User.DoesNotExist):
            return Response({"error": "Enlace inválido"}, 
                          status=status.HTTP_400_BAD_REQUEST)

        if default_token_generator.check_token(user, token):
            user.is_verified = True
            user.pending_verification = False
            user.save()
            
            # Si es una niñera, también verificar su perfil automáticamente
            if user.role == 'nanny':
                try:
                    from nannies.models import NannyProfile
                    nanny_profile = NannyProfile.objects.get(user=user)
                    nanny_profile.verified = True
                    nanny_profile.save()
                except NannyProfile.DoesNotExist:
                    # Si no existe el perfil, crearlo verificado
                    NannyProfile.objects.create(
                        user=user,
                        experience_years=0,
                        hourly_rate=10000,
                        description='',
                        verified=True  # Crear ya verificado
                    )
            
            return Response({"message": "✅ Tu cuenta ha sido verificada correctamente."})
        else:
            return Response({"error": "❌ Enlace de verificación inválido o expirado."}, 
                          status=status.HTTP_400_BAD_REQUEST)

class DevVerifyUserView(APIView):
    """
    Vista SOLO para desarrollo: Auto-verifica el último usuario registrado.
    REMOVER EN PRODUCCIÓN.
    """
    permission_classes = [AllowAny]
    
    def post(self, request):
        email = request.data.get('email')
        if not email:
            return Response({"error": "Email requerido"}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            user = User.objects.get(email=email)
            user.is_verified = True
            user.pending_verification = False
            user.save()
            
            # Si es una niñera, también verificar su perfil automáticamente
            if user.role == 'nanny':
                try:
                    from nannies.models import NannyProfile
                    nanny_profile = NannyProfile.objects.get(user=user)
                    nanny_profile.verified = True
                    nanny_profile.save()
                except NannyProfile.DoesNotExist:
                    # Si no existe el perfil, crearlo verificado
                    NannyProfile.objects.create(
                        user=user,
                        experience_years=0,
                        hourly_rate=10000,
                        description='',
                        verified=True
                    )
            
            return Response({
                "message": f"✅ Usuario {user.username} verificado correctamente (dev mode)",
                "username": user.username,
                "email": user.email
            })
        except User.DoesNotExist:
            return Response({"error": "Usuario no encontrado"}, status=status.HTTP_404_NOT_FOUND)
        
class PublicNannyListView(generics.ListAPIView):
    """
    Vista pública para listar todas las niñeras verificadas.
    Accesible sin autenticación.
    """
    queryset = User.objects.filter(role='nanny', is_verified=True)
    serializer_class = UserListSerializer
    permission_classes = [AllowAny]

# Vista para solicitar recuperación de contraseña
class PasswordResetRequestView(APIView):
    """
    Vista para solicitar recuperación de contraseña.
    
    POST:
    - Recibe email del usuario
    - Genera token de recuperación
    - Envía correo con enlace de reset
    - El enlace es válido por 24 horas
    """
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get('email')
        
        if not email:
            return Response(
                {"error": "El email es requerido"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            # Por seguridad, no revelamos si el email existe o no
            return Response(
                {"message": "Si el email existe, recibirás un correo con instrucciones para restablecer tu contraseña."},
                status=status.HTTP_200_OK
            )
        
        # Generar token de reset
        token = default_token_generator.make_token(user)
        uid = urlsafe_base64_encode(force_bytes(user.pk))
        reset_url = f"{settings.FRONTEND_URL}/reset-password/{uid}/{token}/"
        
        # Enviar correo
        try:
            send_mail(
                subject="Recuperación de contraseña - Home Nannies",
                message=f"Hola {user.username},\n\nHaz clic en el siguiente enlace para restablecer tu contraseña:\n\n{reset_url}\n\nEste enlace expirará en 24 horas.\n\nSi no solicitaste este cambio, ignora este correo.\n\nSaludos,\nEquipo de Home Nannies",
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[user.email],
                fail_silently=False,
            )
        except Exception as e:
            return Response(
                {"error": "Error al enviar el correo"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
        
        return Response(
            {"message": "Si el email existe, recibirás un correo con instrucciones para restablecer tu contraseña."},
            status=status.HTTP_200_OK
        )

# Vista para restablecer contraseña
class PasswordResetConfirmView(APIView):
    """
    Vista para restablecer la contraseña.
    
    POST:
    - Valida el token de recuperación
    - Actualiza la contraseña del usuario
    - Retorna 200 si es exitoso
    - Retorna 400 si el token es inválido o expiró
    """
    permission_classes = [AllowAny]

    def post(self, request, uidb64, token):
        password = request.data.get('password')
        password2 = request.data.get('password2')
        
        if not password or not password2:
            return Response(
                {"error": "Ambas contraseñas son requeridas"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if password != password2:
            return Response(
                {"error": "Las contraseñas no coinciden"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            uid = force_str(urlsafe_base64_decode(uidb64))
            user = User.objects.get(pk=uid)
        except (TypeError, ValueError, OverflowError, User.DoesNotExist):
            return Response(
                {"error": "Enlace inválido"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if not default_token_generator.check_token(user, token):
            return Response(
                {"error": "Enlace de recuperación inválido o expirado"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Actualizar contraseña
        user.set_password(password)
        user.save()
        
        return Response(
            {"message": "✅ Tu contraseña ha sido restablecida correctamente. Ya puedes iniciar sesión."},
            status=status.HTTP_200_OK
        )


# Dashboard views
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from bookings.models import Booking
from reviews.models import Review
from django.db.models import Q, Avg

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def parent_dashboard(request):
    """Endpoint para obtener datos del dashboard del padre."""
    user = request.user
    
    if user.role != 'parent':
        return Response(
            {'error': 'No eres un padre/madre registrado'},
            status=status.HTTP_403_FORBIDDEN
        )
    
    # Bookings activos
    active_bookings = Booking.objects.filter(
        parent__user=user,
        status__in=['pending', 'confirmed']
    ).count()
    
    # Bookings completados
    completed_bookings = Booking.objects.filter(
        parent__user=user,
        status='completed'
    ).count()
    
    # Próximas reservas
    upcoming_bookings = Booking.objects.filter(
        parent__user=user,
        status__in=['pending', 'confirmed']
    ).order_by('start_date')[:5].values(
        'id', 'nanny__user__first_name', 'nanny__user__last_name',
        'start_date', 'end_date', 'status'
    )
    
    dashboard_data = {
        'parent': {
            'name': f"{user.first_name} {user.last_name}",
            'avatar': user.first_name[0] + user.last_name[0] if user.first_name and user.last_name else 'P',
            'memberSince': user.date_joined.isoformat(),
        },
        'stats': {
            'activeBookings': active_bookings,
            'completedBookings': completed_bookings,
            'totalSpent': 0,  # TODO: Calcular gastos reales
        },
        'upcomingBookings': list(upcoming_bookings),
        'recentBookings': list(upcoming_bookings),
    }
    
    return Response(dashboard_data, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def admin_dashboard(request):
    """Endpoint para obtener datos del dashboard del admin."""
    try:
        user = request.user
        
        if user.role != 'admin' and not user.is_superuser:
            return Response(
                {'error': 'No tienes permisos de administrador'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        from django.db.models import Count, Q
        from datetime import datetime, timedelta
        
        # Estadísticas generales
        total_users = User.objects.count()
        active_users = User.objects.filter(is_active=True).count()
        total_nannies = User.objects.filter(role='nanny', is_verified=True).count()
        total_parents = User.objects.filter(role='parent').count()
        
        # Bookings
        total_bookings = Booking.objects.count()
        pending_bookings = Booking.objects.filter(status='pending').count()
        completed_bookings = Booking.objects.filter(status='completed').count()
        
        # Calcular tasa de éxito
        success_rate = (completed_bookings / total_bookings * 100) if total_bookings > 0 else 0
        
        # Paginación de usuarios - obtener solo la página solicitada
        page = request.GET.get('page', 1)
        page_size = request.GET.get('page_size', 20)
        
        try:
            page = int(page)
            page_size = min(int(page_size), 100)  # Máximo 100 registros por página
        except (ValueError, TypeError):
            page = 1
            page_size = 20
        
        # Calcular offset y limit para la paginación
        offset = (page - 1) * page_size
        
        # Obtener usuarios paginados
        users_queryset = User.objects.all().order_by('-date_joined')
        total_users_count = users_queryset.count()
        users_page = users_queryset[offset:offset + page_size]
        
        # Lista de usuarios con información adicional
        users_list = []
        for u in users_page:
            bookings_count = 0
            if u.role == 'nanny':
                bookings_count = Booking.objects.filter(nanny=u).count()
            elif u.role == 'parent':
                bookings_count = Booking.objects.filter(parent=u).count()
            
            users_list.append({
                'id': u.id,
                'name': f"{u.first_name} {u.last_name}" if u.first_name and u.last_name else u.username,
                'email': u.email,
                'role': u.role,
                'status': 'active' if u.is_active else 'inactive',
                'joinDate': u.date_joined.strftime('%Y-%m-%d'),
                'bookings': bookings_count,
            })
        
        # Reportes mensuales (últimos 6 meses)
        reports = []
        for i in range(5, -1, -1):
            date = datetime.now() - timedelta(days=30*i)
            month_start = date.replace(day=1)
            month_end = (month_start + timedelta(days=32)).replace(day=1) - timedelta(days=1)
            
            bookings_count = Booking.objects.filter(
                created_at__gte=month_start,
                created_at__lte=month_end
            ).count()
            
            users_count = User.objects.filter(
                date_joined__gte=month_start,
                date_joined__lte=month_end
            ).count()
            
            # Calcular revenue estimado (bookings completados * tarifa promedio)
            completed = Booking.objects.filter(
                created_at__gte=month_start,
                created_at__lte=month_end,
                status='completed'
            ).count()
            revenue = completed * 50000  # Tarifa promedio estimada
            
            reports.append({
                'month': date.strftime('%B'),
                'bookings': bookings_count,
                'revenue': revenue,
                'users': users_count,
            })
        
        # OCR Status - con manejo de errores
        ocr_status_data = {
            'total': 0,
            'processed': 0,
            'pending': 0,
            'failed': 0,
            'lastUpdate': 'N/A',
        }
        try:
            from core.models import OCRExtraction
            ocr_status_data['total'] = OCRExtraction.objects.count()
            ocr_status_data['processed'] = OCRExtraction.objects.filter(status='validated').count()
            ocr_status_data['pending'] = OCRExtraction.objects.filter(status='extracting').count()
            ocr_status_data['failed'] = OCRExtraction.objects.filter(status='failed').count()
            last_ocr = OCRExtraction.objects.order_by('-extracted_at').first()
            if last_ocr:
                ocr_status_data['lastUpdate'] = last_ocr.extracted_at.strftime('%Y-%m-%d %H:%M')
        except Exception as e:
            print(f"Error loading OCR status: {e}")
        
        # Academic Status - usando AcademicVerification que tiene status
        academic_status_data = {
            'total': 0,
            'verified': 0,
            'pending': 0,
            'rejected': 0,
            'lastUpdate': 'N/A',
        }
        try:
            from academic.models import AcademicVerification
            academic_status_data['total'] = AcademicVerification.objects.count()
            academic_status_data['verified'] = AcademicVerification.objects.filter(status='verified').count()
            academic_status_data['pending'] = AcademicVerification.objects.filter(status='pending').count()
            academic_status_data['rejected'] = AcademicVerification.objects.filter(status='failed').count()
            last_academic = AcademicVerification.objects.order_by('-created_at').first()
            if last_academic:
                academic_status_data['lastUpdate'] = last_academic.created_at.strftime('%Y-%m-%d %H:%M')
        except Exception as e:
            print(f"Error loading Academic status: {e}")
        
        dashboard_data = {
            'admin': {
                'name': f"{user.first_name} {user.last_name}" if user.first_name and user.last_name else user.username,
                'avatar': (user.first_name[0] + user.last_name[0]) if user.first_name and user.last_name else user.username[0].upper(),
                'role': 'Superadmin' if user.is_superuser else 'Admin',
            },
            'metrics': {
                'totalUsers': total_users,
                'activeUsers': active_users,
                'totalNannies': total_nannies,
                'totalParents': total_parents,
                'totalBookings': total_bookings,
                'pendingBookings': pending_bookings,
                'successRate': round(success_rate, 1),
            },
            'users': users_list,
            'usersPagination': {
                'total': total_users_count,
                'page': page,
                'pageSize': page_size,
                'totalPages': (total_users_count + page_size - 1) // page_size,
                'hasNext': offset + page_size < total_users_count,
                'hasPrev': page > 1,
            },
            'reports': reports,
            'ocrStatus': ocr_status_data,
            'academicStatus': academic_status_data,
            'systemHealth': {
                'status': 'ok',
                'uptime': '99.9%',
            }
        }
        
        return Response(dashboard_data, status=status.HTTP_200_OK)
        
    except Exception as e:
        import traceback
        print(f"Error en admin_dashboard: {str(e)}")
        print(traceback.format_exc())
        return Response(
            {'error': f'Error interno del servidor: {str(e)}'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


# === ENDPOINTS DE GESTIÓN DE USUARIOS (SPRINT 3) ===

from rest_framework.decorators import api_view, permission_classes
from django.shortcuts import get_object_or_404
from django.utils import timezone
from notifications.models import Notification


@api_view(['POST'])
@permission_classes([IsAdminUser])
def suspend_user(request, user_id):
    """
    Suspende un usuario (solo admin).
    
    POST /api/users/{user_id}/suspend/
    Body: {
        "reason": "Motivo de la suspensión"
    }
    """
    user = get_object_or_404(User, id=user_id)
    
    # No permitir suspender a otros admins
    if user.role == 'admin':
        return Response(
            {'error': 'No se puede suspender a un administrador'},
            status=status.HTTP_403_FORBIDDEN
        )
    
    # No suspender si ya está suspendido
    if user.is_suspended:
        return Response(
            {'error': 'El usuario ya está suspendido'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    reason = request.data.get('reason', 'Sin motivo especificado')
    
    user.is_suspended = True
    user.suspended_at = timezone.now()
    user.suspended_by = request.user
    user.suspension_reason = reason
    user.is_active = False  # Desactivar cuenta
    user.save()
    
    # Crear notificación para el usuario suspendido
    try:
        Notification.objects.create(
            user=user,
            title='Cuenta Suspendida',
            message=f'Tu cuenta ha sido suspendida. Motivo: {reason}',
            type='warning',
            priority='high'
        )
    except Exception:
        pass  # Si falla la notificación, continuar
    
    # Enviar email de notificación
    try:
        send_mail(
            subject="Cuenta Suspendida - Home Nannies",
            message=f"Tu cuenta ha sido suspendida.\n\nMotivo: {reason}\n\nContacta al administrador para más información.",
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[user.email],
            fail_silently=True,
        )
    except Exception:
        pass
    
    return Response({
        'message': 'Usuario suspendido exitosamente',
        'user': {
            'id': user.id,
            'username': user.username,
            'is_suspended': user.is_suspended,
            'suspended_at': user.suspended_at,
            'suspension_reason': user.suspension_reason,
        }
    }, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([IsAdminUser])
def reactivate_user(request, user_id):
    """
    Reactiva un usuario suspendido (solo admin).
    
    POST /api/users/{user_id}/reactivate/
    """
    user = get_object_or_404(User, id=user_id)
    
    if not user.is_suspended:
        return Response(
            {'error': 'El usuario no está suspendido'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    user.is_suspended = False
    user.suspended_at = None
    user.suspended_by = None
    user.suspension_reason = ''
    user.is_active = True
    user.save()
    
    # Crear notificación
    try:
        Notification.objects.create(
            user=user,
            title='Cuenta Reactivada',
            message='Tu cuenta ha sido reactivada. Ya puedes acceder nuevamente.',
            type='success',
            priority='high'
        )
    except Exception:
        pass
    
    # Enviar email
    try:
        send_mail(
            subject="Cuenta Reactivada - Home Nannies",
            message="Tu cuenta ha sido reactivada exitosamente.\n\nYa puedes acceder nuevamente al sistema.",
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[user.email],
            fail_silently=True,
        )
    except Exception:
        pass
    
    return Response({
        'message': 'Usuario reactivado exitosamente',
        'user': {
            'id': user.id,
            'username': user.username,
            'is_active': user.is_active,
            'is_suspended': user.is_suspended,
        }
    }, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([IsAdminUser])
def approve_user(request, user_id):
    """
    Aprueba un usuario pendiente (solo admin).
    
    POST /api/users/{user_id}/approve/
    """
    user = get_object_or_404(User, id=user_id)
    
    if user.verification_status == 'approved':
        return Response(
            {'error': 'El usuario ya está aprobado'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    user.verification_status = 'approved'
    user.is_verified = True
    user.pending_verification = False
    user.save()
    
    # Crear notificación
    try:
        Notification.objects.create(
            user=user,
            title='Cuenta Aprobada',
            message='Tu cuenta ha sido aprobada. Ya puedes usar todos los servicios.',
            type='success',
            priority='high'
        )
    except Exception:
        pass
    
    # Enviar email
    try:
        send_mail(
            subject="Cuenta Aprobada - Home Nannies",
            message="¡Felicitaciones! Tu cuenta ha sido aprobada.\n\nYa puedes usar todos los servicios de Home Nannies.",
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[user.email],
            fail_silently=True,
        )
    except Exception:
        pass
    
    return Response({
        'message': 'Usuario aprobado exitosamente',
        'user': {
            'id': user.id,
            'username': user.username,
            'verification_status': user.verification_status,
            'is_verified': user.is_verified,
        }
    }, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([IsAdminUser])
def reject_user(request, user_id):
    """
    Rechaza un usuario pendiente (solo admin).
    
    POST /api/users/{user_id}/reject/
    Body: {
        "reason": "Motivo del rechazo"
    }
    """
    user = get_object_or_404(User, id=user_id)
    
    if user.verification_status == 'rejected':
        return Response(
            {'error': 'El usuario ya está rechazado'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    reason = request.data.get('reason', 'Sin motivo especificado')
    
    user.verification_status = 'rejected'
    user.is_active = False
    user.save()
    
    # Crear notificación
    try:
        Notification.objects.create(
            user=user,
            title='Cuenta Rechazada',
            message=f'Tu cuenta ha sido rechazada. Motivo: {reason}',
            type='error',
            priority='high'
        )
    except Exception:
        pass
    
    # Enviar email
    try:
        send_mail(
            subject="Cuenta Rechazada - Home Nannies",
            message=f"Tu solicitud de cuenta ha sido rechazada.\n\nMotivo: {reason}\n\nContacta al administrador para más información.",
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[user.email],
            fail_silently=True,
        )
    except Exception:
        pass
    
    return Response({
        'message': 'Usuario rechazado',
        'user': {
            'id': user.id,
            'username': user.username,
            'verification_status': user.verification_status,
        }
    }, status=status.HTTP_200_OK)