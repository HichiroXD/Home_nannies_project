# 🚀 Guía de Despliegue en Droplet (DigitalOcean)

## 📋 Información del Servidor

- **IP**: 104.248.213.225
- **Sistema**: Ubuntu (recomendado)
- **Base de datos**: PostgreSQL
- **Servidor Web**: Nginx + Gunicorn (recomendado)

## 🔧 Configuración Inicial del Droplet

### 1. Conectar al Droplet

```bash
ssh root@104.248.213.225
```

### 2. Actualizar el Sistema

```bash
sudo apt update
sudo apt upgrade -y
```

### 3. Instalar Dependencias

```bash
# Python y herramientas
sudo apt install -y python3 python3-pip python3-venv

# PostgreSQL
sudo apt install -y postgresql postgresql-contrib libpq-dev

# Nginx (servidor web)
sudo apt install -y nginx

# Git (para clonar el repositorio)
sudo apt install -y git

# Supervisor (para mantener Gunicorn corriendo)
sudo apt install -y supervisor
```

## 🗄️ Configurar PostgreSQL

### 1. Crear Base de Datos y Usuario

```bash
# Acceder a PostgreSQL
sudo -u postgres psql

# Crear base de datos
CREATE DATABASE home_nannies_db;

# Crear usuario
CREATE USER morrigan WITH PASSWORD 'CAMBIA_ESTA_CONTRASEÑA_SEGURA';

# Dar permisos
GRANT ALL PRIVILEGES ON DATABASE home_nannies_db TO morrigan;

# Salir
\q
```

### 2. Configurar Acceso Remoto (opcional)

```bash
# Editar postgresql.conf
sudo nano /etc/postgresql/*/main/postgresql.conf
# Cambiar: listen_addresses = 'localhost' a listen_addresses = '*'

# Editar pg_hba.conf
sudo nano /etc/postgresql/*/main/pg_hba.conf
# Agregar: host all all 0.0.0.0/0 md5

# Reiniciar PostgreSQL
sudo systemctl restart postgresql
```

## 📦 Desplegar la Aplicación

### 1. Crear Usuario para la Aplicación (Recomendado)

```bash
# Crear usuario sin privilegios de root
sudo adduser django
sudo usermod -aG sudo django

# Cambiar al nuevo usuario
su - django
```

### 2. Clonar el Repositorio

```bash
cd /home/django
git clone https://github.com/tu-usuario/Home_nannies_project.git
cd Home_nannies_project/Back_Django_REST
```

### 3. Crear Entorno Virtual

```bash
python3 -m venv venv
source venv/bin/activate
```

### 4. Instalar Dependencias

```bash
pip install --upgrade pip
pip install -r requirements.txt
pip install gunicorn  # Servidor WSGI
```

### 5. Configurar Variables de Entorno

```bash
# Copiar template de producción
cp .env.production.example .env

# Editar con valores reales
nano .env
```

**Contenido de `.env` para producción:**

```bash
# SEGURIDAD (CRÍTICO)
SECRET_KEY='GENERAR_NUEVA_CLAVE_CON_generate_secret_key.py'
DEBUG=False

# Hosts permitidos
ALLOWED_HOSTS=104.248.213.225,tu-dominio.com,www.tu-dominio.com

# BASE DE DATOS
USE_POSTGRESQL=True
DB_NAME=home_nannies_db
DB_USER=morrigan
DB_PASSWORD=TU_CONTRASEÑA_SEGURA
DB_HOST=localhost
DB_PORT=5432

# CORS (ajustar según frontend)
CORS_ALLOWED_ORIGINS=https://tu-dominio.com,https://www.tu-dominio.com
CSRF_TRUSTED_ORIGINS=https://tu-dominio.com,https://www.tu-dominio.com

# EMAIL
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=tu-email@gmail.com
EMAIL_HOST_PASSWORD=tu-app-password

# SEGURIDAD
SECURE_SSL_REDIRECT=True
SESSION_COOKIE_SECURE=True
CSRF_COOKIE_SECURE=True
```

### 6. Generar SECRET_KEY

```bash
python generate_secret_key.py
# Copiar la clave generada y pegarla en .env
```

### 7. Aplicar Migraciones

```bash
python manage.py migrate
```

### 8. Crear Superusuario

```bash
python manage.py createsuperuser
```

### 9. Recolectar Archivos Estáticos

```bash
python manage.py collectstatic --noinput
```

## 🔧 Configurar Gunicorn

### 1. Crear Script de Inicio

```bash
# Crear archivo de configuración
sudo nano /etc/systemd/system/gunicorn.service
```

**Contenido:**

```ini
[Unit]
Description=Gunicorn daemon for Home Nannies Django app
After=network.target

[Service]
User=django
Group=www-data
WorkingDirectory=/home/django/Home_nannies_project/Back_Django_REST
Environment="PATH=/home/django/Home_nannies_project/Back_Django_REST/venv/bin"
ExecStart=/home/django/Home_nannies_project/Back_Django_REST/venv/bin/gunicorn \
          --workers 3 \
          --bind unix:/home/django/Home_nannies_project/Back_Django_REST/gunicorn.sock \
          django_crud_api.wsgi:application

[Install]
WantedBy=multi-user.target
```

### 2. Iniciar Gunicorn

```bash
sudo systemctl start gunicorn
sudo systemctl enable gunicorn
sudo systemctl status gunicorn
```

### 3. Reiniciar Gunicorn (cuando hagas cambios)

```bash
sudo systemctl restart gunicorn
```

## 🌐 Configurar Nginx

### 1. Crear Configuración

```bash
sudo nano /etc/nginx/sites-available/home_nannies
```

**Contenido:**

```nginx
server {
    listen 80;
    server_name 104.248.213.225 tu-dominio.com www.tu-dominio.com;

    # Logs
    access_log /var/log/nginx/home_nannies_access.log;
    error_log /var/log/nginx/home_nannies_error.log;

    # Archivos estáticos
    location /static/ {
        alias /home/django/Home_nannies_project/Back_Django_REST/staticfiles/;
    }

    # Archivos media
    location /media/ {
        alias /home/django/Home_nannies_project/Back_Django_REST/media/;
    }

    # Proxy a Gunicorn
    location / {
        proxy_pass http://unix:/home/django/Home_nannies_project/Back_Django_REST/gunicorn.sock;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### 2. Activar Configuración

```bash
# Crear enlace simbólico
sudo ln -s /etc/nginx/sites-available/home_nannies /etc/nginx/sites-enabled/

# Eliminar configuración por defecto
sudo rm /etc/nginx/sites-enabled/default

# Verificar configuración
sudo nginx -t

# Reiniciar Nginx
sudo systemctl restart nginx
```

## 🔒 Configurar SSL con Let's Encrypt (HTTPS)

### 1. Instalar Certbot

```bash
sudo apt install -y certbot python3-certbot-nginx
```

### 2. Obtener Certificado SSL

```bash
# Reemplazar con tu dominio real
sudo certbot --nginx -d tu-dominio.com -d www.tu-dominio.com
```

### 3. Renovación Automática

```bash
# Verificar renovación automática
sudo certbot renew --dry-run
```

## 🔥 Configurar Firewall

```bash
# Permitir SSH
sudo ufw allow OpenSSH

# Permitir HTTP
sudo ufw allow 'Nginx HTTP'

# Permitir HTTPS
sudo ufw allow 'Nginx HTTPS'

# Activar firewall
sudo ufw enable

# Ver estado
sudo ufw status
```

## 📊 Monitoreo y Logs

### Ver Logs de Gunicorn

```bash
sudo journalctl -u gunicorn -f
```

### Ver Logs de Nginx

```bash
# Access log
sudo tail -f /var/log/nginx/home_nannies_access.log

# Error log
sudo tail -f /var/log/nginx/home_nannies_error.log
```

### Ver Logs de Django

```bash
tail -f /home/django/Home_nannies_project/Back_Django_REST/logs/django.log
```

## 🔄 Actualizar la Aplicación

```bash
# Conectar al servidor
ssh django@104.248.213.225

# Ir al directorio del proyecto
cd /home/django/Home_nannies_project

# Activar entorno virtual
source Back_Django_REST/venv/bin/activate

# Actualizar código
git pull origin main

# Instalar nuevas dependencias (si hay)
pip install -r Back_Django_REST/requirements.txt

# Aplicar migraciones
cd Back_Django_REST
python manage.py migrate

# Recolectar archivos estáticos
python manage.py collectstatic --noinput

# Reiniciar Gunicorn
sudo systemctl restart gunicorn

# Reiniciar Nginx (si cambió configuración)
sudo systemctl restart nginx
```

## 🆘 Solución de Problemas

### Error 502 Bad Gateway

```bash
# Verificar que Gunicorn está corriendo
sudo systemctl status gunicorn

# Ver logs de Gunicorn
sudo journalctl -u gunicorn -n 50

# Verificar socket
ls -la /home/django/Home_nannies_project/Back_Django_REST/gunicorn.sock
```

### Error 500 Internal Server Error

```bash
# Ver logs de Django
tail -f /home/django/Home_nannies_project/Back_Django_REST/logs/django.log

# Ver logs de Nginx
sudo tail -f /var/log/nginx/home_nannies_error.log
```

### Error de Conexión a Base de Datos

```bash
# Verificar PostgreSQL
sudo systemctl status postgresql

# Probar conexión
psql -U morrigan -d home_nannies_db -h localhost
```

### Permisos de Archivos

```bash
# Dar permisos correctos
sudo chown -R django:www-data /home/django/Home_nannies_project
sudo chmod -R 755 /home/django/Home_nannies_project
```

## 📝 Checklist de Despliegue

- [ ] Droplet creado y actualizado
- [ ] PostgreSQL instalado y configurado
- [ ] Usuario y base de datos PostgreSQL creados
- [ ] Repositorio clonado
- [ ] Entorno virtual creado
- [ ] Dependencias instaladas
- [ ] `.env` configurado con valores de producción
- [ ] `SECRET_KEY` generada
- [ ] `DEBUG=False`
- [ ] Migraciones aplicadas
- [ ] Superusuario creado
- [ ] Archivos estáticos recolectados
- [ ] Gunicorn configurado y corriendo
- [ ] Nginx configurado y corriendo
- [ ] SSL/HTTPS configurado
- [ ] Firewall configurado
- [ ] Aplicación accesible en http://104.248.213.225

## 🔐 Seguridad Adicional

### Cambiar Puerto SSH

```bash
sudo nano /etc/ssh/sshd_config
# Cambiar Port 22 a otro número (ej: 2222)
sudo systemctl restart ssh
```

### Deshabilitar Login Root

```bash
sudo nano /etc/ssh/sshd_config
# Cambiar PermitRootLogin yes a PermitRootLogin no
sudo systemctl restart ssh
```

### Fail2Ban (Protección contra fuerza bruta)

```bash
sudo apt install fail2ban
sudo systemctl enable fail2ban
sudo systemctl start fail2ban
```

## 📚 Referencias

- [DigitalOcean Django Tutorial](https://www.digitalocean.com/community/tutorials/how-to-set-up-django-with-postgres-nginx-and-gunicorn-on-ubuntu-20-04)
- [Django Deployment Checklist](https://docs.djangoproject.com/en/5.0/howto/deployment/checklist/)
- [Gunicorn Documentation](https://docs.gunicorn.org/)
- [Nginx Documentation](https://nginx.org/en/docs/)
