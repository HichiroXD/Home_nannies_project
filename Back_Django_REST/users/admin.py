from django.contrib import admin
from .models import User
from .role_models import UserRole, ActiveRole


class UserRoleInline(admin.TabularInline):
    """Inline para mostrar roles adicionales en el admin de User"""
    model = UserRole
    extra = 0
    fields = ('role', 'is_active', 'created_at')
    readonly_fields = ('created_at',)


@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ('username', 'email', 'role', 'get_additional_roles', 'is_active', 'is_verified')
    list_filter = ('role', 'is_active', 'is_verified', 'verification_status')
    search_fields = ('username', 'email', 'first_name', 'last_name')
    inlines = [UserRoleInline]
    
    def get_additional_roles(self, obj):
        """Muestra roles adicionales en el listado"""
        additional = obj.additional_roles.filter(is_active=True).values_list('role', flat=True)
        return ', '.join(additional) if additional else '-'
    get_additional_roles.short_description = 'Roles Adicionales'


@admin.register(UserRole)
class UserRoleAdmin(admin.ModelAdmin):
    list_display = ('user', 'role', 'is_active', 'created_at')
    list_filter = ('role', 'is_active')
    search_fields = ('user__username', 'user__email')
    date_hierarchy = 'created_at'


@admin.register(ActiveRole)
class ActiveRoleAdmin(admin.ModelAdmin):
    list_display = ('user', 'active_role', 'updated_at')
    list_filter = ('active_role',)
    search_fields = ('user__username', 'user__email')
    date_hierarchy = 'updated_at'