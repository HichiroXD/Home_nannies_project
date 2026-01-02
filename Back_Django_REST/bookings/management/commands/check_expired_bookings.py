"""
Management command para verificar reservas expiradas.
Se ejecuta diariamente a las 10:00 AM.
"""

from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import timedelta
import logging

logger = logging.getLogger(__name__)


class Command(BaseCommand):
    help = 'Verifica y marca como expiradas las reservas pendientes que llevan más de 48 horas sin respuesta'

    def handle(self, *args, **options):
        from bookings.models import Booking
        from notifications.service import NotificationService
        
        self.stdout.write('⏰ Verificando reservas expiradas...')
        
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
                self.stderr.write(f"Error en booking {booking.id}: {str(e)}")
        
        self.stdout.write(
            self.style.SUCCESS(
                f'✅ Reservas expiradas procesadas: {expired_count}'
            )
        )
