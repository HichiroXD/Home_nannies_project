from django.contrib import admin
from .models import Favorite

@admin.register(Favorite)
class FavoriteAdmin(admin.ModelAdmin):
    list_display = ('parent', 'nanny', 'created_at')
    search_fields = ('parent__username', 'nanny__user__username')
