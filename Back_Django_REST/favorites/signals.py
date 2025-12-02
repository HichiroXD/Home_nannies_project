"""
Signals para registrar eventos de favoritos
"""
import logging
from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from .models import Favorite

logger = logging.getLogger(__name__)

@receiver(post_save, sender=Favorite)
def log_favorite_event(sender, instance, created, **kwargs):
    """Registrar adición de favoritos"""
    if created:
        logger.info(
            f"Favorito añadido: ID={instance.id} | Padre={instance.parent.username} | "
            f"Niñera={instance.nanny.user.username}"
        )

@receiver(post_delete, sender=Favorite)
def log_favorite_delete(sender, instance, **kwargs):
    """Registrar eliminación de favoritos"""
    logger.info(
        f"Favorito eliminado: Padre={instance.parent.username} | "
        f"Niñera={instance.nanny.user.username}"
    )
