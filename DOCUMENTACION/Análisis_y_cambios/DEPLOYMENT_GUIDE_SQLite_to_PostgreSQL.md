# 📘 GUÍA COMPLETA: SQLite → PostgreSQL → Producción

## Tabla de Contenidos
1. [Preparación Previa](#preparación-previa)
2. [Instalación de PostgreSQL](#instalación-de-postgresql)
3. [Configuración Local](#configuración-local)
4. [Migración de Datos](#migración-de-datos)
5. [Testing Local](#testing-local)
6. [Deployment a Producción](#deployment-a-producción)
7. [Configuración de Seguridad](#configuración-de-seguridad)
8. [Monitoreo y Backups](#monitoreo-y-backups)
9. [Troubleshooting](#troubleshooting)

---

## 🔧 Preparación Previa

### Requisitos
- Python 3.13.4+
- PostgreSQL 14+
- Git
- pip
- Acceso a servidor producción (Heroku, AWS, DigitalOcean, etc.)

### 1. Verificar estado actual

```bash
# Desde el directorio del proyecto
cd Back_Django_REST

# Ver base de datos actual
ls -la db.sqlite3

# Verificar versión de Python
python --version

# Verificar Django
python manage.py --version
```

### 2. Crear rama de backup

```bash
git checkout -b production-migration-$(date +%Y%m%d)
git push origin production-migration-$(date +%Y%m%d)
```

---

## 🗄️ Instalación de PostgreSQL

### En Windows (Recomendado: pgAdmin instalado)

```powershell
# Opción 1: PostgreSQL official installer
# Descargar desde: https://www.postgresql.org/download/windows/
# Instalar con:
# - Puerto: 5432 (default)
# - Usuario: postgres
# - Password: [usar contraseña fuerte]
# - Encoding: UTF8

# Opción 2: Con Chocolatey
choco install postgresql14

# Opción 3: Con Windows Subsystem for Linux (WSL)
wsl --install
wsl -d Ubuntu
sudo apt-get update
sudo apt-get install postgresql postgresql-contrib
sudo service postgresql start
```

### En MacOS

```bash
# Con Homebrew (Recomendado)
brew install postgresql@14
brew services start postgresql@14

# O descargar desde
# https://www.postgresql.org/download/macosx/
```

### En Linux (Ubuntu/Debian)

```bash
sudo apt-get update
sudo apt-get install postgresql postgresql-contrib

# Iniciar servicio
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Verificar status
sudo systemctl status postgresql
```

---

## ⚙️ Configuración Local

### 1. Instalar driver PostgreSQL para Python

```bash
pip install psycopg2-binary==2.9.9
pip install psycopg2==2.9.9
```

### 2. Crear base de datos PostgreSQL

```bash
# Acceder a PostgreSQL
psql -U postgres

# En la consola psql:
CREATE DATABASE home_nannies_dev;
CREATE DATABASE home_nannies_test;

# Crear usuario específico (RECOMENDADO)
CREATE USER home_nannies_user WITH PASSWORD 'your_secure_password_here';

# Dar permisos
ALTER ROLE home_nannies_user SET client_encoding TO 'utf8';
ALTER ROLE home_nannies_user SET default_transaction_isolation TO 'read committed';
ALTER ROLE home_nannies_user SET default_transaction_deferrable TO on;
ALTER ROLE home_nannies_user SET default_transaction_level TO 'read committed';
GRANT ALL PRIVILEGES ON DATABASE home_nannies_dev TO home_nannies_user;
GRANT ALL PRIVILEGES ON DATABASE home_nannies_test TO home_nannies_user;

# Salir
\q
```

### 3. Actualizar settings.py

**IMPORTANTE: ANTES DE HACER CAMBIOS, HACER BACKUP**

```bash
cp django_crud_api/settings.py django_crud_api/settings.py.backup
```

Editar `django_crud_api/settings.py`:

```python
# CAMBIAR DE ESTO:
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}

# A ESTO:
import os
from urllib.parse import urlparse

# Usar variables de ambiente para seguridad
if os.getenv('USE_POSTGRESQL'):
    # PostgreSQL para desarrollo/producción
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.postgresql',
            'NAME': os.getenv('DB_NAME', 'home_nannies_dev'),
            'USER': os.getenv('DB_USER', 'home_nannies_user'),
            'PASSWORD': os.getenv('DB_PASSWORD', ''),
            'HOST': os.getenv('DB_HOST', 'localhost'),
            'PORT': os.getenv('DB_PORT', '5432'),
            'CONN_MAX_AGE': 600,
            'OPTIONS': {
                'connect_timeout': 10,
            }
        }
    }
else:
    # SQLite para desarrollo local
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.sqlite3',
            'NAME': BASE_DIR / 'db.sqlite3',
        }
    }
```

### 4. Crear archivo .env.local

```bash
# En Back_Django_REST/.env.local
USE_POSTGRESQL=False
DB_NAME=home_nannies_dev
DB_USER=home_nannies_user
DB_PASSWORD=your_secure_password_here
DB_HOST=localhost
DB_PORT=5432
```

### 5. Actualizar requirements.txt

```bash
pip install psycopg2-binary==2.9.9
pip freeze | grep -i psyco >> requirements.txt

# O editar manualmente y agregar:
# psycopg2-binary==2.9.9
```

---

## 📦 Migración de Datos

### 1. Exportar datos de SQLite

```bash
# Crear dump de SQLite
python manage.py dumpdata > sqlite_backup.json

# Esto crea un JSON con todos los datos
# Tamaño típico: 10-500 MB dependiendo de datos
```

### 2. Cambiar a PostgreSQL (local)

```bash
# Habilitar PostgreSQL
# En .env.local o manualmente en settings.py
export USE_POSTGRESQL=True

# O en Windows PowerShell:
$env:USE_POSTGRESQL="True"
```

### 3. Crear esquema en PostgreSQL

```bash
# Ejecutar migraciones en BD nueva
python manage.py migrate --noinput

# Esto crea todas las tablas necesarias
```

### 4. Restaurar datos

```bash
# Cargar datos desde el dump
python manage.py loaddata sqlite_backup.json

# Si hay problemas de encoding:
python manage.py loaddata sqlite_backup.json --format json
```

### 5. Verificar integridad

```bash
# Contar registros
python manage.py shell

# En la consola Python:
from django.contrib.auth import get_user_model
User = get_user_model()
print(f"Total users: {User.objects.count()}")

# Verificar todas las apps
from django.apps import apps
for model in apps.get_models():
    count = model.objects.count()
    print(f"{model._meta.app_label}.{model.__name__}: {count} registros")

exit()
```

---

## ✅ Testing Local

### 1. Testear conexión

```bash
python manage.py dbshell

# Debería conectar a PostgreSQL
```

### 2. Testear aplicación

```bash
# Ejecutar servidor local
python manage.py runserver

# Ir a http://localhost:8000/admin
# Verificar que admin funciona
# Crear usuario de prueba
```

### 3. Ejecutar tests

```bash
# Tests de migraciones
python manage.py test --keep-db

# O specific app
python manage.py test core --keep-db
python manage.py test academic --keep-db
python manage.py test notifications --keep-db
python manage.py test reports --keep-db
```

### 4. Crear usuario superuser

```bash
python manage.py createsuperuser

# Seguir prompts
```

---

## 🚀 Deployment a Producción

### Opción A: Heroku (Recomendado para principiantes)

#### 1. Crear cuenta Heroku

```bash
# Descargar Heroku CLI desde https://devcenter.heroku.com/articles/heroku-cli
heroku login

# Verificar login
heroku apps
```

#### 2. Crear app en Heroku

```bash
heroku create home-nannies-api

# O si ya existe
heroku apps:info home-nannies-api
```

#### 3. Agregar PostgreSQL en Heroku

```bash
# Plan gratuito (máx 10K filas)
heroku addons:create heroku-postgresql:hobby-dev --app home-nannies-api

# O plan pagado para producción
heroku addons:create heroku-postgresql:standard-0 --app home-nannies-api

# Verificar
heroku addons --app home-nannies-api
```

#### 4. Configurar variables de ambiente

```bash
heroku config:set USE_POSTGRESQL=True --app home-nannies-api
heroku config:set DEBUG=False --app home-nannies-api
heroku config:set ALLOWED_HOSTS=home-nannies-api.herokuapp.com --app home-nannies-api
heroku config:set SECRET_KEY=$(python -c 'import secrets; print(secrets.token_urlsafe(50))') --app home-nannies-api

# La BD se auto-configura con DATABASE_URL
# Verificar:
heroku config --app home-nannies-api
```

#### 5. Crear Procfile

Crear archivo `Procfile` en raíz del proyecto:

```
web: python Back_Django_REST/manage.py runserver 0.0.0.0:$PORT
worker: celery -A django_crud_api worker -l info
release: python Back_Django_REST/manage.py migrate
```

#### 6. Crear runtime.txt

Crear archivo `runtime.txt` en raíz:

```
python-3.13.4
```

#### 7. Actualizar requirements.txt para producción

```bash
pip install gunicorn==21.2.0
pip install whitenoise==6.6.0
pip install psycopg2-binary==2.9.9

pip freeze > requirements.txt
```

#### 8. Actualizar settings.py para Heroku

Agregar al final de `django_crud_api/settings.py`:

```python
# Heroku deployment settings
import os
if os.getenv('HEROKU_APP_NAME'):
    ALLOWED_HOSTS = [f'{os.getenv("HEROKU_APP_NAME")}.herokuapp.com']
    DEBUG = False
    SECURE_SSL_REDIRECT = True
    SECURE_HSTS_SECONDS = 31536000
    SECURE_HSTS_INCLUDE_SUBDOMAINS = True
    SECURE_HSTS_PRELOAD = True
    SESSION_COOKIE_SECURE = True
    CSRF_COOKIE_SECURE = True
    
    # Usar DATABASE_URL de Heroku
    import dj_database_url
    DATABASES['default'] = dj_database_url.config(
        default=os.getenv('DATABASE_URL'),
        conn_max_age=600,
        conn_health_checks=True,
    )
    
    # Static files
    MIDDLEWARE.insert(1, 'whitenoise.middleware.WhiteNoiseMiddleware')
    STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'
```

#### 9. Instalar dependencias Heroku

```bash
pip install dj-database-url==2.1.0
pip install django-environ==0.21.0
```

#### 10. Desplegar a Heroku

```bash
# Asegurar que todo está en git
git add .
git commit -m "Production deployment: SQLite to PostgreSQL"

# Deploy
git push heroku main

# O si estás en rama diferente:
git push heroku production-migration:main

# Monitorear logs
heroku logs --tail --app home-nannies-api

# Ejecutar migraciones (si no estén automáticas)
heroku run python Back_Django_REST/manage.py migrate --app home-nannies-api

# Crear superuser
heroku run python Back_Django_REST/manage.py createsuperuser --app home-nannies-api

# Recopilar archivos estáticos
heroku run python Back_Django_REST/manage.py collectstatic --noinput --app home-nannies-api
```

---

### Opción B: AWS (EC2 + RDS)

#### 1. Crear instancia EC2

```bash
# En AWS Console:
# - Launch Instance
# - Ubuntu Server 22.04 LTS
# - t3.micro (free tier)
# - Security Group: Allow HTTP (80), HTTPS (443), SSH (22)
# - Create key pair y descargar .pem
```

#### 2. Conectarse a EC2

```bash
# En tu máquina local
chmod 400 your-key.pem
ssh -i your-key.pem ubuntu@your-ec2-ip
```

#### 3. Instalar dependencias

```bash
sudo apt-get update
sudo apt-get upgrade -y
sudo apt-get install -y python3.13 python3-pip python3-venv postgresql-client git nginx

# Python virtual environment
python3 -m venv venv
source venv/bin/activate
```

#### 4. Clonar repositorio

```bash
git clone https://github.com/HichiroXD/Home_nannies_project.git
cd Home_nannies_project/Back_Django_REST

# Instalar requirements
pip install -r requirements.txt
```

#### 5. Crear RDS PostgreSQL

```bash
# En AWS Console RDS:
# - Create database
# - PostgreSQL
# - Free tier eligible
# - DB instance: home-nannies
# - Master username: admin
# - Master password: [contraseña fuerte]
# - Allocate storage: 20 GB
# - Public accessibility: No
# - Security group: allow from EC2
```

#### 6. Configurar variables de ambiente

```bash
# En EC2
nano .env

# Agregar:
USE_POSTGRESQL=True
DEBUG=False
SECRET_KEY=your_secret_key_here
ALLOWED_HOSTS=your-domain.com,www.your-domain.com
DB_NAME=homenanniesproddb
DB_USER=admin
DB_PASSWORD=your_rds_password
DB_HOST=your-rds-endpoint.amazonaws.com
DB_PORT=5432
```

#### 7. Ejecutar migraciones

```bash
python manage.py migrate
python manage.py createsuperuser
python manage.py collectstatic --noinput
```

#### 8. Configurar Gunicorn

```bash
# Crear socket de Gunicorn
sudo nano /etc/systemd/system/gunicorn.socket

# Agregar:
[Unit]
Description=gunicorn socket

[Socket]
ListenStream=127.0.0.1:8000

[Install]
WantedBy=sockets.target

# Crear servicio
sudo nano /etc/systemd/system/gunicorn.service

# Agregar:
[Unit]
Description=gunicorn daemon
Requires=gunicorn.socket
After=network.target

[Service]
Type=notify
User=ubuntu
WorkingDirectory=/home/ubuntu/Home_nannies_project/Back_Django_REST
ExecStart=/home/ubuntu/venv/bin/gunicorn django_crud_api.wsgi:application
ExecReload=/bin/kill -s HUP $MAINPID
KillMode=mixed
KillSignal=SIGQUIT

[Install]
WantedBy=multi-user.target

# Habilitar
sudo systemctl daemon-reload
sudo systemctl start gunicorn.socket
sudo systemctl start gunicorn.service
sudo systemctl enable gunicorn.socket
sudo systemctl enable gunicorn.service
```

#### 9. Configurar Nginx

```bash
sudo nano /etc/nginx/sites-available/home-nannies

# Agregar:
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;

    location = /favicon.ico { 
        access_log off; 
        log_not_found off; 
    }
    
    location /static/ {
        alias /home/ubuntu/Home_nannies_project/Back_Django_REST/staticfiles/;
    }

    location / {
        include proxy_params;
        proxy_pass http://unix:/run/gunicorn.sock;
    }
}

# Habilitar
sudo ln -s /etc/nginx/sites-available/home-nannies /etc/nginx/sites-enabled/
sudo systemctl restart nginx
```

#### 10. SSL con Let's Encrypt

```bash
sudo apt-get install certbot python3-certbot-nginx -y
sudo certbot --nginx -d your-domain.com -d www.your-domain.com
```

---

## 🔐 Configuración de Seguridad

### 1. Variables de Ambiente Producción

```bash
# En servidor producción:

# Django
DEBUG=False
SECRET_KEY=generate_with: python -c "import secrets; print(secrets.token_urlsafe(50))"
ALLOWED_HOSTS=your-domain.com,www.your-domain.com

# Base de Datos
USE_POSTGRESQL=True
DB_NAME=homenanniesproddb
DB_USER=produser
DB_PASSWORD=very_strong_password_min_20_chars
DB_HOST=db-prod.example.com
DB_PORT=5432

# Security
SECURE_SSL_REDIRECT=True
SESSION_COOKIE_SECURE=True
CSRF_COOKIE_SECURE=True
SECURE_BROWSER_XSS_FILTER=True
SECURE_CONTENT_SECURITY_POLICY={...}
X_FRAME_OPTIONS=DENY

# Email
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=app_specific_password

# CORS
CORS_ALLOWED_ORIGINS=https://your-domain.com,https://www.your-domain.com
```

### 2. Actualizar settings.py para Producción

```python
# En django_crud_api/settings.py

# CORS Configuration
CORS_ALLOWED_ORIGINS = os.getenv(
    'CORS_ALLOWED_ORIGINS',
    'http://localhost:3000'
).split(',')

# CSRF
CSRF_TRUSTED_ORIGINS = os.getenv(
    'CSRF_TRUSTED_ORIGINS',
    'http://localhost:3000'
).split(',')

# Security Headers
SECURE_SSL_REDIRECT = os.getenv('SECURE_SSL_REDIRECT', 'False') == 'True'
SECURE_HSTS_SECONDS = 31536000
SECURE_HSTS_INCLUDE_SUBDOMAINS = True
SECURE_HSTS_PRELOAD = True
SESSION_COOKIE_SECURE = os.getenv('SESSION_COOKIE_SECURE', 'False') == 'True'
CSRF_COOKIE_SECURE = os.getenv('CSRF_COOKIE_SECURE', 'False') == 'True'
X_FRAME_OPTIONS = 'DENY'
SECURE_CONTENT_SECURITY_POLICY = {
    'default-src': ("'self'",),
    'script-src': ("'self'", "'unsafe-inline'", "cdn.jsdelivr.net"),
    'style-src': ("'self'", "'unsafe-inline'"),
}
```

### 3. Crear usuario PostgreSQL con permisos limitados

```sql
-- Como superuser (postgres):
CREATE ROLE produser WITH LOGIN PASSWORD 'secure_password';
ALTER ROLE produser CREATEDB;
CREATE DATABASE homenanniesproddb OWNER produser;

-- Dar solo permisos necesarios
GRANT CONNECT ON DATABASE homenanniesproddb TO produser;
GRANT USAGE ON SCHEMA public TO produser;
GRANT ALL ON SCHEMA public TO produser;
```

---

## 📊 Monitoreo y Backups

### 1. Backup Automático PostgreSQL

#### En Heroku:
```bash
# Heroku automáticamente hace backups
# Pero puedes crear manual:
heroku pg:backups:capture --app home-nannies-api

# Descargar backup
heroku pg:backups:download --app home-nannies-api

# Ver historial
heroku pg:backups --app home-nannies-api
```

#### En AWS RDS:
```bash
# Automated backups (30 días por defecto)
# En AWS Console RDS:
# - Select DB instance
# - Automated backups son automáticos
# - Puedes crear manual snapshots

# O con CLI:
aws rds create-db-snapshot \
  --db-instance-identifier home-nannies \
  --db-snapshot-identifier home-nannies-backup-$(date +%Y%m%d)
```

#### En EC2 manual:
```bash
#!/bin/bash
# backup.sh

BACKUP_DIR="/backups/postgresql"
DATE=$(date +%Y%m%d_%H%M%S)
DBNAME="homenanniesproddb"

mkdir -p $BACKUP_DIR

# Full backup
pg_dump -h localhost -U produser $DBNAME | \
  gzip > $BACKUP_DIR/backup_$DBNAME\_$DATE.sql.gz

# Mantener solo últimos 7 días
find $BACKUP_DIR -type f -mtime +7 -delete

echo "Backup completado: $DATE"
```

Agregar a crontab:
```bash
# Ejecutar diariamente a las 2 AM
0 2 * * * /home/ubuntu/backup.sh
```

### 2. Monitoreo

#### Sentry (Error Tracking)

```bash
pip install sentry-sdk==1.39.1
```

En `settings.py`:

```python
import sentry_sdk
from sentry_sdk.integrations.django import DjangoIntegration

sentry_sdk.init(
    dsn=os.getenv('SENTRY_DSN'),
    integrations=[
        DjangoIntegration(),
    ],
    traces_sample_rate=1.0,
    send_default_pii=False,
    environment=os.getenv('ENVIRONMENT', 'development'),
)
```

#### New Relic (APM)

```bash
pip install newrelic==9.0.1
```

```bash
# En servidor
NEW_RELIC_CONFIG_FILE=newrelic.ini newrelic-admin run-program gunicorn django_crud_api.wsgi:application
```

### 3. Logs

```bash
# Heroku
heroku logs --tail --app home-nannies-api

# AWS EC2 con journalctl
journalctl -u gunicorn -n 50 -f
journalctl -u nginx -n 50 -f

# O ver archivos
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log
```

---

## 🔧 Troubleshooting

### Error: psycopg2 no se instala

```bash
# Windows
pip install psycopg2-binary

# Mac
brew install postgresql
pip install psycopg2

# Linux
sudo apt-get install libpq-dev
pip install psycopg2
```

### Error: "fe_sendauth: no password supplied"

```bash
# Solución:
# 1. Verificar credenciales en .env
# 2. Crear archivo .pgpass
nano ~/.pgpass

# Agregar:
localhost:5432:home_nannies_dev:home_nannies_user:your_password

chmod 600 ~/.pgpass
```

### Error: "FATAL: Ident authentication failed"

```bash
# En Linux, editar
sudo nano /etc/postgresql/14/main/pg_hba.conf

# Cambiar:
# local   all             all                                     peer
# A:
local   all             all                                     md5

sudo systemctl restart postgresql
```

### Error: "StaticFilesNotFound"

```bash
# Recopilar archivos estáticos
python manage.py collectstatic --noinput --clear

# Para Heroku
heroku run python Back_Django_REST/manage.py collectstatic --noinput
```

### Error: "database does not exist"

```bash
# Verificar BD existe
psql -U postgres -l

# Crear si no existe
psql -U postgres -c "CREATE DATABASE home_nannies_dev;"

# Ejecutar migraciones
python manage.py migrate
```

### Error: "role does not have login privilege"

```bash
# Solución:
psql -U postgres

ALTER ROLE home_nannies_user WITH LOGIN;
```

---

## ✅ Checklist Final

- [ ] Base de datos PostgreSQL creada
- [ ] Usuario PostgreSQL con permisos configurados
- [ ] Datos migraron exitosamente desde SQLite
- [ ] Tests pasaron en ambiente local
- [ ] Variables de ambiente configuradas
- [ ] requirements.txt actualizado
- [ ] Procfile creado
- [ ] runtime.txt creado
- [ ] settings.py actualizado para producción
- [ ] Gunicorn y Nginx configurados (si AWS)
- [ ] SSL/HTTPS configurado
- [ ] Backups automáticos configurados
- [ ] Monitoreo (Sentry) configurado
- [ ] Admin accesible en producción
- [ ] Tests pasaron en producción
- [ ] Logs monitoreados
- [ ] Performance aceptable

---

## 📞 Support

Si tienes problemas:

1. **Verificar logs**: `heroku logs --tail` o `journalctl -u gunicorn -f`
2. **Conectar a BD**: `psql -h host -U user -d dbname`
3. **Verificar migraciones**: `python manage.py showmigrations`
4. **Revertir cambios**: `git revert [commit]`

---

**¡Deployment listo! 🚀**
