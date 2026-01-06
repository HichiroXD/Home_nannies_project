"""
Management command para limpiar notificaciones antiguas.
Se ejecuta semanalmente los domingos a las 2:00 AM.
"""

from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import timedelta
import logging

logger = logging.getLogger(__name__)


class Command(BaseCommand):
    help = 'Elimina notificaciones leídas que tienen más de 30 días'

    def add_arguments(self, parser):
        parser.add_argument(
            '--days',
            type=int,
            default=30,
            help='Número de días para considerar notificaciones antiguas (default: 30)',
        )

    def handle(self, *args, **options):
        from notifications.models import Notification
        
        days = options['days']
        self.stdout.write(f'🧹 Limpiando notificaciones antiguas (>{days} días)...')
        
        cutoff_date = timezone.now() - timedelta(days=days)
        
        # Eliminar notificaciones leídas antiguas
        # No se excluyen tipos específicos ya que el modelo no tiene notification_type
        old_notifications = Notification.objects.filter(
            read_at__isnull=False,  # Leídas
            created_at__lt=cutoff_date
        )
        
        count = old_notifications.count()
        old_notifications.delete()
        
        self.stdout.write(
            self.style.SUCCESS(
                f'✅ Notificaciones antiguas eliminadas: {count}'
            )
        )
