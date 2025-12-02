# 🚀 Quick Wins - Refactoring Inmediato

Este documento lista los **cambios de mayor impacto con menor esfuerzo** del análisis de refactoring completo.

---

## 1️⃣ Fix Bare Except Clauses (15 minutos)

**Impacto**: 🔴 ALTO - Seguridad y debugging  
**Esfuerzo**: 🟢 BAJO - 5 archivos, ~15 líneas

### Archivos a modificar:

```python
# bookings/serializer.py - Línea 90
# ANTES:
try:
    from parents.models import ParentProfile
    parent_profile = ParentProfile.objects.get(user=instance.parent)
    # ...
except:
    parent_data["parent_profile_id"] = None

# DESPUÉS:
try:
    from parents.models import ParentProfile
    parent_profile = ParentProfile.objects.get(user=instance.parent)
    parent_data["parent_profile_id"] = parent_profile.id
    parent_data["first_name"] = parent_profile.first_name or instance.parent.username
    parent_data["last_name"] = parent_profile.last_name or ""
except ParentProfile.DoesNotExist:
    logger.warning(f"ParentProfile not found for user {instance.parent.id}")
    parent_data["parent_profile_id"] = None
    parent_data["first_name"] = instance.parent.username
    parent_data["last_name"] = ""
```

**Repetir para**:
- `bookings/serializer.py` línea 112 (NannyProfile)
- `favorites/views.py` línea 28
- `bookings/views.py` línea 60, 100

---

## 2️⃣ Estandarizar Logging (10 minutos)

**Impacto**: 🟡 MEDIO - Mantenibilidad  
**Esfuerzo**: 🟢 BAJO - Agregar 1 línea en 5 archivos

### Template para cada views.py:

```python
# ✅ Agregar al inicio de CADA archivo views.py
import logging
logger = logging.getLogger(__name__)

# ❌ ELIMINAR todos los:
try:
    logger = logging.getLogger('app_name')
    logger.info(...)
except Exception:
    pass

# ✅ REEMPLAZAR con:
logger.info(...)  # Directo, sin try/except
```

**Archivos**:
- `bookings/views.py`
- `favorites/views.py`
- `nannies/views.py` (ya tiene ✅)
- `parents/views.py`
- `reviews/views.py` (ya tiene ✅)

---

## 3️⃣ Agregar select_related en Querysets (20 minutos)

**Impacto**: 🔴 ALTO - Rendimiento (reduce queries 90%+)  
**Esfuerzo**: 🟢 BAJO - 3 archivos

### reviews/views.py

```python
# ANTES:
def get_queryset(self):
    user = self.request.user
    if user.role == 'parent':
        return Review.objects.filter(parent=user)
    elif user.role == 'nanny':
        return Review.objects.filter(nanny__user=user)

# DESPUÉS:
def get_queryset(self):
    user = self.request.user
    if user.role == 'parent':
        return Review.objects.filter(parent=user)\
            .select_related('nanny', 'nanny__user')
    elif user.role == 'nanny':
        return Review.objects.filter(nanny__user=user)\
            .select_related('parent', 'nanny', 'nanny__user')
```

### bookings/views.py

```python
# Línea 27-31
def get_queryset(self):
    user = self.request.user
    if user.role == "parent":
        return Booking.objects.filter(parent=user)\
            .select_related('parent', 'nanny')  # ✅ AGREGAR
    elif user.role == "nanny":
        return Booking.objects.filter(nanny=user)\
            .select_related('parent', 'nanny')  # ✅ AGREGAR
```

### nannies/views.py

```python
# Línea 34-54
def get_queryset(self):
    queryset = NannyProfile.objects.all()\
        .select_related('user')  # ✅ AGREGAR
    # ... resto del código
```

**Resultado esperado**: 
- Lista de 50 reviews: 51 queries → 1 query
- Lista de 100 bookings: 101 queries → 1 query

---

## 4️⃣ Crear Archivo de Constantes (10 minutos)

**Impacto**: 🟡 MEDIO - Mantenibilidad  
**Esfuerzo**: 🟢 BAJO - Crear 1 archivo nuevo

```python
# bookings/constants.py (nuevo archivo)
"""Constantes para la app de bookings."""

# Status de Booking
BOOKING_STATUS_PENDING = 'pending'
BOOKING_STATUS_CONFIRMED = 'confirmed'
BOOKING_STATUS_REJECTED = 'rejected'
BOOKING_STATUS_CANCELLED = 'cancelled'
BOOKING_STATUS_COMPLETED = 'completed'

BOOKING_STATUS_CHOICES = [
    (BOOKING_STATUS_PENDING, 'Pendiente'),
    (BOOKING_STATUS_CONFIRMED, 'Confirmada'),
    (BOOKING_STATUS_REJECTED, 'Rechazada'),
    (BOOKING_STATUS_CANCELLED, 'Cancelada'),
    (BOOKING_STATUS_COMPLETED, 'Completada'),
]

# Mensajes de respuesta
BOOKING_MESSAGES = {
    'ACCEPTED': "Reserva aceptada.",
    'REJECTED': "Reserva rechazada.",
    'CANCELLED': "Reserva cancelada.",
    'COMPLETED': "Reserva completada.",
    'NOT_FOUND': "Reserva no encontrada o no autorizada.",
}

# Mensajes de notificación
NOTIFICATION_SUBJECTS = {
    BOOKING_STATUS_CONFIRMED: 'Reserva Confirmada',
    BOOKING_STATUS_REJECTED: 'Reserva Rechazada',
    BOOKING_STATUS_CANCELLED: 'Reserva Cancelada',
    BOOKING_STATUS_COMPLETED: 'Reserva Completada',
}

NOTIFICATION_ACTIONS = {
    BOOKING_STATUS_CONFIRMED: 'confirmada',
    BOOKING_STATUS_REJECTED: 'rechazada',
    BOOKING_STATUS_CANCELLED: 'cancelada',
    BOOKING_STATUS_COMPLETED: 'completada',
}
```

### Usar en código:

```python
# bookings/views.py
from .constants import BOOKING_MESSAGES, BOOKING_STATUS_CONFIRMED

@api_view(["POST"])
def accept_booking(request, pk):
    # ...
    booking.status = BOOKING_STATUS_CONFIRMED
    booking.save()
    return Response(
        {"message": BOOKING_MESSAGES['ACCEPTED']}, 
        status=status.HTTP_200_OK
    )
```

---

## 5️⃣ Agregar Docstrings Consistentes (30 minutos)

**Impacto**: 🟡 MEDIO - Documentación  
**Esfuerzo**: 🟡 MEDIO - ~10 archivos

### Template a seguir:

```python
class MyAPIView(generics.ListCreateAPIView):
    """
    [Descripción breve en una línea]
    
    Permissions:
    - IsAuthenticated
    
    GET:
    - [Qué retorna]
    - [Filtros disponibles si aplica]
    
    POST:
    - [Qué crea]
    - [Validaciones importantes]
    
    Query Parameters:
    - param_name (type): descripción
    
    Example:
        GET /api/endpoint/?filter=value
        POST /api/endpoint/ {"field": "value"}
    """
```

**Aplicar a**:
- `favorites/views.py` - FavoriteListCreateView (incompleto)
- `nannies/views.py` - NannyListView (falta ejemplo)
- `parents/views.py` - ParentProfileDetailView (muy breve)

---

## 📊 Resumen de Impacto

| Quick Win | Tiempo | Impacto | Archivos | ROI |
|-----------|--------|---------|----------|-----|
| 1. Fix bare except | 15 min | 🔴 Alto | 3 | ⭐⭐⭐⭐⭐ |
| 2. Logging estándar | 10 min | 🟡 Medio | 5 | ⭐⭐⭐⭐ |
| 3. select_related | 20 min | 🔴 Alto | 3 | ⭐⭐⭐⭐⭐ |
| 4. Constantes | 10 min | 🟡 Medio | 1 | ⭐⭐⭐ |
| 5. Docstrings | 30 min | 🟡 Medio | 10 | ⭐⭐⭐ |
| **TOTAL** | **85 min** | - | **22 archivos** | - |

**Resultado**: En menos de **2 horas** puedes mejorar significativamente la calidad del código con impacto en seguridad, rendimiento y mantenibilidad.

---

## ✅ Checklist de Implementación

```markdown
Sprint Quick Wins (1-2 horas):
- [ ] 1. Reemplazar bare except en bookings/serializer.py (L90)
- [ ] 2. Reemplazar bare except en bookings/serializer.py (L112)
- [ ] 3. Reemplazar bare except en favorites/views.py (L28)
- [ ] 4. Reemplazar bare except en bookings/views.py (L60, L100)
- [ ] 5. Agregar logger = logging.getLogger(__name__) en bookings/views.py
- [ ] 6. Agregar logger = logging.getLogger(__name__) en favorites/views.py
- [ ] 7. Agregar logger = logging.getLogger(__name__) en parents/views.py
- [ ] 8. Eliminar try/except de logging en bookings/views.py
- [ ] 9. Agregar select_related en reviews/views.py get_queryset
- [ ] 10. Agregar select_related en bookings/views.py get_queryset
- [ ] 11. Agregar select_related en nannies/views.py get_queryset
- [ ] 12. Crear bookings/constants.py
- [ ] 13. Importar constantes en bookings/views.py
- [ ] 14. Reemplazar strings con constantes en accept_booking
- [ ] 15. Reemplazar strings con constantes en reject_booking
- [ ] 16. Reemplazar strings con constantes en cancel_booking
- [ ] 17. Reemplazar strings con constantes en complete_booking
- [ ] 18. Mejorar docstring de FavoriteListCreateView
- [ ] 19. Mejorar docstring de NannyListView
- [ ] 20. Mejorar docstring de ParentProfileDetailView

Post-implementación:
- [ ] Ejecutar tests: python manage.py test
- [ ] Verificar logs: tail -f logs/django.log
- [ ] Verificar queries: DEBUG_TOOLBAR o logging queries
- [ ] Commit: "refactor: implement quick wins from analysis"
```

---

**Próximos pasos**: Una vez completados estos quick wins, revisar el documento `REFACTORING_ANALYSIS.md` para cambios más profundos (Prioridad Media/Baja).
