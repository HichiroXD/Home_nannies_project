from django.contrib import admin
from .models import ParentProfile


@admin.register(ParentProfile)
class ParentProfileAdmin(admin.ModelAdmin):
    list_display = ['user', 'children_count', 'phone', 'created_at']
    search_fields = ['user__username', 'user__email', 'user__first_name', 'user__last_name']
    list_filter = ['children_count', 'created_at']
    readonly_fields = ['created_at', 'updated_at']
