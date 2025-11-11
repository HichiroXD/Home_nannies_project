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