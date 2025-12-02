from django.db import models
from django.conf import settings

class NannyProfile(models.Model):
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='nanny_profile'
    )
    experience_years = models.PositiveIntegerField(default=0)
    hourly_rate = models.PositiveIntegerField(default=0)  # Hasta 7 dígitos, sin decimales
    description = models.TextField(blank=True)
    verified = models.BooleanField(default=False)
    age = models.PositiveIntegerField(null=True, blank=True)
    certifications = models.TextField(blank=True)
    rating_avg = models.DecimalField(max_digits=3, decimal_places=2, default=0.0)
    profile_photo = models.ImageField(upload_to='nanny_profiles/', blank=True, null=True)

    @property
    def role(self):
        """Retorna el rol del usuario asociado"""
        return self.user.role

    def __str__(self):
        return f"{self.user.first_name} {self.user.last_name} - ${self.hourly_rate}/hr"
