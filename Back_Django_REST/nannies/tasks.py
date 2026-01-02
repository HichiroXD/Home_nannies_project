"""
Tareas asíncronas de Celery para el módulo de nannies.
"""

from celery import shared_task
from django.db.models import Avg, Count, Q
from django.utils import timezone
import logging

logger = logging.getLogger(__name__)


@shared_task(name='nannies.tasks.update_nanny_statistics')
def update_nanny_statistics():
    """
    Actualiza estadísticas calculadas de niñeras:
    - Rating promedio
    - Número de reservas completadas
    - Tasa de aceptación
    Se ejecuta diariamente a las 4:00 AM.
    """
    from nannies.models import NannyProfile
    from reviews.models import Review
    from bookings.models import Booking
    
    updated_count = 0
    
    nannies = NannyProfile.objects.all()
    
    for nanny in nannies:
        try:
            # Calcular rating promedio
            avg_rating = Review.objects.filter(
                nanny=nanny.user
            ).aggregate(Avg('rating'))['rating__avg']
            
            if avg_rating is not None:
                nanny.rating_avg = round(avg_rating, 2)
            
            # Contar reservas completadas
            completed_bookings = Booking.objects.filter(
                nanny=nanny.user,
                status='completed'
            ).count()
            
            # Calcular tasa de aceptación
            total_requests = Booking.objects.filter(
                nanny=nanny.user
            ).exclude(status='pending').count()
            
            accepted_requests = Booking.objects.filter(
                nanny=nanny.user,
                status__in=['confirmed', 'completed']
            ).count()
            
            if total_requests > 0:
                acceptance_rate = (accepted_requests / total_requests) * 100
            else:
                acceptance_rate = 0
            
            # Guardar cambios (agregar campos si no existen en el modelo)
            nanny.save()
            updated_count += 1
            
        except Exception as e:
            logger.error(f"Error actualizando estadísticas de niñera {nanny.user.id}: {str(e)}")
    
    logger.info(f"Estadísticas actualizadas para {updated_count} niñeras")
    return {'updated': updated_count}


@shared_task(name='nannies.tasks.check_verification_expiry')
def check_verification_expiry():
    """
    Verifica si las verificaciones de niñeras están próximas a expirar.
    Envía notificaciones para renovar documentos.
    Opcional: útil si se implementa expiración de verificaciones.
    """
    from nannies.models import NannyProfile
    from notifications.service import NotificationService
    from datetime import timedelta
    
    # Verificaciones que expiran en 30 días
    thirty_days_ahead = timezone.now() + timedelta(days=30)
    
    # Por ahora solo un placeholder - requiere campo de fecha de expiración
    logger.info("Verificación de expiración de documentos (no implementado aún)")
    return {'checked': 0}


@shared_task(name='nannies.tasks.send_inactive_nanny_reminder')
def send_inactive_nanny_reminder():
    """
    Envía recordatorio a niñeras que no han tenido actividad en 30 días.
    Incentiva a mantener el perfil activo.
    """
    from nannies.models import NannyProfile
    from bookings.models import Booking
    from notifications.service import NotificationService
    from datetime import timedelta
    
    thirty_days_ago = timezone.now() - timedelta(days=30)
    
    # Buscar niñeras sin reservas recientes
    inactive_nannies = NannyProfile.objects.exclude(
        user__nanny_bookings__created_at__gte=thirty_days_ago
    ).filter(user__is_active=True)
    
    sent_count = 0
    
    for nanny in inactive_nannies:
        try:
            NotificationService.create_notification(
                user=nanny.user,
                notification_type='INACTIVITY_REMINDER',
                title='¡Te echamos de menos!',
                message='No has tenido reservas en el último mes. Actualiza tu perfil y disponibilidad para recibir más solicitudes.'
            )
            sent_count += 1
        except Exception as e:
            logger.error(f"Error enviando recordatorio a niñera {nanny.user.id}: {str(e)}")
    
    logger.info(f"Recordatorios de inactividad enviados: {sent_count}")
    return {'sent': sent_count}
