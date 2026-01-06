# 🚀 Despliegue en Servidor Debian - Guía Rápida

## ❌ Problema Identificado

El error que estás viendo ocurre porque:

1. **Frontend**: Corre en `http://104.248.213.225:5173`
2. **Backend**: El frontend intenta acceder a `http://localhost:8000`
3. **Resultado**: CORS bloquea la petición porque `localhost` no es accesible desde una IP pública

## ✅ Solución Rápida

### Paso 1: Clonar/Actualizar el Proyecto en Debian

```bash
cd ~
git clone https://github.com/tu-usuario/Home_nannies_project.git
# O si ya lo tienes:
cd ~/Home_nannies_project
git pull origin main
```

### Paso 2: Configurar Variables de Entorno

#### Backend (Django)

```bash
cd ~/Home_nannies_project/Back_Django_REST
cp .env.debian.example .env
nano .env
```

**Configuración mínima necesaria:**

```env
DEBUG=False
SECRET_KEY=GENERA-UNA-CLAVE-SECRETA-AQUI
ALLOWED_HOSTS=104.248.213.225,localhost
CORS_ALLOWED_ORIGINS=http://104.248.213.225:5173
CSRF_TRUSTED_ORIGINS=http://104.248.213.225:5173,http://104.248.213.225:8000
```

> 💡 **Generar SECRET_KEY:**
> ```bash
> python3 -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
> ```

#### Frontend (Vite/React)

```bash
cd ~/Home_nannies_project/frontend_nannies
cp .env.debian.example .env
nano .env
```

**Configuración:**

```env
VITE_API_URL=http://104.248.213.225:8000/api
```

### Paso 3: Hacer el Script Ejecutable

```bash
cd ~/Home_nannies_project/scripts
chmod +x start_debian_server.sh
```

### Paso 4: Iniciar los Servicios

```bash
./start_debian_server.sh start
```

El script automáticamente:
- ✅ Verificará dependencias
- ✅ Creará el entorno virtual de Python
- ✅ Instalará todas las dependencias (backend y frontend)
- ✅ Aplicará migraciones de base de datos
- ✅ Iniciará el backend en `0.0.0.0:8000`
- ✅ Iniciará el frontend en `0.0.0.0:5173`

### Paso 5: Verificar que Funciona

```bash
# Ver estado de los servicios
./start_debian_server.sh status

# Ver logs del backend
tail -f ~/Home_nannies_project/logs/django.log

# Ver logs del frontend
tail -f ~/Home_nannies_project/logs/vite.log
```

### Acceder a la Aplicación

- **Frontend**: http://104.248.213.225:5173
- **API Backend**: http://104.248.213.225:8000/api
- **Admin Django**: http://104.248.213.225:8000/admin

---

## 🛠️ Comandos Útiles

### Gestión de Servicios

```bash
# Detener servicios
./start_debian_server.sh stop

# Reiniciar servicios
./start_debian_server.sh restart

# Ver estado
./start_debian_server.sh status

# Solo configurar (sin iniciar)
./start_debian_server.sh setup
```

### Firewall (UFW)

```bash
# Ver estado del firewall
sudo ufw status

# Permitir puertos necesarios
sudo ufw allow 8000/tcp  # Backend Django
sudo ufw allow 5173/tcp  # Frontend Vite
sudo ufw allow 80/tcp    # HTTP (si usas Nginx)
sudo ufw allow 443/tcp   # HTTPS (si usas SSL)

# Habilitar firewall
sudo ufw enable
```

### Ver Procesos Corriendo

```bash
# Ver procesos Python (Django)
ps aux | grep python

# Ver procesos Node (Vite)
ps aux | grep node

# Ver puertos en uso
sudo netstat -tulpn | grep -E '8000|5173'
```

---

## 🔧 Configuración Avanzada

### Usar Gunicorn (Recomendado para Producción)

```bash
cd ~/Home_nannies_project/Back_Django_REST
source venv/bin/activate
pip install gunicorn

# Crear archivo de configuración
nano gunicorn_config.py
```

**gunicorn_config.py:**

```python
bind = "0.0.0.0:8000"
workers = 3
worker_class = "sync"
timeout = 120
keepalive = 5
accesslog = "/var/log/gunicorn/access.log"
errorlog = "/var/log/gunicorn/error.log"
loglevel = "info"
```

**Iniciar con Gunicorn:**

```bash
mkdir -p /var/log/gunicorn
gunicorn django_crud_api.wsgi:application -c gunicorn_config.py --daemon
```

### Usar PM2 (Mantener Servicios Corriendo)

```bash
# Instalar PM2
sudo npm install -g pm2

# Backend con PM2
cd ~/Home_nannies_project/Back_Django_REST
pm2 start gunicorn_config.py --name django-backend --interpreter /path/to/venv/bin/python

# Frontend con PM2
cd ~/Home_nannies_project/frontend_nannies
pm2 start npm --name frontend-nannies -- run dev -- --host 0.0.0.0 --port 5173

# Ver procesos
pm2 list

# Ver logs
pm2 logs

# Guardar configuración para reinicio automático
pm2 save
pm2 startup
```

### Configurar Nginx (Proxy Inverso)

```bash
sudo apt install nginx
sudo nano /etc/nginx/sites-available/home_nannies
```

**Configuración Nginx:**

```nginx
server {
    listen 80;
    server_name 104.248.213.225;

    client_max_body_size 100M;

    # Frontend
    location / {
        proxy_pass http://localhost:5173;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Django Admin
    location /admin {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # Archivos estáticos
    location /static {
        alias /home/usuario/Home_nannies_project/Back_Django_REST/staticfiles;
    }

    # Archivos de medios
    location /media {
        alias /home/usuario/Home_nannies_project/Back_Django_REST/media;
    }
}
```

**Activar configuración:**

```bash
sudo ln -s /etc/nginx/sites-available/home_nannies /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

Con Nginx, actualiza el `.env` del frontend:

```env
VITE_API_URL=/api
```

---

## 🐛 Solución de Problemas

### Error: "Connection refused"

**Causa**: El backend no está escuchando en `0.0.0.0` o el puerto está cerrado

**Solución**:
```bash
# Verificar que está escuchando correctamente
sudo netstat -tulpn | grep 8000

# Debe mostrar: 0.0.0.0:8000 (NO 127.0.0.1:8000)

# Verificar firewall
sudo ufw status
sudo ufw allow 8000
```

### Error: CORS persiste

**Causa**: Variables de entorno no cargadas o mal configuradas

**Solución**:
```bash
cd ~/Home_nannies_project/Back_Django_REST
source venv/bin/activate

# Verificar que Django lee el .env
python manage.py shell
>>> import os
>>> print(os.getenv('CORS_ALLOWED_ORIGINS'))
>>> print(os.getenv('ALLOWED_HOSTS'))
>>> exit()

# Si no muestra nada, verifica que python-dotenv esté instalado
pip install python-dotenv

# Reinicia el servidor Django
pkill -f "manage.py runserver"
python manage.py runserver 0.0.0.0:8000
```

### Frontend no carga la API

**Causa**: Variable `VITE_API_URL` no se está usando

**Solución**:
```bash
# Vite necesita reiniciarse para cargar nuevas variables .env
cd ~/Home_nannies_project/frontend_nannies
pkill -f "vite"
npm run dev -- --host 0.0.0.0 --port 5173

# Verifica en el navegador (consola):
# Debería mostrar la URL correcta en los requests
```

### Error 500 en Django

**Causa**: Error en la aplicación o base de datos

**Solución**:
```bash
# Ver logs detallados
tail -f ~/Home_nannies_project/logs/django.log

# Aplicar migraciones pendientes
cd ~/Home_nannies_project/Back_Django_REST
source venv/bin/activate
python manage.py migrate

# Verificar configuración
python manage.py check
```

### Puerto ya en uso

**Causa**: Proceso anterior no se detuvo correctamente

**Solución**:
```bash
# Ver qué está usando el puerto
sudo lsof -i :8000
sudo lsof -i :5173

# Matar proceso específico
kill -9 <PID>

# O matar todos
pkill -f "manage.py runserver"
pkill -f "vite"
```

---

## 📝 Checklist de Despliegue

- [ ] Servidor Debian actualizado: `sudo apt update && sudo apt upgrade`
- [ ] Python 3.8+ instalado: `python3 --version`
- [ ] Node.js 16+ instalado: `node --version`
- [ ] Git instalado: `git --version`
- [ ] Proyecto clonado en el servidor
- [ ] Archivo `.env` configurado en `Back_Django_REST/`
- [ ] Archivo `.env` configurado en `frontend_nannies/`
- [ ] SECRET_KEY única generada
- [ ] Firewall configurado (puertos 8000, 5173)
- [ ] Backend iniciado en `0.0.0.0:8000`
- [ ] Frontend iniciado en `0.0.0.0:5173`
- [ ] Se puede acceder desde `http://104.248.213.225:5173`
- [ ] Las peticiones a la API funcionan sin error CORS

---

## 📚 Documentación Adicional

- [Configuración Completa Servidor Debian](./CONFIGURACION_SERVIDOR_DEBIAN.md)
- [Guía de Django en Producción](https://docs.djangoproject.com/en/5.0/howto/deployment/)
- [Guía de Vite en Producción](https://vitejs.dev/guide/build.html)
- [Configuración PM2](https://pm2.keymetrics.io/docs/usage/quick-start/)
- [Configuración Nginx](https://nginx.org/en/docs/)

---

## 🆘 Necesitas Ayuda?

Si después de seguir esta guía sigues teniendo problemas:

1. Revisa los logs: `tail -f ~/Home_nannies_project/logs/*.log`
2. Verifica la configuración: `./start_debian_server.sh status`
3. Comprueba que los puertos están abiertos: `sudo netstat -tulpn | grep -E '8000|5173'`
4. Revisa las variables de entorno están cargadas correctamente

**Logs importantes:**
- Backend: `~/Home_nannies_project/logs/django.log`
- Frontend: `~/Home_nannies_project/logs/vite.log`
- Nginx: `/var/log/nginx/error.log`
- Gunicorn: `/var/log/gunicorn/error.log`
