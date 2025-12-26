from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from drf_spectacular.utils import extend_schema
import logging
from django.utils import timezone
from core.mixins import RoleBasedQuerysetMixin
from .models import Booking, Availability
from .serializer import BookingSerializer, AvailabilitySerializer, NotificationSerializer
from .constants import (
    BOOKING_STATUS_CONFIRMED,
    BOOKING_STATUS_REJECTED,
    BOOKING_STATUS_CANCELLED,
    BOOKING_STATUS_COMPLETED,
    BOOKING_MESSAGES
)

logger = logging.getLogger(__name__)

# --- BOOKING ---
class BookingListCreateView(RoleBasedQuerysetMixin, generics.ListCreateAPIView):
    """
    Vista para listar y crear reservas.
    
    GET:
    - Padres ven sus propias reservas
    - Niñeras ven las reservas que han recibido
    
    POST:
    - Crea una nueva reserva
    - Notifica automáticamente a la niñera
    """
    serializer_class = BookingSerializer
    permission_classes = [permissions.IsAuthenticated]
    queryset = Booking.objects.all()
    
    # Configuración del mixin
    parent_filter_field = 'parent'
    nanny_filter_field = 'nanny'
    select_related_fields = ('parent', 'nanny')

    def perform_create(self, serializer):
        """
        Crea una nueva reserva y notifica a la niñera.
        
        Args:
            serializer: BookingSerializer con datos validados
            
        Side effects:
            - Guarda booking con parent = usuario autenticado
            - Crea notificación para la niñera usando NotificationService
            - Registra evento en logs
        """
        from .services import NotificationService
        
        booking = serializer.save(parent=self.request.user)
        
        # Crear notificación para la niñera usando el servicio
        NotificationService.notify_new_booking(booking, self.request.user)
        
        # Log booking creation
        logger.info(
            f"booking_created id={booking.id} parent={booking.parent.username} "
            f"nanny={booking.nanny.username} start={booking.start_time} end={booking.end_time}"
        )


class BookingDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    Vista para gestionar una reserva específica.
    
    Endpoints:
        GET: Obtiene detalles de la reserva
        PATCH/PUT: Actualiza la reserva
        DELETE: Elimina la reserva
        
    Permissions:
        - Usuario debe estar autenticado
        - Solo el creador (parent) o destinatario (nanny) pueden acceder
    """
    queryset = Booking.objects.all()
    serializer_class = BookingSerializer
    permission_classes = [permissions.IsAuthenticated]


# --- AVAILABILITY ---
class AvailabilityListCreateView(generics.ListCreateAPIView):
    """
    Vista para que las niñeras gestionen su disponibilidad.
    
    GET: Lista la disponibilidad de la niñera autenticada
    POST: Crea un nuevo slot de disponibilidad
    """
    serializer_class = AvailabilitySerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Si se pasa el parámetro 'nanny' en la querystring, devolver la disponibilidad
        # de esa niñera (uso de lectura pública por usuarios autenticados).
        nanny_id = self.request.query_params.get('nanny')
        if nanny_id:
            return Availability.objects.filter(nanny__id=nanny_id).select_related('nanny')
        return Availability.objects.filter(nanny=self.request.user).select_related('nanny')

    def perform_create(self, serializer):
        serializer.save(nanny=self.request.user)
        # Log availability created
        obj = serializer.instance
        logger.info(f"availability_created id={obj.id} nanny={obj.nanny.username} day={obj.day} start={obj.start_time} end={obj.end_time}")

class AvailabilityDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Vista para actualizar o eliminar un slot de disponibilidad."""
    serializer_class = AvailabilitySerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Availability.objects.filter(nanny=self.request.user)


# --- NOTIFICATION ---
class NotificationListView(generics.ListAPIView):
    """
    Vista para listar las notificaciones del usuario autenticado.
    Ordenadas por fecha de creación (más recientes primero).
    """
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return self.request.user.notifications.all().order_by('-created_at')

class NotificationDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Vista para obtener, actualizar o eliminar una notificación específica."""
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return self.request.user.notifications.all()


# --- ACCIONES PERSONALIZADAS ---

def _update_booking_status(booking, new_status, request_user, recipient_role):
    """
    Actualiza el estado de una reserva y crea notificación.
    
    Args:
        booking: Objeto Booking a actualizar
        new_status: Nuevo estado ('confirmed', 'rejected', 'cancelled', 'completed')
        request_user: Usuario que realiza la acción
        recipient_role: 'parent' o 'nanny' (destinatario de la notificación)
    """
    from .services import NotificationService
    
    booking.status = new_status
    booking.save()
    
    # Determinar el destinatario de la notificación
    recipient = booking.parent if recipient_role == 'parent' else booking.nanny
    
    # Crear notificación usando el servicio
    NotificationService.notify_booking_status_change(
        booking=booking,
        new_status=new_status,
        notifier=request_user,
        recipient=recipient
    )
    
    logger.info(f"booking_status_updated id={booking.id} status={new_status} by={request_user.username}")


@extend_schema(request=None, responses=None)
@api_view(["POST"])
@permission_classes([permissions.IsAuthenticated])
def accept_booking(request, pk):
    """Aceptar una reserva (solo la niñera)."""
    try:
        booking = Booking.objects.get(pk=pk, nanny=request.user)
    except Booking.DoesNotExist:
        return Response({"error": BOOKING_MESSAGES['NOT_FOUND']},
                        status=status.HTTP_404_NOT_FOUND)

    _update_booking_status(booking, BOOKING_STATUS_CONFIRMED, request.user, 'parent')
    return Response({"message": BOOKING_MESSAGES['ACCEPTED']}, status=status.HTTP_200_OK)


@extend_schema(request=None, responses=None)
@api_view(["POST"])
@permission_classes([permissions.IsAuthenticated])
def reject_booking(request, pk):
    """Rechazar una reserva (solo la niñera)."""
    try:
        booking = Booking.objects.get(pk=pk, nanny=request.user)
    except Booking.DoesNotExist:
        return Response({"error": BOOKING_MESSAGES['NOT_FOUND']},
                        status=status.HTTP_404_NOT_FOUND)

    _update_booking_status(booking, BOOKING_STATUS_REJECTED, request.user, 'parent')
    return Response({"message": BOOKING_MESSAGES['REJECTED']}, status=status.HTTP_200_OK)


@extend_schema(request=None, responses=None)
@api_view(["POST"])
@permission_classes([permissions.IsAuthenticated])
def cancel_booking(request, pk):
    """Cancelar una reserva (solo el padre/madre)."""
    try:
        booking = Booking.objects.get(pk=pk, parent=request.user)
    except Booking.DoesNotExist:
        return Response({"error": BOOKING_MESSAGES['NOT_FOUND']},
                        status=status.HTTP_404_NOT_FOUND)

    _update_booking_status(booking, BOOKING_STATUS_CANCELLED, request.user, 'nanny')
    return Response({"message": BOOKING_MESSAGES['CANCELLED']}, status=status.HTTP_200_OK)


@extend_schema(request=None, responses=None)
@api_view(["POST"])
@permission_classes([permissions.IsAuthenticated])
def complete_booking(request, pk):
    """Marcar una reserva como completada (solo la niñera)."""
    try:
        booking = Booking.objects.get(pk=pk, nanny=request.user)
    except Booking.DoesNotExist:
        return Response({"error": BOOKING_MESSAGES['NOT_FOUND']},
                        status=status.HTTP_404_NOT_FOUND)
    
    # Validar que la reserva haya terminado
    now = timezone.now()
    if booking.end_time > now:
        time_remaining = booking.end_time - now
        hours = int(time_remaining.total_seconds() // 3600)
        minutes = int((time_remaining.total_seconds() % 3600) // 60)
        return Response(
            {
                "error": f"No puedes completar esta reserva aún. Faltan {hours} horas y {minutes} minutos para que termine el servicio.",
                "end_time": booking.end_time.isoformat(),
                "can_complete_at": booking.end_time.isoformat()
            },
            status=status.HTTP_400_BAD_REQUEST
        )

    _update_booking_status(booking, BOOKING_STATUS_COMPLETED, request.user, 'parent')
    return Response({"message": BOOKING_MESSAGES['COMPLETED']}, status=status.HTTP_200_OK)

# Favorites have been moved to the `favorites` app; use /api/favorites/ endpoints.