"""
Management command para realizar backup de la base de datos.
Se ejecuta diariamente a las 3:00 AM.
"""

from django.core.management.base import BaseCommand
from django.core.management import call_command
from django.conf import settings
from datetime import datetime, timedelta
from django.utils import timezone
import os
import logging

logger = logging.getLogger(__name__)


class Command(BaseCommand):
    help = 'Realiza backup de la base de datos en formato JSON'

    def add_arguments(self, parser):
        parser.add_argument(
            '--output',
            type=str,
            help='Directorio de salida para el backup',
        )
        parser.add_argument(
            '--keep-days',
            type=int,
            default=7,
            help='Días de backups a mantener (default: 7)',
        )
        parser.add_argument(
            '--no-cleanup',
            action='store_true',
            help='No limpiar backups antiguos',
        )

    def handle(self, *args, **options):
        self.stdout.write('💾 Creando backup de base de datos...')
        
        # Directorio de backup
        if options['output']:
            backup_dir = options['output']
        else:
            backup_dir = settings.BASE_DIR / 'backups'
        
        os.makedirs(backup_dir, exist_ok=True)
        
        # Nombre del archivo
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        backup_file = os.path.join(backup_dir, f'db_backup_{timestamp}.json')
        
        try:
            # Crear backup
            with open(backup_file, 'w', encoding='utf-8') as f:
                call_command(
                    'dumpdata',
                    '--natural-foreign',
                    '--natural-primary',
                    '--indent', '2',
                    '--exclude', 'contenttypes',
                    '--exclude', 'auth.permission',
                    '--exclude', 'sessions.session',
                    stdout=f
                )
            
            file_size = os.path.getsize(backup_file)
            file_size_mb = file_size / (1024 * 1024)
            
            self.stdout.write(
                self.style.SUCCESS(
                    f'✅ Backup creado: {os.path.basename(backup_file)} ({file_size_mb:.2f} MB)'
                )
            )
            
            # Limpiar backups antiguos
            if not options['no_cleanup']:
                self._cleanup_old_backups(backup_dir, options['keep_days'])
            
        except Exception as e:
            logger.error(f"Error creando backup: {str(e)}")
            self.stderr.write(
                self.style.ERROR(f'❌ Error creando backup: {str(e)}')
            )
            raise

    def _cleanup_old_backups(self, backup_dir, keep_days):
        """Elimina backups más antiguos que keep_days"""
        self.stdout.write(f'🧹 Limpiando backups antiguos (>{keep_days} días)...')
        
        cutoff_date = timezone.now() - timedelta(days=keep_days)
        deleted_count = 0
        
        for filename in os.listdir(backup_dir):
            if filename.startswith('db_backup_') and filename.endswith('.json'):
                filepath = os.path.join(backup_dir, filename)
                
                try:
                    file_mtime = datetime.fromtimestamp(os.path.getmtime(filepath))
                    if timezone.is_naive(file_mtime):
                        file_mtime = timezone.make_aware(file_mtime)
                    
                    if file_mtime < cutoff_date:
                        os.remove(filepath)
                        deleted_count += 1
                        
                except Exception as e:
                    logger.error(f"Error eliminando backup {filename}: {str(e)}")
        
        if deleted_count > 0:
            self.stdout.write(f'   Eliminados: {deleted_count} backups')
