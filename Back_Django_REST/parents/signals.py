from django.db.models.signals import post_save
from django.dispatch import receiver
from django.conf import settings
from .models import ParentProfile
import logging

logger = logging.getLogger(__name__)


@receiver(post_save, sender=settings.AUTH_USER_MODEL)
def create_parent_profile(sender, instance, created, **kwargs):
    """
    Crea automáticamente un ParentProfile cuando se registra un usuario con rol 'parent'.
    Esto previene errores 404 cuando el usuario intenta acceder a /api/parents/profile/
    """
    if created and instance.role == 'parent':
        try:
            profile = ParentProfile.objects.create(
                user=instance,
                address='',  # String vacío para evitar NOT NULL constraint
                children_count=1  # Valor por defecto mínimo
            )
            logger.info(f"ParentProfile creado automáticamente para usuario {instance.username} (ID: {profile.id})")
        except Exception as e:
            logger.error(f"Error al crear ParentProfile para {instance.username}: {str(e)}")
