"""
Signals para registrar eventos en el sistema de reservas
Se ejecutan automáticamente cuando se crean o modifican modelos
"""
import logging
from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from .models import Booking
from notifications.models import Notification
from favorites.models import Favorite

logger = logging.getLogger(__name__)

@receiver(post_save, sender=Booking)
def log_booking_event(sender, instance, created, **kwargs):
    """Registrar creación/actualización de reservas"""
    if created:
        logger.info(
            f"Booking creada: ID={instance.id} | Padre={instance.parent.username} | "
            f"Niñera={instance.nanny.username} | Estado=pendiente | "
            f"Fecha: {instance.start_time.date()}"
        )
    else:
        logger.info(
            f"Booking actualizada: ID={instance.id} | Estado={instance.status} | "
            f"Padre={instance.parent.username} | Niñera={instance.nanny.username}"
        )

@receiver(post_delete, sender=Booking)
def log_booking_delete(sender, instance, **kwargs):
    """Registrar eliminación de reservas"""
    logger.info(
        f"Booking eliminada: ID={instance.id} | Padre={instance.parent.username} | "
        f"Niñera={instance.nanny.username}"
    )
