# Home Nannies - Plataforma de Conexión Niñeras-Familias

**Status**: ✅ Backend & Frontend Operativos | **Última Actualización**: 5 Ene 2026  
**Versión:** 2.3.0 | **Build:** 🟢 STABLE | **Coverage:** 85%+ Backend | **Tests:** 19/19 ✅ | **Docs:** ✨ Reorganizadas

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

Toda la documentación está **reorganizada** en categorías temáticas para fácil navegación:

```
DOCUMENTACION/
├── 📋 README.md                          ← ÍNDICE COMPLETO (👈 START HERE)
├── 📝 INDEX.md                           ← Navegación rápida
├── 📊 ESTRUCTURA.md                      ← Árbol visual de documentos
│
├── 📁 01_PLANIFICACION/                  ← Planificación y análisis
│   ├── ANALISIS_HISTORIAS_USUARIO_BACKLOG.md
│   ├── ESTIMACION_PUNTOS_HISTORIA_SPRINTS.md
│   └── PLAN_MEJORAS_SISTEMA.md
│
├── 📁 02_DESARROLLO/                     ← Desarrollo y arquitectura
│   ├── API_ENDPOINTS.md                 (50+ endpoints documentados)
│   ├── COMPONENTS_GUIDE.md              (Guía de componentes React)
│   ├── NAVIGATION_MAP.md                (Mapa de navegación)
│   └── REFACTORING_CODIGO_DUPLICADO.md
│
├── 📁 03_IMPLEMENTACION/                 ← Implementación y cambios
│   ├── CAMBIOS_FASE_1_APLICADOS.md
│   ├── CAMBIOS_FASE_2_APLICADOS.md
│   ├── FASE_3_COMPLETADA.md
│   ├── PHASE_4_COMPLETED.md             (Multi-rol & Tests)
│   ├── GESTION_HIJOS_IMPLEMENTADA.md
│   ├── AUTOSERVICIO_ROL_MULTIROLE.md
│   ├── SISTEMA_ROL_ACTIVO.md
│   └── MEJORAS_CRITICAS_IMPLEMENTADAS.md
│
├── 📁 04_SEGURIDAD/                      ← Seguridad y auditoría
│   ├── AUDITORIA_SEGURIDAD.md
│   ├── INSTRUCCIONES_AUDITORIA.md
│   └── SISTEMA_PERMISOS_Y_AUDITORIA.md
│
├── 📁 05_GUIAS/                          ← Guías de usuario
│   └── GUIA_PREFERENCIAS_NOTIFICACION.md
│
├── 📁 ARQUITECTURA/                      ← Arquitectura del sistema
│   ├── Arquitectura_User_Profiles.md
│   └── Análisis_y_cambios/              (Guías técnicas)
│
├── 📁 DEPLOYMENT/                        ← Despliegue
│   ├── RAILWAY_DEPLOYMENT.md            (Guía completa Railway)
│   ├── DEPLOYMENT_CHECKLIST.md
│   └── COMANDOS_RAILWAY.md
│
├── 📁 TESTING/                           ← Testing y QA
│   ├── FRONTEND_TESTING_COMPLETED.md
│   └── TESTING_SPRINT.md
│
└── 📁 SPRINTS/                           ← Sprints de desarrollo
    ├── SPRINT_1/ (Fundación)
    ├── SPRINT_2/ (Features avanzadas)
    ├── SPRINT_3/ (Integración)
    └── SPRINT_4/ (Refinamiento)
```

👉 **[VER ÍNDICE COMPLETO](./DOCUMENTACION/README.md)**  
👉 **[NAVEGACIÓN RÁPIDA](./DOCUMENTACION/INDEX.md)**  
👉 **[ESTRUCTURA VISUAL](./DOCUMENTACION/ESTRUCTURA.md)**

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

**Índices Principales:**
- 📋 [Índice Completo](./DOCUMENTACION/README.md) - Toda la documentación organizada
- 🗺️ [Navegación Rápida](./DOCUMENTACION/INDEX.md) - Acceso rápido por categoría
- 📊 [Estructura Visual](./DOCUMENTACION/ESTRUCTURA.md) - Árbol de documentos

**Desarrollo y Arquitectura:**
- [API Endpoints](./DOCUMENTACION/02_DESARROLLO/API_ENDPOINTS.md) - 50+ endpoints documentados
- [Guía de Componentes](./DOCUMENTACION/02_DESARROLLO/COMPONENTS_GUIDE.md) - Componentes React
- [Mapa de Navegación](./DOCUMENTACION/02_DESARROLLO/NAVIGATION_MAP.md) - Estructura de rutas
- [Refactoring](./DOCUMENTACION/02_DESARROLLO/REFACTORING_CODIGO_DUPLICADO.md) - Mejoras de código

**Implementación:**
- [Fase 1 Completada](./DOCUMENTACION/03_IMPLEMENTACION/CAMBIOS_FASE_1_APLICADOS.md)
- [Fase 2 Completada](./DOCUMENTACION/03_IMPLEMENTACION/CAMBIOS_FASE_2_APLICADOS.md)
- [Fase 3 Completada](./DOCUMENTACION/03_IMPLEMENTACION/FASE_3_COMPLETADA.md)
- [Fase 4 Completada](./DOCUMENTACION/03_IMPLEMENTACION/PHASE_4_COMPLETED.md) - Multi-rol & Tests
- [Sistema de Roles](./DOCUMENTACION/03_IMPLEMENTACION/SISTEMA_ROL_ACTIVO.md)

**Testing:**
- [Testing Frontend](./DOCUMENTACION/TESTING/FRONTEND_TESTING_COMPLETED.md)
- [Testing Sprints](./DOCUMENTACION/TESTING/TESTING_SPRINT.md)
- Backend Tests: `Back_Django_REST/core/tests.py` (143+ tests)

### 📊 Para Project Managers

**Planificación:**
- [Historias de Usuario](./DOCUMENTACION/01_PLANIFICACION/ANALISIS_HISTORIAS_USUARIO_BACKLOG.md)
- [Estimaciones y Sprints](./DOCUMENTACION/01_PLANIFICACION/ESTIMACION_PUNTOS_HISTORIA_SPRINTS.md)
- [Plan de Mejoras](./DOCUMENTACION/01_PLANIFICACION/PLAN_MEJORAS_SISTEMA.md)

**Implementación por Fases:**
- [Cambios Fase 1](./DOCUMENTACION/03_IMPLEMENTACION/CAMBIOS_FASE_1_APLICADOS.md)
- [Cambios Fase 2](./DOCUMENTACION/03_IMPLEMENTACION/CAMBIOS_FASE_2_APLICADOS.md)
- [Fase 3 Completada](./DOCUMENTACION/03_IMPLEMENTACION/FASE_3_COMPLETADA.md)
- [Fase 4 Completada](./DOCUMENTACION/03_IMPLEMENTACION/PHASE_4_COMPLETED.md)
- [Mejoras Críticas](./DOCUMENTACION/03_IMPLEMENTACION/MEJORAS_CRITICAS_IMPLEMENTADAS.md)

**Sprints:**
- [Sprint 1](./DOCUMENTACION/SPRINTS/SPRINT_1/) - Fundación
- [Sprint 2](./DOCUMENTACION/SPRINTS/SPRINT_2/) - Features avanzadas
- [Sprint 3](./DOCUMENTACION/SPRINTS/SPRINT_3/) - Integración
- [Sprint 4](./DOCUMENTACION/SPRINTS/SPRINT_4/) - Refinamiento

### 🧪 Para QA/Testers

**Testing:**
- [Frontend Testing](./DOCUMENTACION/TESTING/FRONTEND_TESTING_COMPLETED.md) - 91/97 tests ✅
- [Testing Sprint](./DOCUMENTACION/TESTING/TESTING_SPRINT.md)
- Backend Tests: `Back_Django_REST/core/tests.py` - 19/19 tests ✅

### 🔒 Para Seguridad

**Auditoría y Permisos:**
- [Auditoría de Seguridad](./DOCUMENTACION/04_SEGURIDAD/AUDITORIA_SEGURIDAD.md)
- [Instrucciones de Auditoría](./DOCUMENTACION/04_SEGURIDAD/INSTRUCCIONES_AUDITORIA.md)
- [Sistema de Permisos](./DOCUMENTACION/04_SEGURIDAD/SISTEMA_PERMISOS_Y_AUDITORIA.md)

### 🚢 Para DevOps

**Despliegue:**
- [Railway Deployment](./DOCUMENTACION/DEPLOYMENT/RAILWAY_DEPLOYMENT.md) - Guía completa
- [Deployment Checklist](./DOCUMENTACION/DEPLOYMENT/DEPLOYMENT_CHECKLIST.md)
- [Comandos Railway](./DOCUMENTACION/DEPLOYMENT/COMANDOS_RAILWAY.md)
---

## 🔧 Estructura del Proyecto

```
Home_nannies_project/
├── DOCUMENTACION/                       ← 📚 Documentación completa reorganizada
│   ├── README.md                        (Índice completo)
│   ├── INDEX.md                         (Navegación rápida)
│   ├── ESTRUCTURA.md                    (Árbol visual)
│   ├── 01_PLANIFICACION/                (Planificación y análisis)
│   ├── 02_DESARROLLO/                   (Desarrollo y arquitectura)
│   ├── 03_IMPLEMENTACION/               (Implementación y cambios)
│   ├── 04_SEGURIDAD/                    (Seguridad y auditoría)
│   ├── 05_GUIAS/                        (Guías de usuario)
│   ├── ARQUITECTURA/                    (Arquitectura del sistema)
│   ├── DEPLOYMENT/                      (Despliegue)
│   ├── TESTING/                         (Testing y QA)
│   └── SPRINTS/                         (Sprints 1-4)
│
├── scripts/                             ← 🛠️ Scripts de gestión del proyecto
│   ├── start_project.ps1/sh            (Iniciar proyecto)
│   └── switch_environment.ps1/sh       (Cambiar entorno)
│
├── docs/                                ← 📖 Documentación técnica adicional
│   ├── REFACTORING_2025.md
│   ├── OPTIMIZACIONES_COMPLETADAS.md
│   └── INICIO_RAPIDO_ENTORNOS.md
│
├── Back_Django_REST/                    ← 🐍 Backend Django REST API
│   ├── manage.py
│   ├── requirements.txt
│   ├── scripts/                         (Scripts organizados)
│   │   ├── setup/                       (Configuración inicial)
│   │   ├── maintenance/                 (Mantenimiento)
│   │   └── testing/                     (Scripts de prueba)
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
- [Guía Completa Railway](./DOCUMENTACION/DEPLOYMENT/RAILWAY_DEPLOYMENT.md) - Guía detallada
- [Deployment Checklist](./DOCUMENTACION/DEPLOYMENT/DEPLOYMENT_CHECKLIST.md)
- [Comandos Railway](./DOCUMENTACION/DEPLOYMENT/COMANDOS_RAILWAY.md)
- [Template Variables .env](./.env.example) - Todas las variables disponibles

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
Versión:  2.3.0
Status:   🟢 STABLE (Production Ready)
Release:  5 de enero de 2026
```

### Características Destacadas v2.3
- ✨ **Documentación Reorganizada**: Nueva estructura por categorías temáticas
- 🗂️ **Índices Mejorados**: README principal, INDEX de navegación rápida, ESTRUCTURA visual
- 📁 **Scripts Organizados**: Carpetas dedicadas para setup, maintenance y testing
- 🛠️ **Mejor Navegación**: READMEs en cada categoría con guías específicas

### Características Destacadas v2.1-2.2
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

### Documentación Reorganizada (Enero 2026) 🆕
La documentación completa ha sido reorganizada en categorías temáticas:
- 📋 **01_PLANIFICACION**: Planificación y análisis
- 🛠️ **02_DESARROLLO**: Desarrollo y arquitectura  
- ✅ **03_IMPLEMENTACION**: Implementación y cambios
- 🔒 **04_SEGURIDAD**: Seguridad y auditoría
- 📖 **05_GUIAS**: Guías de usuario
- 🏗️ **ARQUITECTURA**, 🚢 **DEPLOYMENT**, 🧪 **TESTING**, 🏃 **SPRINTS**

Ver [DOCUMENTACION/README.md](./DOCUMENTACION/README.md) para el índice completo.

### Mejoras de UX (Fase 3)
- **ImageUploader**: Componente drag & drop para fotos de perfil
- **RoleProtectedRoute**: Protección de rutas basada en roles
- **Notificaciones mejoradas**: Soporte para reseñas
- **Perfiles mejorados**: Foto siempre visible, mejor UX de edición

### Scripts Organizados 🆕
- ✅ Carpeta `scripts/` en raíz con scripts de inicio y entorno
- ✅ Carpeta `docs/` con documentación técnica adicional
- ✅ Backend scripts organizados en `setup/`, `maintenance/`, `testing/`
- ✅ READMEs explicativos en cada carpeta

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
**Última actualización:** 5 de enero de 2026  
**Versión:** 2.3.0 - Documentación Reorganizada & Scripts Organizados  
**Status:** ✅ PRODUCTION READY | **Tests:** 19/19 ✅ | **Docs:** Reorganizadas ✨
