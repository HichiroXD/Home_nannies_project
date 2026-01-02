"""
Tareas asíncronas de Celery para el módulo core (backups, mantenimiento).
"""

from celery import shared_task
from django.core.management import call_command
from django.conf import settings
from datetime import datetime
import os
import logging
import subprocess

logger = logging.getLogger(__name__)


@shared_task(name='core.tasks.database_backup')
def database_backup():
    """
    Realiza backup de la base de datos.
    Se ejecuta diariamente a las 3:00 AM.
    Guarda en la carpeta /backups con rotación de 7 días.
    """
    backup_dir = settings.BASE_DIR / 'backups'
    backup_dir.mkdir(exist_ok=True)
    
    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
    backup_file = backup_dir / f'db_backup_{timestamp}.json'
    
    try:
        # Usar dumpdata para exportar toda la base de datos
        with open(backup_file, 'w', encoding='utf-8') as f:
            call_command(
                'dumpdata',
                '--natural-foreign',
                '--natural-primary',
                '--indent', '2',
                '--exclude', 'contenttypes',
                '--exclude', 'auth.permission',
                '--exclude', 'sessions.session',
                '--exclude', 'django_celery_beat',
                '--exclude', 'django_celery_results',
                stdout=f
            )
        
        file_size = os.path.getsize(backup_file)
        logger.info(f"Backup creado exitosamente: {backup_file.name} ({file_size} bytes)")
        
        # Rotar backups: mantener solo los últimos 7 días
        cleanup_old_backups(backup_dir, days=7)
        
        return {
            'success': True,
            'file': str(backup_file.name),
            'size': file_size
        }
        
    except Exception as e:
        logger.error(f"Error creando backup: {str(e)}")
        return {
            'success': False,
            'error': str(e)
        }


def cleanup_old_backups(backup_dir, days=7):
    """
    Elimina backups más antiguos que el número de días especificado.
    """
    from datetime import timedelta
    from django.utils import timezone
    
    cutoff_date = timezone.now() - timedelta(days=days)
    deleted_count = 0
    
    for backup_file in backup_dir.glob('db_backup_*.json'):
        try:
            # Obtener fecha de modificación del archivo
            file_mtime = datetime.fromtimestamp(backup_file.stat().st_mtime)
            
            # Hacer timezone aware
            if timezone.is_naive(file_mtime):
                file_mtime = timezone.make_aware(file_mtime)
            
            if file_mtime < cutoff_date:
                backup_file.unlink()
                deleted_count += 1
                logger.info(f"Backup antiguo eliminado: {backup_file.name}")
                
        except Exception as e:
            logger.error(f"Error eliminando backup {backup_file.name}: {str(e)}")
    
    if deleted_count > 0:
        logger.info(f"Total de backups antiguos eliminados: {deleted_count}")


@shared_task(name='core.tasks.send_backup_notification')
def send_backup_notification(backup_result):
    """
    Envía notificación sobre el estado del backup a los administradores.
    """
    from users.models import User
    from django.core.mail import send_mail
    
    admins = User.objects.filter(is_staff=True, is_active=True)
    
    if backup_result.get('success'):
        subject = '✅ Backup Exitoso - Home Nannies'
        message = f"""
Backup de base de datos completado exitosamente.

Archivo: {backup_result['file']}
Tamaño: {backup_result['size']} bytes
Fecha: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}
        """
    else:
        subject = '❌ Error en Backup - Home Nannies'
        message = f"""
Error al realizar backup de base de datos.

Error: {backup_result.get('error', 'Desconocido')}
Fecha: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}

Por favor revisar los logs del servidor.
        """
    
    sent_count = 0
    for admin in admins:
        try:
            send_mail(
                subject=subject,
                message=message,
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[admin.email],
                fail_silently=True,
            )
            sent_count += 1
        except Exception as e:
            logger.error(f"Error enviando notificación de backup a {admin.email}: {str(e)}")
    
    logger.info(f"Notificaciones de backup enviadas: {sent_count}")
    return {'sent': sent_count}


@shared_task(name='core.tasks.cleanup_temp_files')
def cleanup_temp_files():
    """
    Limpia archivos temporales antiguos de OCR y uploads.
    """
    from datetime import timedelta
    from django.utils import timezone
    
    temp_dir = settings.BASE_DIR / 'temp_ocr'
    if not temp_dir.exists():
        return {'deleted': 0}
    
    cutoff_date = timezone.now() - timedelta(days=1)  # Archivos de más de 1 día
    deleted_count = 0
    
    for temp_file in temp_dir.iterdir():
        if temp_file.is_file():
            try:
                file_mtime = datetime.fromtimestamp(temp_file.stat().st_mtime)
                if timezone.is_naive(file_mtime):
                    file_mtime = timezone.make_aware(file_mtime)
                
                if file_mtime < cutoff_date:
                    temp_file.unlink()
                    deleted_count += 1
            except Exception as e:
                logger.error(f"Error eliminando archivo temporal {temp_file.name}: {str(e)}")
    
    logger.info(f"Archivos temporales eliminados: {deleted_count}")
    return {'deleted': deleted_count}
