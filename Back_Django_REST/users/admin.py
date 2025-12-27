from django.contrib import admin
from django import forms
from .models import User, LoginHistory
from .role_models import UserRole, ActiveRole


class UserAdminForm(forms.ModelForm):
    """Formulario personalizado para convertir campos booleanos en listas desplegables"""
    
    is_verified = forms.TypedChoiceField(
        label='Is verified',
        choices=[(True, 'Verificado'), (False, 'No verificado')],
        widget=forms.Select,
        coerce=lambda x: x == 'True' or x == True,
        required=True
    )
    
    pending_verification = forms.TypedChoiceField(
        label='Pending verification',
        choices=[(True, 'Pendiente de verificación'), (False, 'No pendiente')],
        widget=forms.Select,
        coerce=lambda x: x == 'True' or x == True,
        required=True
    )
    
    is_active = forms.TypedChoiceField(
        label='Is active',
        choices=[(True, 'Activo'), (False, 'Inactivo')],
        widget=forms.Select,
        coerce=lambda x: x == 'True' or x == True,
        required=True
    )
    
    class Meta:
        model = User
        fields = '__all__'
        widgets = {
            'password': forms.PasswordInput(render_value=True),
        }
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # Establecer valores iniciales correctos
        if self.instance and self.instance.pk:
            self.fields['is_verified'].initial = self.instance.is_verified
            self.fields['pending_verification'].initial = self.instance.pending_verification
            self.fields['is_active'].initial = self.instance.is_active


class UserRoleInline(admin.TabularInline):
    """Inline para mostrar roles adicionales en el admin de User"""
    model = UserRole
    extra = 0
    fields = ('role', 'is_active', 'created_at')
    readonly_fields = ('created_at',)


@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    form = UserAdminForm
    list_display = ('username', 'email', 'role', 'get_additional_roles', 'is_active', 'is_verified')
    list_filter = ('role', 'is_active', 'is_verified', 'verification_status')
    search_fields = ('username', 'email', 'first_name', 'last_name')
    actions = ['verificar_usuarios', 'desverificar_usuarios']
    inlines = [UserRoleInline]
    
    # Sobreescribir los widgets de campos booleanos
    def formfield_for_dbfield(self, db_field, request, **kwargs):
        if db_field.name == 'is_verified':
            kwargs['widget'] = forms.Select(choices=[(True, 'Verificado'), (False, 'No verificado')])
            return db_field.formfield(**kwargs)
        elif db_field.name == 'pending_verification':
            kwargs['widget'] = forms.Select(choices=[(True, 'Pendiente de verificación'), (False, 'No pendiente')])
            return db_field.formfield(**kwargs)
        elif db_field.name == 'is_active':
            kwargs['widget'] = forms.Select(choices=[(True, 'Activo'), (False, 'Inactivo')])
            return db_field.formfield(**kwargs)
        return super().formfield_for_dbfield(db_field, request, **kwargs)
    
    # Organizar campos en el formulario
    fieldsets = (
        ('Información de Usuario', {
            'fields': ('username', 'email', 'first_name', 'last_name', 'role')
        }),
        ('Estado de Verificación', {
            'fields': ('verification_status', 'is_verified', 'pending_verification')
        }),
        ('Estado de Cuenta', {
            'fields': ('is_active', 'is_staff', 'is_superuser')
        }),
        ('Información Institucional', {
            'fields': ('institutional_email', 'rut', 'email_verified'),
            'classes': ('collapse',)
        }),
        ('Fechas Importantes', {
            'fields': ('date_joined', 'last_login'),
            'classes': ('collapse',)
        }),
    )
    
    readonly_fields = ('date_joined', 'last_login')
    
    # Usar radio buttons para el estado de verificación
    radio_fields = {
        'verification_status': admin.VERTICAL,
        'role': admin.HORIZONTAL,
    }
    
    def get_additional_roles(self, obj):
        """Muestra roles adicionales en el listado"""
        additional = obj.additional_roles.filter(is_active=True).values_list('role', flat=True)
        return ', '.join(additional) if additional else '-'
    get_additional_roles.short_description = 'Roles Adicionales'
    
    @admin.action(description='✅ Verificar usuarios seleccionados')
    def verificar_usuarios(self, request, queryset):
        updated = queryset.update(is_verified=True, pending_verification=False)
        self.message_user(request, f'{updated} usuario(s) verificado(s) correctamente.')
    
    @admin.action(description='❌ Marcar como no verificados')
    def desverificar_usuarios(self, request, queryset):
        updated = queryset.update(is_verified=False, pending_verification=True)
        self.message_user(request, f'{updated} usuario(s) marcado(s) como no verificados.')


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


@admin.register(LoginHistory)
class LoginHistoryAdmin(admin.ModelAdmin):
    list_display = ('user', 'login_time', 'ip_address', 'login_successful', 'device_type', 'location')
    list_filter = ('login_successful', 'device_type', 'login_time')
    search_fields = ('user__username', 'user__email', 'ip_address', 'location')
    date_hierarchy = 'login_time'
    readonly_fields = ('login_time', 'session_duration')
    
    def has_add_permission(self, request):
        return False  # No permitir agregar manualmente
    
    def has_change_permission(self, request, obj=None):
        return False  # No permitir editar
