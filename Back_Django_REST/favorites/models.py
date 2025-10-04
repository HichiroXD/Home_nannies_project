from django.db import models
from django.conf import settings
from nannies.models import NannyProfile

class Favorite(models.Model):
    parent = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='favorites'
    )
    nanny = models.ForeignKey(
        NannyProfile,
        on_delete=models.CASCADE,
        related_name='favorited_by'
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('parent', 'nanny')

    def __str__(self):
        return f"{self.parent.username} ❤️ {self.nanny.user.username}"
