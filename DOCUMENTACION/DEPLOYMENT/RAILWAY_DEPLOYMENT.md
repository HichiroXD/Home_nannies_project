# Guía de Despliegue en Railway - Home Nannies

## 📋 Requisitos Previos

- ✅ Cuenta en [Railway](https://railway.app)
- ✅ Repositorio GitHub conectado
- ✅ Python 3.13.4 especificado en `runtime.txt`
- ✅ `requirements.txt` actualizado con dependencias de producción
- ✅ `Procfile` configurado con comandos de web y release

## 🚀 Pasos para Desplegar el Backend Django

### 1. Crear Proyecto en Railway

1. Ve a [Railway](https://railway.app) e inicia sesión
2. Click en **"New Project"**
3. Selecciona **"Deploy from GitHub repo"**
4. Autoriza Railway para acceder a tu repositorio
5. Selecciona el repositorio `Home_nannies_project`

### 2. Configurar Servicio Backend

1. Railway detectará automáticamente que es un proyecto Python
2. Si hay múltiples carpetas, asegúrate de que el **Root Directory** apunte a la raíz del proyecto
3. Railway usará el `Procfile` para iniciar la aplicación

### 3. Añadir Plugin PostgreSQL

1. En tu proyecto de Railway, click en **"New"** → **"Database"** → **"Add PostgreSQL"**
2. Railway creará automáticamente una base de datos y generará la variable `DATABASE_URL`
3. Esta variable se inyectará automáticamente en tu servicio backend

### 4. Configurar Variables de Entorno

Ve a tu servicio backend → **"Variables"** y añade las siguientes:

#### Variables Obligatorias

```bash
# Seguridad
SECRET_KEY=tu-clave-secreta-super-segura-aqui-genera-una-nueva
DEBUG=False

# Hosts permitidos (separados por comas, sin espacios)
ALLOWED_HOSTS=.railway.app,tudominio.com

# CSRF Trusted Origins (con https://)
CSRF_TRUSTED_ORIGINS=https://tu-backend.up.railway.app,https://tudominio.com

# CORS Allowed Origins (URLs completas del frontend)
CORS_ALLOWED_ORIGINS=https://tu-frontend.vercel.app,https://tudominio.com

# Frontend URL
FRONTEND_URL=https://tu-frontend.vercel.app
```

#### Variables Opcionales (si usas servicios externos)

```bash
# AWS S3 (para archivos media)
AWS_ACCESS_KEY_ID=tu-access-key
AWS_SECRET_ACCESS_KEY=tu-secret-key
AWS_STORAGE_BUCKET_NAME=nombre-bucket
AWS_S3_REGION_NAME=us-east-1

# Sentry (monitoreo de errores)
SENTRY_DSN=tu-sentry-dsn

# Email (si usas SMTP real)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_HOST_USER=tu-email@gmail.com
EMAIL_HOST_PASSWORD=tu-password-app
EMAIL_USE_TLS=True
```

### 5. Verificar Configuración del Procfile

El `Procfile` ya está configurado correctamente:

```
web: gunicorn --chdir Back_Django_REST --pythonpath . django_crud_api.wsgi:application
release: python Back_Django_REST/manage.py migrate --noinput && python Back_Django_REST/manage.py collectstatic --noinput
```

- **web**: Inicia el servidor Gunicorn
- **release**: Ejecuta migraciones y collectstatic antes de cada deploy

### 6. Desplegar

1. Railway detectará cambios automáticamente cuando hagas push a la rama principal
2. O puedes hacer click en **"Deploy"** manualmente desde la interfaz
3. Revisa los **Logs** en tiempo real para verificar que todo funcione correctamente

### 7. Verificar el Despliegue

Después del despliegue:

1. Railway te dará una URL pública: `https://tu-proyecto.up.railway.app`
2. Verifica que el backend funcione:
   - `https://tu-proyecto.up.railway.app/admin/` (panel de administración)
   - `https://tu-proyecto.up.railway.app/api/schema/swagger-ui/` (documentación API)
3. Revisa los logs si hay errores

## 🎨 Despliegue del Frontend React

### Opción A: Vercel (Recomendado)

1. Ve a [Vercel](https://vercel.com)
2. Importa tu repositorio GitHub
3. Configura el proyecto:
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend_nannies`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Variables de entorno:
   ```bash
   VITE_API_URL=https://tu-backend.up.railway.app
   ```
5. Deploy automático en cada push

### Opción B: Railway (Frontend como servicio separado)

1. En Railway, click en **"New"** → **"GitHub Repo"** (mismo repo)
2. Configura:
   - **Root Directory**: `frontend_nannies`
   - **Build Command**: `npm ci && npm run build`
   - **Start Command**: `npx serve -s dist -l $PORT`
3. Variables de entorno:
   ```bash
   VITE_API_URL=https://tu-backend.up.railway.app
   ```

## 🔒 Configuración de Dominio Personalizado

### En Railway (Backend)

1. Ve a tu servicio → **"Settings"** → **"Domains"**
2. Click en **"Generate Domain"** (obtienes un dominio .railway.app)
3. O añade un dominio personalizado:
   - Click en **"Custom Domain"**
   - Ingresa tu dominio: `api.tudominio.com`
   - Railway te dará registros DNS para configurar:
     ```
     Tipo: CNAME
     Nombre: api
     Valor: tu-proyecto.up.railway.app
     ```
4. Actualiza las variables de entorno:
   ```bash
   ALLOWED_HOSTS=.railway.app,api.tudominio.com,tudominio.com
   CSRF_TRUSTED_ORIGINS=https://api.tudominio.com,https://tudominio.com
   ```

### En Vercel (Frontend)

1. Ve a tu proyecto → **"Settings"** → **"Domains"**
2. Añade tu dominio personalizado
3. Configura los registros DNS según las instrucciones de Vercel

## 📊 Monitoreo y Logs

### Ver Logs en Railway

1. Ve a tu servicio → **"Deployments"**
2. Click en el deployment activo
3. Revisa los logs en tiempo real

### Errores Comunes

#### Error: "DisallowedHost"
```python
# Solución: Añadir el dominio a ALLOWED_HOSTS
ALLOWED_HOSTS=.railway.app,tu-dominio.com
```

#### Error: "CSRF verification failed"
```python
# Solución: Añadir el dominio a CSRF_TRUSTED_ORIGINS
CSRF_TRUSTED_ORIGINS=https://tu-backend.up.railway.app,https://tudominio.com
```

#### Error: "No module named 'dj_database_url'"
```bash
# Solución: Instalar dependencias localmente primero
pip install -r requirements.txt
```

#### Error: Static files not found
```bash
# Solución: Verificar que collectstatic se ejecute en release command
python manage.py collectstatic --noinput
```

## 🔄 Comandos Útiles

### Ejecutar comandos en Railway

Railway permite ejecutar comandos one-off:

```bash
# Crear superusuario
python Back_Django_REST/manage.py createsuperuser

# Ver migraciones
python Back_Django_REST/manage.py showmigrations

# Ejecutar shell de Django
python Back_Django_REST/manage.py shell
```

### Rollback a un deployment anterior

1. Ve a **"Deployments"**
2. Click en el deployment anterior que funcionaba
3. Click en **"Redeploy"**

## 📦 Backups de Base de Datos

Railway no hace backups automáticos. Recomendaciones:

### Opción 1: Backup manual con pg_dump

```bash
# Instalar Railway CLI
npm i -g @railway/cli

# Login
railway login

# Conectar al proyecto
railway link

# Hacer backup
railway run pg_dump $DATABASE_URL > backup.sql
```

### Opción 2: Usar un servicio de backups

- [PGBackups](https://www.pgbackups.com/)
- [Replicant](https://replicant.io/)
- Configurar backups automáticos con cron jobs

## 🛡️ Seguridad

### Checklist de Seguridad

- [ ] `DEBUG=False` en producción
- [ ] `SECRET_KEY` único y seguro (nunca usar el del código)
- [ ] `ALLOWED_HOSTS` restringido a dominios específicos
- [ ] `CSRF_TRUSTED_ORIGINS` configurado correctamente
- [ ] HTTPS habilitado (Railway lo hace automáticamente)
- [ ] Variables sensibles en Railway Variables (no en código)
- [ ] Revisar permisos de CORS (no usar `CORS_ALLOW_ALL_ORIGINS` en producción)
- [ ] Rate limiting configurado (considerar django-ratelimit)
- [ ] Configurar Sentry para monitoreo de errores

### Generar SECRET_KEY seguro

```python
# En Python
from django.core.management.utils import get_random_secret_key
print(get_random_secret_key())
```

O en PowerShell:
```powershell
python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
```

## 📈 Escalabilidad

Railway permite escalar vertical y horizontalmente:

1. Ve a **"Settings"** → **"Resources"**
2. Ajusta CPU, RAM y réplicas según necesidad
3. Railway escala automáticamente según tráfico

## 🎯 Checklist Final Pre-Despliegue

- [ ] ✅ `requirements.txt` tiene todas las dependencias
- [ ] ✅ `Procfile` configurado con web y release commands
- [ ] ✅ `runtime.txt` especifica Python 3.13.4
- [ ] ✅ `settings.py` lee variables de entorno
- [ ] ✅ PostgreSQL plugin añadido en Railway
- [ ] ✅ Todas las variables de entorno configuradas
- [ ] ✅ `SECRET_KEY` único generado
- [ ] ✅ `DEBUG=False` en producción
- [ ] ✅ `ALLOWED_HOSTS` y `CSRF_TRUSTED_ORIGINS` configurados
- [ ] ✅ Frontend apunta a la URL correcta del backend
- [ ] ✅ CORS configurado para permitir el frontend
- [ ] ✅ Tests pasan localmente
- [ ] ✅ Migraciones aplicadas correctamente

## 🆘 Soporte

- [Railway Docs](https://docs.railway.app)
- [Django Deployment Checklist](https://docs.djangoproject.com/en/5.2/howto/deployment/checklist/)
- [Railway Discord](https://discord.gg/railway)

## 📝 Notas Adicionales

### Archivos Media (Uploads)

Railway **NO** es persistente para archivos subidos. Opciones:

1. **AWS S3** (recomendado): Instalar `django-storages` y `boto3`
2. **Cloudinary**: Bueno para imágenes
3. **DigitalOcean Spaces**: Similar a S3, más económico

### Performance

- WhiteNoise sirve archivos estáticos eficientemente
- Considera usar Redis para caché (Railway tiene plugin)
- Habilita compresión con GZip middleware
- Usar CDN para archivos estáticos pesados

### CI/CD

Considera añadir GitHub Actions para:
- Ejecutar tests antes de deploy
- Lint y format checks
- Notificaciones de deploy

Ejemplo `.github/workflows/tests.yml`:
```yaml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-python@v4
        with:
          python-version: '3.13.4'
      - run: pip install -r Back_Django_REST/requirements.txt
      - run: cd Back_Django_REST && python manage.py test
```

---

**¡Listo para producción! 🚀**
