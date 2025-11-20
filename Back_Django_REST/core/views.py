from rest_framework import viewsets, generics, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from django.contrib.auth import get_user_model
from django.utils import timezone
from django.core.mail import send_mail
from django.conf import settings
import jwt
import os
import random
from datetime import date, timedelta

from .models import (
    UniversityProgram,
    StudentVerification,
    DocumentVerification,
    OCRExtraction,
    AcademicIntegration
)
from .serializers import (
    UniversityProgramSerializer,
    StudentVerificationSerializer,
    DocumentVerificationSerializer,
    RegisterParentSerializer,
    RegisterNannySerializer,
    VerifyEmailSerializer,
    ResendTokenSerializer,
    VerificationStatusSerializer,
    OCRExtractionSerializer,
    DocumentUploadSerializer,
    OCRResultSerializer,
    AcademicIntegrationSerializer,
    DocumentVerificationExpandedSerializer,
    AcademicVerificationSerializer,
    AcademicDataSimulatorSerializer
)

User = get_user_model()


class UniversityProgramListView(generics.ListAPIView):
    """Listar todos los programas universitarios"""
    queryset = UniversityProgram.objects.all()
    serializer_class = UniversityProgramSerializer
    permission_classes = [AllowAny]


class RegisterParentView(generics.CreateAPIView):
    """Registrar nuevo Padre/Madre"""
    queryset = User.objects.all()
    serializer_class = RegisterParentSerializer
    permission_classes = [AllowAny]

    def create(self, request, *args, **kwargs):
        """Crear usuario y enviar email de verificación"""
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        user = serializer.save()
        
        # Generar token de verificación
        self._send_verification_email(user)
        
        return Response(
            {
                'id': user.id,
                'username': user.username,
                'institutional_email': user.institutional_email,
                'message': 'Registro exitoso. Verifique su email para activar la cuenta.'
            },
            status=status.HTTP_201_CREATED
        )

    @staticmethod
    def _send_verification_email(user):
        """Generar y enviar email de verificación"""
        # Generar token JWT
        secret = os.getenv('SECRET_KEY', settings.SECRET_KEY)
        payload = {
            'user_id': user.id,
            'email': user.institutional_email,
            'exp': timezone.now().timestamp() + (24 * 3600)  # 24 horas
        }
        token = jwt.encode(payload, secret, algorithm='HS256')
        
        # Guardar token en usuario
        user.email_verification_token = token
        user.save()
        
        # Construir URL de verificación
        verification_url = f"{os.getenv('FRONTEND_URL', 'http://localhost:5173')}/verify-email/{token}"
        
        # Enviar email
        subject = 'Verificar email - Home Nannies'
        message = f"""
        Hola {user.first_name},
        
        Para activar tu cuenta, haz clic en el siguiente enlace:
        {verification_url}
        
        Este enlace expira en 24 horas.
        
        Si no solicitaste este registro, ignora este email.
        
        Saludos,
        Home Nannies
        """
        
        send_mail(
            subject,
            message,
            settings.DEFAULT_FROM_EMAIL,
            [user.institutional_email],
            fail_silently=True
        )


class RegisterNannyView(generics.CreateAPIView):
    """Registrar nuevo Niñera con verificación de estudiante"""
    queryset = User.objects.all()
    serializer_class = RegisterNannySerializer
    permission_classes = [AllowAny]

    def create(self, request, *args, **kwargs):
        """Crear usuario niñera y solicitud de verificación"""
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        user = serializer.save()
        
        # Generar token de verificación
        RegisterParentView._send_verification_email(user)
        
        return Response(
            {
                'id': user.id,
                'username': user.username,
                'institutional_email': user.institutional_email,
                'role': user.role,
                'message': 'Registro exitoso. Verifique su email y espere aprobación del administrador.'
            },
            status=status.HTTP_201_CREATED
        )


class VerifyEmailView(generics.GenericAPIView):
    """Verificar email usando token"""
    serializer_class = VerifyEmailSerializer
    permission_classes = [AllowAny]

    def post(self, request, token=None):
        """Verificar token y activar email"""
        if token:
            request.data._mutable = True
            request.data['token'] = token
        
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        user = serializer.validated_data['token']
        
        # Marcar email como verificado
        user.email_verified = True
        user.is_verified = True
        user.email_verified_date = timezone.now()
        user.email_verification_token = None
        user.save()
        
        return Response(
            {
                'message': 'Email verificado exitosamente',
                'user_id': user.id,
                'username': user.username
            },
            status=status.HTTP_200_OK
        )


class ResendVerificationTokenView(generics.GenericAPIView):
    """Reenviar token de verificación"""
    serializer_class = ResendTokenSerializer
    permission_classes = [AllowAny]

    def post(self, request):
        """Reenviar email de verificación"""
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        user = serializer.validated_data['institutional_email']
        
        # Enviar email
        RegisterParentView._send_verification_email(user)
        
        return Response(
            {
                'message': 'Email de verificación reenviado',
                'institutional_email': user.institutional_email
            },
            status=status.HTTP_200_OK
        )


class VerificationStatusView(generics.GenericAPIView):
    """Obtener estado de verificación del usuario actual"""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        """Retornar estado completo de verificación"""
        user = request.user
        
        serializer = VerificationStatusSerializer(user)
        
        return Response(
            {
                'user': serializer.data['user'],
                'verification_status': {
                    'email_verified': user.email_verified,
                    'institutional_status': user.verification_status,
                    'student_verification': (
                        StudentVerificationSerializer(user.student_verification).data
                        if hasattr(user, 'student_verification')
                        else None
                    ),
                    'documents': serializer.data['documents']
                }
            },
            status=status.HTTP_200_OK
        )


class UniversityProgramViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet para Programas Universitarios (solo lectura)"""
    queryset = UniversityProgram.objects.all()
    serializer_class = UniversityProgramSerializer
    permission_classes = [AllowAny]


class StudentVerificationViewSet(viewsets.ModelViewSet):
    """ViewSet para Verificaciones de Estudiante (admin)"""
    queryset = StudentVerification.objects.all()
    serializer_class = StudentVerificationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """Filtrar según permisos"""
        user = self.request.user
        if user.role == 'admin':
            return StudentVerification.objects.all()
        # Usuario regular solo ve su propia verificación
        return StudentVerification.objects.filter(user=user)

    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        """Aprobar verificación de estudiante"""
        verification = self.get_object()
        
        # Solo admin
        if request.user.role != 'admin':
            return Response(
                {'error': 'No tiene permisos'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        verification.status = 'approved'
        verification.verified_date = timezone.now()
        verification.save()
        
        # Actualizar usuario
        user = verification.user
        user.verification_status = 'approved'
        user.save()
        
        # Enviar email de notificación
        self._send_approval_email(user)
        
        return Response(
            {
                'message': 'Verificación aprobada',
                'verification': StudentVerificationSerializer(verification).data
            },
            status=status.HTTP_200_OK
        )

    @action(detail=True, methods=['post'])
    def reject(self, request, pk=None):
        """Rechazar verificación de estudiante"""
        verification = self.get_object()
        
        # Solo admin
        if request.user.role != 'admin':
            return Response(
                {'error': 'No tiene permisos'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        reason = request.data.get('reason', 'No especificado')
        
        verification.status = 'rejected'
        verification.rejection_reason = reason
        verification.verified_date = timezone.now()
        verification.save()
        
        # Actualizar usuario
        user = verification.user
        user.verification_status = 'rejected'
        user.save()
        
        # Enviar email de notificación
        self._send_rejection_email(user, reason)
        
        return Response(
            {
                'message': 'Verificación rechazada',
                'verification': StudentVerificationSerializer(verification).data
            },
            status=status.HTTP_200_OK
        )

    @staticmethod
    def _send_approval_email(user):
        """Enviar email de aprobación"""
        subject = 'Verificación Aprobada - Home Nannies'
        message = f"""
        Hola {user.first_name},
        
        ¡Felicidades! Tu verificación como estudiante ha sido aprobada.
        
        Ya puedes acceder completamente a Home Nannies.
        
        Saludos,
        Home Nannies
        """
        
        send_mail(
            subject,
            message,
            settings.DEFAULT_FROM_EMAIL,
            [user.institutional_email],
            fail_silently=True
        )

    @staticmethod
    def _send_rejection_email(user, reason):
        """Enviar email de rechazo"""
        subject = 'Verificación Rechazada - Home Nannies'
        message = f"""
        Hola {user.first_name},
        
        Tu verificación ha sido rechazada por el siguiente motivo:
        
        {reason}
        
        Por favor, contacta al administrador para más información.
        
        Saludos,
        Home Nannies
        """
        
        send_mail(
            subject,
            message,
            settings.DEFAULT_FROM_EMAIL,
            [user.institutional_email],
            fail_silently=True
        )


class DocumentVerificationViewSet(viewsets.ModelViewSet):
    """ViewSet para Verificaciones de Documento (admin)"""
    queryset = DocumentVerification.objects.all()
    serializer_class = DocumentVerificationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """Filtrar según permisos"""
        user = self.request.user
        if user.role == 'admin':
            return DocumentVerification.objects.all()
        # Usuario regular solo ve sus propios documentos
        return DocumentVerification.objects.filter(user=user)

    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        """Aprobar documento"""
        doc = self.get_object()
        
        # Solo admin
        if request.user.role != 'admin':
            return Response(
                {'error': 'No tiene permisos'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        notes = request.data.get('notes', '')
        doc.approve(notes=notes)
        
        return Response(
            {
                'message': 'Documento aprobado',
                'document': DocumentVerificationSerializer(doc).data
            },
            status=status.HTTP_200_OK
        )

    @action(detail=True, methods=['post'])
    def reject(self, request, pk=None):
        """Rechazar documento"""
        doc = self.get_object()
        
        # Solo admin
        if request.user.role != 'admin':
            return Response(
                {'error': 'No tiene permisos'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        reason = request.data.get('reason', 'No especificado')
        doc.reject(reason=reason)
        
        return Response(
            {
                'message': 'Documento rechazado',
                'document': DocumentVerificationSerializer(doc).data
            },
            status=status.HTTP_200_OK
        )


# ========== PHASE 2: OCR Y VALIDACIÓN ACADÉMICA ==========


class OCRDocumentUploadView(generics.CreateAPIView):
    """Phase 2: Cargar documento para procesamiento OCR"""
    queryset = DocumentVerification.objects.all()
    serializer_class = DocumentUploadSerializer
    permission_classes = [IsAuthenticated]

    def create(self, request, *args, **kwargs):
        """Cargar documento para procesamiento OCR"""
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        # Asignar usuario actual
        doc = serializer.save()
        doc.user = request.user
        doc.save()
        
        # Iniciar procesamiento OCR (simulado)
        self._process_ocr_simulated(doc)
        
        return Response(
            {
                'message': 'Documento cargado para procesamiento OCR',
                'document_id': doc.id,
                'status': 'processing',
                'ocr_status': doc.ocr_status
            },
            status=status.HTTP_201_CREATED
        )

    @staticmethod
    def _process_ocr_simulated(doc):
        """
        Simular procesamiento OCR.
        
        Phase 2: En producción, usar pytesseract o servicio OCR externo
        """
        doc.ocr_status = 'processing'
        doc.save()
        
        # Simular extracción basada en tipo de documento
        if doc.document_type == 'rut':
            # Simular extracción de RUT
            simulated_rut = f"{random.randint(10, 25)}.{random.randint(100000, 999999)}-{random.choice('0123456789K')}"
            doc.extracted_rut = simulated_rut
            doc.extracted_name = f"Usuario {doc.user.id}"
            doc.confidence_score = random.uniform(0.85, 0.99)
            
        elif doc.document_type == 'certificate':
            # Simular extracción de certificado
            doc.extracted_rut = f"{random.randint(10, 25)}.{random.randint(100000, 999999)}-{random.choice('0123456789K')}"
            doc.extracted_name = doc.user.get_full_name()
            doc.valid_from = date.today() - timedelta(days=365)
            doc.valid_until = date.today() + timedelta(days=365)
            doc.confidence_score = random.uniform(0.80, 0.98)
        
        doc.ocr_status = 'extracted'
        doc.save()
        
        # Crear registro OCRExtraction
        OCRExtraction.objects.create(
            document=doc,
            extracted_rut=doc.extracted_rut,
            extracted_name=doc.extracted_name,
            extracted_program='Educación' if doc.document_type == 'certificate' else '',
            extracted_enrollment_year=date.today().year if doc.document_type == 'certificate' else None,
            valid_from=doc.valid_from,
            valid_until=doc.valid_until,
            confidence_score=doc.confidence_score,
            confidence_level=OCRExtraction.CONFIDENCE_LEVELS[
                0 if doc.confidence_score >= 0.9 else (1 if doc.confidence_score >= 0.7 else 2)
            ][0],
            raw_text=f"Texto extraído simulado para {doc.document_type}",
            extraction_metadata={
                'method': 'simulated_ocr',
                'language': 'es',
                'document_type': doc.document_type
            },
            status='extracted'
        )


class OCRDocumentStatusView(generics.RetrieveAPIView):
    """Phase 2: Obtener estado de procesamiento OCR"""
    queryset = DocumentVerification.objects.all()
    serializer_class = DocumentVerificationExpandedSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """Filtrar documentos del usuario"""
        return DocumentVerification.objects.filter(user=self.request.user)


class OCRExtractRUTView(generics.GenericAPIView):
    """Phase 2: Extraer RUT de documento"""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        """Extraer RUT de documento"""
        document_id = request.data.get('document_id')
        
        if not document_id:
            return Response(
                {'error': 'document_id requerido'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            doc = DocumentVerification.objects.get(id=document_id, user=request.user)
        except DocumentVerification.DoesNotExist:
            return Response(
                {'error': 'Documento no encontrado'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Validar que sea documento RUT
        if doc.document_type != 'rut':
            return Response(
                {'error': 'Documento debe ser RUT'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Simular extracción de RUT
        ocr_result = self._simulate_rut_extraction(doc)
        
        return Response(ocr_result, status=status.HTTP_200_OK)

    @staticmethod
    def _simulate_rut_extraction(doc):
        """Simular extracción de RUT específicamente"""
        # Simular RUT válido chileno
        rut_numbers = f"{random.randint(10, 25)}.{random.randint(100000, 999999)}"
        check_digits = random.choice('0123456789K')
        simulated_rut = f"{rut_numbers}-{check_digits}"
        
        doc.extracted_rut = simulated_rut
        doc.confidence_score = random.uniform(0.90, 0.99)
        doc.save()
        
        return {
            'document_id': doc.id,
            'extracted_rut': simulated_rut,
            'confidence_score': doc.confidence_score,
            'confidence_level': 'high' if doc.confidence_score >= 0.85 else 'medium',
            'status': 'extracted'
        }


class AcademicVerifyView(generics.GenericAPIView):
    """Phase 2: Verificar datos académicos del estudiante"""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        """Verificar datos académicos con sistema académico"""
        student_verification_id = request.data.get('student_verification_id')
        document_id = request.data.get('document_id')
        
        if not student_verification_id or not document_id:
            return Response(
                {'error': 'student_verification_id y document_id requeridos'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            student_verif = StudentVerification.objects.get(
                id=student_verification_id,
                user=request.user
            )
            doc = DocumentVerification.objects.get(
                id=document_id,
                user=request.user
            )
        except (StudentVerification.DoesNotExist, DocumentVerification.DoesNotExist):
            return Response(
                {'error': 'Verificación o documento no encontrado'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Simular consulta a sistema académico
        academic_data = self._simulate_academic_system_query(
            student_verif.user,
            doc.extracted_rut
        )
        
        # Crear/actualizar integración académica
        academic_integration, created = AcademicIntegration.objects.get_or_create(
            student_verification=student_verif,
            defaults={
                'academic_student_id': academic_data['academic_student_id'],
                'enrollment_status': academic_data['enrollment_status'],
                'enrollment_date': academic_data['enrollment_date'],
                'is_regular_student': academic_data['is_regular_student'],
                'has_academic_debt': academic_data['has_academic_debt'],
                'verification_status': 'verified'
            }
        )
        
        if not created:
            # Actualizar campos
            academic_integration.enrollment_status = academic_data['enrollment_status']
            academic_integration.is_regular_student = academic_data['is_regular_student']
            academic_integration.has_academic_debt = academic_data['has_academic_debt']
            academic_integration.verification_status = 'verified'
            academic_integration.verified_at = timezone.now()
            academic_integration.save()
        
        serializer = AcademicIntegrationSerializer(academic_integration)
        
        return Response(
            {
                'message': 'Verificación académica completada',
                'academic_integration': serializer.data,
                'is_eligible': academic_integration.is_valid()
            },
            status=status.HTTP_200_OK
        )

    @staticmethod
    def _simulate_academic_system_query(user, rut):
        """
        Simular consulta a sistema académico.
        
        Phase 2: En producción, hacer llamada real a API del sistema académico
        """
        # Simular respuesta del sistema académico
        academic_student_id = f"EST-{user.id}-{random.randint(10000, 99999)}"
        enrollment_status = random.choice(['active', 'inactive', 'graduated'])
        enrollment_date = date.today() - timedelta(days=random.randint(365, 1825))
        
        return {
            'academic_student_id': academic_student_id,
            'rut': rut,
            'name': user.get_full_name(),
            'program': 'Educación',
            'enrollment_year': enrollment_date.year,
            'enrollment_status': enrollment_status,
            'is_active': enrollment_status == 'active',
            'is_regular_student': random.choice([True, False]),
            'has_academic_debt': random.choice([False, False, True]),  # 66% sin deuda
            'verification_status': 'verified',
            'academic_year': date.today().year,
            'enrollment_date': enrollment_date,
            'graduation_year': None if enrollment_status != 'graduated' else enrollment_date.year + 4
        }


class AcademicStatusView(generics.RetrieveAPIView):
    """Phase 2: Obtener estado académico del estudiante"""
    queryset = AcademicIntegration.objects.all()
    serializer_class = AcademicIntegrationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """Filtrar por usuario"""
        return AcademicIntegration.objects.filter(
            student_verification__user=self.request.user
        )
