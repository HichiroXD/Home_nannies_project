from django.db import models
from django.contrib.auth import get_user_model
from django.core.validators import FileExtensionValidator
from django.utils import timezone
from .audit_models import AuditLog, UserPermission  # Importar modelos de auditoría

User = get_user_model()


class UniversityProgram(models.Model):
    """
    Programas universitarios disponibles en la institución.
    
    Solo estudiantes de programas con is_education_program=True
    pueden registrarse como niñeras.
    """
    code = models.CharField(
        max_length=50,
        unique=True,
        help_text="Código del programa (e.g., EDUC101)"
    )
    name = models.CharField(
        max_length=200,
        help_text="Nombre oficial del programa"
    )
    is_education_program = models.BooleanField(
        default=False,
        help_text="¿Es programa de Educación? Solo estos pueden ser niñeras"
    )
    specialization = models.CharField(
        max_length=200,
        blank=True,
        help_text="Especialización dentro del programa"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Programa Universitario"
        verbose_name_plural = "Programas Universitarios"
        ordering = ['code']
        indexes = [
            models.Index(fields=['code']),
            models.Index(fields=['is_education_program']),
        ]

    def __str__(self):
        return f"{self.code} - {self.name}"


class StudentVerification(models.Model):
    """
    Vinculación entre usuario y programa universitario.
    Registra el estado de verificación del estudiante.
    """
    VERIFICATION_STATUS = (
        ('pending', 'Pendiente'),
        ('approved', 'Aprobado'),
        ('rejected', 'Rechazado'),
        ('suspended', 'Suspendido'),
    )

    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name='student_verification'
    )
    program = models.ForeignKey(
        UniversityProgram,
        on_delete=models.PROTECT,
        related_name='students'
    )
    
    # Documento de matrícula
    enrollment_certificate = models.FileField(
        upload_to='certificates/%Y/%m/%d/',
        validators=[FileExtensionValidator(allowed_extensions=['pdf', 'jpg', 'jpeg', 'png'])],
        help_text="Certificado de matrícula actual"
    )
    
    # Estado
    status = models.CharField(
        max_length=20,
        choices=VERIFICATION_STATUS,
        default='pending',
        help_text="Estado de verificación"
    )
    verified_date = models.DateTimeField(
        null=True,
        blank=True,
        help_text="Fecha de verificación por admin"
    )
    rejection_reason = models.TextField(
        blank=True,
        help_text="Motivo de rechazo si aplica"
    )
    
    # Auditoría
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Verificación de Estudiante"
        verbose_name_plural = "Verificaciones de Estudiantes"
        indexes = [
            models.Index(fields=['user', 'status']),
            models.Index(fields=['program']),
        ]

    def __str__(self):
        return f"{self.user.username} - {self.program.code}"

    def is_active_student(self):
        """¿Es estudiante activo verificado?"""
        return self.status == 'approved'

    def is_eligible_nanny(self):
        """¿Puede ser niñera?"""
        return (
            self.is_active_student() and 
            self.program.is_education_program
        )


class DocumentVerification(models.Model):
    """
    Verifica documentos como RUT y certificados de matrícula.
    Phase 2: Expandido con campos para OCR y validación automática.
    """
    DOCUMENT_TYPES = (
        ('rut', 'RUT/Cédula de Identidad'),
        ('certificate', 'Certificado de Matrícula'),
        ('other', 'Otro Documento'),
    )

    VERIFICATION_STATUS = (
        ('pending', 'Pendiente'),
        ('approved', 'Aprobado'),
        ('rejected', 'Rechazado'),
    )
    
    # Phase 2: OCR Status
    OCR_STATUS = (
        ('pending', 'Pendiente'),
        ('processing', 'Procesando'),
        ('extracted', 'Extraído'),
        ('verified', 'Verificado'),
        ('failed', 'Falló'),
    )

    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='document_verifications'
    )
    
    document_type = models.CharField(
        max_length=20,
        choices=DOCUMENT_TYPES,
        help_text="Tipo de documento"
    )
    
    # Archivo
    file = models.FileField(
        upload_to='documents/%Y/%m/%d/',
        validators=[FileExtensionValidator(allowed_extensions=['pdf', 'jpg', 'jpeg', 'png'])],
        help_text="Documento escaneado"
    )
    
    # RUT extraído
    rut_number = models.CharField(
        max_length=20,
        blank=True,
        help_text="RUT extraído del documento"
    )
    
    # Estado
    status = models.CharField(
        max_length=20,
        choices=VERIFICATION_STATUS,
        default='pending'
    )
    verified_date = models.DateTimeField(
        null=True,
        blank=True,
        help_text="Fecha de verificación"
    )
    notes = models.TextField(
        blank=True,
        help_text="Notas de verificación"
    )
    
    # Phase 2: OCR Status
    ocr_status = models.CharField(
        max_length=20,
        choices=OCR_STATUS,
        default='pending',
        help_text="Estado del procesamiento OCR"
    )
    
    # Phase 2: Confianza
    confidence_score = models.FloatField(
        default=0.0,
        help_text="Confianza de OCR (0.0 a 1.0)"
    )
    
    # Phase 2: Fechas de validez
    valid_from = models.DateField(
        null=True,
        blank=True,
        help_text="Fecha de inicio de validez"
    )
    valid_until = models.DateField(
        null=True,
        blank=True,
        help_text="Fecha de vencimiento"
    )
    
    # Phase 2: Datos extraídos
    extracted_rut = models.CharField(
        max_length=20,
        blank=True,
        help_text="RUT extraído por OCR"
    )
    
    extracted_name = models.CharField(
        max_length=200,
        blank=True,
        help_text="Nombre extraído por OCR"
    )
    
    # Auditoría
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Verificación de Documento"
        verbose_name_plural = "Verificaciones de Documentos"
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', 'document_type']),
            models.Index(fields=['rut_number']),
            models.Index(fields=['status']),
            models.Index(fields=['ocr_status']),
            models.Index(fields=['confidence_score']),
        ]

    def __str__(self):
        return f"{self.user.username} - {self.document_type} ({self.status})"

    def approve(self, notes=""):
        """Aprobar documento"""
        self.status = 'approved'
        self.verified_date = timezone.now()
        self.notes = notes
        self.save()

    def reject(self, reason):
        """Rechazar documento"""
        self.status = 'rejected'
        self.verified_date = timezone.now()
        self.notes = reason
        self.save()
    
    def is_valid_certificate(self):
        """¿Certificado vigente?"""
        if not self.valid_until:
            return False
        today = timezone.now().date()
        return today <= self.valid_until
    
    def is_high_confidence(self):
        """¿OCR con confianza suficiente?"""
        return self.confidence_score >= 0.85


class OCRExtraction(models.Model):
    """
    Phase 2: Almacena datos extraídos por OCR desde documentos.
    Relaciona directamente con DocumentVerification.
    """
    CONFIDENCE_LEVELS = (
        ('high', 'Alta (90-100%)'),
        ('medium', 'Media (70-89%)'),
        ('low', 'Baja (<70%)'),
    )
    
    OCR_STATUS_CHOICES = (
        ('extracting', 'En extracción'),
        ('extracted', 'Datos extraídos'),
        ('validating', 'Validando'),
        ('validated', 'Validado'),
        ('failed', 'Falló extracción'),
    )
    
    document = models.OneToOneField(
        DocumentVerification,
        on_delete=models.CASCADE,
        related_name='ocr_extraction',
        help_text="Documento del cual se extrajo"
    )
    
    # Datos extraídos
    extracted_rut = models.CharField(
        max_length=20,
        blank=True,
        help_text="RUT extraído"
    )
    extracted_name = models.CharField(
        max_length=200,
        blank=True,
        help_text="Nombre extraído"
    )
    extracted_program = models.CharField(
        max_length=100,
        blank=True,
        help_text="Programa extraído"
    )
    extracted_enrollment_year = models.IntegerField(
        null=True,
        blank=True,
        help_text="Año de matrícula extraído"
    )
    
    # Certificado (si aplica)
    valid_from = models.DateField(
        null=True,
        blank=True,
        help_text="Fecha de inicio de validez"
    )
    valid_until = models.DateField(
        null=True,
        blank=True,
        help_text="Fecha de vencimiento"
    )
    
    # Confianza
    confidence_score = models.FloatField(
        default=0.0,
        help_text="Score de confianza (0.0 a 1.0)"
    )
    confidence_level = models.CharField(
        max_length=10,
        choices=CONFIDENCE_LEVELS,
        default='low'
    )
    
    # Datos crudos
    raw_text = models.TextField(
        blank=True,
        help_text="Texto completo extraído"
    )
    extraction_metadata = models.JSONField(
        default=dict,
        help_text="Metadatos del OCR"
    )
    
    # Estado
    status = models.CharField(
        max_length=20,
        choices=OCR_STATUS_CHOICES,
        default='extracting'
    )
    
    # Auditoría
    extracted_at = models.DateTimeField(auto_now_add=True)
    validated_at = models.DateTimeField(
        null=True,
        blank=True
    )
    
    class Meta:
        verbose_name = "Extracción OCR"
        verbose_name_plural = "Extracciones OCR"
        ordering = ['-extracted_at']
        indexes = [
            models.Index(fields=['document']),
            models.Index(fields=['status']),
            models.Index(fields=['confidence_score']),
        ]
    
    def __str__(self):
        return f"OCR {self.document.user.username} - {self.status}"
    
    def get_confidence_level(self):
        """Obtener nivel de confianza"""
        if self.confidence_score >= 0.9:
            return 'high'
        elif self.confidence_score >= 0.7:
            return 'medium'
        else:
            return 'low'
    
    def is_high_confidence(self):
        """¿Confianza suficiente?"""
        return self.confidence_score >= 0.85


class AcademicIntegration(models.Model):
    """
    Phase 2: Integración con sistema académico.
    Almacena datos académicos verificados del estudiante.
    """
    ENROLLMENT_STATUS = (
        ('active', 'Activo'),
        ('inactive', 'Inactivo'),
        ('suspended', 'Suspendido'),
        ('graduated', 'Egresado'),
    )
    
    VERIFICATION_STATUS = (
        ('pending', 'Pendiente'),
        ('verified', 'Verificado'),
        ('mismatch', 'Inconsistencia'),
        ('error', 'Error de consulta'),
    )
    
    student_verification = models.OneToOneField(
        StudentVerification,
        on_delete=models.CASCADE,
        related_name='academic_integration',
        help_text="Verificación de estudiante"
    )
    
    # Datos académicos
    academic_student_id = models.CharField(
        max_length=50,
        unique=True,
        help_text="ID en sistema académico"
    )
    enrollment_status = models.CharField(
        max_length=20,
        choices=ENROLLMENT_STATUS,
        default='active'
    )
    academic_year = models.IntegerField(
        default=2024,
        help_text="Año académico actual"
    )
    enrollment_date = models.DateField(
        help_text="Fecha de matrícula"
    )
    graduation_year = models.IntegerField(
        null=True,
        blank=True,
        help_text="Año de egreso (si aplica)"
    )
    
    # Validaciones
    is_regular_student = models.BooleanField(
        default=True,
        help_text="¿Es estudiante regular?"
    )
    has_academic_debt = models.BooleanField(
        default=False,
        help_text="¿Tiene deudas académicas?"
    )
    
    # Estado de verificación
    verification_status = models.CharField(
        max_length=20,
        choices=VERIFICATION_STATUS,
        default='pending'
    )
    
    # Auditoría
    created_at = models.DateTimeField(auto_now_add=True)
    verified_at = models.DateTimeField(
        null=True,
        blank=True,
        help_text="Cuándo se verificó"
    )
    last_sync = models.DateTimeField(
        null=True,
        blank=True,
        help_text="Última sincronización con sistema académico"
    )
    
    class Meta:
        verbose_name = "Integración Académica"
        verbose_name_plural = "Integraciones Académicas"
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['academic_student_id']),
            models.Index(fields=['enrollment_status']),
            models.Index(fields=['verification_status']),
        ]
    
    def __str__(self):
        return f"{self.academic_student_id} - {self.enrollment_status}"
    
    def is_valid(self):
        """¿Datos académicos válidos para ser niñera?"""
        return (
            self.enrollment_status == 'active' and
            not self.has_academic_debt and
            self.is_regular_student and
            self.verification_status == 'verified'
        )
    
    def sync_with_academic_system(self):
        """Sincronizar con sistema académico"""
        self.last_sync = timezone.now()
        self.save()
