"""
Models for Notifications App - Phase 3
Define notificaciones, plantillas de email, y configuración de webhooks
"""

from django.db import models
from django.contrib.auth import get_user_model
from django.utils import timezone
from django.core.validators import URLValidator

User = get_user_model()


class NotificationTemplate(models.Model):
    """
    Plantilla para notificaciones - Email templates reutilizables
    """
    TEMPLATE_TYPES = (
        ('ocr_approved', 'OCR Document Approved'),
        ('ocr_rejected', 'OCR Document Rejected'),
        ('ocr_needs_review', 'OCR Document Needs Review'),
        ('booking_confirmed', 'Booking Confirmed'),
        ('booking_cancelled', 'Booking Cancelled'),
        ('verification_complete', 'User Verification Complete'),
        ('verification_failed', 'User Verification Failed'),
        ('custom', 'Custom Notification'),
    )

    name = models.CharField(
        max_length=100,
        unique=True,
        help_text='Identificador único de la plantilla'
    )
    template_type = models.CharField(
        max_length=50,
        choices=TEMPLATE_TYPES,
        default='custom'
    )
    subject = models.CharField(
        max_length=255,
        help_text='Asunto del email. Puede contener variables: {user_name}, {document_id}, {rut}'
    )
    body_html = models.TextField(
        help_text='Cuerpo HTML del email. Variables: {user_name}, {document_id}, {rut}, {status}, {confidence_score}, {timestamp}'
    )
    body_text = models.TextField(
        blank=True,
        help_text='Versión texto plano del email (generado automáticamente si vacío)'
    )
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Email Template'
        verbose_name_plural = 'Email Templates'
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.name} ({self.get_template_type_display()})'

    def render_subject(self, context):
        """
        Renderiza el asunto con variables de contexto
        """
        return self.subject.format(**context)

    def render_body(self, context):
        """
        Renderiza el cuerpo HTML con variables de contexto
        """
        return self.body_html.format(**context)


class Notification(models.Model):
    """
    Notificación individual - Registro de cada notificación enviada/pendiente
    """
    STATUS_CHOICES = (
        ('pending', 'Pendiente'),
        ('sent', 'Enviada'),
        ('failed', 'Fallida'),
        ('read', 'Leída'),
    )

    CHANNEL_CHOICES = (
        ('email', 'Email'),
        ('webhook', 'Webhook'),
        ('in_app', 'In-App'),
        ('sms', 'SMS'),
    )

    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='notifications'
    )
    template = models.ForeignKey(
        NotificationTemplate,
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )
    channel = models.CharField(
        max_length=20,
        choices=CHANNEL_CHOICES,
        default='email'
    )
    subject = models.CharField(max_length=255)
    message = models.TextField()
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='pending'
    )
    recipient_email = models.EmailField(blank=True)
    related_document_id = models.CharField(
        max_length=100,
        blank=True,
        help_text='ID del documento OCR relacionado'
    )
    related_booking_id = models.CharField(
        max_length=100,
        blank=True,
        help_text='ID de la reserva relacionada'
    )
    context_data = models.JSONField(
        default=dict,
        blank=True,
        help_text='Datos de contexto en JSON'
    )
    sent_at = models.DateTimeField(null=True, blank=True)
    read_at = models.DateTimeField(null=True, blank=True)
    attempts = models.IntegerField(default=0)
    last_error = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Notification'
        verbose_name_plural = 'Notifications'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', 'status']),
            models.Index(fields=['related_document_id']),
            models.Index(fields=['created_at']),
        ]

    def __str__(self):
        return f'{self.subject} - {self.user.email} ({self.get_status_display()})'

    def mark_sent(self):
        """Marca la notificación como enviada"""
        self.status = 'sent'
        self.sent_at = timezone.now()
        self.save(update_fields=['status', 'sent_at', 'updated_at'])

    def mark_failed(self, error_msg=''):
        """Marca la notificación como fallida"""
        self.status = 'failed'
        self.last_error = error_msg
        self.attempts += 1
        self.save(update_fields=['status', 'last_error', 'attempts', 'updated_at'])

    def mark_read(self):
        """Marca la notificación como leída"""
        self.status = 'read'
        self.read_at = timezone.now()
        self.save(update_fields=['status', 'read_at', 'updated_at'])


class WebhookEndpoint(models.Model):
    """
    Endpoint webhook para enviar eventos en tiempo real
    """
    EVENT_TYPES = (
        ('ocr_completed', 'OCR Processing Completed'),
        ('ocr_approved', 'OCR Document Approved'),
        ('ocr_rejected', 'OCR Document Rejected'),
        ('booking_created', 'Booking Created'),
        ('booking_cancelled', 'Booking Cancelled'),
        ('verification_completed', 'User Verification Completed'),
        ('all', 'Todos los eventos'),
    )

    name = models.CharField(max_length=255)
    url = models.URLField(validators=[URLValidator()])
    secret_key = models.CharField(
        max_length=255,
        help_text='Clave secreta para validar webhooks (HMAC)'
    )
    event_type = models.CharField(
        max_length=50,
        choices=EVENT_TYPES,
        default='all'
    )
    is_active = models.BooleanField(default=True)
    retry_count = models.IntegerField(default=3)
    timeout = models.IntegerField(
        default=10,
        help_text='Timeout en segundos'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    last_triggered_at = models.DateTimeField(null=True, blank=True)
    last_error = models.TextField(blank=True)

    class Meta:
        verbose_name = 'Webhook Endpoint'
        verbose_name_plural = 'Webhook Endpoints'
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.name} - {self.url}'


class WebhookLog(models.Model):
    """
    Log de webhooks enviados
    """
    STATUS_CHOICES = (
        ('pending', 'Pendiente'),
        ('success', 'Éxito'),
        ('failed', 'Fallido'),
        ('retrying', 'Reintentando'),
    )

    webhook = models.ForeignKey(
        WebhookEndpoint,
        on_delete=models.CASCADE,
        related_name='logs'
    )
    event_type = models.CharField(max_length=50)
    payload = models.JSONField()
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='pending'
    )
    response_status = models.IntegerField(null=True, blank=True)
    response_body = models.TextField(blank=True)
    error_message = models.TextField(blank=True)
    attempts = models.IntegerField(default=0)
    next_retry_at = models.DateTimeField(null=True, blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Webhook Log'
        verbose_name_plural = 'Webhook Logs'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['webhook', 'status']),
            models.Index(fields=['event_type']),
        ]

    def __str__(self):
        return f'{self.webhook.name} - {self.event_type} ({self.get_status_display()})'


class NotificationPreference(models.Model):
    """
    Preferencias de notificaciones por usuario
    """
    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name='notification_preference'
    )
    email_ocr_events = models.BooleanField(
        default=True,
        help_text='Recibir emails sobre eventos OCR'
    )
    email_booking_events = models.BooleanField(
        default=True,
        help_text='Recibir emails sobre reservas'
    )
    email_verification_events = models.BooleanField(
        default=True,
        help_text='Recibir emails sobre verificación'
    )
    in_app_notifications = models.BooleanField(
        default=True,
        help_text='Recibir notificaciones in-app'
    )
    quiet_hours_start = models.TimeField(
        null=True,
        blank=True,
        help_text='Hora de inicio de no-molestar (HH:MM)'
    )
    quiet_hours_end = models.TimeField(
        null=True,
        blank=True,
        help_text='Hora de fin de no-molestar (HH:MM)'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Notification Preference'
        verbose_name_plural = 'Notification Preferences'

    def __str__(self):
        return f'Preferencias de {self.user.email}'

    def is_in_quiet_hours(self):
        """Verifica si es hora de no-molestar"""
        if not self.quiet_hours_start or not self.quiet_hours_end:
            return False
        current_time = timezone.now().time()
        return self.quiet_hours_start <= current_time <= self.quiet_hours_end
