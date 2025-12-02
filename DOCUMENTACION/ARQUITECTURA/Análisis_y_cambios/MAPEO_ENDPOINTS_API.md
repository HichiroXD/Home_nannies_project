# 🔌 MAPEO COMPLETO DE ENDPOINTS API

**Fecha:** 21 de noviembre de 2025  
**Versión:** 1.0  
**Base URL:** `http://localhost:8000/api/`

---

## 📋 ÍNDICE

1. [Auth Endpoints](#auth-endpoints)
2. [Users Endpoints](#users-endpoints)
3. [Nannies Endpoints](#nannies-endpoints)
4. [Bookings Endpoints](#bookings-endpoints)
5. [Favorites Endpoints](#favorites-endpoints)
6. [Reviews Endpoints](#reviews-endpoints)
7. [Notifications Endpoints](#notifications-endpoints)
8. [Availability Endpoints](#availability-endpoints)

---

## 🔐 Auth Endpoints

### Register User
```
POST /auth/register/
Content-Type: application/json

Request:
{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "SecurePass123!",
  "password2": "SecurePass123!",
  "role": "parent",  // "parent" | "nanny" | "admin"
  "full_name": "John Doe",
  "phone": "+1234567890"
}

Response 201:
{
  "id": 1,
  "username": "johndoe",
  "email": "john@example.com",
  "role": "parent",
  "full_name": "John Doe",
  "is_email_verified": false,
  "created_at": "2025-11-21T10:30:00Z"
}
```

### Verify Email
```
POST /auth/verify-email/
Content-Type: application/json

Request:
{
  "email": "john@example.com",
  "token": "abc123def456..."
}

Response 200:
{
  "message": "Email verificado correctamente",
  "user_id": 1
}
```

### Login
```
POST /auth/login/
Content-Type: application/json

Request:
{
  "email": "john@example.com",
  "password": "SecurePass123!"
}

Response 200:
{
  "access": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "user": {
    "id": 1,
    "username": "johndoe",
    "email": "john@example.com",
    "role": "parent"
  }
}

Error 401:
{
  "detail": "Invalid credentials"
}
```

### Refresh Token
```
POST /auth/token/refresh/
Content-Type: application/json

Request:
{
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}

Response 200:
{
  "access": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}
```

### Password Reset
```
POST /auth/password-reset/
Content-Type: application/json

Request:
{
  "email": "john@example.com"
}

Response 200:
{
  "message": "Email enviado con instrucciones de reset"
}
```

### Confirm Password Reset
```
POST /auth/password-reset-confirm/
Content-Type: application/json

Request:
{
  "email": "john@example.com",
  "token": "abc123...",
  "new_password": "NewPassword123!",
  "new_password2": "NewPassword123!"
}

Response 200:
{
  "message": "Contraseña actualizada"
}
```

---

## 👤 Users Endpoints

### Get Current User
```
GET /users/me/
Authorization: Bearer {access_token}

Response 200:
{
  "id": 1,
  "username": "johndoe",
  "email": "john@example.com",
  "full_name": "John Doe",
  "phone": "+1234567890",
  "role": "parent",
  "profile_picture": "https://...",
  "is_email_verified": true,
  "created_at": "2025-11-21T10:30:00Z",
  "updated_at": "2025-11-21T10:30:00Z"
}
```

### Update Current User
```
PATCH /users/me/
Authorization: Bearer {access_token}
Content-Type: application/json

Request:
{
  "full_name": "John Doe Updated",
  "phone": "+9876543210",
  "profile_picture": "base64_image_data"
}

Response 200:
{
  "id": 1,
  "username": "johndoe",
  "email": "john@example.com",
  "full_name": "John Doe Updated",
  "phone": "+9876543210",
  "role": "parent"
}
```

### List Users (Admin Only)
```
GET /users/?role=parent&search=john
Authorization: Bearer {admin_token}

Query Parameters:
- role: "parent" | "nanny" | "admin"
- search: string (busca en username, email, full_name)
- page: integer (default: 1)
- limit: integer (default: 20)

Response 200:
{
  "count": 150,
  "next": "http://localhost:8000/api/users/?page=2",
  "previous": null,
  "results": [
    {
      "id": 1,
      "username": "johndoe",
      "email": "john@example.com",
      "full_name": "John Doe",
      "role": "parent",
      "created_at": "2025-11-21T10:30:00Z"
    },
    ...
  ]
}
```

### Delete User Account
```
DELETE /users/me/
Authorization: Bearer {access_token}
Content-Type: application/json

Request:
{
  "password": "SecurePass123!"
}

Response 204: No Content
```

---

## 👩‍⚕️ Nannies Endpoints

### List Nannies
```
GET /nannies/?search=maria&rating_min=4&available=true
Query Parameters:
- search: string (busca en nombre, especialidades)
- rating_min: float (default: 0)
- rating_max: float (default: 5)
- available: boolean
- experience_min: integer (años)
- location: string
- page: integer
- limit: integer

Response 200:
{
  "count": 45,
  "next": null,
  "previous": null,
  "results": [
    {
      "id": 5,
      "user": {
        "id": 5,
        "username": "maria_nanny",
        "full_name": "Maria García",
        "profile_picture": "https://..."
      },
      "bio": "Cuidadora con 10 años de experiencia...",
      "specialties": ["Infantes", "Necesidades especiales"],
      "years_experience": 10,
      "hourly_rate": 25.00,
      "rating": 4.8,
      "total_reviews": 45,
      "location": "San Francisco, CA",
      "is_available": true,
      "featured": true,
      "created_at": "2025-01-15T08:00:00Z"
    },
    ...
  ]
}
```

### Get Nanny Details
```
GET /nannies/{id}/
Authorization: Optional

Response 200:
{
  "id": 5,
  "user": { ... },
  "bio": "Cuidadora con 10 años de experiencia...",
  "specialties": ["Infantes", "Necesidades especiales"],
  "years_experience": 10,
  "hourly_rate": 25.00,
  "rating": 4.8,
  "total_reviews": 45,
  "location": "San Francisco, CA",
  "is_available": true,
  "featured": true,
  "certifications": [
    {
      "id": 1,
      "name": "CPR Certification",
      "issue_date": "2024-01-15",
      "expiry_date": "2027-01-15"
    }
  ],
  "education": [
    {
      "id": 1,
      "school": "University of Education",
      "degree": "Bachelor in Childcare",
      "year_graduated": 2015
    }
  ]
}
```

### Update Nanny Profile (Nanny Only)
```
PATCH /nannies/{id}/
Authorization: Bearer {nanny_token}
Content-Type: application/json

Request:
{
  "bio": "Updated bio...",
  "specialties": ["Infantes", "Necesidades especiales", "Adolescentes"],
  "years_experience": 11,
  "hourly_rate": 26.00,
  "location": "San Francisco, CA"
}

Response 200: { ... updated nanny object ... }
```

### Add Certification
```
POST /nannies/{id}/certifications/
Authorization: Bearer {nanny_token}
Content-Type: application/json

Request:
{
  "name": "First Aid Certification",
  "issue_date": "2024-06-15",
  "expiry_date": "2027-06-15",
  "document": "base64_encoded_pdf"
}

Response 201:
{
  "id": 2,
  "name": "First Aid Certification",
  "issue_date": "2024-06-15",
  "expiry_date": "2027-06-15"
}
```

### Add Education
```
POST /nannies/{id}/education/
Authorization: Bearer {nanny_token}
Content-Type: application/json

Request:
{
  "school": "Community College",
  "degree": "Associate in Child Development",
  "year_graduated": 2020
}

Response 201:
{
  "id": 2,
  "school": "Community College",
  "degree": "Associate in Child Development",
  "year_graduated": 2020
}
```

---

## 📅 Bookings Endpoints

### List Bookings
```
GET /bookings/?status=pending&sort=-created_at
Authorization: Bearer {access_token}

Query Parameters:
- status: "pending" | "confirmed" | "completed" | "cancelled"
- nanny_id: integer
- parent_id: integer
- sort: "-created_at" | "created_at" | "-booking_date"
- page: integer
- limit: integer

Response 200:
{
  "count": 25,
  "results": [
    {
      "id": 1,
      "booking_date": "2025-12-15",
      "start_time": "10:00:00",
      "end_time": "14:00:00",
      "status": "pending",
      "hourly_rate": 25.00,
      "total_amount": 100.00,
      "nanny": {
        "id": 5,
        "user": { "full_name": "Maria García" },
        "hourly_rate": 25.00
      },
      "parent": {
        "id": 1,
        "user": { "full_name": "John Doe" }
      },
      "notes": "Los niños tienen alergias...",
      "created_at": "2025-11-21T10:30:00Z",
      "updated_at": "2025-11-21T10:30:00Z"
    },
    ...
  ]
}
```

### Create Booking
```
POST /bookings/
Authorization: Bearer {parent_token}
Content-Type: application/json

Request:
{
  "nanny_id": 5,
  "booking_date": "2025-12-15",
  "start_time": "10:00:00",
  "end_time": "14:00:00",
  "notes": "Los niños tienen alergias...",
  "special_requirements": "Alguacil disponible"
}

Response 201:
{
  "id": 1,
  "booking_date": "2025-12-15",
  "start_time": "10:00:00",
  "end_time": "14:00:00",
  "status": "pending",
  "total_amount": 100.00,
  "nanny": { ... },
  "parent": { ... },
  "notes": "Los niños tienen alergias...",
  "created_at": "2025-11-21T10:30:00Z"
}

Error 400:
{
  "booking_date": ["Invalid date format"],
  "start_time": ["Start time must be before end time"]
}

Error 409:
{
  "detail": "Nanny is not available for this time slot"
}
```

### Get Booking Details
```
GET /bookings/{id}/
Authorization: Bearer {access_token}

Response 200: { ... full booking object ... }
```

### Update Booking (Parent Only)
```
PATCH /bookings/{id}/
Authorization: Bearer {parent_token}
Content-Type: application/json

Request:
{
  "booking_date": "2025-12-16",
  "start_time": "11:00:00",
  "end_time": "15:00:00",
  "notes": "Updated notes..."
}

Response 200: { ... updated booking ... }

Error 400:
{
  "detail": "Cannot modify confirmed bookings"
}
```

### Accept Booking (Nanny Only)
```
PATCH /bookings/{id}/accept/
Authorization: Bearer {nanny_token}

Response 200:
{
  "id": 1,
  "status": "confirmed",
  "accepted_at": "2025-11-21T11:00:00Z"
}
```

### Reject Booking (Nanny Only)
```
PATCH /bookings/{id}/reject/
Authorization: Bearer {nanny_token}
Content-Type: application/json

Request:
{
  "rejection_reason": "No disponible en esa fecha"
}

Response 200:
{
  "id": 1,
  "status": "rejected",
  "rejection_reason": "No disponible en esa fecha"
}
```

### Cancel Booking (Parent/Nanny)
```
PATCH /bookings/{id}/cancel/
Authorization: Bearer {access_token}
Content-Type: application/json

Request:
{
  "cancellation_reason": "Cambio de planes"
}

Response 200:
{
  "id": 1,
  "status": "cancelled",
  "cancellation_reason": "Cambio de planes"
}
```

### Complete Booking (Nanny Only)
```
PATCH /bookings/{id}/complete/
Authorization: Bearer {nanny_token}

Response 200:
{
  "id": 1,
  "status": "completed",
  "completed_at": "2025-12-15T14:00:00Z"
}
```

---

## ❤️ Favorites Endpoints

### List Favorites
```
GET /favorites/?ordering=-created_at
Authorization: Bearer {access_token}

Response 200:
{
  "count": 12,
  "results": [
    {
      "id": 1,
      "nanny": {
        "id": 5,
        "user": { "full_name": "Maria García" },
        "hourly_rate": 25.00,
        "rating": 4.8
      },
      "parent": { "id": 1 },
      "created_at": "2025-11-20T10:30:00Z"
    },
    ...
  ]
}
```

### Add to Favorites
```
POST /favorites/
Authorization: Bearer {parent_token}
Content-Type: application/json

Request:
{
  "nanny_id": 5
}

Response 201:
{
  "id": 1,
  "nanny": { ... },
  "parent": { ... },
  "created_at": "2025-11-21T10:30:00Z"
}

Error 400:
{
  "detail": "This nanny is already in your favorites"
}
```

### Remove from Favorites
```
DELETE /favorites/{id}/
Authorization: Bearer {parent_token}

Response 204: No Content
```

### Check if Nanny is Favorite
```
GET /favorites/check/?nanny_id=5
Authorization: Bearer {parent_token}

Response 200:
{
  "is_favorite": true,
  "favorite_id": 1
}
```

---

## ⭐ Reviews Endpoints

### List Reviews
```
GET /reviews/?nanny_id=5&sort=-rating
Query Parameters:
- nanny_id: integer (required if not profile view)
- parent_id: integer
- sort: "-rating" | "rating" | "-created_at"
- min_rating: integer (1-5)
- page: integer

Response 200:
{
  "count": 45,
  "results": [
    {
      "id": 1,
      "nanny": { "id": 5, "user": { "full_name": "Maria García" } },
      "parent": { "id": 1, "user": { "full_name": "John Doe" } },
      "booking": { "id": 1 },
      "rating": 5,
      "comment": "Excellent service! Maria is very professional...",
      "created_at": "2025-11-20T10:30:00Z"
    },
    ...
  ]
}
```

### Create Review
```
POST /reviews/
Authorization: Bearer {parent_token}
Content-Type: application/json

Request:
{
  "booking_id": 1,
  "nanny_id": 5,
  "rating": 5,
  "comment": "Excellent service! Maria is very professional..."
}

Response 201:
{
  "id": 1,
  "nanny": { ... },
  "parent": { ... },
  "booking": { ... },
  "rating": 5,
  "comment": "Excellent service!...",
  "created_at": "2025-11-21T10:30:00Z"
}

Error 400:
{
  "rating": ["Rating must be between 1 and 5"],
  "detail": "You have already reviewed this nanny for this booking"
}
```

### Update Review (Parent Only)
```
PATCH /reviews/{id}/
Authorization: Bearer {parent_token}
Content-Type: application/json

Request:
{
  "rating": 4,
  "comment": "Updated comment..."
}

Response 200: { ... updated review ... }
```

### Delete Review (Parent Only)
```
DELETE /reviews/{id}/
Authorization: Bearer {parent_token}

Response 204: No Content
```

---

## 🔔 Notifications Endpoints

### List Notifications
```
GET /notifications/?unread=true&sort=-created_at
Authorization: Bearer {access_token}

Query Parameters:
- unread: boolean
- sort: "-created_at"
- page: integer
- limit: integer

Response 200:
{
  "count": 8,
  "results": [
    {
      "id": 1,
      "user": { "id": 1 },
      "type": "booking_request",
      "title": "Nueva solicitud de reserva",
      "message": "Maria García ha solicitado una reserva...",
      "related_id": 1,
      "is_read": false,
      "created_at": "2025-11-21T10:30:00Z"
    },
    ...
  ]
}
```

### Mark Notification as Read
```
PATCH /notifications/{id}/mark-as-read/
Authorization: Bearer {access_token}

Response 200:
{
  "id": 1,
  "is_read": true
}
```

### Mark All as Read
```
PATCH /notifications/mark-all-as-read/
Authorization: Bearer {access_token}

Response 200:
{
  "updated": 5
}
```

### Delete Notification
```
DELETE /notifications/{id}/
Authorization: Bearer {access_token}

Response 204: No Content
```

### Get Notification Statistics
```
GET /notifications/stats/
Authorization: Bearer {access_token}

Response 200:
{
  "total": 25,
  "unread": 8,
  "by_type": {
    "booking_request": 3,
    "booking_confirmed": 2,
    "review_posted": 1,
    "message": 2
  }
}
```

---

## 📅 Availability Endpoints

### List Availability
```
GET /availability/?nanny_id=5&date_from=2025-12-01
Authorization: Optional

Query Parameters:
- nanny_id: integer (required)
- date_from: YYYY-MM-DD
- date_to: YYYY-MM-DD
- available_only: boolean

Response 200:
{
  "count": 90,
  "results": [
    {
      "id": 1,
      "nanny": { "id": 5 },
      "date": "2025-12-01",
      "start_time": "09:00:00",
      "end_time": "17:00:00",
      "is_available": true,
      "created_at": "2025-11-21T10:30:00Z"
    },
    ...
  ]
}
```

### Create Availability Slot (Nanny Only)
```
POST /availability/
Authorization: Bearer {nanny_token}
Content-Type: application/json

Request:
{
  "date": "2025-12-01",
  "start_time": "09:00:00",
  "end_time": "17:00:00",
  "is_available": true
}

Response 201:
{
  "id": 1,
  "date": "2025-12-01",
  "start_time": "09:00:00",
  "end_time": "17:00:00",
  "is_available": true
}
```

### Update Availability (Nanny Only)
```
PATCH /availability/{id}/
Authorization: Bearer {nanny_token}
Content-Type: application/json

Request:
{
  "is_available": false,
  "reason": "Ocupado"
}

Response 200: { ... updated availability ... }
```

### Delete Availability (Nanny Only)
```
DELETE /availability/{id}/
Authorization: Bearer {nanny_token}

Response 204: No Content
```

### Get Nanny Availability Calendar
```
GET /availability/calendar/{nanny_id}/?year=2025&month=12
Authorization: Optional

Response 200:
{
  "nanny_id": 5,
  "year": 2025,
  "month": 12,
  "calendar": {
    "1": { "available": true, "slots": [] },
    "2": { "available": false, "slots": [] },
    ...
    "15": {
      "available": true,
      "slots": [
        { "start_time": "09:00:00", "end_time": "12:00:00" },
        { "start_time": "14:00:00", "end_time": "17:00:00" }
      ]
    }
  }
}
```

---

## 📊 RESUMEN DE ENDPOINTS

| Módulo | Método | Endpoint | Auth | Status |
|--------|--------|----------|------|--------|
| **Auth** | POST | /auth/register/ | No | ✅ |
| | POST | /auth/login/ | No | ✅ |
| | POST | /auth/verify-email/ | No | ✅ |
| | POST | /auth/token/refresh/ | No | ✅ |
| | POST | /auth/password-reset/ | No | ✅ |
| **Users** | GET | /users/me/ | Si | ✅ |
| | PATCH | /users/me/ | Si | ✅ |
| | GET | /users/ | Admin | ✅ |
| | DELETE | /users/me/ | Si | ✅ |
| **Nannies** | GET | /nannies/ | No | ✅ |
| | GET | /nannies/{id}/ | No | ✅ |
| | PATCH | /nannies/{id}/ | Nanny | ✅ |
| | POST | /nannies/{id}/certifications/ | Nanny | ✅ |
| | POST | /nannies/{id}/education/ | Nanny | ✅ |
| **Bookings** | GET | /bookings/ | Si | ✅ |
| | POST | /bookings/ | Parent | ✅ |
| | GET | /bookings/{id}/ | Si | ✅ |
| | PATCH | /bookings/{id}/ | Parent | ✅ |
| | PATCH | /bookings/{id}/accept/ | Nanny | ✅ |
| | PATCH | /bookings/{id}/reject/ | Nanny | ✅ |
| | PATCH | /bookings/{id}/cancel/ | Si | ✅ |
| | PATCH | /bookings/{id}/complete/ | Nanny | ✅ |
| **Favorites** | GET | /favorites/ | Si | ✅ |
| | POST | /favorites/ | Parent | ✅ |
| | DELETE | /favorites/{id}/ | Parent | ✅ |
| | GET | /favorites/check/ | Parent | ✅ |
| **Reviews** | GET | /reviews/ | No | ✅ |
| | POST | /reviews/ | Parent | ✅ |
| | PATCH | /reviews/{id}/ | Parent | ✅ |
| | DELETE | /reviews/{id}/ | Parent | ✅ |
| **Notifications** | GET | /notifications/ | Si | ✅ |
| | PATCH | /notifications/{id}/mark-as-read/ | Si | ✅ |
| | PATCH | /notifications/mark-all-as-read/ | Si | ✅ |
| | DELETE | /notifications/{id}/ | Si | ✅ |
| | GET | /notifications/stats/ | Si | ✅ |
| **Availability** | GET | /availability/ | No | ✅ |
| | POST | /availability/ | Nanny | ✅ |
| | PATCH | /availability/{id}/ | Nanny | ✅ |
| | DELETE | /availability/{id}/ | Nanny | ✅ |
| | GET | /availability/calendar/{id}/ | No | ✅ |

**Total Endpoints:** 40+  
**Todos Implementados:** ✅

---

## 🔗 FLUJOS DE INTEGRACIÓN FRONTEND-BACKEND

### 1. Flujo de Registro y Login
```
Frontend (Landing.jsx)
    ↓
    POST /auth/register/ (sin token)
    ↓
Backend (UserSerializer)
    ↓
Response: user object + is_email_verified: false
    ↓
Frontend: Mostrar VerifyEmail view
    ↓
    POST /auth/verify-email/ (con token)
    ↓
Backend: Marcar usuario como verificado
    ↓
Frontend (Login.jsx)
    ↓
    POST /auth/login/
    ↓
Backend: Generar JWT tokens
    ↓
Frontend: Guardar en localStorage, redirigir a dashboard
```

### 2. Flujo de Búsqueda de Nanas
```
Frontend (Catalog.jsx)
    ↓
    GET /nannies/?search=query&rating_min=4
    ↓
Backend: Filtrar y paginar resultados
    ↓
Frontend: Mostrar grid de NannyCard
    ↓
User click en ❤️ (favorites)
    ↓
    POST /favorites/ (con nanny_id)
    ↓
Backend: Crear relación
    ↓
Frontend: Mostrar AlertToast "Agregada a favoritos"
```

### 3. Flujo de Reserva
```
Frontend (BookingCreate.jsx)
    ↓
    GET /availability/?nanny_id=5
    ↓
Backend: Retornar slots disponibles
    ↓
Frontend: Mostrar AvailabilitySelector
    ↓
User selecciona fecha/hora
    ↓
    POST /bookings/
    ↓
Backend: Validar disponibilidad, crear booking
    ↓
Response: booking object + status: "pending"
    ↓
Frontend: Mostrar AlertToast + redirigir a MyBookings
    ↓
Backend: Django signal → crear Notification para nanny
```

### 4. Flujo de Aceptación de Reserva (Nanny)
```
Backend: Notification creada
    ↓
Frontend (NannyRequests.jsx)
    ↓
    GET /notifications/?unread=true
    ↓
Mostrar lista de solicitudes pendientes
    ↓
Nanny click en "Aceptar"
    ↓
    PATCH /bookings/{id}/accept/
    ↓
Backend: status = "confirmed"
    ↓
Frontend: AlertToast "Reserva aceptada"
    ↓
Backend: Signal → Notification para parent
```

### 5. Flujo de Reseña
```
Frontend (MyBookings.jsx)
    ↓
Booking status = "completed"
    ↓
Mostrar botón "Dejar reseña"
    ↓
    POST /reviews/
    ↓
Backend: Crear review + calcular rating promedio
    ↓
Frontend: AlertToast "Reseña enviada"
    ↓
Backend: Signal → Notification para nanny
```

---

## 🧪 EJEMPLOS CURL PARA TESTING

### Registrarse
```bash
curl -X POST http://localhost:8000/api/auth/register/ \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "TestPass123!",
    "password2": "TestPass123!",
    "role": "parent",
    "full_name": "Test User",
    "phone": "+1234567890"
  }'
```

### Login
```bash
curl -X POST http://localhost:8000/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPass123!"
  }'
```

### Listar Nanas
```bash
curl -X GET "http://localhost:8000/api/nannies/?search=maria&rating_min=4"
```

### Crear Reserva (requiere token)
```bash
curl -X POST http://localhost:8000/api/bookings/ \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "nanny_id": 5,
    "booking_date": "2025-12-15",
    "start_time": "10:00:00",
    "end_time": "14:00:00",
    "notes": "Necesito cuidadora de tiempo completo"
  }'
```

---

**Documento completado:** 21 de noviembre de 2025  
**Endpoints mapeados:** 40+  
**Status:** ✅ LISTO PARA CONSULTAR
