# Revisión Técnica: Análisis de Vistas Faltantes
**Fecha:** 14 de noviembre de 2025  
**Proyecto:** Home Nannies  
**Objetivo:** Auditar estado actual y mapear implementación de:
1. **Detalle de Niñera** (`NannyDetail`)
2. **Detalle de Reserva** (`BookingDetail`)
3. **Chat Usuario 1:1** (`ChatUsuario`)

---

## 📊 ESTADO ACTUAL DEL BACKEND

### Modelos Existentes

| Modelo | Ubicación | Estado | Campos |
|--------|-----------|--------|--------|
| **User** | `users/models.py` | ✅ Existe | id, username, email, role, is_verified, password_hash |
| **NannyProfile** | `nannies/models.py` | ✅ Existe | user, experience_years, hourly_rate, description, verified, age, certifications, rating_avg |
| **Booking** | `bookings/models.py` | ✅ Existe | parent, nanny, start_time, end_time, status, created_at, updated_at |
| **Availability** | `bookings/models.py` | ✅ Existe | nanny, day, start_time, end_time, created_at |
| **Review** | `reviews/models.py` | ✅ Existe | parent, nanny, rating, comment, created_at |
| **Favorite** | `favorites/models.py` | ✅ Existe | parent, nanny, created_at |
| **Notification** | `bookings/models.py` | ✅ Existe | user, message, is_read, created_at, updated_at |
| **Message** (Chat) | ❌ **NO EXISTE** | 🔴 Falta | — |

### Serializers Existentes

| Serializer | Ubicación | Estado | Campos de Salida |
|-----------|-----------|--------|-----------------|
| **NannyProfileSerializer** | `nannies/serializer.py` | ✅ Existe | id, username, email, role, experience_years, hourly_rate, description, verified, age, certifications, rating_avg, reviews |
| **BookingSerializer** | `bookings/serializer.py` | ✅ Existe | id, parent, nanny, start_time, end_time, status, created_at, updated_at |
| **AvailabilitySerializer** | `bookings/serializer.py` | ✅ Existe | id, nanny, day, start_time, end_time, created_at |
| **NotificationSerializer** | `bookings/serializer.py` | ✅ Existe | id, message, is_read, created_at, user |
| **ReviewSerializer** | `reviews/serializer.py` | ✅ Existe | id, parent, nanny, rating, comment, created_at |
| **FavoriteSerializer** | `favorites/serializer.py` | ✅ Existe | id, nanny, nanny_id (write-only), created_at |
| **MessageSerializer** (Chat) | ❌ **NO EXISTE** | 🔴 Falta | — |

### Vistas (ViewSets y Generics) Existentes

| Vista | Ubicación | Método HTTP | Endpoint | Estado |
|-------|-----------|-------------|----------|--------|
| **NannyListView** | `nannies/views.py` | GET | `/api/nannies/` | ✅ Pública (sin auth) |
| **NannyDetailView** | `nannies/views.py` | GET | `/api/nannies/{id}/` | ✅ Pública (sin auth) |
| **BookingListCreateView** | `bookings/views.py` | GET, POST | `/api/bookings/` | ✅ Auth requerida |
| **BookingDetailView** | `bookings/views.py` | GET, PUT, PATCH, DELETE | `/api/bookings/{id}/` | ✅ Auth requerida |
| **accept_booking** (función) | `bookings/views.py` | POST | `/api/bookings/{id}/accept/` | ✅ Custom action |
| **reject_booking** (función) | `bookings/views.py` | POST | `/api/bookings/{id}/reject/` | ✅ Custom action |
| **cancel_booking** (función) | `bookings/views.py` | POST | `/api/bookings/{id}/cancel/` | ✅ Custom action |
| **complete_booking** (función) | `bookings/views.py` | POST | `/api/bookings/{id}/complete/` | ✅ Custom action |
| **AvailabilityListCreateView** | `bookings/views.py` | GET, POST | `/api/bookings/availabilities/` | ✅ Auth requerida (solo nanny) |
| **AvailabilityDetailView** | `bookings/views.py` | GET, PUT, PATCH, DELETE | `/api/bookings/availabilities/{id}/` | ✅ Auth requerida |
| **NotificationListView** | `bookings/views.py` | GET | `/api/bookings/notifications/` | ✅ Auth requerida |
| **NotificationDetailView** | `bookings/views.py` | GET, PUT, PATCH, DELETE | `/api/bookings/notifications/{id}/` | ✅ Auth requerida |
| **FavoriteListCreateView** | `favorites/views.py` | GET, POST | `/api/favorites/` | ✅ Auth requerida |
| **FavoriteDeleteView** | `favorites/views.py` | DELETE | `/api/favorites/{id}/` | ✅ Auth requerida |
| **ChatMessageListView** (Mensajes) | ❌ **NO EXISTE** | — | — | 🔴 Falta |

### Permisos Configurados

- **Públicas (AllowAny):** `/api/nannies/`, `/api/nannies/{id}/`
- **Autenticadas (IsAuthenticated):** `/api/bookings/`, `/api/favorites/`, `/api/bookings/notifications/`, `/api/bookings/availabilities/`
- **Globales (REST_FRAMEWORK):** La aplicación usa JWT para autenticación

---

## 📱 ESTADO ACTUAL DEL FRONTEND

### Vistas (React Components) Existentes

| Ruta | Componente | Ubicación | Estado | Descripción |
|------|-----------|-----------|--------|------------|
| `/` | `Landing` | `src/views/Landing.jsx` | ✅ Existe | Página de inicio |
| `/login/` | `Login` | `src/views/auth/Login.jsx` | ✅ Existe | Formulario de login |
| `/register/` | `Register` | `src/views/auth/Register.jsx` | ✅ Existe | Formulario de registro |
| `/verify/:uid/:token/` | `Verify` | `src/views/auth/Verify.jsx` | ✅ Existe | Verificación de email |
| `/dashboard/` | `DashboardUser` | `src/views/dashboard/DashboardUser.jsx` | ✅ Existe | Dashboard del usuario |
| `/catalog/` | `Catalog` | `src/views/Catalog.jsx` | ✅ Existe | Catálogo de niñeras |
| `/favorites/` | `FavoriteList` | `src/views/FavoriteList.jsx` | ✅ Existe | Lista de favoritos |
| `/bookings/` | `MyBookings` | `src/views/MyBookings.jsx` | ✅ Existe | Mis reservas |
| `/bookings/create/:nannyId` | `BookingCreate` | `src/views/BookingCreate.jsx` | ✅ Existe | Crear reserva |
| `/nannies/:id` | **NannyDetail** | ❌ **NO EXISTE** | 🔴 Falta | Detalle de niñera |
| `/bookings/:id` | **BookingDetail** | ❌ **NO EXISTE** | 🔴 Falta | Detalle de reserva |
| `/bookings/:id/chat` | **ChatWindow** | ❌ **NO EXISTE** | 🔴 Falta | Chat 1:1 con niñera |

### Clientes API Existentes

| Cliente | Ubicación | Funciones |
|---------|-----------|-----------|
| **nannyApi.js** | `src/api/nannyApi.js` | `getNannies()`, `getNannyById()` |
| **bookingApi.js** | `src/api/bookingApi.js` | `getBookings()`, `createBooking()`, `updateBooking()`, `deleteBooking()`, `acceptBooking()`, `rejectBooking()`, `cancelBooking()`, `completeBooking()` |
| **availabilityApi.js** | `src/api/availabilityApi.js` | `getAvailabilities()`, `createAvailability()`, `updateAvailability()`, `deleteAvailability()` |
| **favoriteApi.js** | `src/api/favoriteApi.js` | `getFavorites()`, `addFavorite()`, `deleteFavorite()` |
| **userApi.js** | `src/api/userApi.js` | `login()`, `register()`, `verify()`, `logout()`, `getProfile()` |
| **messageApi.js** (Chat) | ❌ **NO EXISTE** | 🔴 Falta |

### Componentes Presentacionales Existentes

| Componente | Ubicación | Propósito |
|-----------|-----------|----------|
| **NannyCard** | `src/components/nanny/NannyCard.jsx` | Tarjeta resumen de niñera |
| **NannyFilters** | `src/components/nanny/NannyFilters.jsx` | Filtros de búsqueda |
| **NannyCatalog** | `src/components/nanny/NannyCatalog.jsx` | Grid de niñeras |
| **AvailabilityCalendar** | `src/components/bookings/AvailabilityCalendar.jsx` | Calendario de disponibilidad |
| **BookingCard** | `src/components/bookings/BookingCard.jsx` | Tarjeta de reserva |
| **FavoriteCard** | `src/components/favorites/FavoriteCard.jsx` | Tarjeta de favorito |
| **AlertToast** | `src/components/layout/AlertToast.jsx` | Notificación emergente |
| **HeaderLanding** | `src/components/layout/HeaderLanding.jsx` | Header |
| **Footer** | `src/components/layout/Footer.jsx` | Footer |
| **Loader** | `src/components/layout/Loader.jsx` | Spinner |

---

## 🔴 GAPS Y REQUERIMIENTOS FALTANTES

### NUEVAS PRIORIDADES: VISTAS PARA ROL NIÑERA

#### F5: Gestionar Disponibilidad (`AvailabilityManagement.jsx`)
- **Ubicación:** Dashboard Niñera
- **Backend:** ✅ Endpoints GET/POST/PUT/DELETE `/api/bookings/availabilities/` YA EXISTEN
- **Frontend:** 🔴 Componente falta
- **Funcionalidad:**
  - Listar slots de disponibilidad del mes/año
  - Crear nuevas franjas disponibles
  - Editar/eliminar franjas existentes
  - Calendario visual con disponibilidades

**Archivos:**
| Archivo | Acción |
|---------|--------|
| `frontend_nannies/src/views/AvailabilityManagement.jsx` | **Crear** |
| `frontend_nannies/src/components/availability/AvailabilityForm.jsx` | **Crear** |
| `frontend_nannies/src/components/availability/AvailabilityCalendar.jsx` | **Crear** |
| `frontend_nannies/src/router/AppRouter.jsx` | **Modificar** (agregar ruta) |

---

#### F7: Solicitudes Pendientes (`NannyRequests.jsx`)
- **Ubicación:** Dashboard Niñera
- **Backend:** ✅ Endpoint GET `/api/bookings/` filtrado por `nanny` YA EXISTE
- **Frontend:** 🔴 Componente falta (necesita lógica para filtrar `status=pending`)
- **Funcionalidad:**
  - Listar reservas recibidas con `status='pending'`
  - Botones Aceptar / Rechazar
  - Información de parent: nombre, email, teléfono
  - Detalles: fecha, hora, duración, lugar
  - Notificación cuando llega nueva solicitud

**Archivos:**
| Archivo | Acción |
|---------|--------|
| `frontend_nannies/src/views/NannyRequests.jsx` | **Crear** |
| `frontend_nannies/src/components/bookings/RequestCard.jsx` | **Crear** |
| `frontend_nannies/src/router/AppRouter.jsx` | **Modificar** (agregar ruta) |

---

#### F11: Historial de Reservas Niñera (`NannyBookingHistory.jsx`)
- **Ubicación:** Dashboard Niñera (o pestaña en MyBookings)
- **Backend:** ✅ Endpoint GET `/api/bookings/` con filtros YA EXISTE
- **Frontend:** 🔴 Componente falta (variante niñera de MyBookings)
- **Funcionalidad:**
  - Listar todas las reservas de la niñera (recibidas)
  - Filtrar por estado (pending, confirmed, completed, cancelled, rejected)
  - Mostrar: parent, fecha, hora, estado, rating recibido
  - Link a detalle de reserva
  - Estadísticas: reservas totales, completadas, ingresos

**Archivos:**
| Archivo | Acción |
|---------|--------|
| `frontend_nannies/src/views/NannyBookingHistory.jsx` | **Crear** |
| `frontend_nannies/src/components/bookings/NannyBookingCard.jsx` | **Crear** |
| `frontend_nannies/src/router/AppRouter.jsx` | **Modificar** (agregar ruta) |

---

#### F16: Chat Niñera (`ChatNanny.jsx`)
- **Ubicación:** Accesible desde NannyRequests, NannyBookingHistory, BookingDetail
- **Backend:** 🔴 Modelo `Message` y endpoints FALTA
- **Frontend:** 🔴 Componente falta
- **Funcionalidad:**
  - Chat 1:1 con cada parent
  - Ver conversaciones históricas por booking
  - Notificaciones de nuevo mensaje

**Archivos:** (Ver sección F3 Chat Usuario - es compartido)

---

### PRIORIDADES ORIGINALES (Rol Padre)

### 1. Vista: Detalle de Niñera (`NannyDetail`)

#### Backend
- ✅ Endpoint GET `/api/nannies/{id}/` **YA EXISTE**
- ✅ Serializer `NannyProfileSerializer` incluye `reviews` via `SerializerMethodField`
- ⚠️ **Falta:** `availability` en serializer de NannyProfile (agregada al endpoint pero requiere serializer)

#### Frontend
- 🔴 **Componente:** No existe `src/views/NannyDetail.jsx`
- 🔴 **Ruta:** No existe en `AppRouter.jsx` (agregar `/nannies/:id`)
- 🔴 **Componentes child:** Faltan `ReviewList.jsx`, `AvailabilityListView.jsx` (presentacionales)

#### Funcionalidad esperada
- Mostrar perfil completo de niñera
- Listar reseñas con puntuación y comentarios
- Mostrar calendarios de disponibilidad próxima
- Botón "Reservar" que lleva a `BookingCreate`
- Botón favorito (add/remove)

#### Archivos a crear/modificar
| Archivo | Acción | Prioridad |
|---------|--------|-----------|
| `frontend_nannies/src/views/NannyDetail.jsx` | **Crear** | 🔴 Alta |
| `frontend_nannies/src/components/nanny/NannyProfileDetail.jsx` | **Crear** | 🔴 Alta |
| `frontend_nannies/src/components/reviews/ReviewList.jsx` | **Crear** | 🟡 Media |
| `frontend_nannies/src/components/bookings/AvailabilityListView.jsx` | **Crear** | 🟡 Media |
| `frontend_nannies/src/router/AppRouter.jsx` | **Modificar** | 🔴 Alta |
| `Back_Django_REST/nannies/serializer.py` | **Modificar** | 🟢 Baja (opcional) |

---

### 2. Vista: Detalle de Reserva (`BookingDetail`)

#### Backend
- ✅ Endpoint GET `/api/bookings/{id}/` **YA EXISTE** (BookingDetailView)
- ✅ Endpoints de acción: accept, reject, cancel, complete **YA EXISTEN**
- ⚠️ **Falta:** Endpoint PATCH/PUT para modificar hora/lugar con validación
- 🔴 **Falta:** Modelo `Message` para chat y endpoints relacionados

#### Frontend
- 🔴 **Componente:** No existe `src/views/BookingDetail.jsx`
- 🔴 **Ruta:** No existe en `AppRouter.jsx` (agregar `/bookings/:id`)
- 🔴 **Cliente API:** Faltan funciones `updateBookingTime()`, `getMessages()`, `sendMessage()` en clients

#### Funcionalidad esperada
- Mostrar detalles completos de la reserva (parent, nanny, horas, estado)
- Chat embebido con la otra parte (nanny o parent)
- Acciones según rol y estado:
  - Parent: cambiar hora/lugar (request), cancelar, ver estado
  - Nanny: aceptar, rechazar, completar, responder chat
- Notificaciones de cambios de estado
- Historial de modificaciones

#### Archivos a crear/modificar
| Archivo | Acción | Prioridad |
|---------|--------|-----------|
| `frontend_nannies/src/views/BookingDetail.jsx` | **Crear** | 🔴 Alta |
| `frontend_nannies/src/components/bookings/BookingStatusBadge.jsx` | **Crear** | 🟡 Media |
| `frontend_nannies/src/components/bookings/BookingActions.jsx` | **Crear** | 🔴 Alta |
| `frontend_nannies/src/api/bookingApi.js` | **Modificar** | 🟡 Media |
| `frontend_nannies/src/router/AppRouter.jsx` | **Modificar** | 🔴 Alta |
| `Back_Django_REST/bookings/views.py` | **Modificar** | 🟡 Media (agregar validación PATCH) |
| `Back_Django_REST/bookings/serializer.py` | **Modificar** | 🟡 Media |

---

### 3. Vista: Chat Usuario 1:1 (`ChatUsuario`)

#### Backend
- 🔴 **Modelo:** `Message` no existe → **CREAR**
- 🔴 **Serializer:** `MessageSerializer` no existe → **CREAR**
- 🔴 **Vistas:** Endpoints para GET mensajes y POST nuevo mensaje → **CREAR**
- 🔴 **Decisión arquitectónica:** WebSocket (real-time via Django Channels) vs. REST polling

#### Opciones de implementación

**Opción A: REST Polling (Recomendada para MVP)**
- Simpler, no requiere infraestructura adicional
- Fronted hace GET cada N segundos
- Backend: GET `/api/bookings/{id}/messages/` y POST `/api/bookings/{id}/messages/`
- Latencia ~2-5s, adecuado para MVP

**Opción B: WebSocket (Producción)**
- Real-time, mejor UX
- Requiere Django Channels + redis broker
- Más complejo, pero escalable
- Latencia ~100-500ms

#### Frontend (para Opción A)
- 🔴 **Componente:** `src/components/chat/ChatWindow.jsx`
- 🔴 **Hook:** Custom hook para polling de mensajes
- 🔴 **Cliente API:** `messageApi.js` con `getMessages()`, `sendMessage()`

#### Archivos a crear/modificar
| Archivo | Acción | Prioridad | Nota |
|---------|--------|-----------|------|
| `Back_Django_REST/bookings/models.py` | **Modificar** | 🔴 Alta | Agregar modelo Message |
| `Back_Django_REST/bookings/serializer.py` | **Modificar** | 🔴 Alta | Agregar MessageSerializer |
| `Back_Django_REST/bookings/views.py` | **Crear** | 🔴 Alta | Agregar vistas MessageListCreate, MessageDetail |
| `Back_Django_REST/bookings/urls.py` | **Modificar** | 🔴 Alta | Agregar rutas de mensajes |
| `frontend_nannies/src/api/messageApi.js` | **Crear** | 🔴 Alta | Cliente para mensajes |
| `frontend_nannies/src/components/chat/ChatWindow.jsx` | **Crear** | 🔴 Alta | UI del chat |
| `frontend_nannies/src/components/chat/MessageBubble.jsx` | **Crear** | 🟡 Media | Componente presentacional |
| `frontend_nannies/src/router/AppRouter.jsx` | **Modificar** | 🔴 Alta | Agregar ruta (o embeber en BookingDetail) |

---

---

### NUEVAS PRIORIDADES: VISTAS PARA ROL ADMIN (F8, F9, F10, F11)

#### F8: Dashboard Admin (`DashboardAdmin.jsx`)
- **Ubicación:** `/admin/` 
- **Backend:** 🔴 Nuevos endpoints necesarios
- **Frontend:** 🔴 Componente falta
- **Funcionalidad:**
  - Métricas: total usuarios, niñeras verificadas, reservas completadas, ingresos estimados
  - Gráficos: bookings por mes, usuarios nuevos, rating promedio
  - Actividad reciente: últimos registros, reservas, reviews
  - KPIs: tasa de conversión, satisfaction score, active nannies

**Backend endpoints a crear:**
```
GET /api/admin/stats/
  └─ Respuesta: {
       total_users: int,
       total_nannies_verified: int,
       total_bookings: int,
       total_reviews: int,
       avg_rating: float,
       revenue_estimated: float,
       active_last_week: int
     }

GET /api/admin/activity/?limit=10
  └─ Respuesta: [
       { type: "user_registered", user: {...}, created_at: datetime },
       { type: "booking_completed", booking: {...}, completed_at: datetime },
       { type: "nanny_verified", nanny: {...}, verified_at: datetime },
       ...
     ]
```

**Archivos:**
| Archivo | Acción |
|---------|--------|
| `frontend_nannies/src/views/admin/DashboardAdmin.jsx` | **Crear** |
| `frontend_nannies/src/components/admin/MetricsCard.jsx` | **Crear** |
| `frontend_nannies/src/components/admin/ActivityFeed.jsx` | **Crear** |
| `frontend_nannies/src/api/adminApi.js` | **Crear** |
| `Back_Django_REST/admin_api/views.py` | **Crear** (new app) |

---

#### F9: Gestión de Usuarios (`AdminUsersList.jsx`)
- **Ubicación:** `/admin/users/`
- **Backend:** 🔴 Nuevos endpoints necesarios
- **Frontend:** 🔴 Componente falta
- **Funcionalidad:**
  - Tabla con usuarios (id, email, nombre, rol, estado, fecha registro)
  - Búsqueda por email/nombre
  - Filtros: rol (padre, niñera, admin), estado (activo, bloqueado, no verificado)
  - Acciones por usuario: cambiar rol, verificar, bloquear, eliminar
  - Paginación
  - Bulk actions: cambiar rol múltiples, bloquear múltiples

**Backend endpoints a crear:**
```
GET /api/admin/users/?role=parent&verified=true&page=1
  └─ Respuesta: [
       { id, username, email, role, is_verified, is_active, created_at, last_login },
       ...
     ]

PATCH /api/admin/users/{id}/
  └─ Request: { role: "admin", is_active: false, is_verified: true }
  └─ Respuesta: usuario actualizado

DELETE /api/admin/users/{id}/
  └─ Respuesta: { success: true }
```

**Archivos:**
| Archivo | Acción |
|---------|--------|
| `frontend_nannies/src/views/admin/AdminUsersList.jsx` | **Crear** |
| `frontend_nannies/src/components/admin/UserRow.jsx` | **Crear** |
| `frontend_nannies/src/components/admin/UserFilters.jsx` | **Crear** |
| `Back_Django_REST/admin_api/views.py` | **Modificar** (agregar UserListView) |

---

#### F10: Gestión de Niñeras (`AdminNanniesList.jsx`)
- **Ubicación:** `/admin/nannies/`
- **Backend:** 🔴 Nuevos endpoints necesarios
- **Frontend:** 🔴 Componente falta
- **Funcionalidad:**
  - Tabla con perfiles de niñeras (nombre, email, rating, estado verificación, reviews)
  - Búsqueda por nombre/email
  - Filtros: verificada (si/no), rating mín/máx, experiencia mín/máx
  - Acciones: ver perfil, verificar, bloquear, eliminar
  - Ver reviews recibidas, historial de bookings
  - Aprobar/rechazar solicitudes de verificación

**Backend endpoints a crear:**
```
GET /api/admin/nannies/?verified=true&min_rating=3.5&page=1
  └─ Respuesta: [
       { id, user: {...}, experience_years, hourly_rate, verified, rating_avg, 
         bookings_count, reviews_count },
       ...
     ]

GET /api/admin/nannies/{id}/
  └─ Respuesta: perfil completo + reviews + bookings

PATCH /api/admin/nannies/{id}/
  └─ Request: { verified: true, is_active: true }
  └─ Respuesta: nanny actualizada

DELETE /api/admin/nannies/{id}/
  └─ Respuesta: { success: true }
```

**Archivos:**
| Archivo | Acción |
|---------|--------|
| `frontend_nannies/src/views/admin/AdminNanniesList.jsx` | **Crear** |
| `frontend_nannies/src/components/admin/NannyRow.jsx` | **Crear** |
| `frontend_nannies/src/components/admin/NannyFilters.jsx` | **Crear** |
| `Back_Django_REST/admin_api/views.py` | **Modificar** (agregar NannyListView) |

---

#### F11: Moderación de Reseñas (`AdminReviewsList.jsx` - Opcional pero recomendado)
- **Ubicación:** `/admin/reviews/`
- **Backend:** 🔴 Nuevos endpoints necesarios
- **Frontend:** 🔴 Componente falta
- **Funcionalidad:**
  - Tabla con reviews (id, author, nanny, rating, texto preview, estado, fecha)
  - Búsqueda por contenido
  - Filtros: rating, reportado, bloqueado, verificado
  - Acciones: ver completo, aprobar, rechazar, eliminar
  - Flag/unflag como inapropiada
  - Ver detalles de booking asociado

**Backend endpoints a crear:**
```
GET /api/admin/reviews/?flagged=true&page=1
  └─ Respuesta: [
       { id, parent: {...}, nanny: {...}, rating, comment, is_flagged, 
         created_at },
       ...
     ]

PATCH /api/admin/reviews/{id}/
  └─ Request: { is_flagged: true, status: "approved|rejected|deleted" }
  └─ Respuesta: review actualizada

DELETE /api/admin/reviews/{id}/
  └─ Respuesta: { success: true }
```

**Archivos:**
| Archivo | Acción |
|---------|--------|
| `frontend_nannies/src/views/admin/AdminReviewsList.jsx` | **Crear** |
| `frontend_nannies/src/components/admin/ReviewRow.jsx` | **Crear** |
| `Back_Django_REST/admin_api/views.py` | **Modificar** (agregar ReviewListView) |

---

#### Admin UI: Router y Sidebar
- **Ubicación:** Accesible solo para role=admin
- **Funcionalidad:**
  - Sidebar con navegación: Dashboard, Usuarios, Niñeras, Reviews
  - Verificación de permisos en rutas: redirigir si no es admin
  - Breadcrumbs
  - Logout para admin

**Archivos:**
| Archivo | Acción |
|---------|--------|
| `frontend_nannies/src/components/admin/AdminLayout.jsx` | **Crear** |
| `frontend_nannies/src/components/admin/AdminSidebar.jsx` | **Crear** |
| `frontend_nannies/src/router/AppRouter.jsx` | **Modificar** (agregar rutas admin) |

---

### BACKEND: NUEVA APP `admin_api`

**Crear app:**
```bash
python manage.py startapp admin_api
```

**Archivos backend:**
```
Back_Django_REST/admin_api/__init__.py (NEW)
Back_Django_REST/admin_api/admin.py (NEW)
Back_Django_REST/admin_api/apps.py (NEW)
Back_Django_REST/admin_api/models.py (NEW - puede estar vacío, hereda de users/bookings)
Back_Django_REST/admin_api/serializers.py (NEW)
  └─ AdminUserSerializer, AdminNannySerializer, AdminReviewSerializer
  └─ AdminStatsSerializer, AdminActivitySerializer

Back_Django_REST/admin_api/views.py (NEW)
  └─ AdminStatsView (GET stats)
  └─ AdminActivityView (GET activity feed)
  └─ AdminUserListView (GET/PATCH users)
  └─ AdminNannyListView (GET/PATCH nannies)
  └─ AdminReviewListView (GET/PATCH/DELETE reviews)
  └─ Permisos: IsAuthenticated + IsAdminUser

Back_Django_REST/admin_api/urls.py (NEW)
  └─ Rutas: /api/admin/stats/, /api/admin/activity/, /api/admin/users/, etc.

Back_Django_REST/admin_api/permissions.py (NEW)
  └─ Custom permission: IsAdminUser (verifica role=admin)

Back_Django_REST/django_crud_api/settings.py (MODIFY)
  └─ Agregar 'admin_api' a INSTALLED_APPS

Back_Django_REST/django_crud_api/urls.py (MODIFY)
  └─ Incluir urls de admin_api: path('api/admin/', include('admin_api.urls'))
```

---

### FASE 0: DASHBOARD NIÑERA (URGENTE)

#### Frontend - F5: Gestionar Disponibilidad
```
frontend_nannies/src/views/AvailabilityManagement.jsx (NEW)
  └─ Fetch GET /api/bookings/availabilities/?nanny=<id>
  └─ Listar slots en calendario
  └─ Acciones: crear, editar, eliminar
  └─ Estados: loading, error, success

frontend_nannies/src/components/availability/AvailabilityForm.jsx (NEW)
  └─ Form: day (DateInput), start_time, end_time
  └─ Validación: start < end, sin overlaps
  └─ Submit: POST /api/bookings/availabilities/

frontend_nannies/src/components/availability/AvailabilityCalendar.jsx (NEW or REUSE)
  └─ Mostrar calendar con disponibilidades
  └─ Si existe reutilizar; si no, crear con react-calendar

frontend_nannies/src/api/availabilityApi.js (REVIEW/MODIFY)
  └─ Verificar: getAvailabilities(), createAvailability(), updateAvailability(), deleteAvailability()
```

#### Frontend - F7: Solicitudes Pendientes
```
frontend_nannies/src/views/NannyRequests.jsx (NEW)
  └─ Fetch GET /api/bookings/?status=pending&nanny=<id>
  └─ Mostrar lista de RequestCards
  └─ Refetch cada 5s o auto-reload

frontend_nannies/src/components/bookings/RequestCard.jsx (NEW)
  └─ Mostrar: parent name, date, time, duration, location
  └─ Botones: Accept (POST /bookings/{id}/accept/), Reject
  └─ Estado: loading durante acción
```

#### Frontend - F11: Historial Reservas Niñera
```
frontend_nannies/src/views/NannyBookingHistory.jsx (NEW)
  └─ Fetch GET /api/bookings/ (filtrado automáticamente por backend para nanny)
  └─ Listar NannyBookingCards
  └─ Filtros: estado, fecha

frontend_nannies/src/components/bookings/NannyBookingCard.jsx (NEW)
  └─ Mostrar: parent, date, status, rating
  └─ Link a /bookings/:id
  └─ Badge de estado (pending, confirmed, completed, etc.)
```

#### Frontend - Router
```
frontend_nannies/src/router/AppRouter.jsx (MODIFY)
  └─ Agregar: <Route path="/availability" element={<AvailabilityManagement />} />
  └─ Agregar: <Route path="/requests" element={<NannyRequests />} />
  └─ Agregar: <Route path="/history" element={<NannyBookingHistory />} />
  └─ Verificar: routing condicional por rol (solo nanny)
```

#### Frontend - Dashboard
```
frontend_nannies/src/views/dashboard/DashboardNanny.jsx (MODIFY if exists)
  └─ Agregar: links a /availability, /requests, /history
  └─ Mostrar: resumen de disponibilidades, solicitudes pending, reservas próximas
```

---

### FASE 1: CHAT BACKEND

#### Backend
```
Back_Django_REST/bookings/models.py (MODIFY)
  └─ Agregar: class Message
     - booking FK (o conversation FK)
     - sender FK User
     - text TextField
     - created_at DateTimeField(auto_now_add)
     - is_read BooleanField(default=False)
     - Permisos: solo sender y receiver de booking pueden acceder

Back_Django_REST/bookings/serializer.py (MODIFY)
  └─ Agregar: MessageSerializer
     - campos: id, booking, sender, text, created_at, is_read
     - read_only: sender (tomar de request.user), created_at

Back_Django_REST/bookings/views.py (MODIFY)
  └─ Agregar: MessageListCreateView(ListCreateAPIView)
     - GET /api/bookings/{booking_id}/messages/
     - POST /api/bookings/{booking_id}/messages/
     - Permisos: IsAuthenticated + validar que user es parent o nanny
  
  └─ Agregar: MessageDetailView(RetrieveUpdateDestroyAPIView)
     - GET /api/bookings/{booking_id}/messages/{msg_id}/
     - PATCH /api/bookings/{booking_id}/messages/{msg_id}/ (marcar read)
     - DELETE

Back_Django_REST/bookings/urls.py (MODIFY)
  └─ Agregar paths para MessageListCreateView, MessageDetailView
```

#### Migraciones
```
Back_Django_REST/bookings/migrations/
  └─ Crear: python manage.py makemigrations
  └─ Aplicar: python manage.py migrate
```

---

### FASE 2: CHAT FRONTEND

```
frontend_nannies/src/api/messageApi.js (NEW)
  └─ getMessages(bookingId, page=1)
  └─ sendMessage(bookingId, text)
  └─ markMessageRead(messageId)
  └─ deleteMessage(messageId)

frontend_nannies/src/components/chat/ChatWindow.jsx (NEW)
  └─ Hook: useMessages(bookingId) → polling cada 2s
  └─ Mostrar: lista de MessageBubbles
  └─ Input: enviar mensaje
  └─ Auto-scroll al bottom al llegar mensaje nuevo

frontend_nannies/src/components/chat/MessageBubble.jsx (NEW)
  └─ Props: sender, text, created_at
  └─ Estilos: bubble izquierda (receiver) vs derecha (current user)

frontend_nannies/src/views/BookingDetail.jsx (CREATE)
  └─ Embeber ChatWindow al final
  └─ O crear ruta separada /bookings/:id/chat
```

---

### FASE 3: VISTAS PADRE

```
frontend_nannies/src/views/NannyDetail.jsx (NEW)
  └─ Fetch GET /api/nannies/:id
  └─ Mostrar: perfil, reviews, disponibilidades
  └─ Botón: Reservar, Favorito

frontend_nannies/src/components/nanny/NannyProfileDetail.jsx (NEW)
  └─ Props: nanny (object)
  └─ Mostrar: foto, name, bio, experiencia, tarifa, etc.

frontend_nannies/src/components/reviews/ReviewList.jsx (NEW)
  └─ Props: reviews (array)
  └─ Mostrar: lista de reviews con star rating

frontend_nannies/src/components/bookings/AvailabilityListView.jsx (NEW)
  └─ Props: nannyId
  └─ Mostrar: slots disponibles próximas
  └─ Diferente a AvailabilityCalendar (lectura vs gestión)

frontend_nannies/src/views/BookingDetail.jsx (NEW)
  └─ Fetch GET /api/bookings/:id
  └─ Mostrar: parent, nanny, estado, acciones
  └─ Embeber ChatWindow
  └─ Botones: accept/reject/cancel/complete (según rol)
```

---

## 📋 LISTA CONSOLIDADA DE ARCHIVOS POR CREAR/MODIFICAR (ORIGINAL)

### Backend

#### Nuevos Modelos y Serializers
```
Back_Django_REST/bookings/models.py
  └─ Añadir: class Message (conversation field, sender, text, created_at, is_read)

Back_Django_REST/bookings/serializer.py
  └─ Añadir: MessageSerializer (lectura/escritura con autor)
  └─ Modificar: BookingSerializer (agregar endpoint modify_time/place si es necesario)
```

#### Nuevas Vistas
```
Back_Django_REST/bookings/views.py
  └─ Añadir: MessageListCreateView (GET/POST messages para booking)
  └─ Añadir: MessageDetailView (GET single, PATCH read status, DELETE)
  └─ Modificar: BookingDetailView (POST action para modify_time si se requiere)
```

#### Rutas
```
Back_Django_REST/bookings/urls.py
  └─ Añadir: path('bookings/<int:pk>/messages/', MessageListCreateView)
  └─ Añadir: path('bookings/<int:pk>/messages/<int:msg_id>/', MessageDetailView)
```

#### Opcional: Mejoras en Serializers
```
Back_Django_REST/nannies/serializer.py
  └─ Añadir: availability (SerializerMethodField) en NannyProfileSerializer (para detalle)
```

### Frontend

#### Nuevas Vistas
```
frontend_nannies/src/views/NannyDetail.jsx
  └─ Componente principal que:
     - Fetch GET /api/nannies/:id
     - Mostrar NannyProfileDetail
     - Mostrar ReviewList
     - Mostrar AvailabilityListView
     - Botón Reservar y Favorito

frontend_nannies/src/views/BookingDetail.jsx
  └─ Componente principal que:
     - Fetch GET /api/bookings/:id
     - Mostrar BookingStatusBadge
     - Mostrar BookingActions (según rol/estado)
     - Embeber ChatWindow
```

#### Nuevos Componentes Presentacionales
```
frontend_nannies/src/components/nanny/NannyProfileDetail.jsx
  └─ Mostrar: perfil completo, fotos, certificaciones, estadísticas

frontend_nannies/src/components/reviews/ReviewList.jsx
  └─ Mostrar: lista de reviews con puntuación, autor, comentario

frontend_nannies/src/components/bookings/AvailabilityListView.jsx
  └─ Mostrar: calendario con franjas disponibles de la niñera

frontend_nannies/src/components/bookings/BookingStatusBadge.jsx
  └─ Mostrar: badge de estado (pending, confirmed, cancelled, etc.)

frontend_nannies/src/components/bookings/BookingActions.jsx
  └─ Botones de acciones: accept, reject, cancel, complete, modify

frontend_nannies/src/components/chat/ChatWindow.jsx
  └─ Componente de chat (polling REST)
  └─ Mostrar: mensajes, input, send button

frontend_nannies/src/components/chat/MessageBubble.jsx
  └─ Componente presentacional para un mensaje
```

#### Clientes API
```
frontend_nannies/src/api/messageApi.js
  └─ Nuevas funciones:
     - getMessages(bookingId)
     - sendMessage(bookingId, text)
     - markMessageRead(messageId)
     - deleteMessage(messageId)

frontend_nannies/src/api/bookingApi.js
  └─ Modificar: agregar updateBookingTime(), updateBookingPlace() si es necesario
```

#### Router
```
frontend_nannies/src/router/AppRouter.jsx
  └─ Añadir: <Route path="/nannies/:id" element={<NannyDetail />} />
  └─ Añadir: <Route path="/bookings/:id" element={<BookingDetail />} />
  └─ Modificar: Catalog component para link a /nannies/:id
```

---

## 🎯 PLAN DE IMPLEMENTACIÓN RECOMENDADO

### **PRIORIDADES POR ROL**

#### 1️⃣ PRIORIDAD MÁXIMA: Vistas Niñera (F5, F7, F11, F16)
**Justificación:** El dashboard niñera es crítico para el MVP; requiere tan poco backend nuevo que es low-risk.

**Fase 0: Dashboard Niñera Core (URGENTE)**
**Tiempo estimado:** 4-5 horas total  
**Por qué ahora:** Endpoints backend ya existen; solo falta frontend

**0a) Gestionar Disponibilidad (F5)** — 1.5h
- Crear `AvailabilityManagement.jsx` + componentes
- Listar/crear/editar franjas en calendario
- Validaciones: no solapamientos, horas futuras
- Feedback: toast alerts para éxito/error

**0b) Solicitudes Pendientes (F7)** — 1.5h
- Crear `NannyRequests.jsx` (filtrar bookings status=pending)
- Crear `RequestCard.jsx` con botones Accept/Reject
- Refetch automático cada 5s o al aceptar/rechazar
- Toast con notificación

**0c) Historial de Reservas (F11)** — 1.5h
- Crear `NannyBookingHistory.jsx` (filtrar bookings nanny=current_user)
- Crear `NannyBookingCard.jsx` con info completa
- Filtros: estado, mes, año
- Link a detalle (BookingDetail)

**0d) Actualizar Router** — 0.5h
- Agregar rutas `/availability/`, `/requests/`, `/history/`
- Enlazar desde DashboardNanny

---

#### 2️⃣ PRIORIDAD ALTA: Vistas Admin (F8, F9, F10, F11 opcional)
**Justificación:** Crítico para gestionar usuarios y moderar contenido; soporte y escalabilidad del producto.
**Backend existente:** ✅ Django admin está disponible, pero no es accesible desde React para usuarios comunes.
**Tiempo estimado:** 6-8 horas total (incluir backend API si es necesario)

**Fase 1a: Dashboard Admin (F8)** — 2h
- Crear `DashboardAdmin.jsx` 
- Componentes: MetricsCard, ActivityChart
- Datos necesarios (nuevos endpoints backend):
  - GET `/api/admin/stats/` → total users, nannies verified, bookings, revenue
  - GET `/api/admin/activity/` → últimas acciones (registros, bookings, reviews)
- Gráficos: bookings por mes, nannies activas, ingresos estimados

**Fase 1b: Gestión de Usuarios (F9)** — 2h
- Crear `AdminUsersList.jsx` con tabla de usuarios
- Crear `UserRow.jsx` con acciones inline
- Backend endpoints:
  - GET `/api/admin/users/` (listar con filtros: role, verified, active)
  - PATCH `/api/admin/users/<id>/` (cambiar rol, bloquear, verificar)
  - DELETE `/api/admin/users/<id>/` (eliminar)
- Permisos: solo admin puede ver/modificar
- Funcionalidades: búsqueda, filtros, bulk actions

**Fase 1c: Gestión de Niñeras (F10)** — 2h
- Crear `AdminNanniesList.jsx` con tabla de perfiles
- Crear `NannyRow.jsx` con acciones inline
- Backend endpoints:
  - GET `/api/admin/nannies/` (listar con filtros: verified, rating, etc.)
  - PATCH `/api/admin/nannies/<id>/` (verificar, bloquear, cambiar rating)
  - DELETE `/api/admin/nannies/<id>/` (eliminar perfil)
- Funcionalidades: revisar perfil, aprobar/rechazar verificación, ver reviews

**Fase 1d: Moderación de Reseñas (F11 - Opcional pero recomendado)** — 1.5h
- Crear `AdminReviewsList.jsx` con tabla de reviews
- Crear `ReviewRow.jsx` con acciones inline
- Backend endpoints:
  - GET `/api/admin/reviews/` (listar con filtros: rating, reported, etc.)
  - PATCH `/api/admin/reviews/<id>/` (cambiar estado, flagged)
  - DELETE `/api/admin/reviews/<id>/` (eliminar review inapropiada)
- Funcionalidades: ver review, marcar como apropiada/inapropiada, eliminar

**Fase 1e: Router y Sidebar Admin** — 0.5h
- Agregar rutas `/admin/`, `/admin/users/`, `/admin/nannies/`, `/admin/reviews/`
- Crear `AdminSidebar.jsx` con navegación
- Verificación de rol: solo admin puede acceder

---

#### 3️⃣ PRIORIDAD MEDIA: Chat (F16 - Compartido)
**Tiempo estimado:** 4-6 horas  
**Deps:** Puede hacerse en paralelo

---

#### 4️⃣ PRIORIDAD MEDIA-BAJA: Vistas Padre
**Tiempo estimado:** 2-3 horas cada una (NannyDetail, BookingDetail)

---

### Orden Sugerido (Gantt - Timeline Real)
```
SEMANA 1:
  Lunes:   
    Mañana:  Fase 0a + 0b (Availability + Requests Nanny)
    Tarde:   Fase 0c (NannyBookingHistory)
  
  Martes:  
    Mañana:  Fase 0d + Router nanny
    Tarde:   Fase 1a (Dashboard Admin)
  
  Miércoles:
    Mañana:  Fase 1b (Admin Users CRUD)
    Tarde:   Fase 1c (Admin Nannies CRUD)
  
  Jueves:  
    Mañana:  Fase 1d (Reviews moderation) + Fase 1e (Router/Sidebar Admin)
    Tarde:   Chat backend (Message model + serializers)
  
  Viernes:
    Mañana:  Chat frontend (ChatWindow + MessageBubble)
    Tarde:   Integración Chat en BookingDetail + testing

SEMANA 2:
  Lunes-Martes: NannyDetail + BookingDetail
  Miércoles-Jueves: Tests, bug fixes, optimizaciones
  Viernes: Review, deployment prep

TOTAL ESTIMADO: ~18-20 horas de desarrollo
```

---

## ✅ CHECKLIST DE VALIDACIÓN

### Backend
- [ ] Modelo `Message` con campos necesarios y permisos
- [ ] Serializer `MessageSerializer` con lectura/escritura
- [ ] Vistas `MessageListCreateView` y `MessageDetailView` con permisos IsAuthenticated
- [ ] Rutas configuradas en `bookings/urls.py`
- [ ] Migraciones creadas y aplicadas (`python manage.py makemigrations && python manage.py migrate`)
- [ ] Pruebas de endpoints con Postman/insomnia o tests unitarios

### Frontend
- [ ] Rutas actualizadas en `AppRouter.jsx`
- [ ] Componentes creados y importados correctamente
- [ ] Cliente API `messageApi.js` funcional
- [ ] Estados iniciales (loading, error, data) manejados
- [ ] Redirecciones 401 funcionan correctamente (interceptor existente)
- [ ] Chat polling actualiza automáticamente cada N segundos
- [ ] Responsive design (mobile-first)
- [ ] Pruebas e2e (navegar, enviar mensaje, verificar aparición)

---

## 📝 NOTAS TÉCNICAS

### Decisiones de Diseño
1. **Chat:** Se recomienda empezar con REST polling por simplicidad; WebSocket puede venir después.
2. **Timezones:** `Booking.start_time` y `end_time` son `DateTimeField` en UTC; frontend debe convertir a zona local del usuario.
3. **Permisos:** Usar `IsAuthenticated` y validación en serializer para asegurar que solo owner de conversation pueda acceder.
4. **Escalabilidad:** Agregar paginación en `MessageListCreateView` si hay muchos mensajes (usar `PageNumberPagination`).

### Consideraciones de Seguridad
- Validar que solo parent e nanny de una booking puedan acceder a sus mensajes
- Validar que modificaciones de `Booking` (e.g., cambiar hora) solo las haga el owner
- Rate limit en endpoints de mensajes si es necesario (para evitar spam)

### Mejoras Futuras (Post-MVP)
- WebSocket en lugar de polling (Django Channels + redis)
- Búsqueda de mensajes (full-text search)
- Marcación de "visto" automática al abrir chat
- Tipeo en tiempo real ("escribiendo...")
- Reacciones emoji a mensajes
- Notificaciones push cuando llega mensaje nuevo

---

## 🚀 SIGUIENTES PASOS

1. **Revisar este documento** con el equipo para validar prioridades
2. **Iniciar Fase 1** (Detalle de Niñera) para ganar momentum
3. **Crear PR** para cada fase con pruebas incluidas
4. **Integración contínua:** Asegurar que tests pasen antes de merge

---

**Documento generado:** 14/11/2025  
**Revisión técnica completada por:** Assistant (GitHub Copilot)  
**Estado:** ✅ LISTO PARA IMPLEMENTACIÓN
