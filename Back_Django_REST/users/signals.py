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
