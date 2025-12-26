from pathlib import Path
from datetime import timedelta
import os
# import dj_database_url  # Solo necesario para PostgreSQL en producción
try:
    from dotenv import load_dotenv
except Exception:
    # dotenv is optional in some environments; continue if not installed.
    def load_dotenv():
        return None


# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent

load_dotenv()

# Quick-start development settings - unsuitable for production
# See https://docs.djangoproject.com/en/5.2/howto/deployment/checklist/

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = os.getenv("SECRET_KEY")
if not SECRET_KEY:
    if os.getenv("DEBUG", "False") == "False":
        raise ValueError("SECRET_KEY debe estar definida en variables de entorno para producción")
    else:
        # Solo en desarrollo: usar clave temporal
        SECRET_KEY = "dev-only-insecure-key-change-in-production"

DEBUG = os.getenv("DEBUG", "False") == "True"  # Default seguro: False

# ALLOWED_HOSTS: leer desde variable de entorno (separado por comas)
# En Railway, configurar: ALLOWED_HOSTS=.railway.app,tudominio.com
ALLOWED_HOSTS = os.getenv("ALLOWED_HOSTS", "localhost,127.0.0.1" , "104.248.213.225").split(",")


# Application definition

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'corsheaders',

    # Terceros
    'rest_framework',
    'rest_framework.authtoken',
    'rest_framework_simplejwt',
    'drf_spectacular',

    # Apps
    'core',  # Phase 1: Validación Institucional
    'users',
    'bookings',
    'nannies',
    'parents',
    'favorites',
    'reviews',
    'notifications',  # Phase 3: Notificaciones automáticas
    'academic',  # Phase 3: Validación académica
    'reports',  # Phase 3: Reportes y análisis
]

# Configuración REST Framework
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ),
    'DEFAULT_PERMISSION_CLASSES': (
        'rest_framework.permissions.IsAuthenticated',
    ),
    'DEFAULT_SCHEMA_CLASS': 'drf_spectacular.openapi.AutoSchema',
}


MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    # 'whitenoise.middleware.WhiteNoiseMiddleware',  # WhiteNoise para archivos estáticos (solo producción)
    'django.contrib.sessions.middleware.SessionMiddleware',
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'core.audit_signals.AuditMiddleware',  # Middleware de auditoría
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'django_crud_api.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'django_crud_api.wsgi.application'

# Database
# https://docs.djangoproject.com/en/5.2/ref/settings/#databases

# SQLite para desarrollo local (activo)
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}

# Configuración PostgreSQL para producción (comentada - descomentar para Railway)
# if os.getenv("DATABASE_URL"):
#     DATABASES = {
#         'default': dj_database_url.parse(os.getenv("DATABASE_URL"), conn_max_age=600)
#     }
# else:
#     # SQLite para desarrollo local
#     DATABASES = {
#         'default': {
#             'ENGINE': 'django.db.backends.sqlite3',
#             'NAME': BASE_DIR / 'db.sqlite3',
#         }
#     }


# Password validation
# https://docs.djangoproject.com/en/5.2/ref/settings/#auth-password-validators

AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
        'OPTIONS': {
            'min_length': 10,  # Sprint 3: mínimo 10 caracteres
        }
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
    {
        'NAME': 'core.validators.SymbolPasswordValidator',  # Sprint 3: requiere símbolos
    },
]


# Internationalization
# https://docs.djangoproject.com/en/5.2/topics/i18n/

LANGUAGE_CODE = 'es-cl'

TIME_ZONE = 'America/Santiago'

USE_I18N = True

USE_TZ = True


# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/5.2/howto/static-files/

STATIC_URL = '/static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'

# WhiteNoise configuration para comprimir y cachear archivos estáticos (solo producción)
# STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'

# Media files (uploads)
MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'media'

# Default primary key field type
# https://docs.djangoproject.com/en/5.2/ref/settings/#default-auto-field

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# CORS settings
# https://pypi.org/project/django-cors-headers/

# CORS origins dinámicos desde variable de entorno
CORS_ALLOWED_ORIGINS_STR = os.getenv(
    "CORS_ALLOWED_ORIGINS",
    "http://localhost:3000,http://localhost:5173,http://localhost:5174,http://127.0.0.1:3000,http://127.0.0.1:5173,http://127.0.0.1:5174"
)
CORS_ALLOWED_ORIGINS = [origin.strip() for origin in CORS_ALLOWED_ORIGINS_STR.split(",")]

# Durante desarrollo permitir todos los orígenes si DEBUG=True
CORS_ALLOW_ALL_ORIGINS = DEBUG

# Permitir cookies/credenciales en requests cross-site
CORS_ALLOW_CREDENTIALS = True

# Headers permitidos en requests CORS
CORS_ALLOW_HEADERS = [
    'accept',
    'accept-encoding',
    'authorization',
    'content-type',
    'dnt',
    'origin',
    'user-agent',
    'x-csrftoken',
    'x-requested-with',
]

# Métodos HTTP permitidos
CORS_ALLOW_METHODS = [
    'DELETE',
    'GET',
    'OPTIONS',
    'PATCH',
    'POST',
    'PUT',
]

# CSRF Trusted Origins (requerido para POST/PUT/DELETE en producción)
CSRF_TRUSTED_ORIGINS_STR = os.getenv("CSRF_TRUSTED_ORIGINS", "")
if CSRF_TRUSTED_ORIGINS_STR:
    CSRF_TRUSTED_ORIGINS = [origin.strip() for origin in CSRF_TRUSTED_ORIGINS_STR.split(",")]
else:
    CSRF_TRUSTED_ORIGINS = []

# Configuración de usuario personalizado
AUTH_USER_MODEL = 'users.User'

# Configuración de algoritmos de hash para contraseñas - Optimizado para startup
PASSWORD_HASHERS = [
    'django.contrib.auth.hashers.Argon2PasswordHasher',    # Primario - más seguro
    'django.contrib.auth.hashers.PBKDF2PasswordHasher',    # Fallback para compatibilidad
]

# Configuración de Simple JWT
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=60),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=1),
    'ROTATE_REFRESH_TOKENS': True,
    'BLACKLIST_AFTER_ROTATION': True,
}

# Configuración de correo electrónico (usando consola para desarrollo)
EMAIL_BACKEND = 'django.core.mail.backends.console.EmailBackend'
DEFAULT_FROM_EMAIL = 'no-reply@homenannies.com'

# Configuración del Frontend URL
FRONTEND_URL = os.getenv('FRONTEND_URL', 'http://localhost:5173')

# Configuración de seguridad para producción
if not DEBUG:
    # HTTPS enforcement
    SECURE_SSL_REDIRECT = True
    SESSION_COOKIE_SECURE = True
    CSRF_COOKIE_SECURE = True
    
    # Security headers
    SECURE_BROWSER_XSS_FILTER = True
    SECURE_CONTENT_TYPE_NOSNIFF = True
    X_FRAME_OPTIONS = 'DENY'
    
    # HSTS (HTTP Strict Transport Security)
    # Descomentar después de confirmar que HTTPS funciona correctamente
    # SECURE_HSTS_SECONDS = 31536000  # 1 año
    # SECURE_HSTS_INCLUDE_SUBDOMAINS = True
    # SECURE_HSTS_PRELOAD = True
    
    # Referrer policy
    SECURE_REFERRER_POLICY = 'same-origin'

# Configuración de drf-spectacular
SPECTACULAR_SETTINGS = {
    'TITLE': 'Home Nannies API',
    'DESCRIPTION': 'API REST para la plataforma de gestión de niñeras, reservas y usuarios.',
    'VERSION': '1.0.0',
    'SERVE_INCLUDE_SCHEMA': False,
    'SERVE_PERMISSIONS': ['rest_framework.permissions.AllowAny'],
    'SCHEMA_PATH_PREFIX': '/api',
}


# Basic logging / monitoring configuration
LOGS_DIR = BASE_DIR / 'logs'
LOGS_DIR.mkdir(parents=True, exist_ok=True)

LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'formatters': {
        'verbose': {
            'format': '[{levelname}] {asctime} {name} {module}.{funcName}:{lineno} {message}',
            'style': '{',
            'datefmt': '%Y-%m-%d %H:%M:%S',
        },
        'simple': {
            'format': '[{levelname}] {message}',
            'style': '{',
        },
    },
    'filters': {
        'require_debug_true': {
            '()': 'django.utils.log.RequireDebugTrue',
        },
        'require_debug_false': {
            '()': 'django.utils.log.RequireDebugFalse',
        },
    },
    'handlers': {
        'console': {
            'class': 'logging.StreamHandler',
            'formatter': 'verbose',
            'filters': ['require_debug_true'],
        },
        'file': {
            'class': 'logging.FileHandler',
            'filename': str(LOGS_DIR / 'home_nannies.log'),
            'formatter': 'verbose',
            'level': 'DEBUG',
        },
        'bookings_file': {
            'class': 'logging.FileHandler',
            'filename': str(LOGS_DIR / 'bookings.log'),
            'formatter': 'verbose',
        },
        'users_file': {
            'class': 'logging.FileHandler',
            'filename': str(LOGS_DIR / 'users.log'),
            'formatter': 'verbose',
        },
        'errors_file': {
            'class': 'logging.FileHandler',
            'filename': str(LOGS_DIR / 'errors.log'),
            'formatter': 'verbose',
            'level': 'WARNING',
        },
    },
    'loggers': {
        'django': {
            'handlers': ['console', 'file', 'errors_file'],
            'level': 'INFO',
            'propagate': False,
        },
        'bookings': {
            'handlers': ['console', 'bookings_file'],
            'level': 'INFO',
            'propagate': False,
        },
        'users': {
            'handlers': ['console', 'users_file'],
            'level': 'INFO',
            'propagate': False,
        },
        'favorites': {
            'handlers': ['console', 'bookings_file'],
            'level': 'INFO',
            'propagate': False,
        },
        'notifications': {
            'handlers': ['console', 'bookings_file'],
            'level': 'INFO',
            'propagate': False,
        },
    }
}
