"""Servicios para gestionar notificaciones."""

import logging
from zoneinfo import ZoneInfo
from notifications.models import Notification
from .constants import NOTIFICATION_SUBJECTS, NOTIFICATION_ACTIONS

logger = logging.getLogger(__name__)


class NotificationService:
    """Servicio para gestionar creación de notificaciones."""
    
    CHILE_TZ = ZoneInfo('America/Santiago')
    
    @classmethod
    def notify_new_booking(cls, booking, requester):
        """
        Crea notificación para nueva solicitud de reserva.
        
        Args:
            booking: Instancia de Booking recién creada
            requester: Usuario que creó la reserva (parent)
        """
        start_local = booking.start_time.astimezone(cls.CHILE_TZ)
        end_local = booking.end_time.astimezone(cls.CHILE_TZ)
        
        message = (
            f"Tienes una nueva solicitud de reserva de {requester.username} "
            f"para el {start_local.strftime('%d/%m/%Y')} "
            f"de {start_local.strftime('%H:%M')} a {end_local.strftime('%H:%M')}."
        )
        
        notification = Notification.objects.create(
            user=booking.nanny,
            subject="Nueva solicitud de reserva",
            message=message,
            channel='in_app',
            status='sent',
            related_booking_id=str(booking.id)
        )
        
        logger.info(
            f"notification_created id={notification.id} "
            f"type=new_booking booking={booking.id} recipient={booking.nanny.username}"
        )
        
        return notification
    
    @classmethod
    def notify_booking_status_change(cls, booking, new_status, notifier, recipient):
        """
        Crea notificación para cambio de estado de reserva.
        
        Args:
            booking: Instancia de Booking
            new_status: Nuevo estado ('confirmed', 'rejected', 'cancelled', 'completed')
            notifier: Usuario que realiza el cambio
            recipient: Usuario que recibe la notificación
        """
        start_local = booking.start_time.astimezone(cls.CHILE_TZ)
        end_local = booking.end_time.astimezone(cls.CHILE_TZ)
        
        # Obtener subject y action desde constantes
        subject = NOTIFICATION_SUBJECTS.get(new_status, 'Actualización de Reserva')
        action = NOTIFICATION_ACTIONS.get(new_status, new_status)
        
        message = (
            f"Tu reserva con {notifier.username} ha sido {action} "
            f"para el {start_local.strftime('%d/%m/%Y')} "
            f"de {start_local.strftime('%H:%M')} a {end_local.strftime('%H:%M')}."
        )
        
        notification = Notification.objects.create(
            user=recipient,
            subject=subject,
            message=message,
            channel='in_app',
            status='sent',
            related_booking_id=str(booking.id)
        )
        
        logger.info(
            f"notification_created id={notification.id} "
            f"type=status_change booking={booking.id} status={new_status} "
            f"recipient={recipient.username}"
        )
        
        return notification
