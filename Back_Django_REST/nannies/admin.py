from django.contrib import admin
from .models import NannyProfile

@admin.register(NannyProfile)
class NannyProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'hourly_rate', 'verified', 'rating_avg')
    search_fields = ('user__username', 'user__first_name', 'user__last_name')
    list_filter = ('verified',)
