"""
Academic API Views - Phase 3
Endpoints REST para validación académica
"""

import logging
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework.exceptions import ValidationError
from django.utils.decorators import method_decorator
from django.views.decorators.cache import cache_page
from django.contrib.auth import get_user_model
from .models import AcademicProvider, AcademicStudent, AcademicProgram, AcademicVerification
from .service import AcademicService
from .serializer import (
    AcademicProviderSerializer,
    AcademicStudentSerializer,
    AcademicProgramSerializer,
    AcademicVerificationSerializer,
    VerifyStudentRequestSerializer,
    VerifyStudentResponseSerializer,
    AcademicStatusSerializer,
)

logger = logging.getLogger(__name__)
User = get_user_model()


class AcademicProviderViewSet(viewsets.ModelViewSet):
    """ViewSet para gestionar proveedores académicos (Admin only)"""

    queryset = AcademicProvider.objects.all()
    serializer_class = AcademicProviderSerializer
    permission_classes = [IsAuthenticated, IsAdminUser]
    filterset_fields = ['provider_type', 'is_active', 'is_primary']
    search_fields = ['name', 'api_endpoint']
    ordering_fields = ['name', 'created_at', 'last_sync']
    ordering = ['-is_primary', '-is_active', 'name']

    def get_queryset(self):
        """Filtra por usuario admin"""
        if self.request.user.is_staff:
            return AcademicProvider.objects.all()
        return AcademicProvider.objects.none()

    @action(detail=True, methods=['post'], permission_classes=[IsAdminUser])
    def test_connection(self, request, pk=None):
        """Prueba conexión a proveedor API"""
        provider = self.get_object()

        if provider.provider_type == 'mock':
            return Response({
                'status': 'success',
                'message': 'Mock provider conexión exitosa',
                'provider_type': 'mock'
            })

        if provider.provider_type != 'api':
            return Response({
                'status': 'error',
                'message': f'No se puede probar conexión para tipo: {provider.provider_type}'
            }, status=status.HTTP_400_BAD_REQUEST)

        try:
            import requests
            headers = {'Authorization': f'Bearer {provider.api_key}'}
            response = requests.get(
                f'{provider.api_endpoint}/health',
                headers=headers,
                timeout=provider.timeout
            )

            if response.status_code == 200:
                provider.sync_status = 'success'
                provider.last_error = None
            else:
                provider.sync_status = 'error'
                provider.last_error = f'HTTP {response.status_code}'

            from django.utils import timezone
            provider.last_sync = timezone.now()
            provider.save()

            return Response({
                'status': 'success' if response.status_code == 200 else 'error',
                'http_status': response.status_code,
                'message': 'Conexión exitosa' if response.status_code == 200 else 'Error en conexión'
            })

        except Exception as e:
            provider.sync_status = 'error'
            provider.last_error = str(e)
            from django.utils import timezone
            provider.last_sync = timezone.now()
            provider.save()

            logger.error(f'Provider connection test failed: {e}')
            return Response({
                'status': 'error',
                'message': f'Error de conexión: {str(e)}'
            }, status=status.HTTP_400_BAD_REQUEST)


class AcademicProgramViewSet(viewsets.ModelViewSet):
    """ViewSet para programas académicos"""

    queryset = AcademicProgram.objects.filter(is_active=True)
    serializer_class = AcademicProgramSerializer
    permission_classes = [IsAuthenticated]
    filterset_fields = ['provider', 'program_type', 'faculty']
    search_fields = ['program_name', 'program_code', 'career_name']
    ordering_fields = ['program_name', 'created_at']
    ordering = ['program_name']

    def get_queryset(self):
        """Filtra programas activos para usuario no-admin"""
        if self.request.user.is_staff:
            return AcademicProgram.objects.all()
        return AcademicProgram.objects.filter(is_active=True)

    def create(self, request, *args, **kwargs):
        """Solo admin puede crear programas"""
        if not request.user.is_staff:
            return Response(
                {'detail': 'Solo administradores pueden crear programas'},
                status=status.HTTP_403_FORBIDDEN
            )
        return super().create(request, *args, **kwargs)

    def update(self, request, *args, **kwargs):
        """Solo admin puede actualizar programas"""
        if not request.user.is_staff:
            return Response(
                {'detail': 'Solo administradores pueden actualizar programas'},
                status=status.HTTP_403_FORBIDDEN
            )
        return super().update(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        """Solo admin puede eliminar programas"""
        if not request.user.is_staff:
            return Response(
                {'detail': 'Solo administradores pueden eliminar programas'},
                status=status.HTTP_403_FORBIDDEN
            )
        return super().destroy(request, *args, **kwargs)

    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    @method_decorator(cache_page(60 * 5))  # Cache 5 minutos
    def list_by_provider(self, request):
        """Lista programas por proveedor"""
        provider_id = request.query_params.get('provider_id')

        if not provider_id:
            return Response(
                {'detail': 'provider_id es requerido'},
                status=status.HTTP_400_BAD_REQUEST
            )

        programs = self.get_queryset().filter(provider_id=provider_id)
        serializer = self.get_serializer(programs, many=True)
        return Response(serializer.data)


class AcademicStudentViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet para estudiantes académicos (Read-only para usuarios normales)"""

    queryset = AcademicStudent.objects.all()
    serializer_class = AcademicStudentSerializer
    permission_classes = [IsAuthenticated]
    filterset_fields = ['provider', 'enrollment_status', 'is_verified']
    search_fields = ['rut', 'first_name', 'last_name', 'email']
    ordering_fields = ['created_at', 'verification_date', 'last_name']
    ordering = ['-verification_date']

    def get_queryset(self):
        """Solo usuarios pueden ver su propio datos o admin puede verlo todo"""
        if self.request.user.is_staff:
            return AcademicStudent.objects.all()
        return AcademicStudent.objects.filter(user=self.request.user)

    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def my_academic_data(self, request):
        """Obtiene datos académicos del usuario autenticado"""
        student = AcademicStudent.objects.filter(user=request.user).first()

        if not student:
            return Response({
                'is_verified': False,
                'student_data': None,
                'message': 'No verified academic data'
            })

        serializer = self.get_serializer(student)
        return Response({
            'is_verified': True,
            'student_data': serializer.data,
            'verification_date': student.verification_date,
            'verification_method': student.verification_method
        })


class AcademicVerificationViewSet(viewsets.ModelViewSet):
    """ViewSet para verificaciones académicas"""

    queryset = AcademicVerification.objects.all()
    serializer_class = AcademicVerificationSerializer
    permission_classes = [IsAuthenticated]
    filterset_fields = ['status', 'provider', 'user']
    search_fields = ['rut', 'first_name', 'last_name']
    ordering_fields = ['created_at', 'attempted_at', 'verified_at']
    ordering = ['-created_at']

    def get_queryset(self):
        """Solo usuario puede ver sus verificaciones o admin todo"""
        if self.request.user.is_staff:
            return AcademicVerification.objects.all()
        return AcademicVerification.objects.filter(user=self.request.user)

    def create(self, request, *args, **kwargs):
        """Crea una verificación (no puede ser POST directo, usar verify_student)"""
        return Response(
            {'detail': 'Use POST /verify-student/ endpoint'},
            status=status.HTTP_405_METHOD_NOT_ALLOWED
        )


class VerifyStudentView(viewsets.ViewSet):
    """Endpoint para verificar datos académicos de estudiante"""

    permission_classes = [IsAuthenticated]

    def create(self, request):
        """
        POST /verify-student/
        Verifica datos académicos del estudiante autenticado
        """
        serializer = VerifyStudentRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            rut = serializer.validated_data['rut']
            first_name = serializer.validated_data['first_name']
            last_name = serializer.validated_data['last_name']
            program_name = serializer.validated_data.get('program_name', '')

            logger.info(f'Starting verification for user {request.user.email}: {rut}')

            # Crear registro de verificación
            verification = AcademicService.create_verification_record(
                user=request.user,
                rut=rut,
                first_name=first_name,
                last_name=last_name,
                program_name=program_name
            )

            # Procesar verificación
            success = AcademicService.process_verification(verification)

            response_data = VerifyStudentResponseSerializer({
                'verified': success,
                'student_data': verification.verified_data if success else None,
                'verification_id': verification.id,
                'message': 'Verificación completada exitosamente' if success else 'Verificación fallida',
                'error': verification.error_message if not success else None
            }).data

            status_code = status.HTTP_200_OK if success else status.HTTP_400_BAD_REQUEST
            return Response(response_data, status=status_code)

        except Exception as e:
            logger.error(f'Verification error: {e}', exc_info=True)
            return Response({
                'verified': False,
                'error': f'Error durante verificación: {str(e)}'
            }, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def my_verifications(self, request):
        """Obtiene historial de verificaciones del usuario"""
        verifications = AcademicVerification.objects.filter(
            user=request.user
        ).order_by('-created_at')[:10]

        serializer = AcademicVerificationSerializer(verifications, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def my_status(self, request):
        """Obtiene estado académico del usuario"""
        student = AcademicStudent.objects.filter(user=request.user).first()
        latest_verification = AcademicVerification.objects.filter(
            user=request.user
        ).order_by('-created_at').first()

        if student:
            status_response = {
                'is_verified': True,
                'student_data': AcademicStudentSerializer(student).data,
                'verification_status': latest_verification.status if latest_verification else 'verified',
                'last_verification': student.verification_date,
                'verification_method': student.verification_method
            }
        else:
            status_response = {
                'is_verified': False,
                'student_data': None,
                'verification_status': latest_verification.status if latest_verification else 'not_verified',
                'last_verification': None,
                'verification_method': None
            }

        serializer = AcademicStatusSerializer(status_response)
        return Response(serializer.data)
