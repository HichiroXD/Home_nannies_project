from pathlib import Path
from datetime import timedelta
import os
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
# TODO > Cambiar la clave secreta a un .env por seguridad
SECRET_KEY = os.getenv("SECRET_KEY", "b)+h)pgkb7s^cg%j%6(r!mhnlog%#z94uti)!hqfz1mcnz#z^z")
DEBUG = os.getenv("DEBUG", "False") == "True"  # False por defecto para optimizar startup

ALLOWED_HOSTS = ["*", "localhost", "127.0.0.1"]


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
    'django.contrib.sessions.middleware.SessionMiddleware',
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
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

# settings.py en Django 
# TODO > Cambiar las credenciales a un .env por seguridad
# Usar SQLite para desarrollo, PostgreSQL para producción
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}

# Configuración PostgreSQL (comentada para desarrollo)
# DATABASES = {
#     'default': {
#         'ENGINE': 'django.db.backends.postgresql',
#         'NAME': os.getenv("DB_NAME"),
#         'USER': os.getenv("DB_USER"),
#         'PASSWORD': os.getenv("DB_PASSWORD"),
#         'HOST': os.getenv("DB_HOST", "localhost"),
#         'PORT': os.getenv("DB_PORT", "5432"),
#     }
# }


# Password validation
# https://docs.djangoproject.com/en/5.2/ref/settings/#auth-password-validators

AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
        'OPTIONS': {
            'min_length': 8,
        }
    },
    # Remover CommonPasswordValidator en desarrollo por rendimiento
    # Mantener solo en producción si es necesario
]


# Internationalization
# https://docs.djangoproject.com/en/5.2/topics/i18n/

LANGUAGE_CODE = 'es-cl'

TIME_ZONE = 'America/Santiago'

USE_I18N = True

USE_TZ = True


# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/5.2/howto/static-files/

STATIC_URL = 'static/'

# Default primary key field type
# https://docs.djangoproject.com/en/5.2/ref/settings/#default-auto-field

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# CORS settings
# https://pypi.org/project/django-cors-headers/

CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://localhost:5173",
    "http://localhost:5174",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:5174",
    "http://172.16.157.119:3000",  # tu frontend actual
]

# During development it's convenient to allow all origins when DEBUG is True.
# In production, ensure DEBUG=False and restrict origins appropriately.
CORS_ALLOW_ALL_ORIGINS = DEBUG

# Allow cookies / credentials in cross-site requests if your frontend uses them.
CORS_ALLOW_CREDENTIALS = True

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
