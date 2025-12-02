# 🚀 Comandos Rápidos - Railway Deployment

## 📦 Instalación Local (Desarrollo)

```powershell
# Backend
cd Back_Django_REST
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver

# Frontend
cd frontend_nannies
npm install
npm run dev
```

## 🔐 Generar SECRET_KEY

```powershell
cd Back_Django_REST
python generate_secret_key.py
# Copiar el valor generado para Railway
```

O directamente:
```powershell
python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
```

## 🧪 Verificaciones Pre-Deploy

```powershell
# Verificar settings.py
cd Back_Django_REST
python -c "from django_crud_api import settings; print('✅ Settings OK')"

# Verificar dependencias
pip list | Select-String "gunicorn|whitenoise|dj-database"

# Probar collectstatic
python manage.py collectstatic --noinput

# Probar migraciones
python manage.py migrate --noinput

# Ejecutar tests
python manage.py test
```

## 🌐 Testing Local con Gunicorn

```powershell
cd Back_Django_REST
gunicorn django_crud_api.wsgi:application
# Servidor en http://localhost:8000
```

## 🔧 Railway CLI (Opcional)

### Instalación
```powershell
npm install -g @railway/cli
```

### Comandos Útiles
```bash
# Login
railway login

# Vincular proyecto
railway link

# Ver variables de entorno
railway variables

# Ejecutar comando en Railway
railway run python Back_Django_REST/manage.py createsuperuser

# Ver logs
railway logs

# Backup de base de datos
railway run pg_dump $DATABASE_URL > backup.sql
```

## 🗄️ Comandos de Base de Datos

### Local (SQLite)
```powershell
# Crear migraciones
python manage.py makemigrations

# Aplicar migraciones
python manage.py migrate

# Crear superusuario
python manage.py createsuperuser

# Shell de Django
python manage.py shell
```

### Railway (PostgreSQL)
```bash
# Ejecutar con Railway CLI
railway run python Back_Django_REST/manage.py migrate
railway run python Back_Django_REST/manage.py createsuperuser
railway run python Back_Django_REST/manage.py shell

# Backup
railway run pg_dump $DATABASE_URL > backup_$(date +%Y%m%d).sql

# Restore
railway run psql $DATABASE_URL < backup.sql
```

## 📊 Comandos de Monitoreo

```bash
# Ver logs en tiempo real (Railway CLI)
railway logs --follow

# Ver últimos 100 logs
railway logs --tail 100

# Ver variables
railway variables

# Ver status
railway status
```

## 🔄 Comandos de Deploy

```powershell
# Commit y push (deploy automático)
git add .
git commit -m "Deploy to production"
git push origin main

# Railway desplegará automáticamente
```

## 🧹 Mantenimiento

```powershell
# Limpiar archivos pyc
Get-ChildItem -Recurse -Filter "*.pyc" | Remove-Item -Force

# Limpiar __pycache__
Get-ChildItem -Recurse -Filter "__pycache__" | Remove-Item -Recurse -Force

# Actualizar dependencias
pip list --outdated
pip install -U <paquete>

# Regenerar requirements.txt
pip freeze > requirements.txt
```

## 📝 Variables de Entorno Railway

### Copiar y pegar en Railway → Variables

```bash
# Obligatorias
SECRET_KEY=<generar-con-script>
DEBUG=False
ALLOWED_HOSTS=.railway.app
CSRF_TRUSTED_ORIGINS=https://tu-backend.up.railway.app
CORS_ALLOWED_ORIGINS=https://tu-frontend.vercel.app
FRONTEND_URL=https://tu-frontend.vercel.app

# Opcionales (AWS S3)
AWS_ACCESS_KEY_ID=tu-key
AWS_SECRET_ACCESS_KEY=tu-secret
AWS_STORAGE_BUCKET_NAME=tu-bucket
AWS_S3_REGION_NAME=us-east-1

# Opcionales (Email)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_HOST_USER=tu-email@gmail.com
EMAIL_HOST_PASSWORD=tu-password-app
EMAIL_USE_TLS=True

# Opcionales (Monitoring)
SENTRY_DSN=https://tu-sentry-dsn
```

## 🚨 Troubleshooting Rápido

### Error: DisallowedHost
```bash
# Añadir a Railway Variables:
ALLOWED_HOSTS=.railway.app,tudominio.com
```

### Error: CSRF verification failed
```bash
# Añadir a Railway Variables:
CSRF_TRUSTED_ORIGINS=https://tu-backend.up.railway.app
```

### Error: Static files no cargan
```bash
# Verificar en Railway logs:
# Buscar "collectstatic" en los logs
# Si falta, ejecutar manualmente:
railway run python Back_Django_REST/manage.py collectstatic --noinput
```

### Error: Database connection
```bash
# Verificar que DATABASE_URL exista:
railway variables | grep DATABASE_URL

# Si falta, añadir plugin PostgreSQL en Railway
```

### Reiniciar servicio
```bash
# En Railway web UI:
# Deployments → Click en el deployment activo → Restart
```

## 📖 Enlaces Rápidos

- **Railway Dashboard**: https://railway.app/dashboard
- **Railway Docs**: https://docs.railway.app
- **Vercel Dashboard**: https://vercel.com/dashboard
- **Django Deployment Checklist**: https://docs.djangoproject.com/en/5.2/howto/deployment/checklist/

## 📚 Documentación del Proyecto

```bash
# Ver documentación completa
RAILWAY_DEPLOYMENT.md      # Guía paso a paso (500+ líneas)
DEPLOYMENT_CHECKLIST.md    # Checklist interactivo
.env.example               # Template variables
RESUMEN_CAMBIOS_RAILWAY.md # Resumen de cambios
README.md                  # Documentación principal
```

## 🎯 Workflow Recomendado

```bash
# 1. Desarrollo local
git checkout -b feature/nueva-feature
# ... hacer cambios ...
python manage.py test  # Ejecutar tests
git commit -m "Add: nueva feature"

# 2. Push a GitHub
git push origin feature/nueva-feature

# 3. Crear Pull Request
# Revisar en GitHub

# 4. Merge a main
# Railway desplegará automáticamente

# 5. Verificar en producción
# Revisar logs en Railway
# Probar endpoints
```

## 🔐 Seguridad

```bash
# Rotar SECRET_KEY
python generate_secret_key.py
# Actualizar en Railway Variables

# Verificar DEBUG=False
railway variables | grep DEBUG

# Revisar logs de errores
railway logs --tail 100 | grep ERROR

# Verificar HTTPS
curl -I https://tu-backend.up.railway.app
# Debe redirigir a HTTPS
```

## 📊 Performance

```bash
# Ver métricas en Railway
# Dashboard → Tu servicio → Metrics

# Ajustar workers de Gunicorn
# Editar Procfile:
web: gunicorn --chdir Back_Django_REST --pythonpath . django_crud_api.wsgi:application -w 4

# Formula: workers = (2 x CPU cores) + 1
```

---

**TIP**: Guarda este archivo en tu escritorio para acceso rápido durante el desarrollo y despliegue.
