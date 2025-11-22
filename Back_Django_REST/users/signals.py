"""
Signals para registrar eventos de usuarios
"""
import logging
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.contrib.auth import get_user_model

logger = logging.getLogger(__name__)
User = get_user_model()

@receiver(post_save, sender=User)
def log_user_event(sender, instance, created, **kwargs):
    """Registrar creación/actualización de usuarios"""
    if created:
        logger.info(
            f"Usuario creado: ID={instance.id} | Username={instance.username} | "
            f"Email={instance.email} | Verificado={instance.is_verified}"
        )
    else:
        logger.info(
            f"Usuario actualizado: ID={instance.id} | Username={instance.username} | "
            f"Verificado={instance.is_verified}"
        )

@receiver(post_save, sender=User)
def create_nanny_profile(sender, instance, created, **kwargs):
    """
    Crear automáticamente NannyProfile cuando se crea un usuario con rol 'nanny'
    """
    if created and instance.role and 'nanny' in instance.role.lower():
        from nannies.models import NannyProfile
        try:
            # Verificar si ya existe el perfil
            if not hasattr(instance, 'nanny_profile'):
                NannyProfile.objects.create(
                    user=instance,
                    experience_years=0,
                    hourly_rate=0.0,
                    description="",
                    verified=False
                )
                logger.info(f"NannyProfile creado automáticamente para usuario {instance.username}")
        except Exception as e:
            logger.error(f"Error al crear NannyProfile para {instance.username}: {e}")
