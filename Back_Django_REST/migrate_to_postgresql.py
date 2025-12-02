#!/usr/bin/env python
"""
Script automático para migrar de SQLite a PostgreSQL
Uso: python migrate_to_postgresql.py
"""

import os
import sys
import json
import subprocess
from pathlib import Path

# Colores para consola
class Colors:
    HEADER = '\033[95m'
    OKBLUE = '\033[94m'
    OKCYAN = '\033[96m'
    OKGREEN = '\033[92m'
    WARNING = '\033[93m'
    FAIL = '\033[91m'
    ENDC = '\033[0m'
    BOLD = '\033[1m'
    UNDERLINE = '\033[4m'

def print_header(msg):
    print(f"\n{Colors.HEADER}{Colors.BOLD}{'='*60}")
    print(f"  {msg}")
    print(f"{'='*60}{Colors.ENDC}\n")

def print_success(msg):
    print(f"{Colors.OKGREEN}✓ {msg}{Colors.ENDC}")

def print_info(msg):
    print(f"{Colors.OKCYAN}ℹ {msg}{Colors.ENDC}")

def print_warning(msg):
    print(f"{Colors.WARNING}⚠ {msg}{Colors.ENDC}")

def print_error(msg):
    print(f"{Colors.FAIL}✗ {msg}{Colors.ENDC}")

def run_command(cmd, description=""):
    """Ejecutar comando y mostrar resultado"""
    if description:
        print_info(f"Ejecutando: {description}")
    
    result = subprocess.run(cmd, shell=True, capture_output=True, text=True)
    
    if result.returncode != 0:
        print_error(f"Error: {result.stderr}")
        return False
    
    if result.stdout:
        print(result.stdout)
    
    return True

def main():
    print_header("MIGRACIÓN DE SQLite A PostgreSQL")
    
    # Verificar prerequisitos
    print_info("Verificando prerequisitos...")
    
    # Verificar Python
    if sys.version_info < (3, 11):
        print_warning(f"Python {sys.version_info.major}.{sys.version_info.minor} detectado")
        print_warning("Recomendado: Python 3.13+")
    else:
        print_success(f"Python {sys.version_info.major}.{sys.version_info.minor} ✓")
    
    # Verificar Django
    try:
        import django
        print_success(f"Django {django.VERSION[0]}.{django.VERSION[1]} ✓")
    except ImportError:
        print_error("Django no instalado. Ejecuta: pip install -r requirements.txt")
        return False
    
    # Verificar psycopg2
    try:
        import psycopg2
        print_success(f"psycopg2 ✓")
    except ImportError:
        print_warning("psycopg2 no instalado")
        print_info("Instalando: pip install psycopg2-binary")
        run_command("pip install psycopg2-binary==2.9.9")
    
    # Paso 1: Backup de SQLite
    print_header("PASO 1: BACKUP DE SQLite")
    
    sqlite_file = "db.sqlite3"
    backup_file = "sqlite_backup.json"
    
    if not os.path.exists(sqlite_file):
        print_error(f"No encontrado: {sqlite_file}")
        return False
    
    print_success(f"BD SQLite encontrada: {sqlite_file}")
    
    print_info("Creando backup JSON...")
    if not run_command(f"python manage.py dumpdata > {backup_file}", 
                      "Exportar datos de SQLite"):
        return False
    
    if os.path.exists(backup_file):
        size_mb = os.path.getsize(backup_file) / (1024 * 1024)
        print_success(f"Backup creado: {backup_file} ({size_mb:.2f} MB)")
    
    # Paso 2: Configurar PostgreSQL
    print_header("PASO 2: CONFIGURAR PostgreSQL")
    
    db_name = input(f"{Colors.OKCYAN}Nombre de BD PostgreSQL [home_nannies_dev]: {Colors.ENDC}") or "home_nannies_dev"
    db_user = input(f"{Colors.OKCYAN}Usuario PostgreSQL [home_nannies_user]: {Colors.ENDC}") or "home_nannies_user"
    db_password = input(f"{Colors.OKCYAN}Contraseña PostgreSQL: {Colors.ENDC}")
    db_host = input(f"{Colors.OKCYAN}Host PostgreSQL [localhost]: {Colors.ENDC}") or "localhost"
    db_port = input(f"{Colors.OKCYAN}Puerto PostgreSQL [5432]: {Colors.ENDC}") or "5432"
    
    # Crear archivo .env
    env_content = f"""USE_POSTGRESQL=True
DB_NAME={db_name}
DB_USER={db_user}
DB_PASSWORD={db_password}
DB_HOST={db_host}
DB_PORT={db_port}
DEBUG=False
SECRET_KEY=$(python -c 'import secrets; print(secrets.token_urlsafe(50))')
"""
    
    with open(".env", "w") as f:
        f.write(env_content)
    
    print_success("Archivo .env creado")
    
    # Paso 3: Crear BD en PostgreSQL
    print_header("PASO 3: CREAR BASE DE DATOS EN PostgreSQL")
    
    print_info("Se requieren credenciales de PostgreSQL...")
    
    create_db_sql = f"""
CREATE DATABASE {db_name};
CREATE USER {db_user} WITH PASSWORD '{db_password}';
ALTER ROLE {db_user} SET client_encoding TO 'utf8';
GRANT ALL PRIVILEGES ON DATABASE {db_name} TO {db_user};
"""
    
    print_warning("Ejecuta estos comandos en psql como usuario 'postgres':")
    print(create_db_sql)
    
    input(f"\n{Colors.WARNING}Presiona Enter cuando hayas ejecutado los comandos en PostgreSQL...{Colors.ENDC}")
    
    # Paso 4: Migrar esquema
    print_header("PASO 4: CREAR ESQUEMA EN PostgreSQL")
    
    print_info("Configurando Django para usar PostgreSQL...")
    os.environ['USE_POSTGRESQL'] = 'True'
    os.environ['DB_NAME'] = db_name
    os.environ['DB_USER'] = db_user
    os.environ['DB_PASSWORD'] = db_password
    os.environ['DB_HOST'] = db_host
    os.environ['DB_PORT'] = db_port
    
    print_info("Ejecutando migraciones...")
    if not run_command("python manage.py migrate --noinput",
                      "Aplicar todas las migraciones"):
        print_error("Error al ejecutar migraciones")
        return False
    
    print_success("Esquema creado en PostgreSQL")
    
    # Paso 5: Restaurar datos
    print_header("PASO 5: RESTAURAR DATOS")
    
    print_info("Cargando datos desde backup...")
    if not run_command(f"python manage.py loaddata {backup_file}",
                      "Restaurar datos"):
        print_warning("Error al restaurar datos")
        print_warning("Puedes intentar nuevamente con: python manage.py loaddata sqlite_backup.json")
    else:
        print_success("Datos restaurados exitosamente")
    
    # Paso 6: Verificación
    print_header("PASO 6: VERIFICACIÓN")
    
    print_info("Contando registros en cada tabla...")
    
    verify_command = """python manage.py shell -c "
from django.apps import apps
for model in apps.get_models():
    count = model.objects.count()
    if count > 0:
        print(f'{model._meta.app_label}.{model.__name__}: {count} registros')
" """
    
    run_command(verify_command)
    
    # Paso 7: Instrucciones finales
    print_header("MIGRACIÓN COMPLETADA ✓")
    
    print_success("Tu aplicación ha sido migrada de SQLite a PostgreSQL")
    print_info("Pasos siguientes:")
    print("  1. Ejecutar servidor: python manage.py runserver")
    print("  2. Verificar admin: http://localhost:8000/admin")
    print("  3. Crear superuser: python manage.py createsuperuser")
    print("  4. Ejecutar tests: python manage.py test")
    
    print_info("Para producción, ver: DEPLOYMENT_GUIDE_SQLite_to_PostgreSQL.md")

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print_warning("\nMigración cancelada por el usuario")
        sys.exit(1)
    except Exception as e:
        print_error(f"Error inesperado: {e}")
        sys.exit(1)
