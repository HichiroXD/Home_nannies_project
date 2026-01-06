# ⚡ Guía Rápida - Configuración de Entornos

## 🎯 Cambio Rápido de Entornos

### Opción 1: Script Automatizado (Recomendado)

**Windows PowerShell:**
```powershell
# Desarrollo local (SQLite)
.\switch_environment.ps1 -Env local

# Servidor con PostgreSQL
.\switch_environment.ps1 -Env server

# Producción
.\switch_environment.ps1 -Env production
```

**Linux/Mac:**
```bash
# Dar permisos de ejecución (solo la primera vez)
chmod +x switch_environment.sh

# Desarrollo local (SQLite)
./switch_environment.sh local

# Servidor con PostgreSQL
./switch_environment.sh server

# Producción
./switch_environment.sh production
```

### Opción 2: Manual

**Windows:**
```powershell
cd Back_Django_REST
Copy-Item .env.local .env          # Para desarrollo local
# o
Copy-Item .env.server .env         # Para servidor
```

**Linux/Mac:**
```bash
cd Back_Django_REST
cp .env.local .env          # Para desarrollo local
# o
cp .env.server .env         # Para servidor
```

## 📋 Archivos de Configuración

| Archivo | Uso | Base de Datos | DEBUG |
|---------|-----|---------------|-------|
| `.env.local` | Desarrollo local | SQLite | True |
| `.env.server` | Droplet/Staging (104.248.213.225) | PostgreSQL | True |
| `.env.production.example` | Producción Droplet | PostgreSQL | False |
| `.env` | **ACTIVO** (no subir a Git) | Según copia | Según copia |

## 🚀 Inicio Rápido

### Primera vez - Desarrollo Local:
```bash
# 1. Configurar entorno local
.\switch_environment.ps1 -Env local

# 2. Instalar dependencias
cd Back_Django_REST
pip install -r requirements.txt

# 3. Aplicar migraciones
python manage.py migrate

# 4. Crear superusuario
python manage.py createsuperuser

# 5. Ejecutar servidor
python manage.py runserver
```

### Primera vez - Servidor con PostgreSQL:
```bash
# 1. Configurar entorno servidor
.\switch_environment.ps1 -Env server

# 2. Editar .env con credenciales reales
# (Abrir Back_Django_REST/.env y ajustar DB_PASSWORD, etc.)

# 3. Verificar PostgreSQL está corriendo
# Windows: servicios de Windows
# Linux: sudo systemctl status postgresql

# 4. Aplicar migraciones
cd Back_Django_REST
python manage.py migrate

# 5. Crear superusuario
python manage.py createsuperuser

# 6. Ejecutar servidor
python manage.py runserver 0.0.0.0:8000
```

## 🔍 Verificar Configuración Actual

```powershell
# Ver archivo .env actual
cd Back_Django_REST
cat .env

# Verificar base de datos configurada
python manage.py shell
>>> from django.conf import settings
>>> print(settings.DATABASES['default']['ENGINE'])
>>> print(f"DEBUG: {settings.DEBUG}")
>>> exit()

# Ver migraciones
python manage.py showmigrations
```

## 🔧 Tareas Comunes

### Cambiar de SQLite a PostgreSQL:
```bash
# 1. Cambiar entorno
.\switch_environment.ps1 -Env server

# 2. Aplicar migraciones
cd Back_Django_REST
python manage.py migrate

# 3. (Opcional) Exportar datos de SQLite e importar a PostgreSQL
python manage.py dumpdata --natural-foreign --natural-primary > data.json
# Cambiar a PostgreSQL
python manage.py loaddata data.json
```

### Cambiar de PostgreSQL a SQLite:
```bash
# 1. Cambiar entorno
.\switch_environment.ps1 -Env local

# 2. Aplicar migraciones
cd Back_Django_REST
python manage.py migrate
```

### Generar nueva SECRET_KEY:
```bash
cd Back_Django_REST
python generate_secret_key.py
# Copiar la clave generada y pegarla en .env
```

## ⚠️ Checklist Antes de Producción

- [ ] `DEBUG=False` en `.env`
- [ ] Nueva `SECRET_KEY` generada
- [ ] `ALLOWED_HOSTS` configurado con dominio real
- [ ] `CORS_ALLOWED_ORIGINS` con URLs del frontend real
- [ ] Credenciales de PostgreSQL verificadas
- [ ] Email SMTP configurado y probado
- [ ] SSL/HTTPS configurado
- [ ] Archivos estáticos: `python manage.py collectstatic`
- [ ] Backup de base de datos configurado

## 🆘 Problemas Comunes

### Error: "No module named 'dotenv'"
```bash
pip install python-dotenv
```

### Error: "No module named 'psycopg2'"
```bash
# Windows
pip install psycopg2-binary

# Linux
sudo apt-get install libpq-dev
pip install psycopg2
```

### Error: CORS (Frontend no puede conectar)
```bash
# Verificar en .env:
CORS_ALLOWED_ORIGINS=http://localhost:5173,http://tu-servidor:puerto

# Debe incluir el protocolo (http/https) y puerto exacto
```

### Error: PostgreSQL "Connection refused"
```bash
# Verificar servicio PostgreSQL
# Windows: Servicios de Windows
# Linux: sudo systemctl start postgresql

# Verificar credenciales en .env
cat .env | grep DB_
```

## 📞 Comandos Útiles

```bash
# Ver configuración Django
python manage.py diffsettings

# Verificar problemas de configuración
python manage.py check

# Shell de Django
python manage.py shell

# Shell de base de datos
python manage.py dbshell

# Crear migraciones
python manage.py makemigrations

# Aplicar migraciones
python manage.py migrate

# Crear superusuario
python manage.py createsuperuser

# Recolectar archivos estáticos
python manage.py collectstatic

# Ver estructura de base de datos
python manage.py inspectdb
```

## 📚 Documentación Completa

Para información detallada, consulta:
- [GUIA_CONFIGURACION_ENTORNOS.md](GUIA_CONFIGURACION_ENTORNOS.md) - Guía completa
- [Back_Django_REST/.env.example](Back_Django_REST/.env.example) - Template general
- [Back_Django_REST/.env.local](Back_Django_REST/.env.local) - Template local
- [Back_Django_REST/.env.server](Back_Django_REST/.env.server) - Template servidor
