# ✅ CHECKLIST DE DEPLOYMENT A PRODUCCIÓN

## PRE-DEPLOYMENT (Antes de hacer cualquier cambio)

### Backup y Control de Versiones
- [ ] Backup completo de SQLite: `python manage.py dumpdata > sqlite_backup.json`
- [ ] Backup en archivo: `cp db.sqlite3 db.sqlite3.backup`
- [ ] Crear rama git: `git checkout -b production-migration-$(date +%Y%m%d)`
- [ ] Commit inicial: `git commit -m "Pre-migration backup"`

### Ambiente Local
- [ ] Python 3.13.4 instalado
- [ ] Todos los tests pasando: `python manage.py test`
- [ ] No hay errores de compilación: `python manage.py check`
- [ ] migraciones sin aplicar: `python manage.py showmigrations --plan | grep -i "unapplied"`

---

## CONFIGURACIÓN LOCAL (SQLite → PostgreSQL)

### Instalación
- [ ] PostgreSQL instalado localmente
- [ ] psycopg2-binary instalado: `pip install psycopg2-binary==2.9.9`
- [ ] requirements.txt actualizado: `pip freeze | grep psyco`

### Base de Datos PostgreSQL
- [ ] BD creada: `psql -U postgres -l | grep home_nannies`
- [ ] Usuario creado con permisos: `psql -U postgres -c "\du"`
- [ ] Permisos verificados en BD

### Configuración Django
- [ ] settings.py actualizado para PostgreSQL
- [ ] .env creado con credenciales PostgreSQL
- [ ] .env.example documentado en repo
- [ ] DATABASE_URL validada (si aplica)

### Migración de Datos
- [ ] Datos exportados: `ls -lh sqlite_backup.json`
- [ ] Migraciones ejecutadas: `python manage.py migrate`
- [ ] Datos restaurados: `python manage.py loaddata sqlite_backup.json`
- [ ] Conteo de registros verificado

### Verificación Local
- [ ] Admin accesible: `python manage.py runserver` → http://localhost:8000/admin
- [ ] Superuser creado: `python manage.py createsuperuser`
- [ ] Tests ejecutados: `python manage.py test --keep-db`
- [ ] Performance aceptable

---

## PREPARACIÓN PARA PRODUCCIÓN

### Dependencias
- [ ] Gunicorn instalado: `pip install gunicorn==21.2.0`
- [ ] WhiteNoise instalado: `pip install whitenoise==6.6.0`
- [ ] dj-database-url instalado: `pip install dj-database-url==2.1.0`
- [ ] python-dotenv instalado: `pip install python-dotenv==1.0.0`
- [ ] requirements.txt actualizado: `pip freeze > requirements.txt`

### Configuración Seguridad
- [ ] DEBUG = False
- [ ] SECRET_KEY generada (50+ caracteres): `python -c "import secrets; print(secrets.token_urlsafe(50))"`
- [ ] ALLOWED_HOSTS configurado
- [ ] SECURE_SSL_REDIRECT = True
- [ ] SESSION_COOKIE_SECURE = True
- [ ] CSRF_COOKIE_SECURE = True
- [ ] CORS_ALLOWED_ORIGINS restringidos

### Archivos Estáticos
- [ ] WhiteNoise configurado en settings.py
- [ ] STATIC_URL = '/static/'
- [ ] STATIC_ROOT configurado
- [ ] Prueba local: `python manage.py collectstatic --noinput`

### Email
- [ ] EMAIL_BACKEND configurado (SMTP o SendGrid)
- [ ] EMAIL_HOST_USER y EMAIL_HOST_PASSWORD configurados
- [ ] Test de email enviado manualmente

---

## DEPLOYMENT A HEROKU

### Setup Inicial
- [ ] Heroku CLI instalado: `heroku --version`
- [ ] Login en Heroku: `heroku login`
- [ ] App Heroku creada: `heroku create home-nannies-api`
- [ ] PostgreSQL addon creado: `heroku addons:create heroku-postgresql:hobby-dev`

### Configuración en Heroku
- [ ] Variables de ambiente configuradas: `heroku config:set`
  - [ ] DEBUG=False
  - [ ] SECRET_KEY (valor seguro)
  - [ ] ALLOWED_HOSTS
  - [ ] CORS_ALLOWED_ORIGINS
- [ ] DATABASE_URL auto-configurada por Heroku

### Archivos Requeridos
- [ ] Procfile creado (web, release tasks)
- [ ] runtime.txt creado (python-3.13.4)
- [ ] requirements.txt actualizado
- [ ] .gitignore configurado (.env no tracked)

### Pre-Deploy
- [ ] Git todo commited: `git status` (clean)
- [ ] No hay archivos no tracked importantes
- [ ] rama correcta: `git branch`

### Deploy
- [ ] Push a Heroku: `git push heroku main`
- [ ] Logs monitoreados: `heroku logs --tail`
- [ ] Release task ejecutada correctamente
- [ ] App accesible: `heroku open`

### Post-Deploy
- [ ] Verificar health: `heroku ps`
- [ ] Base de datos OK: `heroku pg:info`
- [ ] Admin accesible: `/admin`
- [ ] Crear superuser: `heroku run python Back_Django_REST/manage.py createsuperuser`
- [ ] Logs sin errores: `heroku logs --tail` (últimos 5 min)

---

## DEPLOYMENT A AWS

### EC2 Setup
- [ ] Instancia t3.micro creada (Ubuntu 22.04)
- [ ] Security Group configurado (22, 80, 443)
- [ ] Key pair descargada y permisos: `chmod 400 key.pem`
- [ ] Conectado vía SSH exitosamente

### RDS PostgreSQL
- [ ] Instancia RDS creada
- [ ] Base de datos creada
- [ ] Credenciales seguras
- [ ] Security group permite acceso desde EC2

### Dependencias en EC2
- [ ] Python 3.13 instalado
- [ ] postgresql-client instalado
- [ ] pip actualizado
- [ ] venv creado y activado

### Código en EC2
- [ ] Repositorio clonado
- [ ] requirements.txt instalados
- [ ] .env configurado con credenciales RDS
- [ ] Migraciones ejecutadas: `python manage.py migrate`

### Gunicorn Setup
- [ ] Gunicorn ejecutándose: `ps aux | grep gunicorn`
- [ ] Socket configurado: `/etc/systemd/system/gunicorn.socket`
- [ ] Service configurado: `/etc/systemd/system/gunicorn.service`
- [ ] Systemd habilitado: `systemctl status gunicorn`

### Nginx Setup
- [ ] Nginx instalado y ejecutándose
- [ ] Configuración creada: `/etc/nginx/sites-available/home-nannies`
- [ ] Symlink habilitado: `sites-enabled`
- [ ] Proxy a Gunicorn funcionando
- [ ] Static files sirviendo correctamente

### SSL/TLS
- [ ] Dominio apuntando a EC2
- [ ] Certbot instalado
- [ ] Certificado Let's Encrypt generado
- [ ] Auto-renovación configurada
- [ ] HTTPS accesible

---

## MONITOREO POST-DEPLOYMENT

### Logs
- [ ] Logs configurados correctamente
- [ ] Sentry integrado (si aplica)
- [ ] Log rotation configurado

### Performance
- [ ] Métricas de CPU < 70%
- [ ] Memoria disponible > 10%
- [ ] Queries de BD optimizadas
- [ ] Respuesta promedio < 500ms

### Backups
- [ ] Backup automático configurado
- [ ] Primer backup completado
- [ ] Backup restore probado
- [ ] Cronograma: diario (mínimo)

### Seguridad
- [ ] SSL/TLS en producción
- [ ] Headers de seguridad configurados
- [ ] CORS restrictivo
- [ ] SQL injection prevención (Django ORM)
- [ ] CSRF protection activado

---

## ROLLBACK (Si algo falla)

- [ ] Base de datos: `python manage.py migrate --zero notifications` (ej. app específica)
- [ ] Código: `git revert [commit]`
- [ ] Heroku: `heroku releases` y `heroku releases:rollback`
- [ ] Restaurar desde backup: `python manage.py loaddata sqlite_backup.json`

---

## DOCUMENTACIÓN

- [ ] README actualizado con instrucciones de setup
- [ ] deployment.md creado en repo
- [ ] Credentials almacenadas de forma segura
- [ ] Team notificado de cambios

---

## VALIDACIÓN FINAL

- [ ] ✅ Aplicación funciona en producción
- [ ] ✅ Datos migraron correctamente
- [ ] ✅ API endpoints respondiendo
- [ ] ✅ Admin accesible con credenciales
- [ ] ✅ Usuarios pueden hacer login
- [ ] ✅ Notificaciones funcionan (si aplica)
- [ ] ✅ OCR funciona en producción (si aplica)
- [ ] ✅ Reportes disponibles (si aplica)
- [ ] ✅ Logs monitoreados
- [ ] ✅ Backups automáticos confirmar

---

## CONTACTO DE SOPORTE

**Si algo falla:**

1. Revisar logs inmediatamente
2. No haces rollback sin investigar
3. Revisar base de datos: `psql -h host -U user -d dbname`
4. Revisar migraciones: `python manage.py showmigrations`
5. Contactar admin de BD/servidor

---

**Deployment completado: [FECHA]**

Persona responsable: ________________
Aprobado por: ________________
