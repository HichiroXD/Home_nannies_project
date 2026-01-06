"""
Management command para enviar recordatorios de reservas.
Se ejecuta diariamente a las 9:00 AM.
"""

from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import timedelta
import logging

logger = logging.getLogger(__name__)


class Command(BaseCommand):
    help = 'Envía recordatorios de reservas que ocurrirán en las próximas 24 horas'

    def handle(self, *args, **options):
        from bookings.models import Booking
        from notifications.service import NotificationService
        
        self.stdout.write('🔔 Enviando recordatorios de reservas...')
        
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
                self.stderr.write(f"Error en booking {booking.id}: {str(e)}")
        
        self.stdout.write(
            self.style.SUCCESS(
                f'✅ Recordatorios enviados: {sent_count} notificaciones para {upcoming_bookings.count()} reservas'
            )
        )
