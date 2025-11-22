from django.db import models
from django.conf import settings


class ParentProfile(models.Model):
    """
    Perfil extendido para usuarios con rol 'parent'.
    Almacena información específica de los padres.
    """
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='parent_profile'
    )
    phone = models.CharField(max_length=20, blank=True)
    address = models.TextField(blank=True)
    emergency_contact = models.CharField(max_length=100, blank=True)
    children_count = models.PositiveIntegerField(default=1)
    preferences = models.TextField(blank=True, help_text="Preferencias o notas adicionales")
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Parent: {self.user.get_full_name() or self.user.username}"

    class Meta:
        verbose_name = "Parent Profile"
        verbose_name_plural = "Parent Profiles"
