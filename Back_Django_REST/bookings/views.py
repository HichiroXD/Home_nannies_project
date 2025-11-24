from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from drf_spectacular.utils import extend_schema
import logging
from .models import Booking, Availability
from notifications.models import Notification
from .serializer import BookingSerializer, AvailabilitySerializer, NotificationSerializer

# --- BOOKING ---
class BookingListCreateView(generics.ListCreateAPIView):
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

    def get_queryset(self):
        # Un padre ve las reservas que hizo, una niñera las que recibió
        user = self.request.user
        if user.role == "parent":
            return Booking.objects.filter(parent=user)
        elif user.role == "nanny":
            return Booking.objects.filter(nanny=user)
        return Booking.objects.none()

    def perform_create(self, serializer):
        booking = serializer.save(parent=self.request.user)
        
        # Crear notificación para la niñera
        # Convertir a hora local de Chile
        from zoneinfo import ZoneInfo
        
        chile_tz = ZoneInfo('America/Santiago')
        start_time_local = booking.start_time.astimezone(chile_tz)
        end_time_local = booking.end_time.astimezone(chile_tz)
        
        message = (f"Tienes una nueva solicitud de reserva de {self.request.user.username} "
                  f"para el {start_time_local.strftime('%d/%m/%Y')} de {start_time_local.strftime('%H:%M')} a {end_time_local.strftime('%H:%M')}.")
        
        Notification.objects.create(
            user=booking.nanny,
            subject="Nueva solicitud de reserva",
            message=message,
            channel='in_app',
            status='sent',
            related_booking_id=str(booking.id)
        )
        
        # Log booking creation
        try:
            logger = logging.getLogger('bookings')
            logger.info(f"booking_created id={booking.id} parent={booking.parent.username} nanny={booking.nanny.username} start={booking.start_time} end={booking.end_time}")
        except Exception:
            pass

class BookingDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Vista para obtener, actualizar o eliminar una reserva específica."""
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
        try:
            obj = serializer.instance
            logger = logging.getLogger('bookings')
            logger.info(f"availability_created id={obj.id} nanny={obj.nanny.username} day={obj.day} start={obj.start_time} end={obj.end_time}")
        except Exception:
            pass

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
    Función auxiliar para actualizar el estado de una reserva y crear notificación.
    
    Args:
        booking: Objeto Booking a actualizar
        new_status: Nuevo estado ('confirmed', 'rejected', 'cancelled', 'completed')
        request_user: Usuario que realiza la acción
        recipient_role: 'parent' o 'nanny' (destinatario de la notificación)
    """
    booking.status = new_status
    booking.save()
    
    # Determinar el destinatario de la notificación
    recipient = booking.parent if recipient_role == 'parent' else booking.nanny
    
    # Convertir a hora local de Chile
    from zoneinfo import ZoneInfo
    
    chile_tz = ZoneInfo('America/Santiago')
    start_time_local = booking.start_time.astimezone(chile_tz)
    end_time_local = booking.end_time.astimezone(chile_tz)
    
    # Mapeo de mensajes y asuntos
    status_info = {
        'confirmed': {'action': 'confirmada', 'subject': 'Reserva Confirmada'},
        'rejected': {'action': 'rechazada', 'subject': 'Reserva Rechazada'},
        'cancelled': {'action': 'cancelada', 'subject': 'Reserva Cancelada'},
        'completed': {'action': 'completada', 'subject': 'Reserva Completada'}
    }
    
    info = status_info.get(new_status, {'action': new_status, 'subject': 'Actualización de Reserva'})
    message = (f"Tu reserva con {request_user.username} ha sido {info['action']} "
               f"para el {start_time_local.strftime('%d/%m/%Y')} de {start_time_local.strftime('%H:%M')} a {end_time_local.strftime('%H:%M')}.")
    
    Notification.objects.create(
        user=recipient, 
        subject=info['subject'],
        message=message,
        channel='in_app',
        status='sent',
        related_booking_id=str(booking.id)
    )
    
    try:
        logger = logging.getLogger('bookings')
        logger.info(f"booking_status_updated id={booking.id} status={new_status} by={request_user.username}")
    except Exception:
        pass


@extend_schema(request=None, responses=None)
@api_view(["POST"])
@permission_classes([permissions.IsAuthenticated])
def accept_booking(request, pk):
    """Aceptar una reserva (solo la niñera)."""
    try:
        booking = Booking.objects.get(pk=pk, nanny=request.user)
    except Booking.DoesNotExist:
        return Response({"error": "Reserva no encontrada o no autorizada."},
                        status=status.HTTP_404_NOT_FOUND)

    _update_booking_status(booking, "confirmed", request.user, 'parent')
    return Response({"message": "Reserva aceptada."}, status=status.HTTP_200_OK)


@extend_schema(request=None, responses=None)
@api_view(["POST"])
@permission_classes([permissions.IsAuthenticated])
def reject_booking(request, pk):
    """Rechazar una reserva (solo la niñera)."""
    try:
        booking = Booking.objects.get(pk=pk, nanny=request.user)
    except Booking.DoesNotExist:
        return Response({"error": "Reserva no encontrada o no autorizada."},
                        status=status.HTTP_404_NOT_FOUND)

    _update_booking_status(booking, "rejected", request.user, 'parent')
    return Response({"message": "Reserva rechazada."}, status=status.HTTP_200_OK)


@extend_schema(request=None, responses=None)
@api_view(["POST"])
@permission_classes([permissions.IsAuthenticated])
def cancel_booking(request, pk):
    """Cancelar una reserva (solo el padre/madre)."""
    try:
        booking = Booking.objects.get(pk=pk, parent=request.user)
    except Booking.DoesNotExist:
        return Response({"error": "Reserva no encontrada o no autorizada."},
                        status=status.HTTP_404_NOT_FOUND)

    _update_booking_status(booking, "cancelled", request.user, 'nanny')
    return Response({"message": "Reserva cancelada."}, status=status.HTTP_200_OK)


@extend_schema(request=None, responses=None)
@api_view(["POST"])
@permission_classes([permissions.IsAuthenticated])
def complete_booking(request, pk):
    """Marcar una reserva como completada (solo la niñera)."""
    try:
        booking = Booking.objects.get(pk=pk, nanny=request.user)
    except Booking.DoesNotExist:
        return Response({"error": "Reserva no encontrada o no autorizada."},
                        status=status.HTTP_404_NOT_FOUND)

    _update_booking_status(booking, "completed", request.user, 'parent')
    return Response({"message": "Reserva completada."}, status=status.HTTP_200_OK)

# Favorites have been moved to the `favorites` app; use /api/favorites/ endpoints.