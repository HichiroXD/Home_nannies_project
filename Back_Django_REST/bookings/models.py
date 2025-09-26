from django.db import models
from django.conf import settings

class Booking(models.Model):
    STATUS_CHOICES = [
        ("pending", "Pendiente"),
        ("confirmed", "Confirmada"),
        ("rejected", "Rechazada"),
        ("cancelled", "Cancelada"),
        ("completed", "Completada"),
    ]

    parent = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="bookings_made"
    )
    nanny = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="bookings_received"
    )
    date = models.DateTimeField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="pending")

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Reserva {self.id} - {self.parent.username} con {self.nanny.username} ({self.status})"
