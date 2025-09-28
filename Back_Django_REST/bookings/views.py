from rest_framework import generics, permissions, status, viewsets
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from drf_spectacular.utils import extend_schema
from .models import Booking, Availability, Notification
from .serializer import BookingSerializer, AvailabilitySerializer, NotificationSerializer, BookingDetailView, EmptySerializer

class BookingViewSet(viewsets.ModelViewSet):
    serializer_class = BookingSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Booking.objects.filter(parent=self.request.user)
    
    def perform_create(self, serializer):
        serializer.save(parent=self.request.user)

# BookingListCreateView removed for consistency; use BookingViewSet for booking operations.

class BookingDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Booking.objects.all()
    serializer_class = BookingDetailView
    permission_classes = [permissions.IsAuthenticated]

class AvailabilityListCreateView(generics.ListCreateAPIView):
    serializer_class = AvailabilitySerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Availability.objects.filter(nanny=self.request.user)

    def perform_create(self, serializer):
        serializer.save(nanny=self.request.user)

class AvailabilityDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = AvailabilitySerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Availability.objects.filter(nanny=self.request.user)
    
    def perform_update(self, serializer):
        serializer.save(nanny=self.request.user)

    def perform_destroy(self, instance):
        instance.delete()

# Asegurarse de que solo la nanny propietaria pueda actualizar o eliminar su disponibilidad
    def get_object(self):
        obj = super().get_object()
        if obj.nanny != self.request.user:
            raise permissions.PermissionDenied("No tienes permiso para acceder a esta disponibilidad.")
        return obj
    
class NotificationListView(generics.ListAPIView):
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return self.request.user.notifications.all().order_by('-created_at')
    
class NotificationDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return self.request.user.notifications.all()
    
    def get_object(self):
        obj = super().get_object()
        if obj.user != self.request.user:
            raise permissions.PermissionDenied("No tienes permiso para acceder a esta notificación.")
        return obj
    
    def perform_update(self, serializer):
        serializer.save()

    def perform_destroy(self, instance):
        instance.delete()

@extend_schema(request=EmptySerializer, responses=EmptySerializer)
@api_view(["POST"])
@permission_classes([permissions.IsAuthenticated])
def accept_booking(request, pk):
    try:
        booking = Booking.objects.get(pk=pk, nanny=request.user)
    except Booking.DoesNotExist:
        return Response({"error": "Reserva no encontrada o no autorizada."},
                        status=status.HTTP_404_NOT_FOUND)

    booking.status = "confirmed"
    booking.save()
    # 🔔 Crear notificación para el padre
    Notification.objects.create(
        user=booking.parent,
        message=f"Tu reserva con {request.user.username} ha sido confirmada para el "
                f"{booking.start_time} - {booking.end_time}."
    )
    return Response({"message": "Reserva aceptada"}, status=200)

@extend_schema(request=EmptySerializer, responses=EmptySerializer)
@api_view(["POST"])
@permission_classes([permissions.IsAuthenticated])
def reject_booking(request, pk):
    try:
        booking = Booking.objects.get(pk=pk, nanny=request.user)
    except Booking.DoesNotExist:
        return Response({"error": "Reserva no encontrada o no autorizada."},
                        status=status.HTTP_404_NOT_FOUND)

    booking.status = "rejected"
    booking.save()
    # 🔔 Crear notificación para el padre
    Notification.objects.create(
        user=booking.parent,
        message=f"Tu reserva con {request.user.username} ha sido rechazada para el "
                f"{booking.start_time} - {booking.end_time}."
    )
    return Response({"message": "Reserva rechazada"}, status=200)

@extend_schema(request=EmptySerializer, responses=EmptySerializer)
@api_view(["POST"])
@permission_classes([permissions.IsAuthenticated])
def cancel_booking(request, pk):
    try:
        booking = Booking.objects.get(pk=pk, parent=request.user)
    except Booking.DoesNotExist:
        return Response({"error": "Reserva no encontrada o no autorizada."},
                        status=status.HTTP_404_NOT_FOUND)

    booking.status = "cancelled"
    booking.save()
    # 🔔 Crear notificación para la niñera
    Notification.objects.create(
        user=booking.nanny,
        message=f"La reserva con {request.user.username} ha sido cancelada para el "
                f"{booking.start_time} - {booking.end_time}."
    )
    return Response({"message": "Reserva cancelada"}, status=200)

@extend_schema(request=EmptySerializer, responses=EmptySerializer)
@api_view(["POST"])
@permission_classes([permissions.IsAuthenticated])
def complete_booking(request, pk):
    try:
        booking = Booking.objects.get(pk=pk, nanny=request.user)
    except Booking.DoesNotExist:
        return Response({"error": "Reserva no encontrada o no autorizada."},
                        status=status.HTTP_404_NOT_FOUND)

    booking.status = "completed"
    booking.save()
    # 🔔 Crear notificación para el padre
    Notification.objects.create(
        user=booking.parent,
        message=f"Tu reserva con {request.user.username} ha sido marcada como completada para el "
                f"{booking.start_time} - {booking.end_time}."
    )
    return Response({"message": "Reserva completada"}, status=200)
