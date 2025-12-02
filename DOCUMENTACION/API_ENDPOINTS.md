# Documentación API - Sistema Multi-rol y Endpoints

## 📍 Endpoints de Autenticación

### POST `/api/register/`
Registra un nuevo usuario en el sistema.

**Body:**
```json
{
  "username": "usuario123",
  "email": "usuario@example.com",
  "password": "password123",
  "role": "parent" // o "nanny"
}
```

**Response (201):**
```json
{
  "id": 1,
  "username": "usuario123",
  "email": "usuario@example.com",
  "role": "parent"
}
```

### POST `/api/login/`
Inicia sesión y obtiene tokens JWT.

**Body:**
```json
{
  "username": "usuario123",
  "password": "password123"
}
```

**Response (200):**
```json
{
  "access": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "user": {
    "id": 1,
    "username": "usuario123",
    "role": "parent"
  }
}
```

---

## 👥 Sistema Multi-rol (Fase 4 - NUEVO)

El sistema permite a los usuarios tener múltiples roles simultáneamente.

### GET `/api/users/user-roles/`
Obtiene todos los roles del usuario actual.

**Headers:**
```
Authorization: Bearer {access_token}
```

**Response (200):**
```json
{
  "username": "usuario123",
  "primary_role": "parent",
  "roles": [
    {
      "id": 1,
      "role": "parent",
      "is_active": true,
      "date_added": "2025-12-02T10:00:00Z"
    },
    {
      "id": 2,
      "role": "nanny",
      "is_active": false,
      "date_added": "2025-12-02T11:00:00Z"
    }
  ]
}
```

### POST `/api/users/add-role/`
Agrega un rol adicional al usuario.

**Headers:**
```
Authorization: Bearer {access_token}
```

**Body:**
```json
{
  "role": "nanny" // parent, nanny, o admin
}
```

**Response (201):**
```json
{
  "message": "Rol 'nanny' agregado exitosamente",
  "user_role": {
    "id": 2,
    "role": "nanny",
    "is_active": false,
    "date_added": "2025-12-02T11:00:00Z"
  }
}
```

**Errores:**
- `400`: El usuario ya tiene este rol
- `401`: No autenticado
- `403`: Sin permisos

### DELETE `/api/users/remove-role/`
Elimina un rol del usuario.

**Headers:**
```
Authorization: Bearer {access_token}
```

**Body:**
```json
{
  "role": "nanny"
}
```

**Response (200):**
```json
{
  "message": "Rol 'nanny' eliminado exitosamente"
}
```

**Errores:**
- `400`: No se puede eliminar el rol primario o el rol no existe
- `401`: No autenticado

### POST `/api/users/switch-role/`
Cambia el rol activo en la sesión actual.

**Headers:**
```
Authorization: Bearer {access_token}
```

**Body:**
```json
{
  "role": "nanny"
}
```

**Response (200):**
```json
{
  "message": "Rol activo cambiado a 'nanny'",
  "active_role": {
    "role": "nanny",
    "activated_at": "2025-12-02T12:00:00Z"
  }
}
```

**Errores:**
- `400`: El usuario no tiene este rol
- `401`: No autenticado

### GET `/api/users/active-role/`
Obtiene el rol activo actual.

**Headers:**
```
Authorization: Bearer {access_token}
```

**Response (200):**
```json
{
  "role": "parent",
  "activated_at": "2025-12-02T10:00:00Z"
}
```

**Response (404):** Si no hay rol activo
```json
{
  "detail": "No active role found"
}
```

---

## 📅 Endpoints de Reservas (Bookings)

### GET `/api/bookings/`
Lista todas las reservas del usuario.

**Query params:**
- `status`: pending, confirmed, completed, cancelled
- `date_from`: YYYY-MM-DD
- `date_to`: YYYY-MM-DD

**Response (200):**
```json
[
  {
    "id": 1,
    "parent": 2,
    "nanny": 3,
    "date": "2025-12-15",
    "start_time": "09:00:00",
    "end_time": "17:00:00",
    "status": "confirmed",
    "total_hours": 8,
    "total_price": 48000,
    "created_at": "2025-12-01T10:00:00Z"
  }
]
```

### POST `/api/bookings/`
Crea una nueva reserva.

**Body:**
```json
{
  "nanny": 3,
  "date": "2025-12-15",
  "start_time": "09:00:00",
  "end_time": "17:00:00",
  "notes": "Cuidar 2 niños"
}
```

**Response (201):**
```json
{
  "id": 1,
  "status": "pending",
  "total_hours": 8,
  "total_price": 48000,
  "notification_sent": true
}
```

### PATCH `/api/bookings/{id}/`
Actualiza el estado de una reserva.

**Body:**
```json
{
  "status": "confirmed" // o "cancelled", "completed"
}
```

**Response (200):**
```json
{
  "id": 1,
  "status": "confirmed",
  "updated_at": "2025-12-02T12:00:00Z"
}
```

---

## ⭐ Endpoints de Reseñas (Reviews)

### GET `/api/reviews/`
Lista reseñas (filtradas por usuario).

**Query params:**
- `nanny`: ID de la niñera
- `parent`: ID del padre
- `rating`: 1-5

**Response (200):**
```json
[
  {
    "id": 1,
    "parent": {
      "id": 2,
      "username": "padre_usuario"
    },
    "nanny": {
      "id": 3,
      "username": "nanny_usuario"
    },
    "rating": 5,
    "comment": "Excelente servicio",
    "created_at": "2025-12-01T15:00:00Z"
  }
]
```

### POST `/api/reviews/`
Crea una nueva reseña (requiere booking completado).

**Body:**
```json
{
  "nanny": 3,
  "rating": 5,
  "comment": "Excelente con los niños, muy profesional"
}
```

**Response (201):**
```json
{
  "id": 1,
  "rating": 5,
  "comment": "Excelente con los niños, muy profesional",
  "notifications_created": true,
  "nanny_rating_updated": true
}
```

**Errores:**
- `400`: Ya existe una reseña de este padre para esta niñera
- `400`: Rating debe estar entre 1 y 5
- `401`: No autenticado
- `403`: Solo padres pueden crear reseñas

---

## 🔔 Endpoints de Notificaciones

### GET `/api/notifications/`
Lista notificaciones del usuario.

**Query params:**
- `unread`: true/false
- `channel`: email, in_app, webhook, sms

**Response (200):**
```json
[
  {
    "id": 1,
    "subject": "Nueva reserva recibida",
    "message": "Padre Juan ha solicitado una reserva para el 15/12/2025",
    "channel": "in_app",
    "status": "sent",
    "read_at": null,
    "created_at": "2025-12-02T10:00:00Z"
  }
]
```

### PATCH `/api/notifications/{id}/mark-read/`
Marca una notificación como leída.

**Response (200):**
```json
{
  "id": 1,
  "status": "read",
  "read_at": "2025-12-02T12:00:00Z"
}
```

### POST `/api/notifications/mark-all-read/`
Marca todas las notificaciones como leídas.

**Response (200):**
```json
{
  "message": "15 notificaciones marcadas como leídas"
}
```

---

## 👤 Endpoints de Perfiles

### GET `/api/nannies/profile/`
Obtiene el perfil de niñera del usuario actual.

**Response (200):**
```json
{
  "id": 1,
  "user": {
    "id": 3,
    "username": "nanny_usuario",
    "email": "nanny@example.com"
  },
  "bio": "Niñera con 5 años de experiencia",
  "hourly_rate": 6000,
  "experience_years": 5,
  "rating_avg": 4.8,
  "profile_photo": "http://localhost:8000/media/profiles/nanny_photo.jpg",
  "available_days": ["monday", "wednesday", "friday"]
}
```

### PATCH `/api/nannies/profile/`
Actualiza el perfil de niñera (soporta multipart/form-data para foto).

**Body (multipart/form-data):**
```
bio: "Niñera certificada con 5 años de experiencia"
hourly_rate: 6500
profile_photo: [archivo de imagen]
```

**Response (200):**
```json
{
  "message": "Perfil actualizado exitosamente",
  "profile": {
    "bio": "Niñera certificada con 5 años de experiencia",
    "hourly_rate": 6500,
    "profile_photo": "http://localhost:8000/media/profiles/new_photo.jpg"
  }
}
```

### GET `/api/parents/profile/`
Obtiene el perfil de padre del usuario actual.

### PATCH `/api/parents/profile/`
Actualiza el perfil de padre (similar a niñera).

---

## 🎓 Endpoints de Validación Académica (OCR)

### POST `/api/academic/upload-document/`
Sube un documento para validación OCR.

**Body (multipart/form-data):**
```
document_type: "cedula" // o "diploma", "certificate"
file: [archivo PDF o imagen]
```

**Response (201):**
```json
{
  "id": 1,
  "status": "processing",
  "document_type": "cedula",
  "uploaded_at": "2025-12-02T10:00:00Z"
}
```

### GET `/api/academic/documents/`
Lista documentos subidos.

**Response (200):**
```json
[
  {
    "id": 1,
    "document_type": "cedula",
    "status": "approved",
    "rut_extracted": "12345678-9",
    "confidence_score": 0.95,
    "uploaded_at": "2025-12-02T10:00:00Z",
    "reviewed_at": "2025-12-02T10:30:00Z"
  }
]
```

---

## 📊 Códigos de Estado HTTP

| Código | Significado | Uso |
|--------|-------------|-----|
| 200 | OK | Solicitud exitosa |
| 201 | Created | Recurso creado exitosamente |
| 204 | No Content | Eliminación exitosa |
| 400 | Bad Request | Datos inválidos |
| 401 | Unauthorized | No autenticado |
| 403 | Forbidden | Sin permisos |
| 404 | Not Found | Recurso no encontrado |
| 500 | Server Error | Error interno del servidor |

---

## 🔐 Autenticación

Todos los endpoints (excepto `/register/` y `/login/`) requieren autenticación JWT.

**Header requerido:**
```
Authorization: Bearer {access_token}
```

**Renovar token:**
```
POST /api/token/refresh/
Body: {"refresh": "{refresh_token}"}
```

---

## 📝 Notas Importantes

1. **Notificaciones automáticas**: Las reservas y reseñas crean notificaciones automáticamente
2. **Validaciones**: Los campos numéricos tienen validadores personalizados (teléfono chileno, valores positivos)
3. **Permisos**: Roles específicos tienen acceso a endpoints específicos
4. **Rate limiting**: Implementado para prevenir abuso (100 req/hora)
5. **CORS**: Configurado para frontend en localhost:5173

---

## 🧪 Testing

Tests disponibles para todos los endpoints:
```bash
# Tests de validadores
python manage.py test core.tests

# Tests de integración
python manage.py test bookings.tests.BookingIntegrationTests
python manage.py test reviews.tests.ReviewIntegrationTests
```

Ver `PHASE_4_COMPLETED.md` para detalles de tests.
