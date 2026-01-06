"""
Soft Delete functionality for Django models.
Provides logical deletion instead of physical deletion for data recovery.
"""
from django.db import models
from django.utils import timezone


class SoftDeleteQuerySet(models.QuerySet):
    """Custom QuerySet that excludes deleted objects by default."""
    
    def delete(self):
        """Soft delete all objects in queryset."""
        return self.update(deleted_at=timezone.now())
    
    def hard_delete(self):
        """Permanently delete all objects in queryset."""
        return super().delete()
    
    def alive(self):
        """Return only non-deleted objects."""
        return self.filter(deleted_at__isnull=True)
    
    def deleted(self):
        """Return only deleted objects."""
        return self.filter(deleted_at__isnull=False)
    
    def with_deleted(self):
        """Return all objects including deleted ones."""
        return self


class SoftDeleteManager(models.Manager):
    """Manager that returns only non-deleted objects by default."""
    
    def get_queryset(self):
        """Return queryset excluding deleted objects."""
        return SoftDeleteQuerySet(self.model, using=self._db).alive()
    
    def deleted_only(self):
        """Return only deleted objects."""
        return SoftDeleteQuerySet(self.model, using=self._db).deleted()
    
    def with_deleted(self):
        """Return all objects including deleted."""
        return SoftDeleteQuerySet(self.model, using=self._db).with_deleted()


class SoftDeleteModel(models.Model):
    """
    Abstract model that adds soft delete functionality.
    
    Usage:
        class MyModel(SoftDeleteModel):
            name = models.CharField(max_length=100)
            
        # Soft delete
        obj.delete()  # Sets deleted_at to current timestamp
        
        # Hard delete
        obj.hard_delete()  # Permanently removes from database
        
        # Restore
        obj.restore()  # Sets deleted_at to None
        
        # Query only alive objects (default)
        MyModel.objects.all()
        
        # Query only deleted objects
        MyModel.objects.deleted_only()
        
        # Query all including deleted
        MyModel.objects.with_deleted()
    """
    
    deleted_at = models.DateTimeField(
        null=True,
        blank=True,
        default=None,
        db_index=True,
        verbose_name='Fecha de eliminación'
    )
    
    objects = SoftDeleteManager()
    all_objects = models.Manager()  # Manager that includes deleted objects
    
    class Meta:
        abstract = True
    
    def delete(self, using=None, keep_parents=False):
        """Soft delete the object."""
        self.deleted_at = timezone.now()
        self.save(using=using)
    
    def hard_delete(self, using=None, keep_parents=False):
        """Permanently delete the object."""
        super().delete(using=using, keep_parents=keep_parents)
    
    def restore(self):
        """Restore a soft-deleted object."""
        self.deleted_at = None
        self.save()
    
    @property
    def is_deleted(self):
        """Check if object is soft-deleted."""
        return self.deleted_at is not None


# Mixin for models that need soft delete
class SoftDeleteMixin:
    """
    Mixin to add soft delete methods to existing models.
    Use this when you can't change the parent class.
    """
    
    def soft_delete(self):
        """Mark as deleted."""
        self.deleted_at = timezone.now()
        self.save()
    
    def restore(self):
        """Restore from deleted state."""
        self.deleted_at = None
        self.save()
    
    @property
    def is_deleted(self):
        """Check if deleted."""
        return self.deleted_at is not None
