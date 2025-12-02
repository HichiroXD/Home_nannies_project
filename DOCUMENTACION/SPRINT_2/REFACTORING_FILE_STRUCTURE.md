# 📁 Estructura de Archivos Sugerida - Refactoring

Este documento propone una nueva estructura de archivos para mejorar la organización del código y facilitar el mantenimiento.

---

## 🎯 Estructura Actual vs Propuesta

### Bookings App - ANTES:
```
bookings/
├── __init__.py
├── admin.py
├── apps.py
├── models.py
├── serializer.py          # 225 líneas
├── signals.py
├── tests.py
├── urls.py
├── views.py               # 243 líneas
├── migrations/
└── __pycache__/
```

### Bookings App - DESPUÉS (Propuesto):
```
bookings/
├── __init__.py
├── admin.py
├── apps.py
├── models.py
├── signals.py
├── urls.py
├── constants.py           # ✅ NUEVO - Constantes compartidas
├── utils.py               # ✅ NUEVO - Helpers reutilizables
├── serializers/           # ✅ NUEVA carpeta
│   ├── __init__.py
│   ├── booking.py         # BookingSerializer
│   └── availability.py    # AvailabilitySerializer
├── views/                 # ✅ NUEVA carpeta
│   ├── __init__.py
│   ├── bookings.py        # Vistas de Booking
│   ├── availability.py    # Vistas de Availability
│   └── actions.py         # accept/reject/cancel/complete
├── tests/                 # ✅ NUEVA carpeta
│   ├── __init__.py
│   ├── test_models.py
│   ├── test_serializers.py
│   ├── test_views.py
│   └── test_edge_cases.py
├── migrations/
└── __pycache__/
```

---

## 📦 Contenido de Nuevos Archivos

### bookings/constants.py
```python
"""Constantes para la app de bookings."""

# Status choices
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

# Días de la semana (para Availability)
WEEKDAY_CHOICES = [
    ('monday', 'Lunes'),
    ('tuesday', 'Martes'),
    ('wednesday', 'Miércoles'),
    ('thursday', 'Jueves'),
    ('friday', 'Viernes'),
    ('saturday', 'Sábado'),
    ('sunday', 'Domingo'),
]
```

### bookings/utils.py
```python
"""Utilidades compartidas para la app de bookings."""

import logging
from typing import Dict, Type, Any
from django.db.models import Model
from users.models import User

logger = logging.getLogger(__name__)


def get_user_profile_data(
    user: User,
    profile_model: Type[Model],
    profile_attr: str = 'id'
) -> Dict[str, Any]:
    """
    Extrae datos de usuario con su perfil asociado.
    
    Args:
        user: Instancia de User
        profile_model: Modelo del perfil (ParentProfile o NannyProfile)
        profile_attr: Nombre del atributo del perfil
    
    Returns:
        dict con datos del usuario y perfil
    
    Example:
        >>> from parents.models import ParentProfile
        >>> data = get_user_profile_data(user, ParentProfile, 'parent_profile_id')
    """
    user_data = {
        "id": user.id,
        "username": user.username,
        "email": user.email,
        "role": user.role,
    }
    
    try:
        profile = profile_model.objects.get(user=user)
        user_data[profile_attr] = profile.id
        user_data["first_name"] = user.first_name or user.username
        user_data["last_name"] = user.last_name or ""
    except profile_model.DoesNotExist:
        logger.warning(f"{profile_model.__name__} not found for user {user.id}")
        user_data[profile_attr] = None
        user_data["first_name"] = user.first_name or user.username
        user_data["last_name"] = user.last_name or ""
    
    return user_data


def format_datetime_for_chile(dt):
    """
    Convierte datetime a timezone de Chile.
    
    Args:
        dt: datetime object (timezone-aware)
    
    Returns:
        datetime convertido a America/Santiago
    """
    from zoneinfo import ZoneInfo
    chile_tz = ZoneInfo('America/Santiago')
    return dt.astimezone(chile_tz)
```

### bookings/serializers/__init__.py
```python
"""Serializers para la app de bookings."""

from .booking import BookingSerializer
from .availability import AvailabilitySerializer

__all__ = ['BookingSerializer', 'AvailabilitySerializer']
```

### bookings/serializers/booking.py
```python
"""Serializer para el modelo Booking."""

from rest_framework import serializers
from django.utils import timezone

from ..models import Booking, Availability
from ..utils import get_user_profile_data
from parents.models import ParentProfile
from nannies.models import NannyProfile

import logging
logger = logging.getLogger(__name__)


class BookingSerializer(serializers.ModelSerializer):
    """
    Serializer para gestionar reservas.
    
    Fields:
    - parent: ReadOnly (asignado automáticamente)
    - status: ReadOnly (gestionado por acciones)
    - nanny: Requerido, debe ser usuario con rol 'nanny'
    - start_time: Debe ser futura
    - end_time: Debe ser mayor a start_time
    
    Validations:
    - Verifica disponibilidad de la niñera
    - Previene solapamientos con otras reservas
    """
    parent = serializers.ReadOnlyField(source="parent.id")

    class Meta:
        model = Booking
        fields = "__all__"
        read_only_fields = ["status", "created_at", "updated_at", "parent"]

    def validate(self, data):
        start = data.get("start_time", None)
        end = data.get("end_time", None)
        nanny = data.get("nanny", None)

        if start and end and start >= end:
            raise serializers.ValidationError(
                "La hora de inicio debe ser menor que la hora de fin."
            )

        if start and start <= timezone.now():
            raise serializers.ValidationError(
                "La fecha y hora de inicio debe ser futura."
            )

        if nanny:
            if not hasattr(nanny, 'role'):
                raise serializers.ValidationError(
                    f"El usuario con ID {nanny.id} no tiene rol definido."
                )
            if nanny.role != "nanny":
                raise serializers.ValidationError(
                    f"El usuario seleccionado tiene rol '{nanny.role}', no es una niñera."
                )

        # Verificar disponibilidad de la niñera
        if start and end and nanny:
            self._validate_availability(nanny, start, end)
            self._validate_no_overlap(nanny, start, end)

        return data

    def _validate_availability(self, nanny, start, end):
        """Verifica que la niñera tenga disponibilidad en el horario solicitado."""
        availability_qs = Availability.objects.filter(
            nanny=nanny,
            day=start.date(),
            start_time__lte=start.time(),
            end_time__gte=end.time(),
        )
        
        if not availability_qs.exists():
            day_availabilities = Availability.objects.filter(
                nanny=nanny,
                day=start.date()
            )
            
            if day_availabilities.exists():
                slots = ", ".join([
                    f"{a.start_time.strftime('%H:%M')}-{a.end_time.strftime('%H:%M')}" 
                    for a in day_availabilities
                ])
                raise serializers.ValidationError(
                    f"La niñera no tiene disponibilidad en el horario "
                    f"{start.time().strftime('%H:%M')}-{end.time().strftime('%H:%M')}. "
                    f"Horarios disponibles ese día: {slots}"
                )
            else:
                raise serializers.ValidationError(
                    f"La niñera no tiene disponibilidad el {start.date().strftime('%d/%m/%Y')}."
                )

    def _validate_no_overlap(self, nanny, start, end):
        """Verifica que no haya solapamiento con otras reservas confirmadas."""
        overlap_qs = Booking.objects.filter(
            nanny=nanny,
            status="confirmed",
            start_time__lt=end,
            end_time__gt=start,
        ).exclude(pk=self.instance.pk if self.instance else None)

        if overlap_qs.exists():
            raise serializers.ValidationError(
                "La niñera ya tiene una reserva confirmada en ese rango."
            )

    def to_representation(self, instance):
        """Incluye información extendida de parent y nanny."""
        rep = super().to_representation(instance)
        
        rep["parent"] = get_user_profile_data(
            instance.parent, ParentProfile, 'parent_profile_id'
        )
        rep["nanny"] = get_user_profile_data(
            instance.nanny, NannyProfile, 'nanny_profile_id'
        )
        
        return rep
```

### bookings/views/__init__.py
```python
"""Views para la app de bookings."""

from .bookings import BookingListCreateView, BookingDetailView
from .availability import AvailabilityListCreateView, AvailabilityDetailView
from .actions import accept_booking, reject_booking, cancel_booking, complete_booking

__all__ = [
    'BookingListCreateView',
    'BookingDetailView',
    'AvailabilityListCreateView',
    'AvailabilityDetailView',
    'accept_booking',
    'reject_booking',
    'cancel_booking',
    'complete_booking',
]
```

### bookings/views/bookings.py
```python
"""Vistas para gestionar reservas (Bookings)."""

from rest_framework import generics, permissions
from notifications.services import NotificationService

from ..models import Booking
from ..serializers import BookingSerializer

import logging
logger = logging.getLogger(__name__)


class BookingListCreateView(generics.ListCreateAPIView):
    """
    Vista para listar y crear reservas.
    
    Permissions:
    - IsAuthenticated
    
    GET:
    - Padres ven sus propias reservas
    - Niñeras ven las reservas que han recibido
    - Resultados ordenados por fecha de inicio
    
    POST:
    - Crea una nueva reserva
    - Notifica automáticamente a la niñera
    - Valida disponibilidad y solapamientos
    
    Example:
        GET /api/bookings/
        POST /api/bookings/ {
            "nanny": 1,
            "start_time": "2024-01-15T09:00:00Z",
            "end_time": "2024-01-15T17:00:00Z",
            "notes": "Cuidado de 2 niños"
        }
    """
    serializer_class = BookingSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == "parent":
            return Booking.objects.filter(parent=user)\
                .select_related('parent', 'nanny')\
                .order_by('-start_time')
        elif user.role == "nanny":
            return Booking.objects.filter(nanny=user)\
                .select_related('parent', 'nanny')\
                .order_by('-start_time')
        return Booking.objects.none()

    def perform_create(self, serializer):
        booking = serializer.save(parent=self.request.user)
        
        # Crear notificación para la niñera
        NotificationService.notify_new_booking(booking, self.request.user)
        
        logger.info(
            f"booking_created id={booking.id} "
            f"parent={booking.parent.username} "
            f"nanny={booking.nanny.username} "
            f"start={booking.start_time} end={booking.end_time}"
        )


class BookingDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    Vista para obtener, actualizar o eliminar una reserva específica.
    
    Permissions:
    - IsAuthenticated
    - Solo el owner (parent o nanny) puede acceder
    
    GET: Obtiene detalles de la reserva
    PUT/PATCH: Actualiza la reserva (limitado)
    DELETE: Elimina la reserva
    """
    queryset = Booking.objects.all()
    serializer_class = BookingSerializer
    permission_classes = [permissions.IsAuthenticated]
```

### bookings/views/actions.py
```python
"""Acciones sobre bookings (accept, reject, cancel, complete)."""

from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from drf_spectacular.utils import extend_schema

from notifications.services import NotificationService
from ..models import Booking
from ..constants import (
    BOOKING_STATUS_CONFIRMED,
    BOOKING_STATUS_REJECTED,
    BOOKING_STATUS_CANCELLED,
    BOOKING_STATUS_COMPLETED,
    BOOKING_MESSAGES
)

import logging
logger = logging.getLogger(__name__)


@extend_schema(request=None, responses=None)
@api_view(["POST"])
@permission_classes([permissions.IsAuthenticated])
def accept_booking(request, pk):
    """
    Aceptar una reserva (solo la niñera).
    
    Args:
        pk: ID de la reserva
    
    Returns:
        200: Reserva aceptada exitosamente
        404: Reserva no encontrada o no autorizada
    
    Example:
        POST /api/bookings/1/accept/
    """
    try:
        booking = Booking.objects.get(pk=pk, nanny=request.user)
    except Booking.DoesNotExist:
        return Response(
            {"error": BOOKING_MESSAGES['NOT_FOUND']},
            status=status.HTTP_404_NOT_FOUND
        )

    booking.status = BOOKING_STATUS_CONFIRMED
    booking.save()
    
    NotificationService.notify_booking_status_change(
        booking=booking,
        new_status=BOOKING_STATUS_CONFIRMED,
        notifier=request.user,
        recipient=booking.parent
    )
    
    logger.info(f"booking_accepted id={booking.id} by={request.user.username}")
    return Response({"message": BOOKING_MESSAGES['ACCEPTED']}, status=status.HTTP_200_OK)


# ... reject_booking, cancel_booking, complete_booking similar
```

---

## 🔄 Plan de Migración

### Fase 1: Crear estructura nueva (Sin romper código)
```bash
# 1. Crear nuevos archivos
mkdir bookings/serializers bookings/views bookings/tests
touch bookings/constants.py bookings/utils.py
touch bookings/serializers/{__init__,booking,availability}.py
touch bookings/views/{__init__,bookings,availability,actions}.py

# 2. Copiar código a nuevos archivos (mantener originales)
# 3. Actualizar imports en nuevos archivos
# 4. Crear tests para verificar funcionalidad
```

### Fase 2: Actualizar imports (Transición gradual)
```python
# bookings/urls.py - ACTUALIZAR imports
from .views import (
    BookingListCreateView,
    BookingDetailView,
    accept_booking,
    # ...
)
```

### Fase 3: Eliminar archivos antiguos
```bash
# Solo después de verificar que todo funciona
rm bookings/serializer.py  # Reemplazado por serializers/
# views.py se mantiene temporalmente con imports de retrocompatibilidad
```

---

## 📂 Otras Apps a Refactorizar

### Reviews App
```
reviews/
├── constants.py           # ✅ NUEVO - Rating choices, mensajes
├── utils.py               # ✅ NUEVO - Helpers
├── serializers/
│   ├── review.py
│   └── review_create.py
├── views/
│   ├── reviews.py
│   └── ...
```

### Notifications App (Prioridad Alta)
```
notifications/
├── constants.py           # ✅ NUEVO - Tipos de notificación, canales
├── services.py            # ✅ NUEVO - NotificationService
├── utils.py               # ✅ NUEVO - Formateo de mensajes
├── serializers/
├── views/
└── tests/
```

---

## ✅ Beneficios de Esta Estructura

1. **Modularidad**: Cada archivo tiene responsabilidad única
2. **Escalabilidad**: Fácil agregar nuevos serializers/views sin archivos gigantes
3. **Testing**: Tests organizados por componente
4. **Colaboración**: Menos conflictos en Git (archivos más pequeños)
5. **Navegación**: Más fácil encontrar código específico
6. **Mantenimiento**: Cambios localizados, menor impacto

---

**Siguiente paso**: Implementar esta estructura en la app `bookings` como piloto, luego replicar en otras apps.
