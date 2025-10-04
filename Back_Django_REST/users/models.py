from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.db import models


class UserManager(BaseUserManager):
    def create_user(self, username, email, role="parent", password=None, **extra_fields):
        if not email:
            raise ValueError('El email es obligatorio')
        email = self.normalize_email(email)
        user = self.model(username=username, email=email, role=role, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, username, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('is_verified', True)
        extra_fields.setdefault('pending_verification', False)

        if extra_fields.get('is_staff') is not True:
            raise ValueError('El superusuario debe tener is_staff=True.')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('El superusuario debe tener is_superuser=True.')

        # Aquí sí forzamos 'admin'
        return self.create_user(username, email, role='admin', password=password, **extra_fields)

class User(AbstractUser):
    ROLE_CHOICES = (
        ('parent', 'Padre/Madre'),
        ('nanny', 'Niñera'),
        ('admin', 'Administrador'),
    )
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default='parent')
    is_verified = models.BooleanField(default=False)  # Verificación de email
    pending_verification = models.BooleanField(default=True)  # Pendiente de verificación
    is_active = models.BooleanField(default=True)  # Activo/inactivo

    objects = UserManager()

    def __str__(self):
        return f"{self.username} ({self.role})"

    class Meta:
        verbose_name = "Usuario"
        verbose_name_plural = "Usuarios"
        ordering = ["username"]
