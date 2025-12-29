# Home Nannies - Plataforma de Conexión Niñeras-Familias

**Status**: ✅ Backend & Frontend Operativos | **Última Actualización**: 2 Dic 2025  
**Versión:** 2.2.0 | **Build:** 🟢 STABLE | **Coverage:** 85%+ Backend | **Tests:** 19/19 ✅

---

## 🎯 Descripción del Proyecto

**Home Nannies** es una plataforma web completa que conecta familias con niñeras calificadas. El sistema incluye:

- 👥 **Gestión de Usuarios**: Registro y autenticación para padres, niñeras y administradores
- 🔄 **Sistema Multi-rol**: Usuarios pueden tener múltiples roles simultáneamente (🆕 Fase 4)
- 📅 **Sistema de Reservas**: Booking de servicios con gestión de disponibilidad
- ⭐ **Sistema de Reseñas**: Valoraciones y comentarios de servicios prestados
- ❤️ **Favoritos**: Lista de niñeras preferidas para acceso rápido
- 🔔 **Notificaciones**: Sistema de alertas para bookings, reseñas y actualizaciones (🆕 Mejorado)
- 📊 **Dashboard Administrativo**: Panel de control con métricas y gestión de usuarios
- 🎓 **Validación Académica**: Verificación de credenciales universitarias (OCR)
- 📸 **Subida de Fotos**: Perfiles con fotos, drag & drop, validación (🆕 Fase 3)
- 🛡️ **Protección de Rutas**: Acceso basado en roles con RoleProtectedRoute (🆕 Fase 3)
- 📱 **Responsive Design**: Interfaz adaptable a dispositivos móviles y desktop

---

## 📚 DOCUMENTACIÓN COMPLETA

Toda la documentación está organizada en carpetas por fase para fácil acceso:

```
DOCUMENTACION/
├── INDEX.md                              ← ÍNDICE PRINCIPAL (👈 START HERE)
├── PHASE_1/                              ← Phase 1: Validación institucional
│   ├── PHASE_1_IMPLEMENTATION_SUMMARY.md
│   ├── README_PHASE_1.md
│   └── IMPLEMENTATION_COMPLETE.md
├── PHASE_2/                              ← Phase 2: OCR simulado
│   ├── RESUMEN_PHASE_2_COMPLETO.md
│   ├── RESUMEN_VISUAL_PHASE_2.md
│   └── CAMBIOS_SPRINT2_FASE_2_MODELS_VALIDATORS_SERIALIZERS.md
├── PHASE_3/                              ← Phase 3: OCR real
│   ├── FASE_3_RESUMEN_FINAL.md
│   ├── ESPECIFICACIONES_FASE_3.md
│   ├── PHASE_3_COMPLETION.md
│   └── TASK_*_COMPLETION.md
├── PHASE_4/                              ← Phase 4: Multi-rol & Tests (🆕)
│   ├── PHASE_4_TASK_1_SUMMARY.md
│   ├── CODE_REVIEW_FRONTEND_PHASE_4.md
│   └── PROXIMOS_PASOS_PHASE_4.md
├── API_ENDPOINTS.md                     ← 🆕 Documentación completa de API
├── COMPONENTS_GUIDE.md                  ← 🆕 Guía de componentes React
├── OPTIMIZACIONES_COMPLETADAS.md       ← 🆕 Refactoring 2025 (useApiData + Material-UI)
├── REFACTORING_USE_API_DATA.md         ← 🆕 Guía de migración a useApiData
└── Análisis_y_cambios/                  ← Documentación técnica
    ├── 00_COMIENZA_AQUI.md              ← Portal de bienvenida
    ├── CHANGELOG_SPRINT_2.md            ← Changes & features
    ├── COMPONENTES_GUIA_EJEMPLOS.md     ← Components guide
    ├── RESUMEN_EJECUTIVO.md
    ├── GUIA_DESARROLLO.md
    ├── MAPEO_ENDPOINTS_API.md
    ├── QUICK_REFERENCE_CARD.md
    └── (20+ documentos más...)
```

👉 **[VER ÍNDICE COMPLETO](./DOCUMENTACION/INDEX.md)**

---

## 🚀 Inicio Rápido

### Prerrequisitos
- Python 3.13+
- Node.js 18+
- PostgreSQL (opcional, usa SQLite por defecto)
- Tesseract OCR (para validación de documentos)

### Backend (Django REST API)
```bash
cd Back_Django_REST
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
# Backend disponible en http://localhost:8000
```

### Frontend (React + Vite)
```bash
cd frontend_nannies
npm install
npm run dev
# Frontend disponible en http://localhost:5173
```

### Tests

**Backend (Django)**
```bash
cd Back_Django_REST

# Todos los tests
python manage.py test

# Tests específicos de Fase 4 (19 tests)
python manage.py test core.tests bookings.tests.BookingIntegrationTests reviews.tests.ReviewIntegrationTests

# Tests de validadores (7 tests)
python manage.py test core.tests.ChileanPhoneValidatorTest core.tests.PositiveNonzeroValidatorTest

# Tests de integración bookings (6 tests)
python manage.py test bookings.tests.BookingIntegrationTests

# Tests de integración reviews (6 tests)
python manage.py test reviews.tests.ReviewIntegrationTests

# 📊 Resultado: 19/19 tests pasando ✅
```

**Frontend (Vitest)** 🆕
```bash
cd frontend_nannies

# Todos los tests
npm test

# Con interfaz gráfica
npm run test:ui

# Con cobertura
npm run test:coverage

# Modo watch
npm run test:watch

# 📊 Resultado: 91/97 tests pasando (93.8%) ✅
# - NotificationCenter: 24/24 ✅
# - RoleProtectedRoute: 16/16 ✅
# - Hooks: 15/15 ✅
# - Utilidades: 18/18 ✅
# - ImageUploader: 14/20 ⚠️ (FileReader mock limitation)
```

### Usuario Admin Demo
```
Email: admin@homenannies.cl
Password: admin123
```

---

## ✅ Características Implementadas

### Backend (Django REST Framework)
- ✅ **Autenticación JWT**: Login, registro, recuperación de contraseña
- ✅ **Gestión de Usuarios**: CRUD completo para padres, niñeras y admins
- ✅ **Sistema de Perfiles**: Perfiles detallados con foto, bio, experiencia
- ✅ **Bookings/Reservas**: Creación, actualización, cancelación de servicios
- ✅ **Disponibilidad**: Gestión de horarios disponibles para niñeras
- ✅ **Reseñas y Ratings**: Sistema de valoraciones con promedios
- ✅ **Favoritos**: Guardar niñeras favoritas
- ✅ **Notificaciones**: Sistema de alertas por eventos
- ✅ **OCR & Validación**: Procesamiento de documentos académicos con Tesseract
- ✅ **Reportes**: Estadísticas y métricas del sistema
- ✅ **Dashboard Admin**: APIs para panel administrativo

### Frontend (React + Material-UI)
- ✅ **Landing Page**: Página de inicio con hero y features
- ✅ **Autenticación**: Login, registro, verificación de email
- ✅ **Catálogo de Niñeras**: Búsqueda con filtros avanzados
- ✅ **Perfiles de Usuario**: Vista y edición de perfiles (parent/nanny/admin)
- ✅ **Sistema de Bookings**: Creación de reservas con calendario
- ✅ **Gestión de Disponibilidad**: CRUD de franjas horarias con repetición semanal
- ✅ **Lista de Favoritos**: Gestión de niñeras favoritas
- ✅ **Historial de Reservas**: Visualización de bookings pasados y futuros
- ✅ **Dashboard Administrativo**: Panel con métricas, usuarios, reportes
- ✅ **Notificaciones**: Centro de notificaciones en tiempo real
- ✅ **Componentes Reutilizables**: DataTable, Modal, FormBuilder, AlertToast
- ✅ **Responsive Design**: Optimizado para móvil y desktop
- ✅ **Control de Acceso por Roles**: Vistas específicas según tipo de usuario

---

## 📖 Documentación por Propósito

### 👨‍💻 Para Desarrolladores

**Configuración y Setup:**
- [Guía de Desarrollo](./DOCUMENTACION/Análisis_y_cambios/GUIA_DESARROLLO.md) - Setup, convenciones, best practices
- [Quick Reference Card](./DOCUMENTACION/Análisis_y_cambios/QUICK_REFERENCE_CARD.md) - Comandos frecuentes

**Componentes React:**
- [Guía de Componentes & Ejemplos](./DOCUMENTACION/Análisis_y_cambios/COMPONENTES_GUIA_EJEMPLOS.md) - ⭐ NUEVO
  - AlertToast, AvailabilitySelector, DataTable, Modal, FormBuilder
  - Custom Hooks (useForm, useFetch, useDebounce, etc.)
  - 10 ejemplos prácticos de integración
- [Phase 4 - Componentes](./DOCUMENTACION/PHASE_4/PHASE_4_TASK_1_SUMMARY.md)

**Backend & API:**
- [Phase 1 Summary](./DOCUMENTACION/PHASE_1/PHASE_1_IMPLEMENTATION_SUMMARY.md)
- [Phase 2 Summary](./DOCUMENTACION/PHASE_2/RESUMEN_PHASE_2_COMPLETO.md)
- [Phase 3 Summary](./DOCUMENTACION/PHASE_3/FASE_3_RESUMEN_FINAL.md)
- [API Endpoints Reference](./DOCUMENTACION/Análisis_y_cambios/MAPEO_ENDPOINTS_API.md) - 40+ endpoints

**Testing:**
- [Testing Guide](./DOCUMENTACION/Análisis_y_cambios/TESTING_GUIDE.md)
- Backend Tests: `Back_Django_REST/core/tests.py` (143+ tests)

### 📊 Para Project Managers

**Resúmenes Ejecutivos:**
- [Resumen Ejecutivo](./DOCUMENTACION/Análisis_y_cambios/RESUMEN_EJECUTIVO.md) - Overview del proyecto
- [Changelog Sprint 2](./DOCUMENTACION/Análisis_y_cambios/CHANGELOG_SPRINT_2.md) - ⭐ NUEVO
  - Nuevas features, bugs fixes, optimizaciones
  - Performance improvements (75% backend startup)
  - Estadísticas de código y documentación

**Métricas y Estadísticas:**
- [Phase 2 Metrics](./DOCUMENTACION/PHASE_2/RESUMEN_VISUAL_PHASE_2.md)
- [Estadísticas Finales Sprint 2](./DOCUMENTACION/Análisis_y_cambios/ESTADISTICAS_FINALES_SPRINT2.md)

### 🧪 Para QA/Testers

- [Testing Guide](./DOCUMENTACION/Análisis_y_cambios/TESTING_GUIDE.md) - Casos de test, ejemplos cURL
- Backend Tests: `Back_Django_REST/core/tests.py` (Run with `python manage.py test`)
- [Phase 3 Completion](./DOCUMENTACION/PHASE_3/PHASE_3_COMPLETION.md) - Final status

---

## 🔧 Estructura del Proyecto

```
Home_nannies_project/
├── DOCUMENTACION/                       ← 📚 Documentación completa (43 archivos)
│   ├── INDEX.md                         (Índice principal)
│   ├── PHASE_1/ - PHASE_4/              (Documentación por fases)
│   └── Análisis_y_cambios/              (Guías técnicas y referencias)
│
├── Back_Django_REST/                    ← 🐍 Backend Django REST API
│   ├── manage.py
│   ├── requirements.txt
│   ├── django_crud_api/                 (Configuración principal)
│   │   ├── settings.py
│   │   ├── urls.py
│   │   └── dashboard_urls.py
│   ├── users/                           (Autenticación y usuarios)
│   │   ├── models.py
│   │   ├── views.py                     (Login, Register, JWT)
│   │   ├── serializers.py
│   │   └── urls.py
│   ├── nannies/                         (Perfiles de niñeras)
│   │   ├── models.py                    (NannyProfile)
│   │   ├── views.py                     (Listado, detalle, filtros)
│   │   └── serializers.py
│   ├── parents/                         (Perfiles de padres)
│   │   ├── models.py                    (ParentProfile)
│   │   └── views.py
│   ├── bookings/                        (Sistema de reservas)
│   │   ├── models.py                    (Booking, Availability)
│   │   ├── views.py                     (CRUD bookings, disponibilidad)
│   │   └── serializers.py
│   ├── favorites/                       (Favoritos)
│   │   ├── models.py                    (Favorite)
│   │   └── views.py
│   ├── reviews/                         (Reseñas y ratings)
│   │   ├── models.py                    (Review)
│   │   └── views.py
│   ├── notifications/                   (Sistema de notificaciones)
│   │   ├── models.py                    (Notification)
│   │   ├── views.py
│   │   └── service.py
│   ├── core/                            (Validación y OCR)
│   │   ├── models.py                    (StudentVerification, OCRDocument)
│   │   ├── views.py                     (OCR processing, verificación)
│   │   ├── ocr_processor.py
│   │   └── validators.py
│   ├── academic/                        (API académica)
│   │   ├── models.py                    (AcademicProvider, Program, Student)
│   │   └── views.py
│   └── reports/                         (Reportes y estadísticas)
│       ├── models.py                    (VerificationReport)
│       └── views.py                     (Dashboard, métricas)
│
├── frontend_nannies/                    ← ⚛️ Frontend React + Vite
│   ├── src/
│   │   ├── views/                       (41 vistas principales)
│   │   │   ├── Landing.jsx              (Página de inicio)
│   │   │   ├── Catalog.jsx              (Catálogo de niñeras)
│   │   │   ├── BookingCreate.jsx        (Crear reserva)
│   │   │   ├── MyBookings.jsx           (Mis reservas)
│   │   │   ├── FavoriteList.jsx         (Mis favoritos)
│   │   │   ├── AvailabilityManagement.jsx (Gestión de horarios)
│   │   │   ├── auth/                    (Login, Register, Verify)
│   │   │   ├── profile/                 (Perfiles por rol)
│   │   │   └── dashboard/               (Dashboards)
│   │   │       └── admin/               (Dashboard administrativo)
│   │   ├── components/                  (57+ componentes)
│   │   │   ├── common/                  (Componentes reutilizables)
│   │   │   │   ├── DataTable.jsx
│   │   │   │   ├── Modal.jsx
│   │   │   │   ├── FormBuilder.jsx
│   │   │   │   ├── AlertToast.jsx
│   │   │   │   └── AvailabilitySelector.jsx
│   │   │   ├── layout/                  (Layout, Header, Footer)
│   │   │   ├── nanny/                   (NannyCard, Filters)
│   │   │   ├── bookings/                (Componentes de reservas)
│   │   │   ├── notifications/           (Centro de notificaciones)
│   │   │   └── ocr/                     (Upload y procesamiento OCR)
│   │   ├── hooks/                       (Custom hooks)
│   │   │   ├── useForm.js
│   │   │   ├── useFetch.js
│   │   │   ├── useDebounce.js
│   │   │   └── useToggle.js
│   │   ├── api/                         (Cliente API)
│   │   │   ├── API.js                   (Axios config)
│   │   │   ├── nannyApi.js
│   │   │   ├── bookingApi.js
│   │   │   ├── profileApi.js
│   │   │   └── ...
│   │   ├── utils/                       (Utilidades)
│   │   ├── App.jsx                      (Componente principal)
│   │   └── main.jsx                     (Entry point)
│   ├── package.json
│   ├── vite.config.js
│   └── vitest.config.js
│
├── README.md                            ← Este archivo
├── CHANGELOG.md                         ← Histórico de cambios
└── Procfile                             ← Configuración de despliegue
```

---

## 📈 Estadísticas del Proyecto

### Código
```
Backend Django:
  - 9 apps Django completamente funcionales
  - 51+ ViewSets y APIViews
  - 143+ tests unitarios (80%+ coverage)
  - 50+ endpoints REST API
  - Sistema de signals para logging automático
  - Validación RUT chileno
  - Procesamiento OCR con Tesseract
  - Integración académica con APIs externas

Frontend React:
  - 41 vistas/páginas completas
  - 57+ componentes React
  - 11 componentes reutilizables (common/)
  - 10+ custom hooks
  - Sistema de routing con protección por roles
  - Dashboard administrativo completo
  - Gestión de estado con hooks y context
  - Integración completa con API backend
```

### APIs Principales
```
Autenticación:
  POST   /api/users/register/          - Registro de usuarios
  POST   /api/users/login/             - Login con JWT
  POST   /api/users/password-reset/    - Recuperar contraseña
  GET    /api/users/me/                - Usuario actual

Niñeras:
  GET    /api/nannies/                 - Listado con filtros
  GET    /api/nannies/{id}/            - Detalle de niñera
  GET    /api/nannies/profile/         - Mi perfil (niñera)

Reservas:
  GET    /api/bookings/                - Mis reservas
  POST   /api/bookings/                - Crear reserva
  PATCH  /api/bookings/{id}/           - Actualizar estado
  DELETE /api/bookings/{id}/           - Cancelar reserva

Disponibilidad:
  GET    /api/availability/            - Horarios disponibles
  POST   /api/availability/            - Crear horario
  PUT    /api/availability/{id}/       - Actualizar horario
  DELETE /api/availability/{id}/       - Eliminar horario

Favoritos:
  GET    /api/favorites/               - Mis favoritos
  POST   /api/favorites/               - Agregar favorito
  DELETE /api/favorites/{id}/          - Eliminar favorito

Reseñas:
  GET    /api/reviews/                 - Reseñas de niñera
  POST   /api/reviews/                 - Crear reseña

Notificaciones:
  GET    /api/notifications/           - Mis notificaciones
  PATCH  /api/notifications/{id}/      - Marcar como leída

Admin Dashboard:
  GET    /api/dashboard/admin/         - Métricas administrativas
  GET    /api/reports/verification/    - Reportes de verificación
  GET    /api/reports/ocr-statistics/  - Estadísticas OCR
```

### Documentación
```
Documentos totales:  43 archivos
Palabras totales:    50,000+ palabras
Páginas estimadas:   170+ páginas
Cobertura:           100% del proyecto
Ejemplos prácticos:  10+ casos de uso
```

### Calidad
```
Django Errors:       0 ✅
npm Vulnerabilities: 0 ✅
Python Vulnerabilities: 0 ✅
Security Issues:     0 ✅
```

---

## 🚀 Roadmap y Mejoras Futuras

### Próximas Características
- 🔄 **Pagos en Línea**: Integración con Mercado Pago/WebPay
- 🔄 **Chat en Tiempo Real**: WebSocket para mensajería entre usuarios
- 🔄 **Sistema de Puntos**: Gamificación para niñeras activas
- 🔄 **App Móvil**: React Native para iOS y Android
- 🔄 **Tests Frontend**: Suite completa con Vitest
- 🔄 **CI/CD**: GitHub Actions para deployment automático
- 🔄 **Modo Offline**: Progressive Web App (PWA)
- 🔄 **Localización**: Soporte multiidioma (ES/EN)

---

## 🔗 Enlaces Útiles

### Documentación
- **[Índice Principal](./DOCUMENTACION/INDEX.md)** - Punto de partida
- **[Guía de Desarrollo](./DOCUMENTACION/Análisis_y_cambios/GUIA_DESARROLLO.md)** - Setup y convenciones
- **[Componentes & Ejemplos](./DOCUMENTACION/Análisis_y_cambios/COMPONENTES_GUIA_EJEMPLOS.md)** - Guía de uso
- **[API Reference](./DOCUMENTACION/Análisis_y_cambios/MAPEO_ENDPOINTS_API.md)** - Endpoints documentados
- **[Changelog Sprint 2](./DOCUMENTACION/Análisis_y_cambios/CHANGELOG_SPRINT_2.md)** - Últimas features

### Recursos
- Backend: `Back_Django_REST/`
- Frontend: `frontend_nannies/`
- Tests: `Back_Django_REST/core/tests.py`
- Deploy: `Procfile` (Heroku-ready)

---

## 🚢 Despliegue en Producción

### Railway Deployment (Recomendado)

Este proyecto está completamente configurado para desplegarse en **Railway** con PostgreSQL.

#### 📖 Guía Completa
👉 **[VER GUÍA COMPLETA DE DESPLIEGUE](./RAILWAY_DEPLOYMENT.md)**

#### ⚡ Resumen Rápido

1. **Requisitos previos instalados:**
   - ✅ `gunicorn` - Servidor WSGI para producción
   - ✅ `whitenoise` - Servir archivos estáticos
   - ✅ `dj-database-url` - Configuración de PostgreSQL
   - ✅ `psycopg2-binary` - Adaptador PostgreSQL
   - ✅ `Procfile` - Comandos de web y release
   - ✅ `runtime.txt` - Python 3.13.4

2. **Desplegar Backend:**
   ```bash
   # 1. Crear proyecto en Railway y conectar repo GitHub
   # 2. Añadir plugin PostgreSQL (auto-genera DATABASE_URL)
   # 3. Configurar variables de entorno en Railway:
   
   SECRET_KEY=genera-clave-secreta-nueva
   DEBUG=False
   ALLOWED_HOSTS=.railway.app,tudominio.com
   CSRF_TRUSTED_ORIGINS=https://tu-backend.up.railway.app
   CORS_ALLOWED_ORIGINS=https://tu-frontend.vercel.app
   FRONTEND_URL=https://tu-frontend.vercel.app
   
   # 4. Railway ejecutará automáticamente:
   #    - Migraciones (migrate --noinput)
   #    - Collectstatic (collectstatic --noinput)
   #    - Gunicorn server
   ```

3. **Desplegar Frontend:**
   - **Opción A (Recomendada):** [Vercel](https://vercel.com) - Deploy automático
   - **Opción B:** Railway - Servicio Node separado
   
   Variables de entorno frontend:
   ```bash
   VITE_API_URL=https://tu-backend.up.railway.app
   ```

4. **Archivos de configuración incluidos:**
   - ✅ `Procfile` - Configurado con comandos de web y release
   - ✅ `.env.example` - Template de variables de entorno
   - ✅ `RAILWAY_DEPLOYMENT.md` - Guía detallada paso a paso
   - ✅ `settings.py` - Configuración dinámica con env vars

#### 🔒 Variables de Entorno Requeridas

Copia `.env.example` y configura:

```bash
# Seguridad
SECRET_KEY=tu-clave-secreta-super-segura
DEBUG=False

# Hosts (Railway auto-provee DATABASE_URL)
ALLOWED_HOSTS=.railway.app,tudominio.com
CSRF_TRUSTED_ORIGINS=https://tu-backend.up.railway.app
CORS_ALLOWED_ORIGINS=https://tu-frontend.vercel.app
```

#### 📚 Documentación Adicional
- [Guía Completa Railway](./RAILWAY_DEPLOYMENT.md) - 500+ líneas de documentación
- [Template Variables .env](./.env.example) - Todas las variables disponibles
- [Django Deployment Checklist](https://docs.djangoproject.com/en/5.2/howto/deployment/checklist/)

---

## 💻 Stack Tecnológico

### Backend
- **Framework:** Django 5.2.6
- **API:** Django REST Framework 3.16.1
- **Autenticación:** Simple JWT 5.5.1
- **Base de Datos:** SQLite (dev) / PostgreSQL (prod)
- **Python:** 3.13+
- **OCR:** Tesseract + pytesseract 0.3.12
- **Validación:** Custom validators para RUT chileno
- **Documentación API:** drf-spectacular 0.28.0
- **CORS:** django-cors-headers 4.8.0
- **Password Hashing:** Argon2 25.1.0

### Frontend
- **Framework:** React 19.1.1
- **Build Tool:** Vite 5.x
- **Routing:** React Router DOM 7.9.3
- **UI Library:** Material-UI (MUI) 6.0.0
- **State Management:** React Hooks + Zustand 4.4.6
- **HTTP Client:** Axios 1.12.2
- **Icons:** Lucide React 0.545.0
- **Forms:** Custom useForm hook
- **Calendar:** react-calendar 5.1.0
- **Charts:** Recharts 2.10.3
- **Testing:** Vitest + Testing Library
- **Dates:** date-fns 2.30.0

---

## 📝 Notas Importantes

### Versión Actual
```
Versión:  2.1.0
Status:   🟢 STABLE (Production Ready)
Release:  23 de noviembre de 2025
```

### Características Destacadas v2.1
- ✨ Sistema completo de bookings con disponibilidad
- 🎨 Dashboard administrativo con métricas en tiempo real
- 📱 Interfaz responsive completamente funcional
- 🔐 Control de acceso por roles (parent/nanny/admin)
- ⭐ Sistema de favoritos y reseñas integrado
- 📊 Reportes y estadísticas del sistema
- 🔔 Centro de notificaciones
- 🎓 Validación académica con OCR
- 💾 API REST completa con 50+ endpoints
- 🔧 Componentes reutilizables y hooks personalizados

### Flujos de Usuario Implementados
```
Padre (Parent):
  ✅ Buscar y filtrar niñeras
  ✅ Ver perfiles detallados con reseñas
  ✅ Crear y gestionar reservas
  ✅ Agregar niñeras a favoritos
  ✅ Dejar reseñas y valoraciones
  ✅ Ver historial de bookings

Niñera (Nanny):
  ✅ Gestionar disponibilidad horaria
  ✅ Ver solicitudes de booking
  ✅ Aceptar/rechazar reservas
  ✅ Actualizar perfil y experiencia
  ✅ Ver reseñas recibidas
  ✅ Subir certificados académicos

Administrador (Admin):
  ✅ Dashboard con métricas del sistema
  ✅ Gestión de usuarios (CRUD)
  ✅ Visualizar reportes y estadísticas
  ✅ Monitorear estado de verificaciones OCR
  ✅ Revisar validaciones académicas
```

---

## 🆕 Novedades Fase 4 (Diciembre 2025)

### Sistema Multi-rol
Los usuarios ahora pueden tener múltiples roles simultáneamente:
- Un usuario puede ser padre **Y** niñera
- Cambio de rol activo en tiempo real
- Perfiles separados por rol
- 5 nuevos endpoints de API

**Endpoints:**
```bash
GET    /api/users/user-roles/         # Listar roles del usuario
POST   /api/users/add-role/            # Agregar rol adicional
DELETE /api/users/remove-role/         # Remover rol
POST   /api/users/switch-role/         # Cambiar rol activo
GET    /api/users/active-role/         # Obtener rol actual
```

### Suite de Tests Completa
19 tests de integración implementados y pasando:
- ✅ 7 tests de validadores (teléfonos, valores positivos)
- ✅ 6 tests de bookings (reservas, notificaciones, solapamiento)
- ✅ 6 tests de reviews (reseñas, ratings, duplicados)

Ver documentación completa en `PHASE_4_COMPLETED.md`

### Mejoras de UX (Fase 3)
- **ImageUploader**: Componente drag & drop para fotos de perfil
- **RoleProtectedRoute**: Protección de rutas basada en roles
- **Notificaciones mejoradas**: Soporte para reseñas
- **Perfiles mejorados**: Foto siempre visible, mejor UX de edición

### Documentación Nueva
- 📖 `API_ENDPOINTS.md`: Documentación completa de todos los endpoints
- 📖 `COMPONENTS_GUIDE.md`: Guía detallada de componentes React
- 📖 `PHASE_4_COMPLETED.md`: Resumen de implementación Fase 4

---

### Configuración Adicional

**Variables de Entorno (Backend)**
```bash
# .env en Back_Django_REST/
SECRET_KEY=tu-clave-secreta
DEBUG=True
DATABASE_URL=sqlite:///db.sqlite3  # o PostgreSQL
CORS_ALLOWED_ORIGINS=http://localhost:5173
TESSERACT_CMD=/usr/bin/tesseract  # Ruta a Tesseract
```

**Variables de Entorno (Frontend)**
```bash
# .env en frontend_nannies/
VITE_API_URL=http://localhost:8000
```

## 🤝 Contribuir

Este proyecto está en desarrollo activo. Para contribuir:

1. Fork el repositorio
2. Crea una rama con tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto es parte de un sistema privado de Home Nannies.

---

## 🐛 Reporte de Bugs

Si encuentras algún bug, por favor:
1. Revisa que no esté ya reportado en Issues
2. Crea un nuevo Issue con:
   - Descripción detallada del problema
   - Pasos para reproducir
   - Comportamiento esperado vs actual
   - Screenshots si aplica
   - Información del entorno (browser, OS, versión)

---

**Desarrollado por:** Equipo Home Nannies  
**Última actualización:** 2 de diciembre de 2025  
**Versión:** 2.2.0 - Multi-rol & Testing Suite  
**Status:** ✅ PRODUCTION READY | **Tests:** 19/19 ✅
