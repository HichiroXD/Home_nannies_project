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
    start_time = models.DateTimeField()
    end_time = models.DateTimeField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="pending")

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Reserva {self.id} - {self.parent.username} con {self.nanny.username} ({self.status})"

class Availability(models.Model):
    nanny = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="availabilities"
    )
    day = models.DateField()
    start_time = models.TimeField()
    end_time = models.TimeField()

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("nanny", "day", "start_time", "end_time")
        ordering = ["day", "start_time"]

    def __str__(self):
        return f"{self.nanny} disponible el {self.day} de {self.start_time} a {self.end_time}" 
    
