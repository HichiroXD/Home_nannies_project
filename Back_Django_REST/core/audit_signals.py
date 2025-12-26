"""
Signals para Auditoría Automática
Registra automáticamente cambios importantes en los modelos del sistema
"""
from django.db.models.signals import post_save, post_delete, pre_save
from django.dispatch import receiver
from django.contrib.auth import get_user_model
from django.contrib.contenttypes.models import ContentType
from .audit_models import AuditLog
import threading

User = get_user_model()

# Thread-local storage para almacenar el usuario actual y request
_thread_locals = threading.local()


def get_current_user():
    """Obtiene el usuario actual del thread local"""
    return getattr(_thread_locals, 'user', None)


def get_current_request():
    """Obtiene el request actual del thread local"""
    return getattr(_thread_locals, 'request', None)


def get_audit_user(fallback_user=None):
    """
    Obtiene el usuario para auditoría de manera segura.
    
    Args:
        fallback_user: Usuario a usar si no hay usuario autenticado
    
    Returns:
        User instance o None
    """
    user = get_current_user()
    
    # Si el usuario existe y está autenticado, usarlo
    if user and hasattr(user, 'is_authenticated') and user.is_authenticated:
        return user
    
    # Si hay un fallback y es un usuario válido, usarlo
    if fallback_user and hasattr(fallback_user, 'is_authenticated'):
        return fallback_user
    
    # Si el fallback no tiene is_authenticated pero parece ser un User, usarlo
    if fallback_user and hasattr(fallback_user, 'username'):
        return fallback_user
    
    return None


class AuditMiddleware:
    """
    Middleware para capturar el usuario y request actual en cada petición.
    Agregar a settings.py MIDDLEWARE.
    """
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        _thread_locals.user = getattr(request, 'user', None)
        _thread_locals.request = request
        response = self.get_response(request)
        return response


def get_client_ip(request):
    """Obtiene la IP real del cliente"""
    if not request:
        return None
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        ip = x_forwarded_for.split(',')[0]
    else:
        ip = request.META.get('REMOTE_ADDR')
    return ip


# ========== USUARIOS ==========

@receiver(post_save, sender=User)
def log_user_changes(sender, instance, created, **kwargs):
    """Registra creación y actualización de usuarios"""
    request = get_current_request()
    user = get_audit_user(fallback_user=instance)
    
    if created:
        AuditLog.log_action(
            user=user,
            action='create',
            description=f'Usuario creado: {instance.username} con rol {instance.role}',
            content_object=instance,
            ip_address=get_client_ip(request) if request else None,
            user_agent=request.META.get('HTTP_USER_AGENT') if request else None,
            metadata={
                'username': instance.username,
                'email': instance.email,
                'role': instance.role,
            }
        )
    else:
        # Para updates, necesitamos comparar con valores anteriores
        # Esto requiere almacenar el estado previo en pre_save
        pass


@receiver(post_delete, sender=User)
def log_user_deletion(sender, instance, **kwargs):
    """Registra eliminación de usuarios"""
    request = get_current_request()
    user = get_audit_user()
    
    # Si no hay usuario, usar el sistema como fallback
    if not user:
        # Crear log sin usuario específico (eliminación del sistema)
        return
    
    AuditLog.log_action(
        user=user,
        action='delete',
        description=f'Usuario eliminado: {instance.username}',
        ip_address=get_client_ip(request) if request else None,
        user_agent=request.META.get('HTTP_USER_AGENT') if request else None,
        metadata={
            'username': instance.username,
            'email': instance.email,
            'role': instance.role,
        }
    )


# ========== BOOKINGS ==========

@receiver(post_save, sender='bookings.Booking')
def log_booking_changes(sender, instance, created, **kwargs):
    """Registra cambios en reservas"""
    request = get_current_request()
    user = get_audit_user(fallback_user=instance.parent)
    
    if created:
        action = 'booking_create'
        description = f'Reserva creada: {instance.parent.username} con {instance.nanny.username}'
    else:
        action = 'booking_update'
        description = f'Reserva actualizada: ID {instance.id} - Estado: {instance.status}'
    
    AuditLog.log_action(
        user=user,
        action=action,
        description=description,
        content_object=instance,
        ip_address=get_client_ip(request) if request else None,
        user_agent=request.META.get('HTTP_USER_AGENT') if request else None,
        metadata={
            'booking_id': instance.id,
            'parent': instance.parent.username,
            'nanny': instance.nanny.username,
            'status': instance.status,
            'start_time': str(instance.start_time),
            'end_time': str(instance.end_time),
        }
    )


@receiver(post_delete, sender='bookings.Booking')
def log_booking_deletion(sender, instance, **kwargs):
    """Registra eliminación de reservas"""
    request = get_current_request()
    user = get_audit_user(fallback_user=instance.parent)
    
    AuditLog.log_action(
        user=user,
        action='booking_cancel',
        description=f'Reserva cancelada/eliminada: ID {instance.id}',
        ip_address=get_client_ip(request) if request else None,
        user_agent=request.META.get('HTTP_USER_AGENT') if request else None,
        metadata={
            'booking_id': instance.id,
            'parent': instance.parent.username,
            'nanny': instance.nanny.username,
            'status': instance.status,
        }
    )


# ========== REVIEWS ==========

@receiver(post_save, sender='reviews.Review')
def log_review_creation(sender, instance, created, **kwargs):
    """Registra creación de reseñas"""
    if not created:
        return
    
    request = get_current_request()
    user = get_audit_user(fallback_user=instance.parent)
    
    AuditLog.log_action(
        user=user,
        action='review_create',
        description=f'Reseña creada: {instance.parent.username} para {instance.nanny.user.username} - {instance.rating}⭐',
        content_object=instance,
        ip_address=get_client_ip(request) if request else None,
        user_agent=request.META.get('HTTP_USER_AGENT') if request else None,
        metadata={
            'rating': instance.rating,
            'comment': instance.comment[:100] if instance.comment else None,
            'nanny': instance.nanny.user.username,
        }
    )


@receiver(post_delete, sender='reviews.Review')
def log_review_deletion(sender, instance, **kwargs):
    """Registra eliminación de reseñas"""
    request = get_current_request()
    user = get_audit_user(fallback_user=instance.parent)
    
    AuditLog.log_action(
        user=user,
        action='review_delete',
        description=f'Reseña eliminada: {instance.parent.username} para {instance.nanny.user.username}',
        ip_address=get_client_ip(request) if request else None,
        user_agent=request.META.get('HTTP_USER_AGENT') if request else None,
        metadata={
            'rating': instance.rating,
            'comment': instance.comment[:100] if instance.comment else None,
        }
    )


# ========== NANNY PROFILES ==========

@receiver(post_save, sender='nannies.NannyProfile')
def log_nanny_profile_changes(sender, instance, created, **kwargs):
    """Registra cambios en perfiles de niñeras"""
    request = get_current_request()
    user = get_audit_user(fallback_user=instance.user)
    
    if created:
        action = 'create'
        description = f'Perfil de niñera creado: {instance.user.username}'
    else:
        action = 'profile_change'
        description = f'Perfil de niñera actualizado: {instance.user.username}'
    
    AuditLog.log_action(
        user=user,
        action=action,
        description=description,
        content_object=instance,
        ip_address=get_client_ip(request) if request else None,
        user_agent=request.META.get('HTTP_USER_AGENT') if request else None,
        metadata={
            'hourly_rate': float(instance.hourly_rate) if instance.hourly_rate else None,
            'experience_years': instance.experience_years,
            'verified': instance.verified,
        }
    )


# ========== PARENT PROFILES ==========

@receiver(post_save, sender='parents.ParentProfile')
def log_parent_profile_changes(sender, instance, created, **kwargs):
    """Registra cambios en perfiles de padres"""
    request = get_current_request()
    user = get_audit_user(fallback_user=instance.user)
    
    if created:
        action = 'create'
        description = f'Perfil de padre creado: {instance.user.username}'
    else:
        action = 'profile_change'
        description = f'Perfil de padre actualizado: {instance.user.username}'
    
    AuditLog.log_action(
        user=user,
        action=action,
        description=description,
        content_object=instance,
        ip_address=get_client_ip(request) if request else None,
        user_agent=request.META.get('HTTP_USER_AGENT') if request else None,
        metadata={
            'children_count': instance.children_count,
        }
    )


# ========== ACADEMIC VERIFICATION ==========

@receiver(post_save, sender='academic.AcademicVerification')
def log_academic_verification_changes(sender, instance, created, **kwargs):
    """Registra cambios en verificaciones académicas"""
    request = get_current_request()
    # Intentar obtener el usuario del estudiante si existe
    fallback = instance.student.user if hasattr(instance, 'student') and instance.student else None
    user = get_audit_user(fallback_user=fallback)
    
    if created:
        action = 'document_upload'
        description = f'Verificación académica creada: {instance.student.user.username if hasattr(instance, "student") else "Usuario"}'
    else:
        action = 'document_verify'
        description = f'Verificación académica actualizada: Estado: {instance.verification_status}'
    
    AuditLog.log_action(
        user=user,
        action=action,
        description=description,
        content_object=instance,
        ip_address=get_client_ip(request) if request else None,
        user_agent=request.META.get('HTTP_USER_AGENT') if request else None,
        metadata={
            'verification_status': instance.verification_status,
            'verified_by': instance.verified_by.username if instance.verified_by else None,
        }
    )
