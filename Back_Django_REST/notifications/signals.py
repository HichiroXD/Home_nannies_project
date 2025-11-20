"""
Signals para notificaciones automáticas
Se disparan cuando cambia el estado de documentos OCR, bookings, etc.
"""

from django.db.models.signals import post_save
from django.dispatch import receiver
import logging
from .models import Notification
from .service import NotificationService

logger = logging.getLogger(__name__)


@receiver(post_save, sender=Notification)
def notification_created(sender, instance, created, **kwargs):
    """
    Signal cuando se crea una notificación
    """
    if created:
        logger.info(f'Notification created: {instance.id} for {instance.user.email}')


def send_ocr_notification(user, document_id, status, context=None):
    """
    Función auxiliar para disparar notificación OCR
    Se llama desde core/views.py cuando cambia estado OCR
    
    Args:
        user: User instance
        document_id: ID del documento
        status: 'approved', 'rejected', 'needs_review'
        context: Dict adicional
    """
    try:
        NotificationService.send_ocr_notification(
            user=user,
            document_id=document_id,
            status=status,
            context=context
        )
    except Exception as e:
        logger.error(f'Error sending OCR notification: {e}')


def send_booking_notification(user, booking_id, event_type, context=None):
    """
    Función auxiliar para disparar notificación booking
    Se llama desde bookings/views.py cuando cambia estado booking
    """
    try:
        NotificationService.send_booking_notification(
            user=user,
            booking_id=booking_id,
            event_type=event_type,
            context=context
        )
    except Exception as e:
        logger.error(f'Error sending booking notification: {e}')


def send_verification_notification(user, status, context=None):
    """
    Función auxiliar para disparar notificación verificación
    """
    try:
        NotificationService.send_verification_notification(
            user=user,
            status=status,
            context=context
        )
    except Exception as e:
        logger.error(f'Error sending verification notification: {e}')
