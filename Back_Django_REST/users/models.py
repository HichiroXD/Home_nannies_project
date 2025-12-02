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
    
    VERIFICATION_STATUS_CHOICES = (
        ('pending', 'Pendiente'),
        ('approved', 'Aprobado'),
        ('rejected', 'Rechazado'),
    )
    
    # Campo original (compatible con existente)
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default='parent')
    is_verified = models.BooleanField(default=False)  # Verificación de email
    pending_verification = models.BooleanField(default=True)  # Pendiente de verificación
    is_active = models.BooleanField(default=True)  # Activo/inactivo
    
    # NUEVOS CAMPOS PHASE 1 - Validación Institucional
    # Email institucional (CRÍTICO)
    institutional_email = models.EmailField(
        unique=True,
        null=True,
        blank=True,
        help_text="Email @universidad.edu.co - Uso obligatorio"
    )
    
    # Verificación de email
    email_verified = models.BooleanField(
        default=False,
        help_text="¿Email verificado vía link de confirmación?"
    )
    email_verification_token = models.CharField(
        max_length=255,
        blank=True,
        unique=True,
        null=True,
        help_text="Token JWT para verificación"
    )
    email_verified_date = models.DateTimeField(
        null=True,
        blank=True,
        help_text="Fecha de verificación de email"
    )
    
    # RUT (Identificación nacional)
    rut = models.CharField(
        max_length=20,
        unique=True,
        null=True,
        blank=True,
        help_text="RUT/Cédula única identificación"
    )
    
    # Verificación administrativa
    verification_status = models.CharField(
        max_length=20,
        choices=VERIFICATION_STATUS_CHOICES,
        default='pending',
        help_text="Estado de verificación institucional"
    )
    
    # Seguridad
    last_login_ip = models.GenericIPAddressField(
        null=True,
        blank=True,
        help_text="IP del último login"
    )
    failed_login_attempts = models.IntegerField(
        default=0,
        help_text="Contador de intentos fallidos"
    )
    locked_until = models.DateTimeField(
        null=True,
        blank=True,
        help_text="Cuenta bloqueada hasta esta fecha"
    )
    
    # Auditoría
    created_at = models.DateTimeField(auto_now_add=True, null=True)
    updated_at = models.DateTimeField(auto_now=True, null=True)

    objects = UserManager()

    def __str__(self):
        return f"{self.username} ({self.role})"
    
    def is_verified_student(self):
        """¿Es estudiante verificado?"""
        if not hasattr(self, 'student_verification'):
            return False
        return self.student_verification.is_active_student()
    
    def is_eligible_nanny(self):
        """¿Puede ser niñera? (debe estar verificado y ser de programa Educación)"""
        if self.role != 'nanny':
            return False
        if not self.is_verified_student():
            return False
        if not hasattr(self, 'student_verification'):
            return False
        program = self.student_verification.program
        return program.is_education_program if program else False
    
    def is_account_locked(self):
        """¿Cuenta bloqueada por seguridad?"""
        from django.utils import timezone
        if self.locked_until is None:
            return False
        return self.locked_until > timezone.now()
    
    # === MÉTODOS PARA ROLES MÚLTIPLES (PHASE 4) ===
    
    def get_all_roles(self):
        """Obtiene todos los roles del usuario (principal + adicionales)"""
        roles = [self.role]
        additional = self.additional_roles.filter(is_active=True).values_list('role', flat=True)
        roles.extend(additional)
        return list(set(roles))  # Eliminar duplicados
    
    def has_role(self, role):
        """Verifica si el usuario tiene un rol específico"""
        if self.role == role:
            return True
        return self.additional_roles.filter(role=role, is_active=True).exists()
    
    def add_role(self, role):
        """Agrega un rol adicional al usuario"""
        from users.role_models import UserRole
        if role == self.role:
            return False  # Ya es el rol principal
        role_obj, created = UserRole.objects.get_or_create(
            user=self,
            role=role,
            defaults={'is_active': True}
        )
        if not created and not role_obj.is_active:
            role_obj.is_active = True
            role_obj.save()
        return created or role_obj.is_active
    
    def remove_role(self, role):
        """Remueve un rol adicional del usuario"""
        if role == self.role:
            return False  # No puede remover el rol principal
        return self.additional_roles.filter(role=role).update(is_active=False) > 0
    
    def can_access_as(self, role):
        """Verifica si puede acceder con un rol específico"""
        return self.has_role(role) and self.is_active and not self.is_account_locked()

    class Meta:
        verbose_name = "Usuario"
        verbose_name_plural = "Usuarios"
        ordering = ["username"]
        indexes = [
            models.Index(fields=['institutional_email']),
            models.Index(fields=['rut']),
            models.Index(fields=['verification_status']),
            models.Index(fields=['role']),
        ]
