# 📋 Plan de Mejoras del Sistema - Home Nannies

**Fecha:** 1 de diciembre de 2025  
**Documento de análisis técnico y plan de implementación**

---

## 📑 Índice de Consideraciones

1. [Agregar campo rol en profiles](#1-agregar-campo-rol-en-profiles)
2. [Validación de teléfono nacional](#2-validación-de-teléfono-nacional)
3. [Validación números positivos (hijos)](#3-validación-números-positivos-familia)
4. [Componente de fotos en profile niñera](#4-componente-fotos-profile-niñera)
5. [Ambigüedad en precios del catálogo](#5-ambigüedad-precios-catálogo)
6. [Ocultar botón editar en reservas (padre)](#6-ocultar-botón-editar-reservas-padre)
7. [Mensajes personalizados en reservas](#7-mensajes-personalizados-reservas)
8. [Filtrar notificaciones vistas](#8-filtrar-notificaciones-vistas)
9. [Traducción completa a español](#9-traducción-español)
10. [Arreglar bookings panel niñera](#10-arreglar-bookings-panel-niñera)
11. [Página 404 para roles no-niñera](#11-página-404-roles-no-niñera)
12. [Tabla intermedia roles duales](#12-tabla-intermedia-roles-duales)
13. [Mejorar mensajes error disponibilidades](#13-mejorar-mensajes-disponibilidades)

---

## 🔧 Análisis y Soluciones

### 1. Agregar campo rol en profiles

#### 📊 Análisis
**Ubicación actual:**
- `Back_Django_REST/users/models.py` - Campo `role` en modelo User
- `Back_Django_REST/parents/models.py` - ParentProfile sin campo rol
- `Back_Django_REST/nannies/models.py` - NannyProfile sin campo rol

**Problema:** Los profiles no tienen referencia directa al rol, lo que puede causar inconsistencias.

#### ✅ Solución
**Opción 1 (Recomendada):** Agregar propiedad de solo lectura
```python
# En ParentProfile
@property
def role(self):
    return self.user.role

# En NannyProfile
@property
def role(self):
    return self.user.role
```

**Opción 2:** Campo redundante (no recomendado)
```python
role = models.CharField(max_length=10, editable=False, default='parent')
```

**Archivos a modificar:**
- `Back_Django_REST/parents/models.py`
- `Back_Django_REST/nannies/models.py`
- `Back_Django_REST/parents/serializer.py`
- `Back_Django_REST/nannies/serializer.py`

---

### 2. Validación de teléfono nacional

#### 📊 Análisis
**Ubicación actual:**
- `Back_Django_REST/parents/models.py` - Campo `phone` sin validación
- `Back_Django_REST/core/validators.py` - Archivo de validadores

**Problema:** No hay validación para formato de teléfono chileno.

#### ✅ Solución
Crear validador para números chilenos (+56 9 XXXX XXXX):

```python
# En core/validators.py
import re
from django.core.exceptions import ValidationError

def validate_chilean_phone(value):
    """
    Valida números telefónicos chilenos.
    Formatos aceptados:
    - +56912345678
    - +56 9 1234 5678
    - 912345678
    - 9 1234 5678
    """
    # Limpiar espacios y guiones
    cleaned = re.sub(r'[\s\-]', '', value)
    
    # Patrones válidos
    patterns = [
        r'^\+569\d{8}$',  # +56912345678
        r'^9\d{8}$',       # 912345678
        r'^\+56[2-9]\d{8}$', # +562XXXXXXXX (fijo)
        r'^[2-9]\d{8}$',     # 2XXXXXXXX (fijo)
    ]
    
    if not any(re.match(pattern, cleaned) for pattern in patterns):
        raise ValidationError(
            'Ingrese un número telefónico chileno válido. '
            'Ejemplos: +56912345678, 912345678'
        )
```

**Aplicar en modelo:**
```python
# En parents/models.py
from core.validators import validate_chilean_phone

class ParentProfile(models.Model):
    phone = models.CharField(
        max_length=20, 
        blank=True,
        validators=[validate_chilean_phone]
    )
```

**Archivos a modificar:**
- `Back_Django_REST/core/validators.py` (crear validador)
- `Back_Django_REST/parents/models.py`
- Migración: `python manage.py makemigrations` (opcional, no destructiva)

---

### 3. Validación números positivos (familia)

#### 📊 Análisis
**Ubicación actual:**
- `Back_Django_REST/parents/models.py` - Campo `children_count` ya usa `PositiveIntegerField`

**Problema:** Aunque el campo es `PositiveIntegerField`, no previene valores 0.

#### ✅ Solución
Agregar validador personalizado:

```python
# En core/validators.py
from django.core.exceptions import ValidationError

def validate_positive_nonzero(value):
    """Valida que el valor sea positivo y mayor a 0"""
    if value < 1:
        raise ValidationError(
            'El número de hijos debe ser al menos 1.'
        )
```

**Aplicar en modelo:**
```python
# En parents/models.py
from core.validators import validate_positive_nonzero

class ParentProfile(models.Model):
    children_count = models.PositiveIntegerField(
        default=1,
        validators=[validate_positive_nonzero],
        help_text="Número de hijos (mínimo 1)"
    )
```

**Archivos a modificar:**
- `Back_Django_REST/core/validators.py`
- `Back_Django_REST/parents/models.py`
- Migración no necesaria (validador a nivel de aplicación)

---

### 4. Componente fotos profile niñera

#### 📊 Análisis
**Ubicación actual:**
- `frontend_nannies/src/views/profile/NannyProfile.jsx` - Vista de perfil
- `Back_Django_REST/nannies/models.py` - No tiene campo para fotos

**Problema:** No existe funcionalidad para subir/gestionar fotos de perfil.

#### ✅ Solución

**Backend:**
1. Agregar campo de imagen en modelo:
```python
# En nannies/models.py
class NannyProfile(models.Model):
    profile_image = models.ImageField(
        upload_to='nanny_profiles/',
        blank=True,
        null=True,
        help_text="Foto de perfil"
    )
```

2. Instalar Pillow: `pip install Pillow`

3. Configurar MEDIA_ROOT en settings.py:
```python
MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'media'
```

**Frontend:**
Crear componente `ImageUploader.jsx`:
```jsx
import React, { useState } from 'react';

const ImageUploader = ({ currentImage, onImageChange }) => {
  const [preview, setPreview] = useState(currentImage);
  
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validar tamaño (máx 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('La imagen debe ser menor a 5MB');
        return;
      }
      
      // Crear preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);
      
      onImageChange(file);
    }
  };
  
  return (
    <div className="image-uploader">
      {preview && (
        <img src={preview} alt="Preview" className="preview-image" />
      )}
      <input 
        type="file" 
        accept="image/*" 
        onChange={handleFileChange}
      />
    </div>
  );
};

export default ImageUploader;
```

**Archivos a modificar:**
- `Back_Django_REST/nannies/models.py`
- `Back_Django_REST/nannies/serializer.py`
- `Back_Django_REST/django_crud_api/settings.py`
- `Back_Django_REST/django_crud_api/urls.py` (agregar media serving)
- `frontend_nannies/src/components/profile/ImageUploader.jsx` (nuevo)
- `frontend_nannies/src/views/profile/NannyProfile.jsx`
- Migración: `python manage.py makemigrations nannies`

---

### 5. Ambigüedad precios catálogo

#### 📊 Análisis
**Ubicación actual:**
- `frontend_nannies/src/views/Catalog.jsx` - Vista de catálogo
- `Back_Django_REST/nannies/models.py` - Campo `hourly_rate`

**Problema:** No está claro si el precio es por hora, por servicio completo, o incluye otros conceptos.

#### ✅ Solución

**Backend:**
```python
# En nannies/serializer.py
class NannyProfileSerializer(serializers.ModelSerializer):
    hourly_rate_display = serializers.SerializerMethodField()
    
    def get_hourly_rate_display(self, obj):
        return f"${obj.hourly_rate:,} CLP/hora"
    
    class Meta:
        fields = [..., 'hourly_rate_display']
```

**Frontend:**
```jsx
// En components/nanny/NannyCard.jsx
<div className="price-container">
  <span className="price-label">Tarifa por hora:</span>
  <span className="price-amount">
    ${nanny.hourly_rate.toLocaleString('es-CL')} CLP
  </span>
  <span className="price-note">
    💡 El costo total se calcula según las horas reservadas
  </span>
</div>
```

**Archivos a modificar:**
- `Back_Django_REST/nannies/serializer.py`
- `frontend_nannies/src/components/nanny/NannyCard.jsx`
- `frontend_nannies/src/views/Catalog.jsx`

---

### 6. Ocultar botón editar reservas (padre)

#### 📊 Análisis
**Ubicación actual:**
- `frontend_nannies/src/views/MyBookings.jsx` - Vista de reservas

**Problema:** Los padres ven botón de editar que no deberían tener acceso.

#### ✅ Solución

```jsx
// En MyBookings.jsx
const userRole = localStorage.getItem('role');

const canEditBooking = (booking) => {
  // Solo niñeras pueden editar y solo si está pendiente
  return userRole === 'nanny' && booking.status === 'pending';
};

// En el render:
{canEditBooking(booking) && (
  <button onClick={() => handleEdit(booking.id)}>
    Editar
  </button>
)}
```

**Archivos a modificar:**
- `frontend_nannies/src/views/MyBookings.jsx`

---

### 7. Mensajes personalizados reservas

#### 📊 Análisis
**Ubicación actual:**
- `Back_Django_REST/bookings/views.py` - Funciones `reject_booking`, `complete_booking`

**Problema:** Mensajes genéricos del sistema en lugar de mensajes del proyecto.

#### ✅ Solución

Crear constantes de mensajes:
```python
# En bookings/constants.py
BOOKING_MESSAGES = {
    'rejected': {
        'nanny_to_parent': (
            'Tu solicitud de reserva con {nanny_name} para el {date} '
            'no pudo ser aceptada en este momento. '
            'Te invitamos a revisar otras niñeras disponibles en nuestro catálogo.'
        ),
        'system': 'Reserva rechazada exitosamente.'
    },
    'completed': {
        'nanny_to_parent': (
            '¡Tu servicio con {nanny_name} ha sido completado! '
            'Te invitamos a dejar una reseña sobre tu experiencia.'
        ),
        'system': 'Reserva marcada como completada.'
    },
    'cancelled': {
        'parent_to_nanny': (
            'El padre {parent_name} ha cancelado la reserva del {date}. '
            'Tu disponibilidad ha sido liberada automáticamente.'
        ),
        'system': 'Reserva cancelada exitosamente.'
    }
}
```

**Aplicar en views:**
```python
# En bookings/views.py
from .constants import BOOKING_MESSAGES

@api_view(["POST"])
def reject_booking(request, pk):
    # ... código existente ...
    
    message_template = BOOKING_MESSAGES['rejected']['nanny_to_parent']
    Notification.objects.create(
        user=booking.parent,
        message=message_template.format(
            nanny_name=request.user.get_full_name() or request.user.username,
            date=booking.start_time.strftime('%d/%m/%Y %H:%M')
        )
    )
    return Response({
        "message": BOOKING_MESSAGES['rejected']['system']
    }, status=200)
```

**Archivos a modificar:**
- `Back_Django_REST/bookings/constants.py` (crear)
- `Back_Django_REST/bookings/views.py`

---

### 8. Filtrar notificaciones vistas

#### 📊 Análisis
**Ubicación actual:**
- `frontend_nannies/src/components/notifications/NotificationCenter.jsx`
- Campo `is_read` en modelo Notification

**Problema:** Al presionar 'x' las notificaciones vistas se siguen mostrando.

#### ✅ Solución

**Opción 1: Eliminar notificaciones vistas**
```jsx
// En NotificationCenter.jsx
const handleDismiss = async (notificationId) => {
  try {
    // Primero marcar como leída
    await markNotificationsAsRead([notificationId]);
    // Luego eliminar
    await deleteNotification(notificationId);
    
    // Recargar lista (solo mostrará no leídas)
    loadNotifications();
    loadUnreadCount();
  } catch (err) {
    setError('Error al procesar notificación');
  }
};
```

**Opción 2: Filtrar solo no leídas (recomendado)**
```jsx
// En NotificationCenter.jsx
const [showOnlyUnread, setShowOnlyUnread] = useState(true);

const handleDismiss = async (notificationId) => {
  try {
    await markNotificationsAsRead([notificationId]);
    
    // Si estamos mostrando solo no leídas, remover de la lista
    if (showOnlyUnread) {
      setNotifications(prev => 
        prev.filter(n => n.id !== notificationId)
      );
    }
    
    loadUnreadCount();
  } catch (err) {
    setError('Error al procesar notificación');
  }
};

// Agregar toggle
<button onClick={() => setShowOnlyUnread(!showOnlyUnread)}>
  {showOnlyUnread ? 'Mostrar todas' : 'Solo no leídas'}
</button>
```

**Archivos a modificar:**
- `frontend_nannies/src/components/notifications/NotificationCenter.jsx`

---

### 9. Traducción español

#### 📊 Análisis
**Problema:** Mensajes en inglés dispersos en el código.

#### ✅ Solución

Crear archivo de constantes de traducción:
```javascript
// frontend_nannies/src/constants/messages.js
export const MESSAGES = {
  errors: {
    generic: 'Ha ocurrido un error. Por favor, intenta nuevamente.',
    network: 'Error de conexión. Verifica tu internet.',
    unauthorized: 'No tienes permisos para realizar esta acción.',
    notFound: 'El recurso solicitado no existe.',
  },
  success: {
    saved: 'Cambios guardados exitosamente',
    deleted: 'Eliminado correctamente',
    created: 'Creado exitosamente',
  },
  bookings: {
    pending: 'Pendiente de confirmación',
    confirmed: 'Confirmada',
    rejected: 'Rechazada',
    cancelled: 'Cancelada',
    completed: 'Completada',
  },
  validation: {
    required: 'Este campo es obligatorio',
    email: 'Ingresa un email válido',
    phone: 'Ingresa un teléfono válido',
    positive: 'Debe ser un número positivo',
  }
};
```

**Backend:**
```python
# Back_Django_REST/bookings/constants.py
ERROR_MESSAGES = {
    'not_found': 'Reserva no encontrada o no autorizada.',
    'invalid_status': 'Estado de reserva inválido.',
    'overlap': 'Ya existe una disponibilidad en este rango de tiempo.',
    'invalid_time': 'La hora de inicio debe ser anterior a la hora de fin.',
}
```

**Archivos a crear/modificar:**
- `frontend_nannies/src/constants/messages.js` (crear)
- Todos los componentes que usen mensajes hardcodeados
- `Back_Django_REST/bookings/constants.py`
- `Back_Django_REST/bookings/serializer.py`
- `Back_Django_REST/bookings/views.py`

---

### 10. Arreglar bookings panel niñera

#### 📊 Análisis
**Ubicación:**
- `frontend_nannies/src/views/dashboard/nanny/NannyDashboard.jsx`

**Problema:** Componente de bookings no funciona correctamente en el panel.

#### ✅ Solución

Verificar y corregir:
1. Query correcto al backend
2. Filtrado de bookings por niñera
3. Estados de carga y error

```jsx
// En NannyDashboard.jsx
const [bookings, setBookings] = useState([]);
const [loading, setLoading] = useState(true);

useEffect(() => {
  loadNannyBookings();
}, []);

const loadNannyBookings = async () => {
  try {
    setLoading(true);
    // Filtrar solo bookings donde el usuario es la niñera
    const response = await getBookings();
    const nannyBookings = response.filter(
      booking => booking.nanny.id === currentUserId
    );
    setBookings(nannyBookings);
  } catch (error) {
    console.error('Error cargando reservas:', error);
  } finally {
    setLoading(false);
  }
};
```

**Archivos a modificar:**
- `frontend_nannies/src/views/dashboard/nanny/NannyDashboard.jsx`
- `frontend_nannies/src/views/NannyRequests.jsx` (si existe)

---

### 11. Página 404 roles no-niñera

#### 📊 Análisis
**Ubicación:**
- `frontend_nannies/src/router/AppRouter.jsx`

**Problema:** Usuarios no-niñera pueden acceder a URLs de niñera.

#### ✅ Solución

**Crear componente RoleProtectedRoute:**
```jsx
// frontend_nannies/src/components/auth/RoleProtectedRoute.jsx
import { Navigate } from 'react-router-dom';

const RoleProtectedRoute = ({ children, allowedRoles }) => {
  const userRole = localStorage.getItem('role');
  
  if (!userRole) {
    return <Navigate to="/login" replace />;
  }
  
  if (!allowedRoles.includes(userRole)) {
    return <Navigate to="/unauthorized" replace />;
  }
  
  return children;
};

export default RoleProtectedRoute;
```

**Crear página 404 personalizada:**
```jsx
// frontend_nannies/src/views/errors/Unauthorized.jsx
const Unauthorized = () => {
  const navigate = useNavigate();
  const userRole = localStorage.getItem('role');
  
  return (
    <div className="unauthorized-page">
      <h1>⛔ Acceso No Autorizado</h1>
      <p>No tienes permisos para acceder a esta página.</p>
      <button onClick={() => navigate(`/dashboard/${userRole}`)}>
        Volver al Dashboard
      </button>
    </div>
  );
};
```

**Aplicar en rutas:**
```jsx
// En AppRouter.jsx
<Route 
  path="/nanny/*" 
  element={
    <RoleProtectedRoute allowedRoles={['nanny']}>
      <NannyRoutes />
    </RoleProtectedRoute>
  } 
/>
```

**Archivos a crear/modificar:**
- `frontend_nannies/src/components/auth/RoleProtectedRoute.jsx` (crear)
- `frontend_nannies/src/views/errors/Unauthorized.jsx` (crear)
- `frontend_nannies/src/router/AppRouter.jsx`

---

### 12. Tabla intermedia roles duales

#### 📊 Análisis
**Problema:** Un usuario puede ser padre Y niñera simultáneamente.

#### ✅ Solución

**Opción 1: Múltiples roles en User (Recomendado)**
```python
# En users/models.py
class User(AbstractUser):
    # Cambiar de CharField a ManyToManyField
    roles = models.ManyToManyField(
        'Role',
        related_name='users',
        help_text="Roles asignados al usuario"
    )
    
    # Mantener campo role para compatibilidad
    @property
    def role(self):
        """Rol principal (primer rol asignado)"""
        first_role = self.roles.first()
        return first_role.name if first_role else 'parent'

class Role(models.Model):
    name = models.CharField(max_length=20, unique=True)
    display_name = models.CharField(max_length=50)
    permissions = models.JSONField(default=dict)
    
    class Meta:
        db_table = 'auth_role'
```

**Opción 2: UserRole intermedia**
```python
# En users/models.py
class UserRole(models.Model):
    """Tabla intermedia para roles múltiples"""
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    role = models.CharField(max_length=10, choices=User.ROLE_CHOICES)
    is_primary = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ('user', 'role')
        db_table = 'users_userrole'
```

**Frontend: Selector de rol activo**
```jsx
// Componente RoleSwitcher.jsx
const RoleSwitcher = () => {
  const [activeRole, setActiveRole] = useState(
    localStorage.getItem('activeRole') || 'parent'
  );
  const userRoles = JSON.parse(localStorage.getItem('userRoles') || '[]');
  
  const switchRole = (newRole) => {
    setActiveRole(newRole);
    localStorage.setItem('activeRole', newRole);
    window.location.reload(); // Recargar para aplicar cambios
  };
  
  if (userRoles.length <= 1) return null;
  
  return (
    <div className="role-switcher">
      <select value={activeRole} onChange={(e) => switchRole(e.target.value)}>
        {userRoles.map(role => (
          <option key={role} value={role}>
            {role === 'parent' ? 'Padre/Madre' : 'Niñera'}
          </option>
        ))}
      </select>
    </div>
  );
};
```

**Archivos a crear/modificar:**
- `Back_Django_REST/users/models.py`
- `Back_Django_REST/users/serializer.py`
- `Back_Django_REST/users/views.py`
- `frontend_nannies/src/components/auth/RoleSwitcher.jsx` (crear)
- Migración: `python manage.py makemigrations users`

---

### 13. Mejorar mensajes disponibilidades

#### 📊 Análisis
**Ubicación:**
- `Back_Django_REST/bookings/serializer.py` - `AvailabilitySerializer`

**Problema:** Mensajes de error poco descriptivos.

#### ✅ Solución

```python
# En bookings/serializer.py
class AvailabilitySerializer(serializers.ModelSerializer):
    class Meta:
        model = Availability
        fields = "__all__"
        read_only_fields = ["nanny"]

    def validate(self, data):
        start_time = data["start_time"]
        end_time = data["end_time"]
        day = data["day"]
        
        # Validación 1: Hora de inicio antes de fin
        if start_time >= end_time:
            raise serializers.ValidationError({
                "start_time": "La hora de inicio debe ser anterior a la hora de fin.",
                "end_time": f"La hora de fin ({end_time.strftime('%H:%M')}) debe ser posterior a la de inicio ({start_time.strftime('%H:%M')})."
            })

        # Validación 2: Traslapes
        nanny = self.context["request"].user
        overlapping = Availability.objects.filter(
            nanny=nanny,
            day=day,
            start_time__lt=end_time,
            end_time__gt=start_time
        )
        
        # Excluir la instancia actual si estamos actualizando
        if self.instance:
            overlapping = overlapping.exclude(pk=self.instance.pk)
        
        if overlapping.exists():
            existing = overlapping.first()
            raise serializers.ValidationError({
                "non_field_errors": [
                    f"⚠️ Conflicto de disponibilidad detectado:",
                    f"Ya tienes disponibilidad registrada el {day.strftime('%d/%m/%Y')} "
                    f"de {existing.start_time.strftime('%H:%M')} a {existing.end_time.strftime('%H:%M')}.",
                    f"",
                    f"Tu nueva disponibilidad ({start_time.strftime('%H:%M')} - {end_time.strftime('%H:%M')}) "
                    f"se traslapa con la existente.",
                    f"",
                    f"💡 Sugerencias:",
                    f"• Edita la disponibilidad existente en lugar de crear una nueva",
                    f"• Elige un horario que no se traslape (antes de {existing.start_time.strftime('%H:%M')} o después de {existing.end_time.strftime('%H:%M')})"
                ]
            })
        
        # Validación 3: Horario razonable
        from datetime import time
        if start_time < time(6, 0) or end_time > time(23, 0):
            raise serializers.ValidationError({
                "non_field_errors": "⏰ El horario debe estar entre las 6:00 AM y las 11:00 PM."
            })
        
        # Validación 4: Duración mínima
        duration = (datetime.combine(day, end_time) - datetime.combine(day, start_time)).seconds / 3600
        if duration < 1:
            raise serializers.ValidationError({
                "non_field_errors": "⏱️ La disponibilidad debe ser de al menos 1 hora."
            })
        
        return data
```

**Frontend: Mostrar errores de forma amigable**
```jsx
// En AvailabilityManagement.jsx
const handleError = (error) => {
  if (error.response?.data) {
    const errorData = error.response.data;
    
    if (errorData.non_field_errors) {
      // Mostrar errores generales
      setAlert({
        type: 'error',
        message: errorData.non_field_errors.join('\n')
      });
    } else {
      // Mostrar errores de campo
      const messages = Object.entries(errorData)
        .map(([field, errors]) => `${field}: ${errors.join(', ')}`)
        .join('\n');
      setAlert({ type: 'error', message: messages });
    }
  } else {
    setAlert({ 
      type: 'error', 
      message: 'Error al guardar disponibilidad. Intenta nuevamente.' 
    });
  }
};
```

**Archivos a modificar:**
- `Back_Django_REST/bookings/serializer.py`
- `frontend_nannies/src/views/AvailabilityManagement.jsx`

---

## 📅 Plan de Implementación

### Fase 1: Validaciones y Seguridad (2-3 días)
- ✅ Validación teléfono nacional
- ✅ Validación números positivos
- ✅ Agregar rol en profiles
- ✅ Ocultar botón editar (padre)
- ✅ Página 404 roles

### Fase 2: UX y Mensajes (2 días)
- ✅ Mensajes personalizados reservas
- ✅ Traducción completa español
- ✅ Mejorar mensajes disponibilidades
- ✅ Filtrar notificaciones vistas

### Fase 3: Funcionalidades (3-4 días)
- ✅ Componente fotos niñera
- ✅ Clarificar precios catálogo
- ✅ Arreglar bookings panel niñera

### Fase 4: Arquitectura (3-5 días)
- ✅ Tabla intermedia roles duales
- ✅ Testing completo
- ✅ Documentación

---

## 🧪 Testing

### Tests Unitarios
```python
# tests/test_validators.py
def test_chilean_phone_valid():
    assert validate_chilean_phone('+56912345678')
    assert validate_chilean_phone('912345678')

def test_chilean_phone_invalid():
    with pytest.raises(ValidationError):
        validate_chilean_phone('123456')
```

### Tests de Integración
```python
# tests/test_bookings.py
def test_reject_booking_message():
    response = client.post(f'/bookings/{booking.id}/reject/')
    notification = Notification.objects.filter(user=parent).first()
    assert 'no pudo ser aceptada' in notification.message
```

---

## 📦 Dependencias Nuevas

```bash
# Backend
pip install Pillow  # Para manejo de imágenes

# Frontend
npm install react-dropzone  # Para upload de imágenes
```

---

## 🔄 Migraciones Requeridas

```bash
# Después de modificar modelos
python manage.py makemigrations
python manage.py migrate

# Migraciones específicas:
# - nannies: agregar profile_image
# - users: agregar UserRole (si se implementa opción 2)
# - parents: validadores (no requiere migración)
```

---

## 📚 Documentación Adicional

- [Validadores Django](https://docs.djangoproject.com/en/4.2/ref/validators/)
- [ImageField Django](https://docs.djangoproject.com/en/4.2/ref/models/fields/#imagefield)
- [React Dropzone](https://react-dropzone.js.org/)
- [i18n React](https://react.i18next.com/)

---

**Documento preparado por:** GitHub Copilot  
**Última actualización:** 1 de diciembre de 2025
