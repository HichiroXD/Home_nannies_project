from django.contrib import admin
from .models import ParentProfile, Child


@admin.register(ParentProfile)
class ParentProfileAdmin(admin.ModelAdmin):
    list_display = ['user', 'children_count', 'phone', 'created_at']
    search_fields = ['user__username', 'user__email', 'user__first_name', 'user__last_name']
    list_filter = ['children_count', 'created_at']
    readonly_fields = ['created_at', 'updated_at']


@admin.register(Child)
class ChildAdmin(admin.ModelAdmin):
    """Administración de hijos en el panel de administración"""
    list_display = ['name', 'age', 'gender', 'parent_username', 'created_at']
    list_filter = ['gender', 'age', 'created_at']
    search_fields = ['name', 'parent__user__username', 'parent__user__email']
    readonly_fields = ['created_at', 'updated_at']
    
    fieldsets = (
        ('Información Básica', {
            'fields': ('parent', 'name', 'age', 'date_of_birth', 'gender')
        }),
        ('Información Médica', {
            'fields': ('allergies', 'medical_conditions', 'special_needs', 'medications'),
            'classes': ('collapse',)
        }),
        ('Contacto de Emergencia', {
            'fields': ('emergency_contact',),
            'classes': ('collapse',)
        }),
        ('Notas Adicionales', {
            'fields': ('notes',),
            'classes': ('collapse',)
        }),
        ('Fechas', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def parent_username(self, obj):
        """Muestra el username del padre"""
        return obj.parent.user.username
    parent_username.short_description = 'Padre/Madre'
    parent_username.admin_order_field = 'parent__user__username'
