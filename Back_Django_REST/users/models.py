from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    ROLE_CHOICES = (
        ('parent', 'Padre/Madre'),
        ('nanny', 'Niñera'),
        ('admin', 'Administrador'),
    )
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default='parent')
    is_verified = models.BooleanField(default=False) # Verificación de email
    pending_verification = models.BooleanField(default=True) # Pendiente de verificación

    def __str__(self):
        return f"{self.username} ({self.role})"
    
    class Meta:
        verbose_name = "Usuario"
        verbose_name_plural = "Usuarios"
        ordering = ["username"]
# Modelo de usuario personalizado con roles
# Nombres legibles en el admin
# Ordenar usuarios por nombre de usuario
