from django.db import models
from django.conf import settings
from django.utils import timezone
from django.core.exceptions import ValidationError


class Booking(models.Model):
    parent = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="bookings_made"
    )
    nanny = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="bookings_received"
    )
    date = models.DateTimeField()
    status = models.CharField(
        max_length=20,
        choices=[
            ("pending", "Pendiente"),
            ("confirmed", "Confirmada"),
            ("cancelled", "Cancelada"),
        ],
        default="pending",
    )

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["parent", "nanny", "date"], name="unique_booking"
            )
        ]

    def clean(self):
        # Evita reservas con fecha en el pasado
        if self.date < timezone.now():
            raise ValidationError("La fecha de la reserva no puede estar en el pasado.")

    def __str__(self):
        return f"Reserva {self.id} - {self.parent} con {self.nanny} ({self.status})"
