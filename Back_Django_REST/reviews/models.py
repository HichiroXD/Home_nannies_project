from django.db import models
from django.conf import settings
from nannies.models import NannyProfile

class Review(models.Model):
    parent = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='reviews_made'
    )
    nanny = models.ForeignKey(
        NannyProfile,
        on_delete=models.CASCADE,
        related_name='reviews_received'
    )
    rating = models.PositiveSmallIntegerField()  # 1–5 estrellas
    comment = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('parent', 'nanny')  # evita reseñas duplicadas
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.parent.username} → {self.nanny.user.username} ({self.rating}⭐)"

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        self.update_nanny_rating()

    def delete(self, *args, **kwargs):
        super().delete(*args, **kwargs)
        self.update_nanny_rating()

    def update_nanny_rating(self):
        """Actualiza el promedio en NannyProfile al modificar reseñas"""
        from django.db.models import Avg
        avg = Review.objects.filter(nanny=self.nanny).aggregate(Avg('rating'))['rating__avg'] or 0
        self.nanny.rating_avg = round(avg, 2)
        self.nanny.save()
