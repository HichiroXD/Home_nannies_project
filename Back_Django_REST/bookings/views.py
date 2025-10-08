from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from drf_spectacular.utils import extend_schema
from .models import Booking, Availability, Notification
from .serializer import BookingSerializer, AvailabilitySerializer, NotificationSerializer, FavoriteSerializer

# --- BOOKING ---
class BookingListCreateView(generics.ListCreateAPIView):
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
        Notification.objects.create(
            user=booking.nanny,
            message=f"Tienes una nueva solicitud de reserva de {self.request.user.username} "
                    f"para el {booking.start_time} - {booking.end_time}."
        )

class BookingDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Booking.objects.all()
    serializer_class = BookingSerializer
    permission_classes = [permissions.IsAuthenticated]


# --- AVAILABILITY ---
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


# --- NOTIFICATION ---
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


# --- ACCIONES PERSONALIZADAS ---
@extend_schema(request=None, responses=None)
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
    Notification.objects.create(
        user=booking.parent,
        message=f"Tu reserva con {request.user.username} ha sido confirmada para el "
                f"{booking.start_time} - {booking.end_time}."
    )
    return Response({"message": "Reserva aceptada"}, status=200)


@extend_schema(request=None, responses=None)
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
    Notification.objects.create(
        user=booking.parent,
        message=f"Tu reserva con {request.user.username} ha sido rechazada para el "
                f"{booking.start_time} - {booking.end_time}."
    )
    return Response({"message": "Reserva rechazada"}, status=200)


@extend_schema(request=None, responses=None)
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
    Notification.objects.create(
        user=booking.nanny,
        message=f"La reserva con {request.user.username} ha sido cancelada para el "
                f"{booking.start_time} - {booking.end_time}."
    )
    return Response({"message": "Reserva cancelada"}, status=200)


@extend_schema(request=None, responses=None)
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
    Notification.objects.create(
        user=booking.parent,
        message=f"Tu reserva con {request.user.username} ha sido marcada como completada para el "
                f"{booking.start_time} - {booking.end_time}."
    )
    return Response({"message": "Reserva completada"}, status=200)

# --- FAVORITES ---
class FavoriteListCreateView(generics.ListCreateAPIView):
    serializer_class = FavoriteSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return self.request.user.favorites.all()

    def perform_create(self, serializer):
        serializer.save(parent=self.request.user)

class FavoriteDeleteView(generics.RetrieveDestroyAPIView):
    serializer_class = FavoriteSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return self.request.user.favorites.all()