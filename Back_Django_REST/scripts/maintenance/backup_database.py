#!/usr/bin/env python
"""
Script de backup manual para Home Nannies.
Crea un backup de la base de datos y opcionalmente lo sube a almacenamiento externo.

Uso:
    python backup_database.py [--upload] [--output DIR]
"""

import os
import sys
import subprocess
from datetime import datetime
from pathlib import Path
import argparse

# Agregar el directorio del proyecto al path
sys.path.insert(0, str(Path(__file__).resolve().parent))

# Configurar Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'django_crud_api.settings')
os.environ.setdefault('DEBUG', 'True')

import django
django.setup()

from django.core.management import call_command
from django.conf import settings


def create_backup(output_dir=None):
    """
    Crea un backup de la base de datos.
    
    Args:
        output_dir: Directorio donde guardar el backup (default: backups/)
    
    Returns:
        Path del archivo creado
    """
    if output_dir is None:
        backup_dir = settings.BASE_DIR / 'backups'
    else:
        backup_dir = Path(output_dir)
    
    backup_dir.mkdir(exist_ok=True)
    
    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
    backup_file = backup_dir / f'db_backup_{timestamp}.json'
    
    print(f"📦 Creando backup en: {backup_file}")
    
    try:
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
        file_size_mb = file_size / (1024 * 1024)
        
        print(f"✅ Backup creado exitosamente!")
        print(f"   Archivo: {backup_file.name}")
        print(f"   Tamaño: {file_size_mb:.2f} MB")
        
        return backup_file
        
    except Exception as e:
        print(f"❌ Error creando backup: {str(e)}")
        sys.exit(1)


def upload_to_cloud(backup_file):
    """
    Sube el backup a almacenamiento en la nube (placeholder).
    
    Args:
        backup_file: Path del archivo de backup
    """
    print(f"\n☁️  Subiendo backup a la nube...")
    print("   (Función no implementada - requiere configurar S3, Google Cloud, etc.)")
    
    # Ejemplo de implementación con AWS S3:
    # import boto3
    # s3 = boto3.client('s3')
    # bucket_name = 'home-nannies-backups'
    # s3.upload_file(str(backup_file), bucket_name, backup_file.name)
    
    return False


def cleanup_old_backups(backup_dir, keep_days=7):
    """
    Elimina backups antiguos.
    
    Args:
        backup_dir: Directorio de backups
        keep_days: Días de backups a mantener
    """
    from django.utils import timezone
    from datetime import timedelta
    
    cutoff_date = timezone.now() - timedelta(days=keep_days)
    deleted_count = 0
    
    for backup_file in backup_dir.glob('db_backup_*.json'):
        try:
            file_mtime = datetime.fromtimestamp(backup_file.stat().st_mtime)
            if timezone.is_naive(file_mtime):
                file_mtime = timezone.make_aware(file_mtime)
            
            if file_mtime < cutoff_date:
                backup_file.unlink()
                deleted_count += 1
                print(f"🗑️  Eliminado backup antiguo: {backup_file.name}")
                
        except Exception as e:
            print(f"⚠️  Error eliminando {backup_file.name}: {str(e)}")
    
    if deleted_count > 0:
        print(f"✅ {deleted_count} backups antiguos eliminados")


def main():
    parser = argparse.ArgumentParser(description='Crear backup de la base de datos')
    parser.add_argument('--upload', action='store_true', help='Subir backup a la nube')
    parser.add_argument('--output', type=str, help='Directorio de salida')
    parser.add_argument('--keep-days', type=int, default=7, help='Días de backups a mantener')
    parser.add_argument('--no-cleanup', action='store_true', help='No limpiar backups antiguos')
    
    args = parser.parse_args()
    
    print("=" * 60)
    print("🏠 Home Nannies - Backup de Base de Datos")
    print("=" * 60)
    print()
    
    # Crear backup
    backup_file = create_backup(output_dir=args.output)
    
    # Subir a la nube si se solicita
    if args.upload:
        upload_to_cloud(backup_file)
    
    # Limpiar backups antiguos
    if not args.no_cleanup:
        print()
        print(f"🧹 Limpiando backups antiguos (>{args.keep_days} días)...")
        cleanup_old_backups(backup_file.parent, keep_days=args.keep_days)
    
    print()
    print("=" * 60)
    print("✅ Proceso completado exitosamente")
    print("=" * 60)


if __name__ == '__main__':
    main()
