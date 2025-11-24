from django.db.models.signals import post_save
from django.dispatch import receiver
from django.conf import settings
from .models import ParentProfile


@receiver(post_save, sender=settings.AUTH_USER_MODEL)
def create_parent_profile(sender, instance, created, **kwargs):
    """
    Crea automáticamente un ParentProfile cuando se registra un usuario con rol 'parent'.
    """
    if created and instance.role == 'parent':
        ParentProfile.objects.create(
            user=instance,
            children_count=1
        )
