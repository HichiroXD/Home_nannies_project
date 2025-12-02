from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.utils import timezone
from django.contrib.auth.tokens import default_token_generator
import jwt
import os

from .models import (
    UniversityProgram,
    StudentVerification,
    DocumentVerification,
    OCRExtraction,
    AcademicIntegration
)
from .validators import (
    validate_rut, 
    validate_institutional_email,
    validate_password_strength,
    validate_ocr,
    validate_certificate_validity,
    validate_academic_consistency
)

User = get_user_model()


class UniversityProgramSerializer(serializers.ModelSerializer):
    """Serializador para Programas Universitarios"""
    
    class Meta:
        model = UniversityProgram
        fields = ['id', 'code', 'name', 'is_education_program', 'specialization']
        read_only_fields = ['id']


class StudentVerificationSerializer(serializers.ModelSerializer):
    """Serializador para Verificación de Estudiante"""
    program_detail = UniversityProgramSerializer(source='program', read_only=True)
    
    class Meta:
        model = StudentVerification
        fields = [
            'id', 'user', 'program', 'program_detail', 'enrollment_certificate',
            'status', 'verified_date', 'rejection_reason', 'created_at'
        ]
        read_only_fields = ['id', 'verified_date', 'created_at']


class DocumentVerificationSerializer(serializers.ModelSerializer):
    """Serializador para Verificación de Documento"""
    
    class Meta:
        model = DocumentVerification
        fields = [
            'id', 'user', 'document_type', 'file', 'rut_number',
            'status', 'verified_date', 'notes', 'created_at'
        ]
        read_only_fields = ['id', 'verified_date', 'created_at']


class RegisterParentSerializer(serializers.Serializer):
    """
    Serializador para registro de Padre/Madre.
    
    Campos requeridos:
    - username: Único, alfanumérico
    - institutional_email: @universidad.edu.co, único
    - first_name: Nombre
    - last_name: Apellido
    - password: Mínimo 8 caracteres, con mayúscula, minúscula, número y especial
    - rut: RUT chileno válido
    """
    username = serializers.CharField(max_length=150)
    institutional_email = serializers.EmailField()
    first_name = serializers.CharField(max_length=150)
    last_name = serializers.CharField(max_length=150)
    password = serializers.CharField(write_only=True, min_length=8)
    rut = serializers.CharField(max_length=20)

    def validate_username(self, value):
        """Validar username único"""
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError(
                'Este nombre de usuario ya está registrado'
            )
        return value

    def validate_institutional_email(self, value):
        """Validar email institucional"""
        validate_institutional_email(value)
        return value

    def validate_password(self, value):
        """Validar contraseña"""
        validate_password_strength(value)
        return value

    def validate_rut(self, value):
        """Validar RUT"""
        validate_rut(value)
        
        # Normalizar RUT
        rut_clean = value.replace('.', '').replace('-', '').upper()
        
        # Validar que no exista
        if User.objects.filter(rut=rut_clean).exists():
            raise serializers.ValidationError(
                'Este RUT ya está registrado'
            )
        return rut_clean

    def create(self, validated_data):
        """Crear usuario Padre/Madre"""
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['institutional_email'],
            institutional_email=validated_data['institutional_email'],
            first_name=validated_data['first_name'],
            last_name=validated_data['last_name'],
            password=validated_data['password'],
            rut=validated_data['rut'],
            role='parent',
            verification_status='pending',
            is_verified=False,
            email_verified=False
        )
        return user


class RegisterNannySerializer(serializers.Serializer):
    """
    Serializador para registro de Niñera.
    
    Además de los campos de Padre/Madre, requiere:
    - program_id: ID del programa universitario (debe ser Educación)
    - enrollment_certificate: Certificado de matrícula (PDF/JPG/PNG)
    """
    username = serializers.CharField(max_length=150)
    institutional_email = serializers.EmailField()
    first_name = serializers.CharField(max_length=150)
    last_name = serializers.CharField(max_length=150)
    password = serializers.CharField(write_only=True, min_length=8)
    rut = serializers.CharField(max_length=20)
    program_id = serializers.IntegerField()
    enrollment_certificate = serializers.FileField()

    def validate_username(self, value):
        """Validar username único"""
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError(
                'Este nombre de usuario ya está registrado'
            )
        return value

    def validate_institutional_email(self, value):
        """Validar email institucional"""
        validate_institutional_email(value)
        return value

    def validate_password(self, value):
        """Validar contraseña"""
        validate_password_strength(value)
        return value

    def validate_rut(self, value):
        """Validar RUT"""
        validate_rut(value)
        
        # Normalizar RUT
        rut_clean = value.replace('.', '').replace('-', '').upper()
        
        # Validar que no exista
        if User.objects.filter(rut=rut_clean).exists():
            raise serializers.ValidationError(
                'Este RUT ya está registrado'
            )
        return rut_clean

    def validate_program_id(self, value):
        """Validar que programa existe y es de Educación"""
        try:
            program = UniversityProgram.objects.get(id=value)
        except UniversityProgram.DoesNotExist:
            raise serializers.ValidationError(
                'Programa universitario no encontrado'
            )
        
        if not program.is_education_program:
            raise serializers.ValidationError(
                'Solo estudiantes de Educación pueden registrarse como niñeras'
            )
        
        return value

    def validate_enrollment_certificate(self, value):
        """Validar archivo de certificado"""
        # Tamaño máximo 5MB
        if value.size > 5 * 1024 * 1024:
            raise serializers.ValidationError(
                'El archivo no debe superar 5MB'
            )
        
        # Extensiones permitidas
        allowed_extensions = ['pdf', 'jpg', 'jpeg', 'png']
        ext = value.name.split('.')[-1].lower()
        if ext not in allowed_extensions:
            raise serializers.ValidationError(
                f'Formato no permitido. Use: {", ".join(allowed_extensions)}'
            )
        
        return value

    def create(self, validated_data):
        """Crear usuario Niñera con verificación"""
        program = UniversityProgram.objects.get(id=validated_data['program_id'])
        
        # Crear usuario
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['institutional_email'],
            institutional_email=validated_data['institutional_email'],
            first_name=validated_data['first_name'],
            last_name=validated_data['last_name'],
            password=validated_data['password'],
            rut=validated_data['rut'],
            role='nanny',
            verification_status='pending',
            is_verified=False,
            email_verified=False
        )
        
        # Crear verificación de estudiante
        StudentVerification.objects.create(
            user=user,
            program=program,
            enrollment_certificate=validated_data['enrollment_certificate'],
            status='pending'
        )
        
        return user


class VerifyEmailSerializer(serializers.Serializer):
    """Serializador para verificación de email"""
    token = serializers.CharField()

    def validate_token(self, value):
        """Validar que token es válido"""
        try:
            # Decodificar JWT
            secret = os.getenv('SECRET_KEY', 'default-secret-key')
            payload = jwt.decode(value, secret, algorithms=['HS256'])
            user_id = payload.get('user_id')
            
            if not user_id:
                raise serializers.ValidationError('Token inválido')
            
            try:
                user = User.objects.get(id=user_id)
            except User.DoesNotExist:
                raise serializers.ValidationError('Usuario no encontrado')
            
            return user
        except jwt.ExpiredSignatureError:
            raise serializers.ValidationError('Token expirado')
        except jwt.InvalidTokenError:
            raise serializers.ValidationError('Token inválido')


class ResendTokenSerializer(serializers.Serializer):
    """Serializador para reenviar token de verificación"""
    institutional_email = serializers.EmailField()

    def validate_institutional_email(self, value):
        """Validar que usuario existe"""
        try:
            user = User.objects.get(institutional_email=value)
        except User.DoesNotExist:
            raise serializers.ValidationError(
                'Usuario no encontrado'
            )
        
        if user.email_verified:
            raise serializers.ValidationError(
                'Email ya está verificado'
            )
        
        return user


class VerificationStatusSerializer(serializers.Serializer):
    """Serializador para obtener estado de verificación"""
    
    class UserNestedSerializer(serializers.ModelSerializer):
        class Meta:
            model = User
            fields = [
                'id', 'username', 'institutional_email', 'role',
                'verification_status', 'email_verified', 'created_at'
            ]
    
    class StudentVerificationNestedSerializer(serializers.ModelSerializer):
        program_detail = UniversityProgramSerializer(source='program', read_only=True)
        
        class Meta:
            model = StudentVerification
            fields = ['status', 'program_detail', 'verified_date', 'rejection_reason']
    
    user = UserNestedSerializer()
    student_verification = StudentVerificationNestedSerializer(required=False)
    documents = serializers.SerializerMethodField()

    def get_documents(self, obj):
        """Obtener documentos de verificación"""
        docs = DocumentVerification.objects.filter(user=obj.user)
        return DocumentVerificationSerializer(docs, many=True).data


# ========== SERIALIZERS PHASE 2: OCR y Validación Académica ==========


class OCRExtractionSerializer(serializers.ModelSerializer):
    """Serializador para resultados de OCR extraídos"""
    
    class Meta:
        model = OCRExtraction
        fields = [
            'id', 'document', 'extracted_rut', 'extracted_name',
            'extracted_program', 'extracted_enrollment_year',
            'valid_from', 'valid_until', 'confidence_score',
            'confidence_level', 'status', 'extracted_at', 'validated_at'
        ]
        read_only_fields = [
            'id', 'extracted_at', 'validated_at', 'confidence_level'
        ]


class DocumentUploadSerializer(serializers.ModelSerializer):
    """
    Serializador para cargar documentos para OCR.
    
    Phase 2: Usado para cargar RUT o certificados de matrícula
    """
    
    class Meta:
        model = DocumentVerification
        fields = [
            'id', 'document_type', 'file', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']
    
    def validate_document_type(self, value):
        """Validar tipo de documento"""
        if value not in ['rut', 'certificate']:
            raise serializers.ValidationError(
                'Tipo debe ser "rut" o "certificate"'
            )
        return value


class OCRResultSerializer(serializers.Serializer):
    """
    Serializador para resultados de extracción OCR.
    
    Representa los datos extraídos de un documento
    """
    document_id = serializers.IntegerField(read_only=True)
    extracted_rut = serializers.CharField(required=False)
    extracted_name = serializers.CharField(required=False)
    extracted_program = serializers.CharField(required=False)
    extracted_enrollment_year = serializers.IntegerField(required=False)
    valid_from = serializers.DateField(required=False)
    valid_until = serializers.DateField(required=False)
    confidence_score = serializers.FloatField()
    confidence_level = serializers.CharField()
    status = serializers.CharField()
    extraction_metadata = serializers.JSONField(required=False)


class AcademicIntegrationSerializer(serializers.ModelSerializer):
    """Serializador para Integración Académica"""
    student_info = serializers.SerializerMethodField()
    
    class Meta:
        model = AcademicIntegration
        fields = [
            'id', 'academic_student_id', 'enrollment_status',
            'academic_year', 'enrollment_date', 'graduation_year',
            'is_regular_student', 'has_academic_debt',
            'verification_status', 'verified_at', 'last_sync',
            'student_info', 'created_at'
        ]
        read_only_fields = [
            'id', 'verified_at', 'last_sync', 'created_at', 'student_info'
        ]
    
    def get_student_info(self, obj):
        """Obtener info del estudiante"""
        return {
            'username': obj.student_verification.user.username,
            'name': obj.student_verification.user.get_full_name(),
            'email': obj.student_verification.user.institutional_email,
            'program': obj.student_verification.program.name
        }


class DocumentVerificationExpandedSerializer(serializers.ModelSerializer):
    """
    Serializador expandido para DocumentVerification con datos OCR.
    
    Phase 2: Incluye información de OCR y validación
    """
    ocr_data = serializers.SerializerMethodField()
    is_valid = serializers.SerializerMethodField()
    
    class Meta:
        model = DocumentVerification
        fields = [
            'id', 'document_type', 'file', 'rut_number', 'extracted_rut',
            'extracted_name', 'status', 'ocr_status', 'confidence_score',
            'valid_from', 'valid_until', 'is_valid', 'ocr_data',
            'verified_date', 'notes', 'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'extracted_rut', 'extracted_name', 'confidence_score',
            'ocr_status', 'valid_from', 'valid_until', 'verified_date',
            'created_at', 'updated_at'
        ]
    
    def get_ocr_data(self, obj):
        """Obtener datos OCR si existen"""
        if hasattr(obj, 'ocr_extraction'):
            return OCRExtractionSerializer(obj.ocr_extraction).data
        return None
    
    def get_is_valid(self, obj):
        """¿Documento válido para verificación?"""
        if obj.status != 'approved':
            return False
        if obj.document_type == 'certificate':
            return obj.is_valid_certificate()
        return True


class AcademicVerificationSerializer(serializers.Serializer):
    """
    Serializador para verificar consistencia académica.
    
    Valida que OCR coincida con sistema académico
    """
    student_verification_id = serializers.IntegerField()
    document_id = serializers.IntegerField()
    
    def validate_student_verification_id(self, value):
        """Validar que StudentVerification existe"""
        try:
            StudentVerification.objects.get(id=value)
        except StudentVerification.DoesNotExist:
            raise serializers.ValidationError(
                'Verificación de estudiante no encontrada'
            )
        return value
    
    def validate_document_id(self, value):
        """Validar que Document existe"""
        try:
            DocumentVerification.objects.get(id=value)
        except DocumentVerification.DoesNotExist:
            raise serializers.ValidationError(
                'Documento no encontrado'
            )
        return value


class AcademicDataSimulatorSerializer(serializers.Serializer):
    """
    Simulador de datos académicos.
    
    Representa datos obtenidos del sistema académico (simulado)
    """
    academic_student_id = serializers.CharField()
    rut = serializers.CharField()
    name = serializers.CharField()
    program = serializers.CharField()
    enrollment_year = serializers.IntegerField()
    enrollment_status = serializers.CharField()
    is_active = serializers.BooleanField()
    has_academic_debt = serializers.BooleanField()
    verification_status = serializers.CharField()
    academic_year = serializers.IntegerField()
