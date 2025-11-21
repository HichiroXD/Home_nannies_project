# ⚡ GUÍA RÁPIDA: SQLite → PostgreSQL

## 5 Pasos Básicos (15 minutos)

### Paso 1: Instalar PostgreSQL y psycopg2
```bash
pip install psycopg2-binary==2.9.9

# Windows: Descargar installer desde postgresql.org
# Mac: brew install postgresql@14
# Linux: sudo apt-get install postgresql postgresql-contrib
```

### Paso 2: Crear base de datos
```bash
psql -U postgres

# En psql:
CREATE DATABASE home_nannies_dev;
CREATE USER home_nannies_user WITH PASSWORD 'tu_contraseña';
GRANT ALL PRIVILEGES ON DATABASE home_nannies_dev TO home_nannies_user;
\q
```

### Paso 3: Actualizar settings.py
```python
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': 'home_nannies_dev',
        'USER': 'home_nannies_user',
        'PASSWORD': 'tu_contraseña',
        'HOST': 'localhost',
        'PORT': '5432',
    }
}
```

### Paso 4: Migrar datos
```bash
# Exportar de SQLite
python manage.py dumpdata > backup.json

# Crear esquema PostgreSQL
python manage.py migrate

# Restaurar datos
python manage.py loaddata backup.json
```

### Paso 5: Verificar
```bash
python manage.py runserver
# Ir a http://localhost:8000/admin
# ¡Verificar que todo esté ahí!
```

---

## Para Heroku (3 comandos)

```bash
# 1. Crear app con PostgreSQL
heroku create home-nannies-api
heroku addons:create heroku-postgresql:hobby-dev

# 2. Desplegar
git push heroku main

# 3. Migrar (automático con 'release' en Procfile)
heroku logs --tail
```

---

## Para AWS (10 minutos más)

```bash
# 1. RDS: Create database (libre 12 meses)
# 2. EC2: Ubuntu t3.micro
# 3. Nginx + Gunicorn + SSL
# Ver DEPLOYMENT_GUIDE_SQLite_to_PostgreSQL.md para detalles
```
