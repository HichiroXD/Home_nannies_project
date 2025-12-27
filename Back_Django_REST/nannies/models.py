from django.db import models
from django.conf import settings
import secrets

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
    verification_code = models.CharField(
        max_length=8,
        blank=True,
        unique=True,
        null=True,
        help_text="Código único de 8 caracteres para verificación"
    )
    age = models.PositiveIntegerField(null=True, blank=True)
    certifications = models.TextField(blank=True)
    rating_avg = models.DecimalField(max_digits=3, decimal_places=2, default=0.0)
    profile_photo = models.ImageField(upload_to='nanny_profiles/', blank=True, null=True)

    @property
    def role(self):
        """Retorna el rol del usuario asociado"""
        return self.user.role
    
    def generate_verification_code(self):
        """Genera un código único de verificación de 8 caracteres"""
        while True:
            code = secrets.token_urlsafe(6)[:8].upper()
            if not NannyProfile.objects.filter(verification_code=code).exists():
                self.verification_code = code
                self.save()
                return code
    
    def verify_with_code(self, code):
        """Verifica la niñera si el código coincide"""
        if self.verification_code and self.verification_code == code.upper():
            self.verified = True
            self.save()
            return True
        return False

    def __str__(self):
        return f"{self.user.first_name} {self.user.last_name} - ${self.hourly_rate}/hr"
