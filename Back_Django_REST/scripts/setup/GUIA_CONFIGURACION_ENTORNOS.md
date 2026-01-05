# Guía de Configuración de Entornos

## 📋 Estructura de Archivos de Configuración

```
Back_Django_REST/
├── .env                          # ⚠️ NO SUBIR A GIT - Archivo activo actual
├── .env.example                  # Template general para referencia
├── .env.local                    # Template para desarrollo local (SQLite)
├── .env.server                   # Template para servidor (PostgreSQL)
└── .env.production.example       # Template para producción completa (Heroku/Railway)
```

## 🔧 Entornos Disponibles

### 1. **Entorno LOCAL (Desarrollo)**
- **Base de datos**: SQLite (`db.sqlite3`)
- **Archivo**: `.env.local`
- **Uso**: Desarrollo en tu máquina personal
- **Características**:
  - DEBUG=True
  - Email a consola
  - Sin seguridad adicional
  - CORS permisivo para localhost

### 2. **Entorno SERVIDOR (Desarrollo/Staging)**
- **Base de datos**: PostgreSQL (104.248.213.225)
- **Archivo**: `.env.server`
- **Uso**: Servidor de desarrollo/pruebas con PostgreSQL
- **Características**:
  - DEBUG=True (cambiar a False para producción)
  - PostgreSQL configurado
  - IP del servidor en ALLOWED_HOSTS
  - CORS ajustado para servidor

### 3. **Entorno PRODUCCIÓN (Droplet/VPS)**
- **Base de datos**: PostgreSQL
- **Archivo**: `.env.production.example`
- **Uso**: Despliegue en servidor Droplet (DigitalOcean) o VPS
- **Características**:
  - DEBUG=False
  - Seguridad completa activada
  - SSL/HTTPS obligatorio
  - Email SMTP real
  - IP: 104.248.213.225

## 🚀 Cómo Usar

### Configuración Inicial

1. **Clonar el repositorio**
   ```bash
   git clone <tu-repo>
   cd Back_Django_REST
   ```

2. **Seleccionar el entorno según tu caso**

#### Para Desarrollo Local (SQLite):
```bash
# Windows PowerShell
Copy-Item .env.local .env

# Linux/Mac
cp .env.local .env
```

#### Para Servidor con PostgreSQL:
```bash
# Windows PowerShell
Copy-Item .env.server .env

# Linux/Mac
cp .env.server .env
```

3. **Editar `.env` con tus valores reales**
   ```bash
   # Editar manualmente el archivo .env
   # Ajustar credenciales, IPs, dominios, etc.
   ```

4. **Instalar dependencias**
   ```bash
   pip install -r requirements.txt
   ```

5. **Aplicar migraciones**
   ```bash
   python manage.py migrate
   ```

6. **Crear superusuario**
   ```bash
   python manage.py createsuperuser
   ```

7. **Ejecutar servidor**
   ```bash
   python manage.py runserver
   ```

## 🔐 Seguridad

### ⚠️ IMPORTANTE - Nunca Subir a Git:
- `.env` (archivo activo con credenciales reales)
- Cualquier archivo con contraseñas o claves reales

### ✅ Sí Subir a Git:
- `.env.example`
- `.env.local`
- `.env.server`
- `.env.production.example`

### Verificar `.gitignore`:
```bash
# Debe contener:
.env
*.env
!.env.example
!.env.local
!.env.server
!.env.production.example
```

## 🔄 Cambiar Entre Entornos

### De Local a Servidor:
```bash
# 1. Hacer backup de .env actual (si es necesario)
Copy-Item .env .env.backup

# 2. Copiar configuración de servidor
Copy-Item .env.server .env

# 3. Editar .env con tus credenciales reales del servidor

# 4. Aplicar migraciones (si usas PostgreSQL)
python manage.py migrate
```

### De Servidor a Local:
```bash
# 1. Copiar configuración local
Copy-Item .env.local .env

# 2. Usar base de datos SQLite existente
python manage.py runserver
```

## 📊 Configuración de Base de Datos

### SQLite (Local):
- **Automático**: Django usa SQLite por defecto
- **Archivo**: `db.sqlite3`
- **No requiere**: Configuración adicional

### PostgreSQL (Servidor):
```bash
# En el servidor, crear base de datos:
sudo -u postgres psql
CREATE DATABASE home_nannies_db;
CREATE USER morrigan WITH PASSWORD 'Morrigan123';
GRANT ALL PRIVILEGES ON DATABASE home_nannies_db TO morrigan;
\q

# Configurar .env con:
USE_POSTGRESQL=True
DB_NAME=home_nannies_db
DB_USER=morrigan
DB_PASSWORD=Morrigan123
DB_HOST=localhost
DB_PORT=5432
```

### Actualizar `settings.py` para usar PostgreSQL dinámicamente:
```python
# Agregar al inicio de settings.py
USE_POSTGRESQL = os.getenv("USE_POSTGRESQL", "False") == "True"

# Modificar DATABASES
if USE_POSTGRESQL:
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.postgresql',
            'NAME': os.getenv('DB_NAME', 'home_nannies_db'),
            'USER': os.getenv('DB_USER', 'morrigan'),
            'PASSWORD': os.getenv('DB_PASSWORD', ''),
            'HOST': os.getenv('DB_HOST', 'localhost'),
            'PORT': os.getenv('DB_PORT', '5432'),
        }
    }
else:
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.sqlite3',
            'NAME': BASE_DIR / 'db.sqlite3',
        }
    }
```

## 🧪 Probar la Configuración

```bash
# Ver configuración actual
python manage.py showmigrations

# Verificar conexión a base de datos
python manage.py dbshell

# Verificar SECRET_KEY y DEBUG
python manage.py shell
>>> from django.conf import settings
>>> print(f"DEBUG: {settings.DEBUG}")
>>> print(f"Database: {settings.DATABASES['default']['ENGINE']}")
```

## 📝 Checklist de Despliegue

### Antes de Desplegar a Producción:
- [ ] `DEBUG=False`
- [ ] SECRET_KEY generada con `generate_secret_key.py`
- [ ] ALLOWED_HOSTS configurado con dominio real
- [ ] CORS_ALLOWED_ORIGINS con URLs reales
- [ ] Configuraciones de seguridad SSL activadas
- [ ] Email SMTP configurado
- [ ] Base de datos PostgreSQL configurada
- [ ] Archivos estáticos configurados (`collectstatic`)
- [ ] Logs configurados
- [ ] Backup de base de datos configurado

## 🆘 Solución de Problemas

### Error: "SECRET_KEY no definida"
```bash
# Verificar que existe .env
ls -la .env

# Verificar contenido
cat .env | grep SECRET_KEY

# Generar nueva clave si es necesario
python generate_secret_key.py
```

### Error: "Connection refused" (PostgreSQL)
```bash
# Verificar que PostgreSQL está corriendo
sudo systemctl status postgresql

# Verificar credenciales en .env
cat .env | grep DB_

# Probar conexión manual
psql -U morrigan -d home_nannies_db -h localhost
```

### Error: CORS
```bash
# Verificar CORS_ALLOWED_ORIGINS en .env
cat .env | grep CORS

# Debe incluir la URL completa del frontend
CORS_ALLOWED_ORIGINS=http://localhost:5173,http://104.248.213.225
```

## 📚 Referencias

- [Django Settings Best Practices](https://docs.djangoproject.com/en/5.0/topics/settings/)
- [12-Factor App](https://12factor.net/)
- [Django Deployment Checklist](https://docs.djangoproject.com/en/5.0/howto/deployment/checklist/)
