"""
Sistema de Auditoría - Registra todos los cambios importantes en el sistema
"""
from django.db import models
from django.conf import settings
from django.contrib.contenttypes.models import ContentType
from django.contrib.contenttypes.fields import GenericForeignKey
import json


class AuditLog(models.Model):
    """
    Modelo para registrar todas las acciones importantes del sistema.
    Permite rastrear quién hizo qué, cuándo y en qué objeto.
    """
    
    ACTION_CHOICES = (
        ('create', 'Crear'),
        ('update', 'Actualizar'),
        ('delete', 'Eliminar'),
        ('login', 'Inicio de sesión'),
        ('logout', 'Cierre de sesión'),
        ('permission_change', 'Cambio de permisos'),
        ('status_change', 'Cambio de estado'),
        ('profile_change', 'Cambio de perfil'),
        ('booking_create', 'Crear reserva'),
        ('booking_update', 'Actualizar reserva'),
        ('booking_cancel', 'Cancelar reserva'),
        ('review_create', 'Crear reseña'),
        ('review_delete', 'Eliminar reseña'),
        ('payment_record', 'Registrar pago'),
        ('document_upload', 'Subir documento'),
        ('document_verify', 'Verificar documento'),
        ('admin_action', 'Acción administrativa'),
    )
    
    # Usuario que realizó la acción
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='audit_logs',
        help_text="Usuario que realizó la acción"
    )
    
    # Acción realizada
    action = models.CharField(
        max_length=50,
        choices=ACTION_CHOICES,
        help_text="Tipo de acción realizada"
    )
    
    # Objeto afectado (usando GenericForeignKey para cualquier modelo)
    content_type = models.ForeignKey(
        ContentType,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        help_text="Tipo de objeto afectado"
    )
    object_id = models.PositiveIntegerField(
        null=True,
        blank=True,
        help_text="ID del objeto afectado"
    )
    content_object = GenericForeignKey('content_type', 'object_id')
    
    # Detalles de la acción
    description = models.TextField(
        help_text="Descripción de la acción realizada"
    )
    
    # Datos adicionales (cambios específicos, valores anteriores, etc.)
    changes = models.JSONField(
        null=True,
        blank=True,
        help_text="Datos de cambios en formato JSON (antes/después)"
    )
    
    # Información de contexto
    ip_address = models.GenericIPAddressField(
        null=True,
        blank=True,
        help_text="Dirección IP desde donde se realizó la acción"
    )
    user_agent = models.TextField(
        null=True,
        blank=True,
        help_text="User agent del navegador"
    )
    
    # Timestamp
    timestamp = models.DateTimeField(
        auto_now_add=True,
        db_index=True,
        help_text="Fecha y hora de la acción"
    )
    
    # Metadata adicional
    metadata = models.JSONField(
        null=True,
        blank=True,
        help_text="Información adicional en formato JSON"
    )
    
    class Meta:
        ordering = ['-timestamp']
        verbose_name = 'Registro de Auditoría'
        verbose_name_plural = 'Registros de Auditoría'
        indexes = [
            models.Index(fields=['-timestamp']),
            models.Index(fields=['user', '-timestamp']),
            models.Index(fields=['action', '-timestamp']),
            models.Index(fields=['content_type', 'object_id']),
        ]
    
    def __str__(self):
        user_name = self.user.username if self.user else 'Sistema'
        return f"{user_name} - {self.get_action_display()} - {self.timestamp.strftime('%Y-%m-%d %H:%M')}"
    
    @classmethod
    def log_action(cls, user, action, description, content_object=None, changes=None, 
                   ip_address=None, user_agent=None, metadata=None):
        """
        Método helper para crear logs de auditoría fácilmente.
        
        Ejemplo:
            AuditLog.log_action(
                user=request.user,
                action='update',
                description='Actualizó su perfil de niñera',
                content_object=nanny_profile,
                changes={'hourly_rate': {'old': 5000, 'new': 6000}},
                ip_address=request.META.get('REMOTE_ADDR'),
                user_agent=request.META.get('HTTP_USER_AGENT')
            )
        """
        log = cls(
            user=user,
            action=action,
            description=description,
            ip_address=ip_address,
            user_agent=user_agent,
            metadata=metadata
        )
        
        if content_object:
            log.content_object = content_object
        
        if changes:
            log.changes = changes
        
        log.save()
        return log
    
    def get_changes_display(self):
        """Retorna los cambios en formato legible"""
        if not self.changes:
            return "Sin cambios registrados"
        
        try:
            if isinstance(self.changes, str):
                changes_dict = json.loads(self.changes)
            else:
                changes_dict = self.changes
            
            result = []
            for field, values in changes_dict.items():
                if isinstance(values, dict) and 'old' in values and 'new' in values:
                    result.append(f"{field}: {values['old']} → {values['new']}")
                else:
                    result.append(f"{field}: {values}")
            
            return "\n".join(result)
        except:
            return str(self.changes)


class UserPermission(models.Model):
    """
    Modelo para gestionar permisos personalizados adicionales a los roles base.
    Permite granularidad fina en el control de acceso.
    """
    
    PERMISSION_CHOICES = (
        # Permisos de usuarios
        ('view_users', 'Ver usuarios'),
        ('create_users', 'Crear usuarios'),
        ('edit_users', 'Editar usuarios'),
        ('delete_users', 'Eliminar usuarios'),
        
        # Permisos de niñeras
        ('view_nannies', 'Ver niñeras'),
        ('verify_nannies', 'Verificar niñeras'),
        ('edit_nanny_profiles', 'Editar perfiles de niñeras'),
        
        # Permisos de padres
        ('view_parents', 'Ver padres'),
        ('edit_parent_profiles', 'Editar perfiles de padres'),
        
        # Permisos de reservas
        ('view_all_bookings', 'Ver todas las reservas'),
        ('manage_bookings', 'Gestionar reservas'),
        ('cancel_any_booking', 'Cancelar cualquier reserva'),
        
        # Permisos de reseñas
        ('view_all_reviews', 'Ver todas las reseñas'),
        ('delete_reviews', 'Eliminar reseñas'),
        ('moderate_reviews', 'Moderar reseñas'),
        
        # Permisos de documentos
        ('view_documents', 'Ver documentos'),
        ('verify_documents', 'Verificar documentos OCR'),
        ('verify_academic', 'Verificar títulos académicos'),
        
        # Permisos de reportes
        ('view_reports', 'Ver reportes'),
        ('export_data', 'Exportar datos'),
        
        # Permisos de auditoría
        ('view_audit_logs', 'Ver logs de auditoría'),
        
        # Permisos de sistema
        ('manage_settings', 'Gestionar configuración'),
        ('access_admin_panel', 'Acceder panel de administración'),
    )
    
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='custom_permissions'
    )
    
    permission = models.CharField(
        max_length=50,
        choices=PERMISSION_CHOICES
    )
    
    granted_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='permissions_granted'
    )
    
    granted_at = models.DateTimeField(auto_now_add=True)
    
    reason = models.TextField(
        blank=True,
        help_text="Razón por la que se otorgó este permiso"
    )
    
    class Meta:
        unique_together = ('user', 'permission')
        verbose_name = 'Permiso de Usuario'
        verbose_name_plural = 'Permisos de Usuarios'
    
    def __str__(self):
        return f"{self.user.username} - {self.get_permission_display()}"
