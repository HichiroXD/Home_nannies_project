"""
Models para Academic API Integration - Phase 3
"""

from django.db import models
from django.contrib.auth import get_user_model
from django.utils import timezone
import json

User = get_user_model()


class AcademicProvider(models.Model):
    """
    Proveedor de servicios académicos
    Define la fuente de datos académica (Mock, Real API, Database)
    """
    PROVIDER_TYPES = (
        ('mock', 'Mock Data'),
        ('api', 'External API'),
        ('database', 'Database'),
        ('sap', 'SAP System'),
        ('banner', 'Banner System'),
    )

    name = models.CharField(max_length=100, unique=True)
    provider_type = models.CharField(max_length=50, choices=PROVIDER_TYPES)
    description = models.TextField(blank=True)
    
    # Configuración de conexión
    api_endpoint = models.URLField(blank=True, help_text='URL del API (si aplica)')
    api_key = models.CharField(max_length=255, blank=True)
    api_secret = models.CharField(max_length=255, blank=True)
    timeout = models.IntegerField(default=10, help_text='Timeout en segundos')
    
    # Estado
    is_active = models.BooleanField(default=True)
    is_primary = models.BooleanField(default=False, help_text='Proveedor principal para queries')
    
    # Metadata
    last_sync = models.DateTimeField(null=True, blank=True)
    sync_status = models.CharField(
        max_length=50,
        choices=(
            ('pending', 'Pending'),
            ('syncing', 'Syncing'),
            ('success', 'Success'),
            ('failed', 'Failed'),
        ),
        default='pending'
    )
    last_error = models.TextField(blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Academic Provider'
        verbose_name_plural = 'Academic Providers'
        ordering = ['-is_primary', '-is_active']

    def __str__(self):
        return f'{self.name} ({self.get_provider_type_display()})'


class AcademicStudent(models.Model):
    """
    Datos académicos de estudiante obtenidos del proveedor
    """
    STATUS_CHOICES = (
        ('active', 'Activo'),
        ('inactive', 'Inactivo'),
        ('suspended', 'Suspendido'),
        ('graduated', 'Egresado'),
        ('expelled', 'Expulsado'),
        ('leave', 'Licencia'),
    )

    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name='academic_student'
    )
    provider = models.ForeignKey(
        AcademicProvider,
        on_delete=models.PROTECT,
        related_name='students'
    )
    
    # Identificadores
    student_id = models.CharField(
        max_length=50,
        help_text='ID en sistema académico'
    )
    rut = models.CharField(
        max_length=12,
        help_text='RUT del estudiante'
    )
    
    # Datos académicos
    first_name = models.CharField(max_length=100, blank=True)
    last_name = models.CharField(max_length=100, blank=True)
    email = models.EmailField(blank=True)
    
    program_name = models.CharField(max_length=255, blank=True)
    program_code = models.CharField(max_length=50, blank=True)
    career_name = models.CharField(max_length=255, blank=True)
    
    enrollment_status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='active'
    )
    enrollment_date = models.DateField(null=True, blank=True)
    graduation_year = models.IntegerField(null=True, blank=True)
    
    current_semester = models.CharField(max_length=10, blank=True)
    current_year = models.IntegerField(null=True, blank=True)
    
    # Validación
    is_verified = models.BooleanField(default=False)
    verification_date = models.DateTimeField(null=True, blank=True)
    verification_method = models.CharField(max_length=50, blank=True)
    
    # Metadata
    raw_data = models.JSONField(
        default=dict,
        blank=True,
        help_text='Datos crudos del proveedor'
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Academic Student'
        verbose_name_plural = 'Academic Students'
        unique_together = [['provider', 'student_id']]
        indexes = [
            models.Index(fields=['user', 'is_verified']),
            models.Index(fields=['rut']),
            models.Index(fields=['enrollment_status']),
        ]

    def __str__(self):
        return f'{self.user.email} - {self.program_name}'

    def get_full_name(self):
        """Obtiene nombre completo"""
        return f'{self.first_name} {self.last_name}'.strip()

    def mark_verified(self, method='api'):
        """Marca como verificado"""
        self.is_verified = True
        self.verification_date = timezone.now()
        self.verification_method = method
        self.save(update_fields=['is_verified', 'verification_date', 'verification_method'])


class AcademicProgram(models.Model):
    """
    Programas académicos disponibles en el proveedor
    """
    provider = models.ForeignKey(
        AcademicProvider,
        on_delete=models.CASCADE,
        related_name='programs'
    )
    
    program_code = models.CharField(max_length=50)
    program_name = models.CharField(max_length=255)
    career_name = models.CharField(max_length=255, blank=True)
    faculty = models.CharField(max_length=255, blank=True)
    
    # Tipo de programa
    degree_type = models.CharField(
        max_length=50,
        choices=(
            ('undergraduate', 'Undergraduate'),
            ('postgraduate', 'Postgraduate'),
            ('diploma', 'Diploma'),
            ('certificate', 'Certificate'),
        ),
        default='undergraduate'
    )
    
    duration_years = models.IntegerField(null=True, blank=True)
    is_active = models.BooleanField(default=True)
    
    metadata = models.JSONField(default=dict, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Academic Program'
        verbose_name_plural = 'Academic Programs'
        unique_together = [['provider', 'program_code']]
        ordering = ['program_name']

    def __str__(self):
        return f'{self.program_name} ({self.provider.name})'


class AcademicVerification(models.Model):
    """
    Registro de verificación académica
    """
    STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('verifying', 'Verifying'),
        ('verified', 'Verified'),
        ('failed', 'Failed'),
        ('mismatch', 'Mismatch'),
    )

    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='academic_verifications'
    )
    
    # Datos a verificar
    rut = models.CharField(max_length=12)
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    program_name = models.CharField(max_length=255, blank=True)
    
    # Resultados
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='pending'
    )
    
    provider = models.ForeignKey(
        AcademicProvider,
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )
    
    academic_student = models.ForeignKey(
        AcademicStudent,
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )
    
    # Datos verificados
    verified_data = models.JSONField(default=dict, blank=True)
    mismatch_details = models.JSONField(default=dict, blank=True)
    error_message = models.TextField(blank=True)
    
    # Auditoría
    attempted_at = models.DateTimeField(auto_now_add=True)
    verified_at = models.DateTimeField(null=True, blank=True)
    verification_method = models.CharField(max_length=50, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Academic Verification'
        verbose_name_plural = 'Academic Verifications'
        ordering = ['-attempted_at']
        indexes = [
            models.Index(fields=['user', 'status']),
            models.Index(fields=['rut']),
        ]

    def __str__(self):
        return f'{self.rut} - {self.get_status_display()}'

    def mark_verified(self, verified_data, method='api'):
        """Marca como verificado con datos"""
        self.status = 'verified'
        self.verified_data = verified_data
        self.verified_at = timezone.now()
        self.verification_method = method
        self.save()

    def mark_failed(self, error_msg=''):
        """Marca como fallida"""
        self.status = 'failed'
        self.error_message = error_msg
        self.save(update_fields=['status', 'error_message'])
