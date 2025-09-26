from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from .models import Booking
from .serializer import BookingSerializer

class BookingListCreateView(generics.ListCreateAPIView):
    queryset = Booking.objects.all()
    serializer_class = BookingSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        # El padre crea la reserva
        serializer.save(parent=self.request.user)


class BookingDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Booking.objects.all()
    serializer_class = BookingSerializer
    permission_classes = [permissions.IsAuthenticated]


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
    return Response({"message": "Reserva aceptada"}, status=200)


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
    return Response({"message": "Reserva rechazada"}, status=200)

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
    return Response({"message": "Reserva cancelada"}, status=200)

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
    return Response({"message": "Reserva completada"}, status=200)

# --- IGNORE ---

# from .views import BookingList
# urlpatterns = [
#     path('', BookingList.as_view(), name='booking-list'),
# ]

# --- IGNORE ---