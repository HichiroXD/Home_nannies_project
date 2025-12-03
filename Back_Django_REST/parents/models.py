from django.db import models
from django.conf import settings
from core.validators import validate_chilean_phone, validate_positive_nonzero


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
    phone = models.CharField(
        max_length=20, 
        blank=True,
        validators=[validate_chilean_phone],
        help_text="Número telefónico chileno"
    )
    address = models.TextField(blank=True)
    emergency_contact = models.CharField(max_length=100, blank=True)
    children_count = models.PositiveIntegerField(
        default=1,
        validators=[validate_positive_nonzero],
        help_text="Número de hijos (mínimo 1)"
    )
    preferences = models.TextField(blank=True, help_text="Preferencias o notas adicionales")
    profile_photo = models.ImageField(
        upload_to='parent_profiles/', 
        blank=True, 
        null=True,
        help_text="Foto de perfil del padre/madre"
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    @property
    def role(self):
        """Retorna el rol del usuario asociado"""
        return self.user.role

    def __str__(self):
        return f"Parent: {self.user.get_full_name() or self.user.username}"

    class Meta:
        verbose_name = "Parent Profile"
        verbose_name_plural = "Parent Profiles"
