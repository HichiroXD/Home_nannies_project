"""
Reports Models - Phase 3
Modelos para almacenar y gestionar reportes de verificación
"""

from django.db import models
from django.contrib.auth import get_user_model
from core.models import StudentVerification
from academic.models import AcademicVerification
from django.db.models import Count, Q, F
from django.utils import timezone
from datetime import timedelta

User = get_user_model()


class VerificationReport(models.Model):
    """Reporte consolidado de verificaciones académicas y OCR"""

    REPORT_TYPES = (
        ('daily', 'Diario'),
        ('weekly', 'Semanal'),
        ('monthly', 'Mensual'),
        ('custom', 'Personalizado'),
    )

    report_type = models.CharField(
        max_length=50,
        choices=REPORT_TYPES,
        verbose_name='Tipo de Reporte'
    )
    title = models.CharField(
        max_length=255,
        verbose_name='Título'
    )
    description = models.TextField(
        blank=True,
        null=True,
        verbose_name='Descripción'
    )

    # Fechas
    start_date = models.DateTimeField(
        verbose_name='Fecha Inicio'
    )
    end_date = models.DateTimeField(
        verbose_name='Fecha Fin'
    )

    # Estadísticas OCR
    total_ocr_submissions = models.PositiveIntegerField(
        default=0,
        verbose_name='Total Envíos OCR'
    )
    successful_ocr = models.PositiveIntegerField(
        default=0,
        verbose_name='OCR Exitosos'
    )
    failed_ocr = models.PositiveIntegerField(
        default=0,
        verbose_name='OCR Fallidos'
    )
    rejected_ocr = models.PositiveIntegerField(
        default=0,
        verbose_name='OCR Rechazados'
    )

    # Estadísticas Académicas
    total_academic_verifications = models.PositiveIntegerField(
        default=0,
        verbose_name='Total Verificaciones Académicas'
    )
    successful_academic = models.PositiveIntegerField(
        default=0,
        verbose_name='Verificaciones Exitosas'
    )
    failed_academic = models.PositiveIntegerField(
        default=0,
        verbose_name='Verificaciones Fallidas'
    )

    # Tasas de éxito
    ocr_success_rate = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=0,
        verbose_name='Tasa Éxito OCR (%)'
    )
    academic_success_rate = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=0,
        verbose_name='Tasa Éxito Académica (%)'
    )

    # Datos adicionales
    unique_students = models.PositiveIntegerField(
        default=0,
        verbose_name='Estudiantes Únicos'
    )
    average_verification_time = models.FloatField(
        default=0,
        verbose_name='Tiempo Promedio Verificación (segundos)'
    )

    # Datos raw
    data = models.JSONField(
        default=dict,
        blank=True,
        null=True,
        verbose_name='Datos Raw'
    )

    # Auditoría
    created_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        verbose_name='Creado Por'
    )
    created_at = models.DateTimeField(
        auto_now_add=True,
        verbose_name='Creado'
    )
    updated_at = models.DateTimeField(
        auto_now=True,
        verbose_name='Actualizado'
    )

    class Meta:
        verbose_name = 'Reporte de Verificación'
        verbose_name_plural = 'Reportes de Verificación'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['report_type', 'created_at'], name='report_type_date_idx'),
            models.Index(fields=['start_date', 'end_date'], name='report_dates_idx'),
        ]

    def __str__(self):
        return f'{self.title} ({self.start_date.date()} - {self.end_date.date()})'

    def get_ocr_summary(self):
        """Retorna resumen de OCR"""
        total = self.total_ocr_submissions or 1
        return {
            'total': self.total_ocr_submissions,
            'successful': self.successful_ocr,
            'failed': self.failed_ocr,
            'rejected': self.rejected_ocr,
            'success_rate': self.ocr_success_rate,
            'pending': total - (self.successful_ocr + self.failed_ocr + self.rejected_ocr)
        }

    def get_academic_summary(self):
        """Retorna resumen académico"""
        total = self.total_academic_verifications or 1
        return {
            'total': self.total_academic_verifications,
            'successful': self.successful_academic,
            'failed': self.failed_academic,
            'success_rate': self.academic_success_rate,
            'pending': total - (self.successful_academic + self.failed_academic)
        }


class OcrStatistics(models.Model):
    """Estadísticas detalladas por día para OCR"""

    date = models.DateField(
        verbose_name='Fecha'
    )
    total_submissions = models.PositiveIntegerField(
        default=0,
        verbose_name='Total Envíos'
    )
    successful = models.PositiveIntegerField(
        default=0,
        verbose_name='Exitosos'
    )
    failed = models.PositiveIntegerField(
        default=0,
        verbose_name='Fallidos'
    )
    rejected = models.PositiveIntegerField(
        default=0,
        verbose_name='Rechazados'
    )
    pending = models.PositiveIntegerField(
        default=0,
        verbose_name='Pendientes'
    )

    # Datos de calidad
    average_confidence = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=0,
        verbose_name='Confianza Promedio (%)'
    )
    average_processing_time = models.FloatField(
        default=0,
        verbose_name='Tiempo Procesamiento Promedio (s)'
    )

    # Usuarios activos
    unique_users = models.PositiveIntegerField(
        default=0,
        verbose_name='Usuarios Únicos'
    )

    success_rate = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=0,
        verbose_name='Tasa de Éxito (%)'
    )

    class Meta:
        verbose_name = 'Estadística OCR Diaria'
        verbose_name_plural = 'Estadísticas OCR Diarias'
        ordering = ['-date']
        unique_together = ['date']
        indexes = [
            models.Index(fields=['date'], name='ocr_stat_date_idx'),
        ]

    def __str__(self):
        return f'OCR Statistics - {self.date}'


class AcademicStatistics(models.Model):
    """Estadísticas detalladas por día para verificaciones académicas"""

    date = models.DateField(
        verbose_name='Fecha'
    )
    total_verifications = models.PositiveIntegerField(
        default=0,
        verbose_name='Total Verificaciones'
    )
    successful = models.PositiveIntegerField(
        default=0,
        verbose_name='Exitosas'
    )
    failed = models.PositiveIntegerField(
        default=0,
        verbose_name='Fallidas'
    )
    pending = models.PositiveIntegerField(
        default=0,
        verbose_name='Pendientes'
    )

    # Proveedores
    mock_verifications = models.PositiveIntegerField(
        default=0,
        verbose_name='Verificaciones Mock'
    )
    api_verifications = models.PositiveIntegerField(
        default=0,
        verbose_name='Verificaciones API'
    )
    database_verifications = models.PositiveIntegerField(
        default=0,
        verbose_name='Verificaciones BD'
    )

    # Usuarios activos
    unique_users = models.PositiveIntegerField(
        default=0,
        verbose_name='Usuarios Únicos'
    )

    # Programas populares
    top_programs = models.JSONField(
        default=list,
        blank=True,
        null=True,
        verbose_name='Programas Populares'
    )

    success_rate = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=0,
        verbose_name='Tasa de Éxito (%)'
    )

    class Meta:
        verbose_name = 'Estadística Académica Diaria'
        verbose_name_plural = 'Estadísticas Académicas Diarias'
        ordering = ['-date']
        unique_together = ['date']
        indexes = [
            models.Index(fields=['date'], name='acad_stat_date_idx'),
        ]

    def __str__(self):
        return f'Academic Statistics - {self.date}'


class VerificationTrend(models.Model):
    """Tendencias de verificación a lo largo del tiempo"""

    TREND_TYPES = (
        ('hourly', 'Horario'),
        ('daily', 'Diario'),
        ('weekly', 'Semanal'),
        ('monthly', 'Mensual'),
    )

    trend_type = models.CharField(
        max_length=50,
        choices=TREND_TYPES,
        verbose_name='Tipo de Tendencia'
    )
    timestamp = models.DateTimeField(
        verbose_name='Marca de Tiempo'
    )

    # Contadores
    ocr_submissions = models.PositiveIntegerField(
        default=0,
        verbose_name='Envíos OCR'
    )
    ocr_successful = models.PositiveIntegerField(
        default=0,
        verbose_name='OCR Exitosos'
    )
    academic_verifications = models.PositiveIntegerField(
        default=0,
        verbose_name='Verificaciones Académicas'
    )
    academic_successful = models.PositiveIntegerField(
        default=0,
        verbose_name='Académicas Exitosas'
    )

    # Usuarios activos
    active_users = models.PositiveIntegerField(
        default=0,
        verbose_name='Usuarios Activos'
    )

    # Datos adicionales
    data = models.JSONField(
        default=dict,
        blank=True,
        null=True,
        verbose_name='Datos Adicionales'
    )

    class Meta:
        verbose_name = 'Tendencia de Verificación'
        verbose_name_plural = 'Tendencias de Verificación'
        ordering = ['-timestamp']
        indexes = [
            models.Index(fields=['trend_type', 'timestamp'], name='trend_type_ts_idx'),
        ]

    def __str__(self):
        return f'{self.get_trend_type_display()} - {self.timestamp}'


class UserVerificationSummary(models.Model):
    """Resumen de verificaciones por usuario"""

    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        verbose_name='Usuario',
        related_name='verification_summary'
    )

    # Contador de verificaciones
    total_ocr_submissions = models.PositiveIntegerField(
        default=0,
        verbose_name='Total Envíos OCR'
    )
    successful_ocr = models.PositiveIntegerField(
        default=0,
        verbose_name='OCR Exitosos'
    )
    failed_ocr = models.PositiveIntegerField(
        default=0,
        verbose_name='OCR Fallidos'
    )

    # Verificación académica
    academic_verified = models.BooleanField(
        default=False,
        verbose_name='Verificación Académica Completada'
    )
    last_academic_verification = models.DateTimeField(
        blank=True,
        null=True,
        verbose_name='Última Verificación Académica'
    )
    academic_verification_method = models.CharField(
        max_length=50,
        blank=True,
        null=True,
        verbose_name='Método Verificación'
    )

    # Auditoría
    first_submission = models.DateTimeField(
        blank=True,
        null=True,
        verbose_name='Primer Envío'
    )
    last_submission = models.DateTimeField(
        blank=True,
        null=True,
        verbose_name='Último Envío'
    )
    updated_at = models.DateTimeField(
        auto_now=True,
        verbose_name='Actualizado'
    )

    class Meta:
        verbose_name = 'Resumen Verificación Usuario'
        verbose_name_plural = 'Resúmenes Verificación Usuario'
        ordering = ['-updated_at']
        indexes = [
            models.Index(fields=['user', 'academic_verified'], name='usr_summary_verified_idx'),
        ]

    def __str__(self):
        return f'{self.user.email} - Resumen Verificación'

    def get_ocr_success_rate(self):
        """Calcula tasa de éxito OCR del usuario"""
        total = self.total_ocr_submissions or 1
        return round((self.successful_ocr / total) * 100, 2)

    def get_verification_status(self):
        """Retorna estado general de verificación"""
        if self.academic_verified and self.successful_ocr > 0:
            return 'fully_verified'
        elif self.academic_verified:
            return 'academically_verified'
        elif self.successful_ocr > 0:
            return 'ocr_verified'
        else:
            return 'not_verified'
