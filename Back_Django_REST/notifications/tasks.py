"""
Tareas asíncronas de Celery para el módulo de notifications.
"""

from celery import shared_task
from django.utils import timezone
from datetime import timedelta
import logging

logger = logging.getLogger(__name__)


@shared_task(name='notifications.tasks.cleanup_old_notifications')
def cleanup_old_notifications():
    """
    Elimina notificaciones leídas que tienen más de 30 días.
    Mantiene notificaciones importantes o no leídas.
    Se ejecuta semanalmente los domingos a las 2:00 AM.
    """
    from notifications.models import Notification
    
    thirty_days_ago = timezone.now() - timedelta(days=30)
    
    # Eliminar notificaciones leídas antiguas
    old_notifications = Notification.objects.filter(
        is_read=True,
        created_at__lt=thirty_days_ago
    ).exclude(
        notification_type__in=['ACCOUNT_SUSPENDED', 'ACCOUNT_APPROVED']  # Mantener importantes
    )
    
    count = old_notifications.count()
    old_notifications.delete()
    
    logger.info(f"Notificaciones antiguas eliminadas: {count}")
    return {'deleted': count}


@shared_task(name='notifications.tasks.send_unread_digest')
def send_unread_digest():
    """
    Envía un resumen por email de notificaciones no leídas.
    Útil para usuarios que no han revisado la app en varios días.
    Opcional: se puede programar semanalmente.
    """
    from notifications.models import Notification
    from users.models import User
    from django.core.mail import send_mail
    from django.conf import settings
    
    sent_count = 0
    
    # Buscar usuarios con notificaciones no leídas de más de 3 días
    three_days_ago = timezone.now() - timedelta(days=3)
    
    users_with_unread = User.objects.filter(
        received_notifications__is_read=False,
        received_notifications__created_at__lt=three_days_ago
    ).distinct()
    
    for user in users_with_unread:
        unread_count = user.received_notifications.filter(is_read=False).count()
        
        try:
            send_mail(
                subject='Tienes notificaciones pendientes en Home Nannies',
                message=f'Hola {user.get_full_name()},\n\nTienes {unread_count} notificaciones sin leer en Home Nannies.\nRevísalas en: {settings.FRONTEND_URL}/notifications',
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[user.email],
                fail_silently=True,
            )
            sent_count += 1
        except Exception as e:
            logger.error(f"Error enviando digest a {user.email}: {str(e)}")
    
    logger.info(f"Resúmenes de notificaciones enviados: {sent_count}")
    return {'sent': sent_count}
