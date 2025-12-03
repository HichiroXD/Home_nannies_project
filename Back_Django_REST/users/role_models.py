from django.db import models
from django.conf import settings


class UserRole(models.Model):
    """
    Modelo para gestionar roles adicionales de usuarios.
    Permite que un usuario tenga múltiples roles (ej: padre Y niñera).
    
    El campo User.role sigue siendo el rol principal/activo,
    pero este modelo permite roles secundarios.
    """
    
    ROLE_CHOICES = (
        ('parent', 'Padre/Madre'),
        ('nanny', 'Niñera'),
    )
    
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='additional_roles'
    )
    role = models.CharField(
        max_length=10,
        choices=ROLE_CHOICES,
        help_text="Rol adicional del usuario"
    )
    is_active = models.BooleanField(
        default=True,
        help_text="¿Este rol está activo?"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        verbose_name = "Rol Adicional"
        verbose_name_plural = "Roles Adicionales"
        unique_together = ('user', 'role')
        ordering = ['user', 'role']
    
    def __str__(self):
        return f"{self.user.username} - {self.get_role_display()}"


class ActiveRole(models.Model):
    """
    Modelo para rastrear qué rol está usando actualmente el usuario.
    Útil para sesiones donde el usuario tiene múltiples roles.
    """
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='active_role_session',
        primary_key=True
    )
    active_role = models.CharField(
        max_length=10,
        choices=(
            ('parent', 'Padre/Madre'),
            ('nanny', 'Niñera'),
            ('admin', 'Administrador'),
        ),
        help_text="Rol actualmente activo en la sesión"
    )
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = "Rol Activo"
        verbose_name_plural = "Roles Activos"
    
    def __str__(self):
        return f"{self.user.username} usando {self.get_active_role_display()}"
