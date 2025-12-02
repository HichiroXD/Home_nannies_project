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
from rest_framework_simplejwt.tokens import RefreshToken
from .models import User
from .serializer import RegisterSerializer, UserSerializer, UserListSerializer, LoginSerializer
from .tokens import account_activation_token

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
    """
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]

    def perform_create(self, serializer):
        # Se crea el usuario, pero no verificado
        user = serializer.save(is_verified=False)

        # Generar token de verificación
        token = default_token_generator.make_token(user)
        uid = urlsafe_base64_encode(force_bytes(user.pk))
        verify_url = f"{settings.FRONTEND_URL}/verify/{uid}/{token}/"

        # Enviar correo
        send_mail(
            subject="Verifica tu cuenta en Home Nannies",
            message=f"Hola {user.username}, haz clic en el siguiente enlace para verificar tu cuenta:\n\n{verify_url}\n\nGracias por unirte a Home Nannies 💜",
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[user.email],
            fail_silently=False,
        )

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
    """
    permission_classes = [AllowAny]
    serializer_class = LoginSerializer

    def post(self, request):
        serializer = self.serializer_class(data=request.data)
        serializer.is_valid(raise_exception=True)

        user = authenticate(
            username=serializer.validated_data["username"],
            password=serializer.validated_data["password"]
        )

        if user is None or not user.is_active:
            return Response({"detail": "Credenciales inválidas"}, status=status.HTTP_401_UNAUTHORIZED)

        if not user.is_verified:
            return Response({"detail": "Cuenta no verificada"}, status=status.HTTP_403_FORBIDDEN)

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
            user.save()
            return Response({"message": "✅ Tu cuenta ha sido verificada correctamente."})
        else:
            return Response({"error": "❌ Enlace de verificación inválido o expirado."}, 
                          status=status.HTTP_400_BAD_REQUEST)
        
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
                message=f"Hola {user.username},\n\nHaz clic en el siguiente enlace para restablecer tu contraseña:\n\n{reset_url}\n\nEste enlace expirará en 24 horas.\n\nSi no solicitaste este cambio, ignora este correo.\n\nSaludos,\nEquipo de Home Nannies 💜",
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
    user = request.user
    
    if user.role != 'admin' and not user.is_superuser:
        return Response(
            {'error': 'No tienes permisos de administrador'},
            status=status.HTTP_403_FORBIDDEN
        )
    
    # Estadísticas generales
    total_users = User.objects.count()
    total_nannies = User.objects.filter(role='nanny', is_verified=True).count()
    total_parents = User.objects.filter(role='parent').count()
    
    # Bookings
    total_bookings = Booking.objects.count()
    pending_bookings = Booking.objects.filter(status='pending').count()
    
    dashboard_data = {
        'admin': {
            'name': f"{user.first_name} {user.last_name}",
            'avatar': user.first_name[0] + user.last_name[0] if user.first_name and user.last_name else 'A',
            'role': 'Superadmin' if user.is_superuser else 'Admin',
        },
        'stats': {
            'totalUsers': total_users,
            'totalNannies': total_nannies,
            'totalParents': total_parents,
            'totalBookings': total_bookings,
            'pendingBookings': pending_bookings,
        },
        'systemHealth': {
            'status': 'ok',
            'uptime': '99.9%',
        }
    }
    
    return Response(dashboard_data, status=status.HTTP_200_OK)