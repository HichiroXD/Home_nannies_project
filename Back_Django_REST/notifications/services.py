"""
Servicio centralizado para gestionar todas las notificaciones del sistema.

Este servicio proporciona una interfaz unificada para crear notificaciones
en diferentes contextos: reservas, reseñas, y otros eventos del sistema.

Arquitectura:
    - Todas las notificaciones deben crearse a través de este servicio
    - Métodos públicos para cada tipo de evento (new_booking, review_created, etc.)
    - Método privado _create_notification para lógica común
    - Logging estructurado de todas las notificaciones

Uso:
    from notifications.services import NotificationService
    
    # Notificar nueva reserva
    NotificationService.notify_new_booking(booking, parent_user)
    
    # Notificar reseña creada
    NotificationService.notify_review_created(review, parent, nanny)
"""

import logging
from typing import Optional
from zoneinfo import ZoneInfo
from django.contrib.auth import get_user_model
from .models import Notification

User = get_user_model()
logger = logging.getLogger(__name__)


class NotificationService:
    """
    Servicio centralizado para gestionar creación de notificaciones.
    
    Attributes:
        CHILE_TZ (ZoneInfo): Timezone para formatear fechas (America/Santiago)
        
    Methods:
        notify_new_booking: Notifica nueva solicitud de reserva
        notify_booking_status_change: Notifica cambio de estado de reserva
        notify_review_created: Notifica creación de reseña (parent + nanny)
        _create_notification: Helper privado para crear notificaciones
    """
    
    CHILE_TZ = ZoneInfo('America/Santiago')
    
    # ==================== BOOKINGS ====================
    
    @classmethod
    def notify_new_booking(cls, booking, requester) -> Notification:
        """
        Crea notificación para nueva solicitud de reserva.
        
        Args:
            booking: Instancia de Booking recién creada
            requester: Usuario que creó la reserva (parent)
            
        Returns:
            Notification: Instancia de notificación creada
        """
        start_local = booking.start_time.astimezone(cls.CHILE_TZ)
        end_local = booking.end_time.astimezone(cls.CHILE_TZ)
        
        message = (
            f"Tienes una nueva solicitud de reserva de {requester.username} "
            f"para el {start_local.strftime('%d/%m/%Y')} "
            f"de {start_local.strftime('%H:%M')} a {end_local.strftime('%H:%M')}."
        )
        
        notification = cls._create_notification(
            user=booking.nanny,
            subject="Nueva solicitud de reserva",
            message=message,
            related_booking_id=str(booking.id),
            context_data={'booking_id': str(booking.id)}
        )
        
        logger.info(
            f"notification_created id={notification.id} "
            f"type=new_booking booking={booking.id} recipient={booking.nanny.username}"
        )
        
        return notification
    
    @classmethod
    def notify_booking_status_change(cls, booking, new_status: str, notifier, recipient) -> Notification:
        """
        Crea notificación para cambio de estado de reserva.
        
        Args:
            booking: Instancia de Booking
            new_status: Nuevo estado ('confirmed', 'rejected', 'cancelled', 'completed')
            notifier: Usuario que realiza el cambio
            recipient: Usuario que recibe la notificación
            
        Returns:
            Notification: Instancia de notificación creada
        """
        from bookings.constants import NOTIFICATION_SUBJECTS, NOTIFICATION_ACTIONS
        
        start_local = booking.start_time.astimezone(cls.CHILE_TZ)
        end_local = booking.end_time.astimezone(cls.CHILE_TZ)
        
        subject = NOTIFICATION_SUBJECTS.get(new_status, 'Actualización de Reserva')
        action = NOTIFICATION_ACTIONS.get(new_status, new_status)
        
        message = (
            f"Tu reserva con {notifier.username} ha sido {action} "
            f"para el {start_local.strftime('%d/%m/%Y')} "
            f"de {start_local.strftime('%H:%M')} a {end_local.strftime('%H:%M')}."
        )
        
        notification = cls._create_notification(
            user=recipient,
            subject=subject,
            message=message,
            related_booking_id=str(booking.id),
            context_data={'booking_id': str(booking.id), 'new_status': new_status}
        )
        
        logger.info(
            f"notification_created id={notification.id} "
            f"type=status_change booking={booking.id} status={new_status} "
            f"recipient={recipient.username}"
        )
        
        return notification
    
    # ==================== REVIEWS ====================
    
    @classmethod
    def notify_review_created(cls, review, parent, nanny) -> tuple[Notification, Notification]:
        """
        Crea notificaciones para nueva reseña (tanto para padre como niñera).
        
        Args:
            review: Instancia de Review recién creada
            parent: Usuario padre que creó la reseña
            nanny: Usuario niñera que recibe la reseña
            
        Returns:
            tuple: (notification_parent, notification_nanny)
        """
        # Notificación para el padre (confirmación)
        notification_parent = cls._create_notification(
            user=parent,
            subject='Reseña publicada',
            message=(
                f'Has dejado una reseña de {review.rating} estrellas para '
                f'{nanny.get_full_name() or nanny.username}.'
            ),
            context_data={
                'review_id': review.id,
                'rating': review.rating,
                'nanny_name': nanny.get_full_name() or nanny.username
            }
        )
        
        # Notificación para la niñera (nueva reseña recibida)
        notification_nanny = cls._create_notification(
            user=nanny,
            subject='Nueva reseña recibida',
            message=(
                f'{parent.get_full_name() or parent.username} te ha dejado '
                f'una reseña de {review.rating} estrellas.'
            ),
            context_data={
                'review_id': review.id,
                'rating': review.rating,
                'parent_name': parent.get_full_name() or parent.username
            }
        )
        
        logger.info(
            f"notifications_created review={review.id} "
            f"parent_notification={notification_parent.id} "
            f"nanny_notification={notification_nanny.id}"
        )
        
        return notification_parent, notification_nanny
    
    # ==================== HELPER METHODS ====================
    
    @classmethod
    def _create_notification(
        cls,
        user: User,
        subject: str,
        message: str,
        channel: str = 'in_app',
        status: str = 'sent',
        related_booking_id: Optional[str] = None,
        context_data: Optional[dict] = None
    ) -> Notification:
        """
        Método privado para crear notificaciones con parámetros comunes.
        
        Args:
            user: Usuario destinatario
            subject: Asunto de la notificación
            message: Mensaje de la notificación
            channel: Canal de notificación (default: 'in_app')
            status: Estado de la notificación (default: 'sent')
            related_booking_id: ID de reserva relacionada (opcional)
            context_data: Datos de contexto adicionales (opcional)
            
        Returns:
            Notification: Instancia de notificación creada
        """
        notification_data = {
            'user': user,
            'subject': subject,
            'message': message,
            'channel': channel,
            'status': status,
        }
        
        if related_booking_id:
            notification_data['related_booking_id'] = related_booking_id
            
        if context_data:
            notification_data['context_data'] = context_data
        
        return Notification.objects.create(**notification_data)
