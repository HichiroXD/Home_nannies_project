"""
Management command para actualizar estadísticas de niñeras.
Se ejecuta diariamente a las 4:00 AM.
"""

from django.core.management.base import BaseCommand
from django.db.models import Avg
import logging

logger = logging.getLogger(__name__)


class Command(BaseCommand):
    help = 'Actualiza estadísticas calculadas de niñeras (rating promedio, reservas completadas, etc.)'

    def handle(self, *args, **options):
        from nannies.models import NannyProfile
        from reviews.models import Review
        from bookings.models import Booking
        
        self.stdout.write('📊 Actualizando estadísticas de niñeras...')
        
        updated_count = 0
        nannies = NannyProfile.objects.all()
        
        for nanny in nannies:
            try:
                # Calcular rating promedio
                avg_rating = Review.objects.filter(
                    nanny=nanny
                ).aggregate(Avg('rating'))['rating__avg']
                
                if avg_rating is not None:
                    nanny.rating_avg = round(avg_rating, 2)
                    nanny.save()
                
                updated_count += 1
                
            except Exception as e:
                logger.error(f"Error actualizando estadísticas de niñera {nanny.user.id}: {str(e)}")
                self.stderr.write(f"Error en niñera {nanny.user.id}: {str(e)}")
        
        self.stdout.write(
            self.style.SUCCESS(
                f'✅ Estadísticas actualizadas para {updated_count} niñeras'
            )
        )
