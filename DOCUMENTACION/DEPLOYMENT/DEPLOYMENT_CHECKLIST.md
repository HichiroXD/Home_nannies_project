# ✅ Checklist de Despliegue en Railway - Home Nannies

## 📋 Pre-Despliegue (Completado)

### Backend Django
- [x] ✅ `requirements.txt` actualizado con dependencias de producción
  - [x] gunicorn==23.0.0
  - [x] whitenoise==6.8.2
  - [x] dj-database-url==2.3.0
  - [x] psycopg2-binary==2.9.10 (ya estaba)
- [x] ✅ `Procfile` configurado con web y release commands
- [x] ✅ `runtime.txt` especifica Python 3.13.4
- [x] ✅ `settings.py` configurado para producción:
  - [x] Importa `dj_database_url`
  - [x] `SECRET_KEY` desde variable de entorno
  - [x] `DEBUG` desde variable de entorno (default False)
  - [x] `ALLOWED_HOSTS` dinámico desde env var
  - [x] `DATABASE_URL` con fallback a SQLite
  - [x] WhiteNoise middleware añadido
  - [x] `STATIC_ROOT` configurado
  - [x] `STATICFILES_STORAGE` con WhiteNoise
  - [x] `CORS_ALLOWED_ORIGINS` dinámico
  - [x] `CSRF_TRUSTED_ORIGINS` dinámico
  - [x] Seguridad HTTPS habilitada para producción
- [x] ✅ `.gitignore` configurado correctamente
- [x] ✅ `.env.example` creado con todas las variables
- [x] ✅ Documentación completa en `RAILWAY_DEPLOYMENT.md`
- [x] ✅ README actualizado con sección de despliegue

## 🚀 Pasos de Despliegue en Railway

### 1. Crear Proyecto en Railway
- [ ] Ir a [Railway](https://railway.app) y hacer login
- [ ] Crear nuevo proyecto
- [ ] Conectar repositorio GitHub `Home_nannies_project`
- [ ] Verificar que Railway detecte Python automáticamente

### 2. Configurar Base de Datos PostgreSQL
- [ ] En Railway, añadir plugin PostgreSQL:
  - Click en "New" → "Database" → "Add PostgreSQL"
- [ ] Railway genera automáticamente `DATABASE_URL`
- [ ] Verificar que la variable esté disponible en el servicio backend

### 3. Configurar Variables de Entorno

#### Variables Obligatorias (copiar de `.env.example`)
```bash
# En Railway → Tu Servicio → Variables

SECRET_KEY=<generar-nueva-clave-secreta>
DEBUG=False
ALLOWED_HOSTS=.railway.app,<tu-dominio-si-tienes>
CSRF_TRUSTED_ORIGINS=https://<tu-backend>.up.railway.app
CORS_ALLOWED_ORIGINS=https://<tu-frontend>.vercel.app
FRONTEND_URL=https://<tu-frontend>.vercel.app
```

#### Generar SECRET_KEY
Ejecutar localmente:
```powershell
python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
```

### 4. Verificar Configuración del Procfile
El `Procfile` ya está configurado:
```
web: gunicorn --chdir Back_Django_REST --pythonpath . django_crud_api.wsgi:application
release: python Back_Django_REST/manage.py migrate --noinput && python Back_Django_REST/manage.py collectstatic --noinput
```

- [ ] Verificar que Railway reconozca el Procfile
- [ ] El comando `release` ejecutará migraciones y collectstatic automáticamente

### 5. Desplegar Backend
- [ ] Railway detectará cambios automáticamente en push
- [ ] O hacer deploy manual desde la interfaz
- [ ] Revisar logs en tiempo real para verificar que:
  - [ ] Dependencias se instalen correctamente
  - [ ] Migraciones se ejecuten sin errores
  - [ ] Collectstatic funcione correctamente
  - [ ] Gunicorn inicie el servidor

### 6. Verificar Despliegue Backend
- [ ] Railway proveerá una URL: `https://<tu-proyecto>.up.railway.app`
- [ ] Verificar endpoints:
  - [ ] `https://<tu-backend>.up.railway.app/admin/` - Panel admin
  - [ ] `https://<tu-backend>.up.railway.app/api/schema/swagger-ui/` - Documentación API
  - [ ] `https://<tu-backend>.up.railway.app/api/users/login/` - Endpoint de login

### 7. Desplegar Frontend

#### Opción A: Vercel (Recomendado)
- [ ] Ir a [Vercel](https://vercel.com)
- [ ] Importar repositorio GitHub
- [ ] Configurar proyecto:
  - Framework Preset: Vite
  - Root Directory: `frontend_nannies`
  - Build Command: `npm run build`
  - Output Directory: `dist`
- [ ] Variables de entorno:
  ```bash
  VITE_API_URL=https://<tu-backend>.up.railway.app
  ```
- [ ] Deploy automático

#### Opción B: Railway (Servicio separado)
- [ ] Crear nuevo servicio desde el mismo repo
- [ ] Root Directory: `frontend_nannies`
- [ ] Build Command: `npm ci && npm run build`
- [ ] Start Command: `npx serve -s dist -l $PORT`
- [ ] Variables de entorno:
  ```bash
  VITE_API_URL=https://<tu-backend>.up.railway.app
  ```

### 8. Actualizar Variables de Entorno con URLs Reales
Una vez desplegado backend y frontend, actualizar en Railway:
- [ ] Actualizar `ALLOWED_HOSTS`:
  ```
  .railway.app,<backend-url>,<custom-domain-si-tienes>
  ```
- [ ] Actualizar `CSRF_TRUSTED_ORIGINS`:
  ```
  https://<tu-backend>.up.railway.app,https://<custom-domain-backend>
  ```
- [ ] Actualizar `CORS_ALLOWED_ORIGINS`:
  ```
  https://<tu-frontend>.vercel.app,https://<custom-domain-frontend>
  ```
- [ ] Actualizar `FRONTEND_URL`:
  ```
  https://<tu-frontend>.vercel.app
  ```

### 9. Configurar Dominio Personalizado (Opcional)
- [ ] En Railway → Settings → Domains
- [ ] Añadir custom domain (ej: `api.tudominio.com`)
- [ ] Configurar registros DNS en tu proveedor:
  ```
  Tipo: CNAME
  Nombre: api
  Valor: <tu-proyecto>.up.railway.app
  ```
- [ ] Esperar propagación DNS (puede tardar hasta 48h)
- [ ] Actualizar variables de entorno con nuevo dominio

### 10. Crear Superusuario en Producción
- [ ] En Railway, ir a tu servicio → "Deployments"
- [ ] Ejecutar comando one-off:
  ```bash
  python Back_Django_REST/manage.py createsuperuser
  ```
- [ ] O usar Railway CLI:
  ```bash
  railway run python Back_Django_REST/manage.py createsuperuser
  ```

## 🧪 Testing Post-Despliegue

### Verificaciones Funcionales
- [ ] Login funciona correctamente
- [ ] Registro de usuarios funciona
- [ ] CRUD de niñeras funciona
- [ ] Sistema de bookings funciona
- [ ] Favoritos funciona
- [ ] Reseñas funcionan
- [ ] Dashboard admin accesible
- [ ] Notificaciones funcionan
- [ ] OCR y validación académica funciona
- [ ] Archivos estáticos se cargan correctamente
- [ ] Panel de admin Django accesible

### Verificaciones de Seguridad
- [ ] `DEBUG=False` en producción (verificar en logs)
- [ ] HTTPS forzado (verificar redirección)
- [ ] CORS configurado correctamente (probar desde frontend)
- [ ] CSRF protection funcionando
- [ ] Admin panel protegido con autenticación
- [ ] Secret key es único (no el del código)

### Verificaciones de Performance
- [ ] Tiempo de respuesta de API < 500ms
- [ ] Archivos estáticos se sirven correctamente
- [ ] Compresión GZIP habilitada (WhiteNoise)
- [ ] Queries a BD optimizadas
- [ ] No hay errores 500 en logs

## 📊 Monitoreo y Mantenimiento

### Configurar Monitoreo
- [ ] Revisar logs regularmente en Railway
- [ ] Configurar alertas de errores (opcional: Sentry)
- [ ] Monitorear uso de recursos (CPU, RAM)
- [ ] Configurar health checks

### Backups de Base de Datos
- [ ] Configurar backups automáticos en Railway
- [ ] O usar Railway CLI para backups manuales:
  ```bash
  railway run pg_dump $DATABASE_URL > backup_$(date +%Y%m%d).sql
  ```
- [ ] Programar backups semanales

### Escalabilidad
- [ ] Ajustar workers de Gunicorn según tráfico:
  - Editar Procfile: `-w 4` (4 workers)
  - Formula: `(2 x CPU cores) + 1`
- [ ] Considerar plan de Railway según necesidades
- [ ] Implementar caché con Redis si es necesario

## 🆘 Troubleshooting

### Error: "DisallowedHost"
```python
# Solución: Verificar ALLOWED_HOSTS en Railway
ALLOWED_HOSTS=.railway.app,tudominio.com
```

### Error: "CSRF verification failed"
```python
# Solución: Añadir URL completa a CSRF_TRUSTED_ORIGINS
CSRF_TRUSTED_ORIGINS=https://tu-backend.up.railway.app
```

### Error: Static files no cargan
```bash
# Verificar que collectstatic se ejecutó:
# Railway → Logs → Buscar "collectstatic"
# Si no, ejecutar manualmente:
railway run python Back_Django_REST/manage.py collectstatic --noinput
```

### Error: Database connection fails
```bash
# Verificar que DATABASE_URL esté configurada:
# Railway → Variables → Verificar DATABASE_URL
# Debe estar vinculada al plugin PostgreSQL
```

### Error: Import error 'dj_database_url'
```bash
# Verificar requirements.txt tiene:
dj-database-url==2.3.0

# Forzar reinstalación en Railway:
# Hacer commit vacío y push para trigger rebuild
```

## 📝 Notas Finales

### Archivos Sensibles
- ⚠️ Nunca commitear `.env` real
- ✅ Usar `.env.example` como template
- ✅ Todas las secrets en Railway Variables

### Archivos Media (Uploads)
- ⚠️ Railway NO es persistente para archivos
- 📌 Recomendación: Usar AWS S3 o Cloudinary
- Ver `RAILWAY_DEPLOYMENT.md` para configuración S3

### CI/CD
- Railway hace deploy automático en cada push a `main`
- Considerar añadir GitHub Actions para tests pre-deploy
- Ver ejemplo en `RAILWAY_DEPLOYMENT.md`

## ✅ Checklist Final Pre-Go-Live

Antes de abrir a usuarios reales:
- [ ] Todos los tests pasan
- [ ] Todas las variables de entorno configuradas
- [ ] SECRET_KEY único generado
- [ ] DEBUG=False verificado
- [ ] HTTPS funcionando
- [ ] Dominio personalizado configurado (si aplica)
- [ ] Backups de BD configurados
- [ ] Monitoreo configurado
- [ ] Superusuario creado en producción
- [ ] Documentación actualizada
- [ ] Plan de rollback preparado

---

**¡Listo para producción! 🚀**

Para más detalles, ver:
- [RAILWAY_DEPLOYMENT.md](./RAILWAY_DEPLOYMENT.md) - Guía completa
- [.env.example](./.env.example) - Template de variables
- [README.md](./README.md) - Documentación del proyecto
