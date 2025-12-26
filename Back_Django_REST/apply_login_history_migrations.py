"""
Script para aplicar las migraciones del historial de acceso
Ejecutar desde: Back_Django_REST/
"""

import os
import sys
import django

# Configurar Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'django_crud_api.settings')
django.setup()

from django.core.management import call_command
from django.db import connection

def main():
    print("=" * 60)
    print("APLICANDO MEJORAS - HISTORIAL DE ACCESO")
    print("=" * 60)
    print()
    
    # Verificar que estamos en el directorio correcto
    if not os.path.exists('manage.py'):
        print("❌ Error: Debes ejecutar este script desde el directorio Back_Django_REST/")
        sys.exit(1)
    
    print("📋 Paso 1: Creando migraciones...")
    try:
        call_command('makemigrations', 'users', interactive=False)
        print("✅ Migraciones creadas")
    except Exception as e:
        print(f"⚠️  Advertencia al crear migraciones: {e}")
    
    print()
    print("📋 Paso 2: Aplicando migraciones...")
    try:
        call_command('migrate', 'users', interactive=False)
        print("✅ Migraciones aplicadas")
    except Exception as e:
        print(f"❌ Error al aplicar migraciones: {e}")
        sys.exit(1)
    
    print()
    print("📋 Paso 3: Verificando tabla LoginHistory...")
    with connection.cursor() as cursor:
        cursor.execute("""
            SELECT COUNT(*) 
            FROM information_schema.tables 
            WHERE table_name = 'users_loginhistory'
        """)
        result = cursor.fetchone()
        if result and result[0] > 0:
            print("✅ Tabla LoginHistory creada correctamente")
        else:
            print("⚠️  Tabla LoginHistory no encontrada (puede ser normal si usas SQLite)")
    
    print()
    print("=" * 60)
    print("🎉 MEJORAS APLICADAS EXITOSAMENTE")
    print("=" * 60)
    print()
    print("Próximos pasos:")
    print("1. Reiniciar el servidor Django si está corriendo")
    print("2. Probar el login para verificar que se registra en el historial")
    print("3. Acceder al endpoint: GET /api/users/login-history/")
    print()

if __name__ == '__main__':
    main()
