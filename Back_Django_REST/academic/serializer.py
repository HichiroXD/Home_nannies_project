"""
Academic API Serializers - Phase 3
Serializers para modelos académicos con validación
"""

from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import AcademicProvider, AcademicStudent, AcademicProgram, AcademicVerification

User = get_user_model()


class AcademicProviderSerializer(serializers.ModelSerializer):
    """Serializer para proveedores académicos"""

    class Meta:
        model = AcademicProvider
        fields = [
            'id', 'name', 'provider_type', 'api_endpoint', 
            'is_active', 'is_primary', 'sync_status', 'last_sync'
        ]
        read_only_fields = ['id', 'sync_status', 'last_sync']

    def validate_api_endpoint(self, value):
        """Valida que la URL sea válida si se proporciona"""
        if value and not (value.startswith('http://') or value.startswith('https://')):
            raise serializers.ValidationError('API endpoint debe comenzar con http:// o https://')
        return value


class AcademicProgramSerializer(serializers.ModelSerializer):
    """Serializer para programas académicos"""

    provider_name = serializers.CharField(source='provider.name', read_only=True)

    class Meta:
        model = AcademicProgram
        fields = [
            'id', 'provider', 'provider_name', 'program_code', 
            'program_name', 'career_name', 'faculty', 'degree_type',
            'duration_years', 'is_active', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']

    def validate(self, data):
        """Valida que el programa sea único por proveedor"""
        # Verificar en actualización
        if self.instance:
            existing = AcademicProgram.objects.filter(
                provider=data.get('provider', self.instance.provider),
                program_code=data.get('program_code', self.instance.program_code)
            ).exclude(id=self.instance.id)
        else:
            existing = AcademicProgram.objects.filter(
                provider=data['provider'],
                program_code=data['program_code']
            )

        if existing.exists():
            raise serializers.ValidationError(
                'Ya existe un programa con este código para este proveedor'
            )

        return data


class AcademicStudentSerializer(serializers.ModelSerializer):
    """Serializer para estudiantes académicos"""

    user_email = serializers.CharField(source='user.email', read_only=True)
    provider_name = serializers.CharField(source='provider.name', read_only=True)
    full_name = serializers.SerializerMethodField()

    class Meta:
        model = AcademicStudent
        fields = [
            'id', 'user', 'user_email', 'provider', 'provider_name',
            'student_id', 'rut', 'first_name', 'last_name', 'full_name',
            'email', 'program_name', 'program_code', 'enrollment_status',
            'enrollment_date', 'graduation_year', 'current_year', 'current_semester',
            'is_verified', 'verification_date', 'verification_method',
            'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'user_email', 'provider_name', 'full_name',
            'created_at', 'updated_at'
        ]

    def get_full_name(self, obj):
        """Retorna nombre completo"""
        return obj.get_full_name()

    def validate_rut(self, value):
        """Valida formato de RUT"""
        if not value or '-' not in value:
            raise serializers.ValidationError('RUT debe tener formato XX.XXX.XXX-X o XXXXXXXX-X')
        return value

    def validate_enrollment_status(self, value):
        """Valida estado de matrícula"""
        valid_statuses = ['active', 'inactive', 'graduated', 'suspended']
        if value not in valid_statuses:
            raise serializers.ValidationError(
                f'Estado inválido. Opciones válidas: {", ".join(valid_statuses)}'
            )
        return value


class AcademicVerificationSerializer(serializers.ModelSerializer):
    """Serializer para verificaciones académicas"""

    user_email = serializers.CharField(source='user.email', read_only=True)
    provider_name = serializers.CharField(source='provider.name', read_only=True, required=False)
    academic_student_id = serializers.SerializerMethodField()

    class Meta:
        model = AcademicVerification
        fields = [
            'id', 'user', 'user_email', 'provider', 'provider_name',
            'academic_student', 'academic_student_id',
            'rut', 'first_name', 'last_name', 'program_name',
            'status', 'verified_data', 'mismatch_details', 'error_message',
            'attempted_at', 'verified_at', 'verification_method',
            'created_at'
        ]
        read_only_fields = [
            'id', 'user_email', 'provider_name', 'academic_student_id',
            'verified_data', 'mismatch_details', 'error_message',
            'attempted_at', 'verified_at', 'verification_method',
            'created_at'
        ]

    def get_academic_student_id(self, obj):
        """Retorna ID del estudiante académico si existe"""
        if obj.academic_student:
            return obj.academic_student.id
        return None

    def validate(self, data):
        """Valida datos requeridos"""
        if not data.get('rut'):
            raise serializers.ValidationError('RUT es requerido')
        if not data.get('first_name'):
            raise serializers.ValidationError('Nombre es requerido')
        if not data.get('last_name'):
            raise serializers.ValidationError('Apellido es requerido')
        return data

    def validate_rut(self, value):
        """Valida formato de RUT"""
        if not value or '-' not in value:
            raise serializers.ValidationError('RUT debe tener formato XX.XXX.XXX-X o XXXXXXXX-X')
        return value


class VerifyStudentRequestSerializer(serializers.Serializer):
    """Serializer para solicitud de verificación de estudiante"""

    rut = serializers.CharField(max_length=20)
    first_name = serializers.CharField(max_length=100)
    last_name = serializers.CharField(max_length=100)
    program_name = serializers.CharField(max_length=255, required=False, allow_blank=True)

    def validate_rut(self, value):
        """Valida formato de RUT"""
        if not value or '-' not in value:
            raise serializers.ValidationError('RUT debe tener formato XX.XXX.XXX-X o XXXXXXXX-X')
        return value

    def validate(self, data):
        """Valida datos generales"""
        if not data.get('first_name') or not data.get('first_name').strip():
            raise serializers.ValidationError({'first_name': 'Nombre no puede estar vacío'})
        if not data.get('last_name') or not data.get('last_name').strip():
            raise serializers.ValidationError({'last_name': 'Apellido no puede estar vacío'})
        return data


class VerifyStudentResponseSerializer(serializers.Serializer):
    """Serializer para respuesta de verificación de estudiante"""

    verified = serializers.BooleanField()
    student_data = serializers.JSONField(required=False, allow_null=True)
    verification_id = serializers.IntegerField(required=False)
    message = serializers.CharField(required=False)
    error = serializers.CharField(required=False, allow_null=True)


class AcademicStatusSerializer(serializers.Serializer):
    """Serializer para estado académico del usuario"""

    is_verified = serializers.BooleanField()
    student_data = AcademicStudentSerializer(required=False, allow_null=True)
    verification_status = serializers.CharField(required=False)
    last_verification = serializers.DateTimeField(required=False, allow_null=True)
    verification_method = serializers.CharField(required=False, allow_null=True)
