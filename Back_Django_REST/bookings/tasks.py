"""
Tareas asíncronas de Celery para el módulo de bookings.
"""

from celery import shared_task
from django.utils import timezone
from datetime import timedelta
from django.core.mail import send_mail
from django.conf import settings
import logging

logger = logging.getLogger(__name__)


@shared_task(name='bookings.tasks.send_booking_reminders')
def send_booking_reminders():
    """
    Envía recordatorios de reservas que ocurrirán en las próximas 24 horas.
    Se ejecuta diariamente a las 9:00 AM.
    """
    from bookings.models import Booking
    from notifications.service import NotificationService
    
    tomorrow = timezone.now() + timedelta(days=1)
    tomorrow_end = tomorrow + timedelta(hours=24)
    
    # Buscar reservas confirmadas que comienzan mañana
    upcoming_bookings = Booking.objects.filter(
        status='confirmed',
        start_time__gte=tomorrow,
        start_time__lt=tomorrow_end
    ).select_related('parent', 'nanny')
    
    sent_count = 0
    
    for booking in upcoming_bookings:
        try:
            # Notificar al padre
            NotificationService.create_notification(
                user=booking.parent,
                notification_type='BOOKING_REMINDER',
                title='Recordatorio de Reserva',
                message=f'Tu reserva con {booking.nanny.get_full_name()} es mañana a las {booking.start_time.strftime("%H:%M")}.',
                related_booking=booking
            )
            
            # Notificar a la niñera
            NotificationService.create_notification(
                user=booking.nanny,
                notification_type='BOOKING_REMINDER',
                title='Recordatorio de Reserva',
                message=f'Tienes una reserva mañana a las {booking.start_time.strftime("%H:%M")} con {booking.parent.get_full_name()}.',
                related_booking=booking
            )
            
            sent_count += 2
            
        except Exception as e:
            logger.error(f"Error enviando recordatorio para booking {booking.id}: {str(e)}")
    
    logger.info(f"Recordatorios enviados: {sent_count} notificaciones para {upcoming_bookings.count()} reservas")
    return {'sent': sent_count, 'bookings': upcoming_bookings.count()}


@shared_task(name='bookings.tasks.check_expired_bookings')
def check_expired_bookings():
    """
    Verifica reservas pendientes que llevan más de 48 horas sin respuesta.
    Notifica a los padres y cambia el estado a 'expired'.
    Se ejecuta diariamente a las 10:00 AM.
    """
    from bookings.models import Booking
    from notifications.service import NotificationService
    
    expiry_threshold = timezone.now() - timedelta(hours=48)
    
    # Buscar reservas pendientes antiguas
    expired_bookings = Booking.objects.filter(
        status='pending',
        created_at__lt=expiry_threshold
    ).select_related('parent', 'nanny')
    
    expired_count = 0
    
    for booking in expired_bookings:
        try:
            # Cambiar estado a expirado
            booking.status = 'expired'
            booking.save()
            
            # Notificar al padre
            NotificationService.create_notification(
                user=booking.parent,
                notification_type='BOOKING_EXPIRED',
                title='Reserva Expirada',
                message=f'Tu reserva con {booking.nanny.get_full_name()} ha expirado por falta de respuesta. Puedes crear una nueva.',
                related_booking=booking
            )
            
            expired_count += 1
            
        except Exception as e:
            logger.error(f"Error procesando booking expirado {booking.id}: {str(e)}")
    
    logger.info(f"Reservas expiradas procesadas: {expired_count}")
    return {'expired': expired_count}


@shared_task(name='bookings.tasks.cleanup_old_bookings')
def cleanup_old_bookings():
    """
    Archiva o limpia reservas completadas muy antiguas (más de 1 año).
    Opcional: para mantener la base de datos limpia.
    """
    from bookings.models import Booking
    
    one_year_ago = timezone.now() - timedelta(days=365)
    
    old_bookings = Booking.objects.filter(
        status='completed',
        end_time__lt=one_year_ago
    )
    
    count = old_bookings.count()
    # Por ahora solo contamos, no eliminamos
    # old_bookings.delete()
    
    logger.info(f"Reservas antiguas encontradas: {count}")
    return {'old_bookings': count}
