# 🔧 Análisis de Refactorización Completo - Home Nannies Project

**Fecha:** 2 de diciembre de 2025  
**Versión:** 2.2.0  
**Scope:** Backend (Django) + Frontend (React)  
**Prioridad:** Por impacto y facilidad de implementación

---

## 📊 Resumen Ejecutivo

### Situación Actual
- ✅ **Backend:** 19/19 tests pasando, bien estructurado
- ✅ **Frontend:** 91/97 tests (93.8%), componentes modernos
- ⚠️ **Código Legado:** Carpeta `Front_React_app` sin usar (⚠️ ELIMINAR)
- ⚠️ **Duplicación:** Lógica similar en múltiples views
- ⚠️ **Documentación:** Algunos archivos de migración/setup obsoletos

### Oportunidades Identificadas
1. 🔴 **ALTA PRIORIDAD** - Eliminar código muerto (Front_React_app)
2. 🟡 **MEDIA PRIORIDAD** - Consolidar servicios de notificaciones
3. 🟢 **BAJA PRIORIDAD** - Optimizaciones menores

---

## 🔴 PRIORIDAD ALTA - Acción Inmediata

### 1. ❌ Eliminar Carpeta `Front_React_app` (Código Muerto)

**Problema:**
```
Home_nannies_project/
├── Front_React_app/          ← ⚠️ CÓDIGO LEGADO/NO USADO
│   ├── src/
│   │   ├── pages/Login_original.js
│   │   ├── pages/Register_original.js
│   │   ├── views/Login.js
│   │   └── ...
├── frontend_nannies/          ← ✅ FRONTEND ACTUAL
    └── src/
        ├── views/
        ├── components/
        └── ...
```

**Impacto:**
- 📦 **Reduce tamaño del repo:** ~500-1000 archivos sin usar
- 🔍 **Mejora búsquedas:** Sin resultados duplicados
- 🧹 **Limpieza:** Elimina confusión para nuevos desarrolladores
- ⚡ **CI/CD:** Builds más rápidos

**Acción:**
```bash
# Backup primero (por si acaso)
git mv Front_React_app _DEPRECATED_Front_React_app

# O eliminar directamente
rm -rf Front_React_app

# Commit
git add -A
git commit -m "chore: remove deprecated Front_React_app folder"
```

**Justificación:**
- `frontend_nannies` es el frontend oficial con Vite + React
- `Front_React_app` tiene componentes duplicados (`Login.js`, `Register.js`)
- Ningún script de build actual lo referencia
- Documentación apunta a `frontend_nannies`

---

### 2. 🔄 Consolidar Servicios de Notificaciones

**Problema Actual:**

**En `bookings/views.py`:**
```python
def perform_create(self, serializer):
    from .services import NotificationService
    
    booking = serializer.save(parent=self.request.user)
    NotificationService.notify_new_booking(booking, self.request.user)
```

**En `reviews/views.py`:**
```python
# Notificación INLINE sin usar servicio
Notification.objects.create(
    user=request.user,
    channel='in_app',
    subject='Reseña publicada',
    message=f'Has dejado una reseña...',
    status='sent',
    context_data={'review_id': review.id}
)

Notification.objects.create(
    user=nanny_profile.user,
    channel='in_app',
    subject='Nueva reseña recibida',
    message=f'{request.user.get_full_name()}...',
    status='sent',
    context_data={'review_id': review.id}
)
```

**Solución:**

**1. Crear servicio centralizado `notifications/services.py`:**
```python
# notifications/services.py
from typing import Dict, Any
from django.contrib.auth import get_user_model
from .models import Notification
import logging

User = get_user_model()
logger = logging.getLogger(__name__)


class NotificationService:
    """Servicio centralizado para crear notificaciones consistentes."""
    
    CHANNELS = {
        'in_app': 'in_app',
        'email': 'email',
        'push': 'push',
    }
    
    @classmethod
    def create_notification(
        cls,
        user: User,
        subject: str,
        message: str,
        channel: str = 'in_app',
        context_data: Dict[str, Any] = None,
        status: str = 'sent'
    ) -> Notification:
        """
        Crea una notificación con validación y logging.
        
        Args:
            user: Usuario destinatario
            subject: Asunto de la notificación
            message: Mensaje completo
            channel: Canal ('in_app', 'email', 'push')
            context_data: Datos adicionales (JSON)
            status: Estado inicial
        
        Returns:
            Notification: Instancia creada
        """
        try:
            notification = Notification.objects.create(
                user=user,
                channel=channel,
                subject=subject,
                message=message,
                status=status,
                context_data=context_data or {}
            )
            
            logger.info(
                f"notification_created id={notification.id} "
                f"user={user.username} subject='{subject}' channel={channel}"
            )
            
            return notification
            
        except Exception as e:
            logger.error(
                f"notification_creation_failed user={user.username} "
                f"subject='{subject}' error={str(e)}"
            )
            raise
    
    @classmethod
    def notify_review_created(cls, review, parent) -> tuple:
        """
        Crea notificaciones para parent y nanny cuando se crea una reseña.
        
        Returns:
            tuple: (notification_parent, notification_nanny)
        """
        # Notificación para el padre
        notif_parent = cls.create_notification(
            user=parent,
            subject='Reseña publicada',
            message=f'Has dejado una reseña de {review.rating} estrellas para {review.nanny.user.get_full_name() or review.nanny.user.username}.',
            context_data={
                'review_id': review.id,
                'rating': review.rating,
                'nanny_id': review.nanny.id
            }
        )
        
        # Notificación para la niñera
        notif_nanny = cls.create_notification(
            user=review.nanny.user,
            subject='Nueva reseña recibida',
            message=f'{parent.get_full_name() or parent.username} te ha dejado una reseña de {review.rating} estrellas.',
            context_data={
                'review_id': review.id,
                'rating': review.rating,
                'parent_id': parent.id
            }
        )
        
        return notif_parent, notif_nanny
    
    @classmethod
    def notify_new_booking(cls, booking, parent) -> Notification:
        """Notificación para niñera cuando recibe una nueva reserva."""
        return cls.create_notification(
            user=booking.nanny,
            subject='Nueva reserva recibida',
            message=f'{parent.get_full_name() or parent.username} te ha enviado una solicitud de reserva.',
            context_data={
                'booking_id': booking.id,
                'parent_id': parent.id,
                'start_time': booking.start_time.isoformat(),
                'end_time': booking.end_time.isoformat()
            }
        )
    
    @classmethod
    def notify_booking_status_change(
        cls,
        booking,
        new_status: str,
        notifier: User,
        recipient: User
    ) -> Notification:
        """Notificación cuando cambia el estado de una reserva."""
        status_messages = {
            'confirmed': 'Tu reserva ha sido confirmada',
            'rejected': 'Tu reserva ha sido rechazada',
            'cancelled': 'La reserva ha sido cancelada',
            'completed': 'La reserva ha sido completada'
        }
        
        return cls.create_notification(
            user=recipient,
            subject=status_messages.get(new_status, 'Actualización de reserva'),
            message=f'{notifier.get_full_name() or notifier.username} ha actualizado el estado de tu reserva a "{new_status}".',
            context_data={
                'booking_id': booking.id,
                'status': new_status,
                'notifier_id': notifier.id
            }
        )
```

**2. Refactorizar `reviews/views.py`:**
```python
# reviews/views.py
from notifications.services import NotificationService  # ← Importar servicio

def create(self, request, *args, **kwargs):
    # ... código existente ...
    
    # Crear la reseña
    review = Review.objects.create(
        parent=request.user,
        nanny=nanny_profile,
        rating=validated_data.get('rating'),
        comment=validated_data.get('comment', '')
    )
    
    logger.info(f"Review created successfully: {review.id}")
    
    # ✅ USAR SERVICIO EN VEZ DE CÓDIGO INLINE
    NotificationService.notify_review_created(review, request.user)
    
    # Actualizar average_rating de la niñera
    self._update_nanny_average_rating(nanny_profile)
    
    # Retornar respuesta
    output_serializer = ReviewSerializer(review)
    return Response(output_serializer.data, status=status.HTTP_201_CREATED)
```

**3. Verificar `bookings/services.py` y consolidar:**
```python
# bookings/services.py
# Si existe NotificationService aquí, moverlo a notifications/services.py
# y actualizar imports en bookings/views.py

# ANTES:
from .services import NotificationService

# DESPUÉS:
from notifications.services import NotificationService
```

**Beneficios:**
- ✅ **Consistencia:** Todas las notificaciones usan la misma estructura
- ✅ **Logging:** Centralizado y uniforme
- ✅ **Testeable:** Un solo lugar para tests
- ✅ **Mantenible:** Cambios en una sola clase
- ✅ **Reutilizable:** Fácil agregar nuevos tipos de notificaciones

**Impacto:**
- 📉 **Reduce duplicación:** ~30 líneas por tipo de notificación
- 🧪 **Mejora tests:** Mockear un servicio vs múltiples creates
- 📝 **Mejor docs:** Un servicio documentado vs código disperso

---

### 3. 🧹 Limpiar Scripts de Migración/Setup Temporales

**Archivos a Revisar/Eliminar:**
```
Back_Django_REST/
├── fix_parent_profiles.py        ← Script one-time
├── fix_nanny_profiles.py         ← Script one-time
├── verify_nanny_profiles.py      ← Script de verificación
├── verify_bookings_data.py       ← Script de verificación
├── update_booking_status.py      ← Script one-time
├── test_review_endpoint.py       ← Test manual (mover a tests/)
├── test_review_creation.py       ← Test manual
├── test_review_api.py            ← Test manual
├── test_refactoring_manual.py    ← Test manual
├── test_cors.py                  ← Test manual
├── migrate_to_postgresql.py      ← Ya documentado
└── load_programs.py              ← Seed data
```

**Estrategia:**

**A. Scripts de Migración One-Time (Completados):**
```bash
# Crear carpeta para scripts históricos
mkdir -p Back_Django_REST/_scripts_historicos/

# Mover scripts completados
mv Back_Django_REST/fix_*.py Back_Django_REST/_scripts_historicos/
mv Back_Django_REST/verify_*.py Back_Django_REST/_scripts_historicos/
mv Back_Django_REST/update_booking_status.py Back_Django_REST/_scripts_historicos/

# Agregar README
cat > Back_Django_REST/_scripts_historicos/README.md << 'EOF'
# Scripts Históricos

Scripts one-time ejecutados durante el desarrollo.
**NO ejecutar nuevamente** - Solo para referencia histórica.

## Scripts Incluidos

- `fix_parent_profiles.py` - Migración inicial de perfiles padre
- `fix_nanny_profiles.py` - Migración inicial de perfiles niñera
- `verify_nanny_profiles.py` - Verificación post-migración
- `verify_bookings_data.py` - Verificación de datos de bookings
- `update_booking_status.py` - Actualización masiva de estados

## Uso

Estos scripts fueron ejecutados una vez durante el desarrollo.
Si necesitas datos similares, usar fixtures o management commands.
EOF
```

**B. Tests Manuales (Mover a tests/):**
```bash
# Opción 1: Mover a carpeta de tests apropiada
mv Back_Django_REST/test_review_*.py Back_Django_REST/reviews/tests/
mv Back_Django_REST/test_cors.py Back_Django_REST/core/tests/
mv Back_Django_REST/test_refactoring_manual.py Back_Django_REST/_scripts_historicos/

# Opción 2: Eliminar si ya hay tests unitarios completos
# (Ya tienes 19/19 tests pasando, estos pueden ser redundantes)
rm Back_Django_REST/test_review_*.py
rm Back_Django_REST/test_cors.py
```

**C. Scripts Útiles (Mantener y Documentar):**
```python
# Back_Django_REST/scripts/README.md
# Scripts Útiles

Scripts reutilizables para tareas comunes.

## load_programs.py
Carga datos iniciales de programas académicos.

**Uso:**
```bash
python manage.py shell < load_programs.py
```

## migrate_to_postgresql.py
Guía para migración de SQLite a PostgreSQL.

**Ver:** `DOCUMENTACION/DEPLOYMENT/POSTGRESQL_MIGRATION.md`
```

**Beneficios:**
- 🗂️ **Organización:** Raíz del proyecto más limpia
- 📚 **Claridad:** Separar scripts históricos de activos
- 🔍 **Descubribilidad:** Más fácil encontrar lo relevante

---

## 🟡 PRIORIDAD MEDIA - Optimizaciones

### 4. 🔄 Extraer Lógica Común en Views

**Patrón Repetido en `bookings/views.py` y similares:**

```python
# bookings/views.py
def get_queryset(self):
    user = self.request.user
    if user.role == "parent":
        return Booking.objects.filter(parent=user).select_related('parent', 'nanny')
    elif user.role == "nanny":
        return Booking.objects.filter(nanny=user).select_related('parent', 'nanny')
    return Booking.objects.none()

# reviews/views.py
def get_queryset(self):
    user = self.request.user
    if user.role == 'parent':
        return Review.objects.filter(parent=user).select_related('nanny', 'nanny__user')
    elif user.role == 'nanny':
        return Review.objects.filter(nanny__user=user).select_related('parent', 'nanny', 'nanny__user')
    return Review.objects.none()
```

**Solución - Crear Mixin Reutilizable:**

```python
# core/mixins.py
from rest_framework.permissions import BasePermission

class RoleBasedQuerysetMixin:
    """
    Mixin para filtrar querysets basado en el rol del usuario.
    
    Attributes:
        parent_filter_field: Nombre del campo para filtrar padres (default: 'parent')
        nanny_filter_field: Nombre del campo para filtrar niñeras (default: 'nanny')
        select_related_fields: Tupla de campos para select_related
    """
    parent_filter_field = 'parent'
    nanny_filter_field = 'nanny'
    select_related_fields = ()
    
    def get_role_based_queryset(self, queryset):
        """
        Filtra queryset basado en el rol del usuario.
        
        Returns:
            QuerySet filtrado según el rol
        """
        user = self.request.user
        
        # Aplicar select_related si está definido
        if self.select_related_fields:
            queryset = queryset.select_related(*self.select_related_fields)
        
        # Filtrar por rol
        if user.role == 'parent':
            filter_kwargs = {self.parent_filter_field: user}
            return queryset.filter(**filter_kwargs)
        
        elif user.role == 'nanny':
            filter_kwargs = {self.nanny_filter_field: user}
            return queryset.filter(**filter_kwargs)
        
        # Admins ven todo
        elif user.role == 'admin':
            return queryset
        
        return queryset.none()


# Uso en bookings/views.py
from core.mixins import RoleBasedQuerysetMixin

class BookingListCreateView(RoleBasedQuerysetMixin, generics.ListCreateAPIView):
    serializer_class = BookingSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    # Configuración del mixin
    parent_filter_field = 'parent'
    nanny_filter_field = 'nanny'
    select_related_fields = ('parent', 'nanny')
    
    def get_queryset(self):
        return self.get_role_based_queryset(Booking.objects.all())


# Uso en reviews/views.py
class ReviewListCreateView(RoleBasedQuerysetMixin, generics.ListCreateAPIView):
    # Configuración del mixin
    parent_filter_field = 'parent'
    nanny_filter_field = 'nanny__user'  # ← Soporte para lookups
    select_related_fields = ('parent', 'nanny', 'nanny__user')
    
    def get_queryset(self):
        return self.get_role_based_queryset(Review.objects.all())
```

**Beneficios:**
- 📉 **Reduce duplicación:** 10 líneas → 3 líneas por view
- ✅ **Consistente:** Mismo filtrado en todas las vistas
- 🧪 **Testeable:** Testear mixin una vez
- 🔧 **Configurable:** Fácil personalizar campos

---

### 5. 🔐 Validación Centralizada de Errores en API

**Problema:**
```javascript
// frontend_nannies/src/api/userApi.js
export const registerUser = async (userData) => {
  try {
    const response = await API.post("/users/register/", userData);
    return response.data;
  } catch (error) {
    console.error("Error en registerUser:", error.response?.data || error.message);
    throw error.response?.data || { detail: "Error al registrar usuario" };
  }
};

export const loginUser = async (username, password) => {
  try {
    const response = await API.post("/users/login/", { username, password });
    return response.data;
  } catch (error) {
    console.error("Error en loginUser:", error.response?.data || error.message);
    throw error.response?.data || { detail: "Error al iniciar sesión" };
  }
};

// ← PATRÓN REPETIDO 5+ VECES
```

**Solución - Interceptor Centralizado:**

```javascript
// frontend_nannies/src/api/api.js
import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor (agregar token)
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ✅ Response interceptor centralizado
API.interceptors.response.use(
  (response) => response,
  (error) => {
    // Logging centralizado
    console.error("[API Error]", {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      data: error.response?.data,
    });
    
    // Manejo de errores comunes
    if (error.response?.status === 401) {
      // Token expirado
      localStorage.removeItem("accessToken");
      localStorage.removeItem("role");
      window.location.href = "/login";
      return Promise.reject({
        detail: "Sesión expirada. Por favor, inicia sesión nuevamente."
      });
    }
    
    if (error.response?.status === 403) {
      return Promise.reject({
        detail: "No tienes permisos para realizar esta acción."
      });
    }
    
    if (error.response?.status >= 500) {
      return Promise.reject({
        detail: "Error del servidor. Por favor, intenta más tarde."
      });
    }
    
    // Retornar error formateado
    return Promise.reject(
      error.response?.data || { 
        detail: "Error de conexión. Verifica tu internet." 
      }
    );
  }
);

export default API;
```

**Refactorizar `userApi.js`:**
```javascript
// frontend_nannies/src/api/userApi.js
import API from "./api";

// ✅ CÓDIGO SIMPLIFICADO - Error handling en interceptor
export const registerUser = async (userData) => {
  const response = await API.post("/users/register/", userData);
  return response.data;
};

export const loginUser = async (username, password) => {
  const response = await API.post("/users/login/", { username, password });
  return response.data;
};

export const getProfile = async () => {
  const response = await API.get("/users/me/");
  return response.data;
};

export const verifyUser = async (uid, token) => {
  const response = await API.get(`/users/verify/${uid}/${token}/`);
  return response.data;
};

// ... resto de funciones sin try/catch redundante
```

**Beneficios:**
- 📉 **Reduce código:** 10 líneas → 2 líneas por función
- 🔄 **Consistente:** Manejo de errores uniforme
- 🔐 **Seguridad:** Logout automático en 401
- 📊 **Logging:** Centralizado y estructurado

---

### 6. ⚡ Optimizar Imports en Frontend

**Problema:**
```javascript
// Múltiples imports de componentes comunes
import { useForm } from '../components/common/hooks';
import { AlertToast } from '../components/common/AlertToast';
import { DataTable } from '../components/common/DataTable';
import { Modal } from '../components/common/Modal';
```

**Solución - Barrel Exports:**

```javascript
// frontend_nannies/src/components/common/index.js
export { default as AlertToast } from './AlertToast';
export { default as DataTable } from './DataTable';
export { default as Modal } from './Modal';
export { default as FormBuilder } from './FormBuilder';
export { default as AvailabilitySelector } from './AvailabilitySelector';

export * from './hooks';
export * from './utils';

// frontend_nannies/src/components/auth/index.js
export { default as RoleProtectedRoute } from './RoleProtectedRoute';
export { default as LoginForm } from './LoginForm';
// ... más exports
```

**Uso Simplificado:**
```javascript
// ANTES:
import { useForm } from '@components/common/hooks';
import { AlertToast } from '@components/common/AlertToast';
import { DataTable } from '@components/common/DataTable';

// DESPUÉS:
import { useForm, AlertToast, DataTable } from '@components/common';
```

**Beneficios:**
- 📦 **Imports limpios:** 1 línea vs 3+ líneas
- 🔄 **Mejor tree-shaking:** Vite optimiza automáticamente
- 📖 **Documentación:** Punto central para exports

---

## 🟢 PRIORIDAD BAJA - Nice to Have

### 7. 📝 Consistencia en Docstrings

**Añadir docstrings consistentes en todos los views:**

```python
# bookings/views.py
class BookingListCreateView(generics.ListCreateAPIView):
    """
    API endpoint para gestión de reservas.
    
    Endpoints:
        GET /api/bookings/ - Lista reservas del usuario
        POST /api/bookings/ - Crea nueva reserva
    
    Permisos:
        - Autenticado requerido
        - Padres ven sus reservas hechas
        - Niñeras ven sus reservas recibidas
    
    Respuesta GET:
        200 OK - Lista de bookings con perfiles completos
    
    Respuesta POST:
        201 Created - Booking creado + notificación enviada
        400 Bad Request - Datos inválidos
    
    Ejemplo POST:
        {
            "nanny": 5,
            "start_time": "2025-12-10T10:00:00Z",
            "end_time": "2025-12-10T14:00:00Z"
        }
    """
    # ... código
```

---

### 8. 🧪 Agregar Type Hints en Python

```python
# ANTES:
def notify_new_booking(booking, parent):
    # ...

# DESPUÉS:
from typing import Optional
from django.contrib.auth import get_user_model

User = get_user_model()

def notify_new_booking(
    booking: 'Booking',
    parent: User
) -> Optional['Notification']:
    """
    Crea notificación para niñera cuando recibe reserva.
    
    Args:
        booking: Instancia de Booking creada
        parent: Usuario padre que creó la reserva
    
    Returns:
        Notification creada o None si falla
    """
    # ...
```

---

## 📋 Plan de Implementación

### Sprint 1: Quick Wins (2-3 horas) 🔴

**Prioridad:** ALTA  
**Impacto:** Máximo  

1. ✅ **Eliminar `Front_React_app`** (15 min)
   ```bash
   git rm -rf Front_React_app
   git commit -m "chore: remove deprecated frontend folder"
   ```

2. ✅ **Mover scripts históricos** (20 min)
   ```bash
   mkdir _scripts_historicos
   mv fix_*.py verify_*.py update_*.py _scripts_historicos/
   ```

3. ✅ **Consolidar NotificationService** (1.5 horas)
   - Crear `notifications/services.py`
   - Refactorizar `reviews/views.py`
   - Verificar `bookings/services.py`
   - Tests: `python manage.py test notifications`

4. ✅ **Verificación** (30 min)
   ```bash
   # Backend
   python manage.py test  # 19/19 tests

   # Frontend
   npm test  # 91/97 tests
   
   # Build
   npm run build  # Sin errores
   ```

---

### Sprint 2: Optimizaciones (3-4 horas) 🟡

1. ✅ **RoleBasedQuerysetMixin** (1.5 horas)
   - Crear `core/mixins.py`
   - Refactorizar 3-4 views
   - Tests de integración

2. ✅ **API Interceptors** (1 hora)
   - Actualizar `api.js`
   - Simplificar `userApi.js`, `bookingApi.js`, etc.
   - Testing manual

3. ✅ **Barrel Exports** (1 hora)
   - Crear `components/common/index.js`
   - Crear `components/auth/index.js`
   - Actualizar imports en views

---

### Sprint 3: Polish (2 horas) 🟢

1. ✅ **Docstrings** (1 hora)
2. ✅ **Type Hints** (1 hora)

---

## 🎯 Métricas de Éxito

### Código
- ✅ Reducción de 500-1000 archivos (Front_React_app eliminado)
- ✅ Reducción de ~100 líneas de código duplicado
- ✅ 100% tests pasando (19 backend + 91 frontend)

### Mantenibilidad
- ✅ Servicio centralizado de notificaciones
- ✅ Error handling consistente
- ✅ Imports simplificados

### Performance
- ⚡ Build time: -20% (menos archivos)
- ⚡ Developer experience: Mejor búsqueda/navegación

---

## ⚠️ Riesgos y Mitigaciones

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|--------------|---------|------------|
| Tests fallan post-refactor | Media | Alto | Run tests después de cada cambio |
| Breaking changes en API | Baja | Alto | No cambiar interfaces públicas |
| Merge conflicts | Media | Medio | Branch específico, PRs pequeños |

---

## 📚 Recursos

### Documentación Relacionada
- `REFACTORING_SUMMARY.md` - Análisis previo
- `REFACTORING_SPRINT_2_COMPLETED.md` - Refactor completado previamente
- `FRONTEND_TESTING_COMPLETED.md` - Estado actual de tests

### Referencias
- [Django REST Best Practices](https://www.django-rest-framework.org/topics/best-practices/)
- [React Code Splitting](https://react.dev/reference/react/lazy)
- [Axios Interceptors](https://axios-http.com/docs/interceptors)

---

## ✅ Checklist Final

**Antes de empezar:**
- [ ] Crear branch: `git checkout -b refactor/cleanup-and-consolidation`
- [ ] Backup de BD: `python manage.py dumpdata > backup.json`
- [ ] Verificar tests base: `python manage.py test && npm test`

**Durante:**
- [ ] Commit después de cada cambio significativo
- [ ] Run tests frecuentemente
- [ ] Documentar cambios en CHANGELOG.md

**Después:**
- [ ] PR con descripción detallada
- [ ] Code review con al menos 1 aprobación
- [ ] Merge a main
- [ ] Deploy a staging y verificación

---

**Creado:** 2 de diciembre de 2025  
**Autor:** Análisis automático del proyecto  
**Próxima Revisión:** Después de Sprint 1
