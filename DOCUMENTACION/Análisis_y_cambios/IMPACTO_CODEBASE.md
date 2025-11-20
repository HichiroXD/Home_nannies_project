# Impacto en Codebase Actual - Cambios Requeridos

**Documento:** Análisis de impacto en código existente  
**Fecha:** 20 de noviembre de 2025  
**Versión:** 1.0

---

## 1. CAMBIOS CRÍTICOS EN BACKEND

### 1.1 User Model - Modificaciones Necesarias

**Archivo:** `Back_Django_REST/users/models.py`

```python
# AGREGAR estos campos al modelo User actual:

class User(AbstractUser):
    # ... campos existentes ...
    
    # NUEVOS - FASE 1
    institutional_email = models.EmailField(
        unique=True,
        null=True,
        blank=True,
        help_text="Email @universidad.edu.co"
    )
    
    email_verified = models.BooleanField(default=False)
    email_verification_token = models.CharField(max_length=255, blank=True, unique=True, null=True)
    email_verified_date = models.DateTimeField(null=True, blank=True)
    
    rut = models.CharField(max_length=20, unique=True, null=True, blank=True)
    
    user_role = models.CharField(
        max_length=20,
        choices=[
            ('parent', 'Padre/Madre'),
            ('nanny', 'Niñera'),
            ('admin', 'Administrador'),
        ]
    )
    
    verification_status = models.CharField(
        max_length=20,
        choices=[
            ('pending', 'Pendiente'),
            ('approved', 'Aprobado'),
            ('rejected', 'Rechazado'),
        ],
        default='pending'
    )
    
    last_login_ip = models.GenericIPAddressField(null=True, blank=True)
    failed_login_attempts = models.IntegerField(default=0)
    locked_until = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        db_table = 'users'
        indexes = [
            models.Index(fields=['institutional_email']),
            models.Index(fields=['rut']),
            models.Index(fields=['user_role']),
        ]
```

**Impacto:**
- ⚠️ Requiere migración
- ⚠️ Cambio en autenticación (usar institutional_email en lugar de email)
- ⚠️ Necesita populate script para datos existentes

---

### 1.2 Archivos a Crear en Backend

#### A. `Back_Django_REST/core/models.py` (NUEVO)
```python
# Crear archivo completo con:
# - UniversityProgram
# - StudentVerification
# - DocumentVerification
# - LocationRestriction (Fase 2)
# - OperatingHours (Fase 2)
```

**Ubicación:** `Back_Django_REST/core/models.py`

#### B. `Back_Django_REST/core/serializers.py` (NUEVO)
```python
# Crear archivo con:
# - UniversityProgramSerializer
# - StudentVerificationSerializer
# - DocumentVerificationSerializer
# - RegisterParentSerializer
# - RegisterNannySerializer
```

**Ubicación:** `Back_Django_REST/core/serializers.py`

#### C. `Back_Django_REST/core/validators.py` (NUEVO)
```python
# Crear validadores personalizados
```

**Ubicación:** `Back_Django_REST/core/validators.py`

#### D. `Back_Django_REST/core/views.py` (MODIFICAR)
```python
# Agregar clases:
# - RegisterParentView
# - RegisterNannyView
# - VerifyEmailView
# - PendingVerificationsView (Admin)
# - VerifyDocumentView (Admin)
```

**Ubicación:** `Back_Django_REST/core/views.py`

#### E. `Back_Django_REST/core/urls.py` (MODIFICAR O CREAR)
```python
# Nuevas rutas:
# POST /api/auth/register/parent/
# POST /api/auth/register/nanny/
# POST /api/auth/verify-email/
# POST /api/documents/upload/
# GET /api/admin/pending-verifications/
# etc.
```

---

### 1.3 Estructura de Carpetas - Backend

**Estado Actual:**
```
Back_Django_REST/
├── users/
│   ├── models.py
│   ├── serializers.py
│   ├── views.py
│   └── urls.py
├── bookings/
├── favorites/
├── nannies/
├── reviews/
└── django_crud_api/
```

**Estado Requerido - Fase 1:**
```
Back_Django_REST/
├── users/
│   ├── models.py (MODIFICAR - agregar campos)
│   ├── serializers.py
│   ├── views.py (MODIFICAR - mejorar auth)
│   └── urls.py
├── core/ (NUEVO - Admin y validación)
│   ├── __init__.py
│   ├── models.py (UniversityProgram, StudentVerification, etc.)
│   ├── serializers.py (Serializadores de validación)
│   ├── validators.py (Validadores personalizados)
│   ├── views.py (RegisterParent, RegisterNanny, VerifyEmail, Admin)
│   ├── urls.py (Nuevas rutas)
│   ├── services.py (EmailService, DocumentService)
│   ├── signals.py (Post-save para auditoría)
│   ├── admin.py (Django admin)
│   ├── apps.py
│   ├── migrations/
│   │   └── 0001_initial.py
│   └── tests/
│       └── test_validators.py
├── bookings/
├── favorites/
├── nannies/
├── reviews/
├── django_crud_api/
│   ├── settings.py (MODIFICAR - agregar 'core' a INSTALLED_APPS)
│   └── urls.py (MODIFICAR - incluir urls de core)
└── manage.py
```

---

## 2. CAMBIOS EN FRONTEND

### 2.1 Componentes a Crear - Autenticación

**Ubicación:** `frontend_nannies/src/components/auth/`

```
auth/ (MODIFICAR)
├── Login.jsx (existente - mejorar)
├── Register.jsx (existente - SEPARAR)
├── RegisterParent.jsx (NUEVO)
├── RegisterNanny.jsx (NUEVO)
├── InstitutionalEmailStep.jsx (NUEVO)
├── RUTValidationStep.jsx (NUEVO)
├── EnrollmentCertificateUpload.jsx (NUEVO)
├── ProgramSelector.jsx (NUEVO)
├── EmailVerificationStep.jsx (NUEVO)
└── PasswordValidator.jsx (NUEVO - mostrar requisitos)
```

### 2.2 Vistas a Crear

**Ubicación:** `frontend_nannies/src/views/`

```
├── auth/
│   ├── RegisterParent.jsx (NUEVO)
│   ├── RegisterNanny.jsx (NUEVO)
│   └── EmailVerification.jsx (NUEVO)
├── admin/ (NUEVA CARPETA)
│   ├── AdminDashboard.jsx (MEJORADO)
│   ├── PendingVerifications.jsx (NUEVO)
│   ├── DocumentReview.jsx (NUEVO)
│   └── UserManagement.jsx (NUEVO)
└── ...
```

### 2.3 Componentes Reusables

**Ubicación:** `frontend_nannies/src/components/`

```
├── validation/
│   ├── RUTInput.jsx (NUEVO)
│   ├── InstitutionalEmailInput.jsx (NUEVO)
│   ├── PasswordStrengthIndicator.jsx (NUEVO)
│   └── FileUpload.jsx (NUEVO)
├── forms/
│   ├── RegistrationForm.jsx (NUEVO)
│   └── DocumentUploadForm.jsx (NUEVO)
```

### 2.4 API Utilities

**Ubicación:** `frontend_nannies/src/api/`

```
├── api.js (MODIFICAR - agregar auth headers)
├── authApi.js (NUEVO)
├── verificationApi.js (NUEVO)
├── adminApi.js (NUEVO)
└── validators.js (NUEVO - validaciones cliente)
```

---

## 3. ARCHIVOS EXISTENTES A MODIFICAR

### 3.1 Backend

| Archivo | Cambios | Prioridad |
|---------|---------|-----------|
| `users/models.py` | Agregar campos a User | **CRÍTICA** |
| `users/serializers.py` | Actualizar UserSerializer | **CRÍTICA** |
| `users/views.py` | Mejorar registro/login | **CRÍTICA** |
| `users/urls.py` | Agregar nuevas rutas | **CRÍTICA** |
| `django_crud_api/settings.py` | Agregar app 'core' | **CRÍTICA** |
| `django_crud_api/urls.py` | Incluir urls de 'core' | **CRÍTICA** |
| `requirements.txt` | Agregar dependencias (Pillow, etc.) | **MEDIA** |
| `manage.py` | Sin cambios necesarios | - |

### 3.2 Frontend

| Archivo | Cambios | Prioridad |
|---------|---------|-----------|
| `router/AppRouter.jsx` | Agregar rutas /register/parent y /register/nanny | **CRÍTICA** |
| `components/auth/Login.jsx` | Usar institutional_email | **CRÍTICA** |
| `api/api.js` | Agregar interceptor para verificación | **MEDIA** |
| `index.css` | Agregar estilos para validación | **BAJA** |

---

## 4. MIGRACIONES REQUERIDAS

### 4.1 Django Migrations

**Secuencia:**

```bash
# 1. Crear app core
python manage.py startapp core

# 2. Crear migraciones para User (campos adicionales)
python manage.py makemigrations users

# 3. Crear migraciones para core (nuevos modelos)
python manage.py makemigrations core

# 4. Aplicar migraciones
python manage.py migrate

# 5. Cargar datos iniciales (programas)
python manage.py loaddata initial_programs.json

# 6. Crear superuser si es necesario
python manage.py createsuperuser
```

### 4.2 Datos Iniciales - fixture `initial_programs.json`

```json
[
  {
    "model": "core.universityprogram",
    "pk": 1,
    "fields": {
      "name": "Licenciatura en Educación Inicial",
      "code": "EDU-INI-001",
      "program_type": "pregrado",
      "faculty": "Facultad de Educación",
      "is_education_program": true,
      "education_specialization": "inicial",
      "description": "Formación de educadores iniciales",
      "active": true
    }
  },
  {
    "model": "core.universityprogram",
    "pk": 2,
    "fields": {
      "name": "Licenciatura en Educación Primaria",
      "code": "EDU-PRI-001",
      "program_type": "pregrado",
      "faculty": "Facultad de Educación",
      "is_education_program": true,
      "education_specialization": "primaria",
      "description": "Formación de educadores primarios",
      "active": true
    }
  },
  {
    "model": "core.universityprogram",
    "pk": 3,
    "fields": {
      "name": "Ingeniería en Sistemas",
      "code": "ENG-SIS-001",
      "program_type": "pregrado",
      "faculty": "Facultad de Ingeniería",
      "is_education_program": false,
      "education_specialization": "general",
      "description": "Formación en ingeniería de sistemas",
      "active": true
    }
  }
]
```

**Ubicación:** `Back_Django_REST/core/fixtures/initial_programs.json`

---

## 5. CONFIGURACIÓN - settings.py

### 5.1 INSTALLED_APPS

```python
INSTALLED_APPS = [
    # ... apps existentes ...
    'core',  # NUEVO - Agregar después de 'users'
]
```

### 5.2 MIDDLEWARE (si usa restricciones)

```python
# Fase 2 (no es necesario Fase 1)
MIDDLEWARE = [
    # ... middleware existente ...
    'core.middleware.LocationRestrictionMiddleware',  # Fase 2
    'core.middleware.OperatingHoursMiddleware',  # Fase 2
]
```

### 5.3 Email Backend (para verificación)

```python
# development
EMAIL_BACKEND = 'django.core.mail.backends.console.EmailBackend'

# production
EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST = 'smtp.gmail.com'
EMAIL_PORT = 587
EMAIL_USE_TLS = True
EMAIL_HOST_USER = os.getenv('EMAIL_HOST_USER')
EMAIL_HOST_PASSWORD = os.getenv('EMAIL_HOST_PASSWORD')
```

---

## 6. DEPENDENCIAS A INSTALAR

### 6.1 Python (Backend)

```
# requirements.txt - Agregar:
Pillow==10.0.0  # Para procesar imágenes de documentos
python-magic==0.4.27  # Para validar tipo de archivo
cryptography==41.0.0  # Para cifrado AES
django-cors-headers==4.3.0  # CORS mejorado
celery==5.3.0  # Para tareas async (notificaciones, Fase 4)
redis==5.0.0  # Cache y mensaje broker
python-dateutil==2.8.2
```

**Comando:**
```bash
pip install -r requirements.txt
```

### 6.2 JavaScript (Frontend)

```json
// package.json - Agregar:
{
  "dependencies": {
    "axios": "^1.5.0",
    "react-router-dom": "^6.x",
    "lucide-react": "^0.x",
    "tailwindcss": "^3.x",
    // NUEVAS PARA VALIDACIÓN
    "validator": "^13.11.0",
    "react-dropzone": "^14.2.3",
    "js-file-download": "^0.4.3"
  }
}
```

**Comando:**
```bash
npm install validator react-dropzone js-file-download
```

---

## 7. VARIABLES DE ENTORNO NUEVAS

### 7.1 `.env` - Backend

```bash
# Verificación institucional
INSTITUTION_EMAIL_DOMAIN=@universidad.edu.co
INSTITUTION_NAME=Universidad Central

# Email
EMAIL_HOST_USER=noreply@universidad.edu.co
EMAIL_HOST_PASSWORD=your_app_password

# Verificación de documentos
DOCUMENT_STORAGE_PATH=/var/uploads/documents/
MAX_DOCUMENT_SIZE=5242880  # 5MB en bytes
ALLOWED_DOCUMENT_TYPES=pdf,jpg,jpeg,png

# Security
SECRET_KEY=your_secret_key
DEBUG=False  # En production
ALLOWED_HOSTS=universidad.edu.co,www.universidad.edu.co
```

### 7.2 `.env` - Frontend

```bash
VITE_API_URL=http://127.0.0.1:8000/api
VITE_INSTITUTION_EMAIL_DOMAIN=@universidad.edu.co
```

---

## 8. TESTING - Setup Requerido

### 8.1 Backend - conftest.py

```python
# Back_Django_REST/conftest.py (NUEVO)
import pytest
from django.contrib.auth import get_user_model

User = get_user_model()

@pytest.fixture
def test_parent_user():
    return User.objects.create_user(
        username='padre@universidad.edu.co',
        email='padre@test.com',
        institutional_email='padre@universidad.edu.co',
        rut='12345678-9',
        user_role='parent',
        verification_status='pending'
    )

@pytest.fixture
def test_nanny_user():
    return User.objects.create_user(
        username='niñera@universidad.edu.co',
        email='niñera@test.com',
        institutional_email='niñera@universidad.edu.co',
        rut='11223344-5',
        user_role='nanny',
        verification_status='pending'
    )
```

### 8.2 Comando para Correr Tests

```bash
# Tests unitarios
pytest Back_Django_REST/core/tests/test_validators.py -v

# Tests integración
pytest Back_Django_REST/core/tests/test_views.py -v

# Cobertura
pytest --cov=core --cov-report=html
```

---

## 9. GUÍA DE EJECUCIÓN PASO A PASO

### 9.1 Backend

```bash
# 1. Entrar a carpeta backend
cd Back_Django_REST

# 2. Instalar dependencias nuevas
pip install Pillow cryptography python-dateutil

# 3. Crear app core
python manage.py startapp core

# 4. Copiar modelos en core/models.py
# (Usar contenido de ESPECIFICACIONES_FASE_1.md)

# 5. Copiar serializers en core/serializers.py

# 6. Copiar validators en core/validators.py

# 7. Copiar views en core/views.py

# 8. Crear core/urls.py con endpoints

# 9. Modificar users/models.py (agregar campos)

# 10. Crear migraciones
python manage.py makemigrations

# 11. Aplicar migraciones
python manage.py migrate

# 12. Cargar fixtures
python manage.py loaddata core/fixtures/initial_programs.json

# 13. Crear superuser
python manage.py createsuperuser

# 14. Probar servidor
python manage.py runserver
```

### 9.2 Frontend

```bash
# 1. Entrar a carpeta frontend
cd frontend_nannies

# 2. Instalar dependencias
npm install validator react-dropzone js-file-download

# 3. Crear componentes en src/components/auth/
# - RegisterParent.jsx
# - RegisterNanny.jsx
# - EmailVerification.jsx
# - RUTInput.jsx
# - etc.

# 4. Crear vistas en src/views/
# - auth/RegisterParent.jsx
# - auth/RegisterNanny.jsx

# 5. Crear API en src/api/
# - authApi.js
# - verificationApi.js

# 6. Actualizar AppRouter.jsx
# - Agregar rutas /register/parent y /register/nanny

# 7. Instalar (si usa Vite)
npm run dev
```

---

## 10. CHECKLIST DE IMPACTO

### Backend
- [ ] Crear app `core` en Django
- [ ] Agregar campos a User model
- [ ] Crear UniversityProgram model
- [ ] Crear StudentVerification model
- [ ] Crear DocumentVerification model
- [ ] Crear serializers
- [ ] Crear validadores
- [ ] Crear views y endpoints
- [ ] Crear urls
- [ ] Actualizar settings.py (INSTALLED_APPS)
- [ ] Crear migraciones
- [ ] Crear fixtures con datos iniciales
- [ ] Crear tests
- [ ] Actualizar documentación API

### Frontend
- [ ] Crear componente RegisterParent
- [ ] Crear componente RegisterNanny
- [ ] Crear componente RUTInput
- [ ] Crear componente PasswordValidator
- [ ] Crear componente DocumentUpload
- [ ] Crear API authApi.js
- [ ] Actualizar AppRouter.jsx
- [ ] Crear vistas de registro
- [ ] Crear vistas de verificación
- [ ] Actualizar Login.jsx

### DevOps/Config
- [ ] Actualizar .env
- [ ] Actualizar requirements.txt
- [ ] Actualizar package.json
- [ ] Crear dockerfile (si aplica)
- [ ] Crear docker-compose.yml (si aplica)

### Testing
- [ ] Tests unitarios backend
- [ ] Tests integración backend
- [ ] Tests componentes frontend
- [ ] Tests E2E

### Documentación
- [ ] README actualizado
- [ ] API documentation
- [ ] Diagrama de arquitectura
- [ ] Guía de desarrollo

---

## 11. ESTIMACIÓN DE TRABAJO

| Tarea | Horas | Responsable |
|-------|-------|-------------|
| Crear modelos Django | 4 | Backend |
| Crear serializers | 3 | Backend |
| Crear validadores | 4 | Backend |
| Crear views/endpoints | 5 | Backend |
| Setup migraciones/fixtures | 3 | Backend |
| Testing backend | 5 | Backend |
| **Subtotal Backend** | **24h** | |
| Componentes React | 6 | Frontend |
| Vistas de registro | 4 | Frontend |
| API integration | 3 | Frontend |
| Validaciones cliente | 3 | Frontend |
| Testing frontend | 4 | Frontend |
| **Subtotal Frontend** | **20h** | |
| **TOTAL FASE 1** | **44h** | **~6 días dev (7h/día)** |

---

## 12. ORDEN DE PRIORIDAD

### 🔴 CRÍTICO (Día 1)
1. Crear modelos (User + UniversityProgram)
2. Crear migraciones y aplicar
3. Crear serializers básicos
4. Crear endpoints registro

### 🟡 ALTO (Día 2-3)
5. Crear validadores
6. Crear views mejoradas
7. Componentes React básicos
8. Integración API

### 🟢 MEDIO (Día 4-5)
9. Componentes de validación
10. Mejora de UI
11. Testing
12. Documentación

---

**Próximo paso:** Iniciar Fase 1 con creación de modelo User modificado.

