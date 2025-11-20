"""
Academic API Admin Interface - Phase 3
Configuración del panel administrativo para gestión académica
"""

from django.contrib import admin
from django.utils.html import format_html
from django.urls import reverse
from django.db.models import Count, Q
from .models import AcademicProvider, AcademicStudent, AcademicProgram, AcademicVerification


@admin.register(AcademicProvider)
class AcademicProviderAdmin(admin.ModelAdmin):
    """Admin para proveedores académicos"""

    list_display = [
        'name', 'get_type_badge', 'get_status_badge',
        'get_primary_badge', 'get_sync_status', 'last_sync', 'get_action_buttons'
    ]
    list_filter = ['provider_type', 'is_active', 'is_primary', 'created_at']
    search_fields = ['name', 'api_endpoint']
    readonly_fields = ['created_at', 'updated_at', 'last_sync', 'sync_status', 'get_sync_info']
    fieldsets = (
        ('Información General', {
            'fields': ('name', 'provider_type', 'is_active', 'is_primary')
        }),
        ('Configuración API', {
            'fields': ('api_endpoint', 'api_key', 'timeout'),
            'classes': ('collapse',)
        }),
        ('Estado', {
            'fields': ('sync_status', 'last_sync', 'last_error', 'get_sync_info'),
            'classes': ('collapse',)
        }),
        ('Auditoría', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        })
    )
    actions = ['activate_provider', 'deactivate_provider', 'set_as_primary']

    def get_type_badge(self, obj):
        """Muestra tipo de proveedor con badge"""
        colors = {
            'mock': '#0066cc',
            'api': '#00cc00',
            'database': '#ff9900',
            'sap': '#9933cc',
            'banner': '#cc0000'
        }
        color = colors.get(obj.provider_type, '#666666')
        return format_html(
            '<span style="background-color: {}; color: white; padding: 3px 8px; '
            'border-radius: 3px; font-weight: bold;">{}</span>',
            color,
            obj.get_provider_type_display()
        )
    get_type_badge.short_description = 'Tipo'

    def get_status_badge(self, obj):
        """Muestra estado activo/inactivo"""
        color = '#00cc00' if obj.is_active else '#cccccc'
        text = 'Activo' if obj.is_active else 'Inactivo'
        return format_html(
            '<span style="background-color: {}; color: white; padding: 3px 8px; '
            'border-radius: 3px;">{}</span>',
            color, text
        )
    get_status_badge.short_description = 'Estado'

    def get_primary_badge(self, obj):
        """Muestra si es primario"""
        if obj.is_primary:
            return format_html(
                '<span style="background-color: #ffcc00; color: black; padding: 3px 8px; '
                'border-radius: 3px;">⭐ Principal</span>'
            )
        return '-'
    get_primary_badge.short_description = 'Principal'

    def get_sync_status(self, obj):
        """Muestra estado de sincronización"""
        colors = {
            'pending': '#ffcc00',
            'success': '#00cc00',
            'error': '#cc0000',
            'in_progress': '#0066cc'
        }
        color = colors.get(obj.sync_status, '#666666')
        return format_html(
            '<span style="background-color: {}; color: white; padding: 3px 8px; '
            'border-radius: 3px;">{}</span>',
            color, obj.sync_status.upper()
        )
    get_sync_status.short_description = 'Sincronización'

    def get_sync_info(self, obj):
        """Información de sincronización"""
        info = f'Última sincronización: {obj.last_sync}\n'
        if obj.last_error:
            info += f'Último error: {obj.last_error}'
        return info
    get_sync_info.short_description = 'Información de Sincronización'

    def get_action_buttons(self, obj):
        """Botones de acción"""
        url = reverse('admin:academic_academicprovider_change', args=[obj.id])
        return format_html(
            '<a class="button" href="{}">Editar</a>',
            url
        )
    get_action_buttons.short_description = 'Acciones'

    def activate_provider(self, request, queryset):
        """Activa proveedores seleccionados"""
        updated = queryset.update(is_active=True)
        self.message_user(request, f'{updated} proveedores activados.')
    activate_provider.short_description = 'Activar proveedores seleccionados'

    def deactivate_provider(self, request, queryset):
        """Desactiva proveedores seleccionados"""
        updated = queryset.update(is_active=False)
        self.message_user(request, f'{updated} proveedores desactivados.')
    deactivate_provider.short_description = 'Desactivar proveedores seleccionados'

    def set_as_primary(self, request, queryset):
        """Establece como proveedor primario"""
        if queryset.count() != 1:
            self.message_user(request, 'Selecciona solo un proveedor', level='error')
            return

        # Remover primario anterior
        AcademicProvider.objects.filter(is_primary=True).update(is_primary=False)
        # Establecer nuevo primario
        queryset.update(is_primary=True)
        self.message_user(request, 'Proveedor establecido como primario.')
    set_as_primary.short_description = 'Establecer como proveedor primario'


@admin.register(AcademicStudent)
class AcademicStudentAdmin(admin.ModelAdmin):
    """Admin para estudiantes académicos"""

    list_display = [
        'get_user_email', 'get_full_name', 'rut', 'program_name',
        'get_enrollment_badge', 'get_verified_badge', 'verification_date'
    ]
    list_filter = [
        'provider', 'enrollment_status', 'is_verified',
        'verification_date', 'created_at'
    ]
    search_fields = ['user__email', 'first_name', 'last_name', 'rut', 'student_id']
    readonly_fields = [
        'user', 'provider', 'created_at', 'updated_at',
        'get_raw_data', 'get_user_link'
    ]
    fieldsets = (
        ('Información de Usuario', {
            'fields': ('user', 'get_user_link', 'provider')
        }),
        ('Datos Académicos', {
            'fields': (
                'student_id', 'rut', 'first_name', 'last_name',
                'email', 'program_name', 'program_code'
            )
        }),
        ('Matrícula', {
            'fields': (
                'enrollment_status', 'enrollment_date',
                'graduation_year', 'current_year', 'current_semester'
            ),
            'classes': ('collapse',)
        }),
        ('Verificación', {
            'fields': (
                'is_verified', 'verification_date', 'verification_method'
            )
        }),
        ('Datos Raw', {
            'fields': ('get_raw_data',),
            'classes': ('collapse',)
        }),
        ('Auditoría', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        })
    )

    def get_user_email(self, obj):
        """Muestra email del usuario"""
        return obj.user.email
    get_user_email.short_description = 'Usuario'

    def get_user_link(self, obj):
        """Link al usuario en admin"""
        url = reverse('admin:users_user_change', args=[obj.user.id])
        return format_html('<a href="{}">{}</a>', url, obj.user.email)
    get_user_link.short_description = 'Ir a Usuario'

    def get_full_name(self, obj):
        """Nombre completo del estudiante"""
        return obj.get_full_name()
    get_full_name.short_description = 'Nombre'

    def get_enrollment_badge(self, obj):
        """Muestra estado de matrícula con badge"""
        colors = {
            'active': '#00cc00',
            'inactive': '#cccccc',
            'graduated': '#0066cc',
            'suspended': '#cc0000'
        }
        color = colors.get(obj.enrollment_status, '#666666')
        return format_html(
            '<span style="background-color: {}; color: white; padding: 3px 8px; '
            'border-radius: 3px;">{}</span>',
            color, obj.get_enrollment_status_display()
        )
    get_enrollment_badge.short_description = 'Matrícula'

    def get_verified_badge(self, obj):
        """Muestra si está verificado"""
        if obj.is_verified:
            return format_html(
                '<span style="background-color: #00cc00; color: white; padding: 3px 8px; '
                'border-radius: 3px;">✓ Verificado</span>'
            )
        return format_html(
            '<span style="background-color: #cccccc; color: black; padding: 3px 8px; '
            'border-radius: 3px;">✗ No Verificado</span>'
        )
    get_verified_badge.short_description = 'Verificación'

    def get_raw_data(self, obj):
        """Muestra datos raw como JSON formateado"""
        import json
        if obj.raw_data:
            return format_html(
                '<pre style="background: #f5f5f5; padding: 10px; '
                'border-radius: 3px; overflow: auto;">{}</pre>',
                json.dumps(obj.raw_data, indent=2, ensure_ascii=False)
            )
        return 'Sin datos'
    get_raw_data.short_description = 'Datos Raw (JSON)'


@admin.register(AcademicProgram)
class AcademicProgramAdmin(admin.ModelAdmin):
    """Admin para programas académicos"""

    list_display = [
        'program_name', 'program_code', 'get_type_badge',
        'career_name', 'faculty', 'get_active_badge', 'created_at'
    ]
    list_filter = ['provider', 'program_type', 'is_active', 'faculty', 'created_at']
    search_fields = ['program_name', 'program_code', 'career_name', 'faculty']
    readonly_fields = ['created_at', 'updated_at', 'get_student_count']
    fieldsets = (
        ('Información General', {
            'fields': ('provider', 'program_name', 'program_code')
        }),
        ('Datos del Programa', {
            'fields': ('career_name', 'faculty', 'program_type')
        }),
        ('Estado', {
            'fields': ('is_active',)
        }),
        ('Estadísticas', {
            'fields': ('get_student_count',),
            'classes': ('collapse',)
        }),
        ('Auditoría', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        })
    )

    def get_type_badge(self, obj):
        """Muestra tipo de programa con badge"""
        colors = {
            'undergraduate': '#0066cc',
            'postgraduate': '#9933cc',
            'diploma': '#ff9900',
            'certificate': '#00cc00'
        }
        color = colors.get(obj.program_type, '#666666')
        return format_html(
            '<span style="background-color: {}; color: white; padding: 3px 8px; '
            'border-radius: 3px;">{}</span>',
            color, obj.get_program_type_display()
        )
    get_type_badge.short_description = 'Tipo'

    def get_active_badge(self, obj):
        """Muestra si está activo"""
        color = '#00cc00' if obj.is_active else '#cccccc'
        text = 'Activo' if obj.is_active else 'Inactivo'
        return format_html(
            '<span style="background-color: {}; color: white; padding: 3px 8px; '
            'border-radius: 3px;">{}</span>',
            color, text
        )
    get_active_badge.short_description = 'Estado'

    def get_student_count(self, obj):
        """Cuenta estudiantes en este programa"""
        count = AcademicStudent.objects.filter(program_code=obj.program_code).count()
        return format_html(
            '<strong>{} estudiantes</strong>',
            count
        )
    get_student_count.short_description = 'Estudiantes'


@admin.register(AcademicVerification)
class AcademicVerificationAdmin(admin.ModelAdmin):
    """Admin para verificaciones académicas"""

    list_display = [
        'get_user_email', 'rut', 'get_status_badge',
        'attempted_at', 'verified_at', 'get_method_badge'
    ]
    list_filter = [
        'status', 'verification_method', 'provider',
        'attempted_at', 'verified_at', 'created_at'
    ]
    search_fields = ['user__email', 'rut', 'first_name', 'last_name']
    readonly_fields = [
        'user', 'created_at', 'get_verification_details',
        'get_mismatch_info', 'get_error_info'
    ]
    fieldsets = (
        ('Información General', {
            'fields': ('user', 'rut', 'first_name', 'last_name', 'program_name')
        }),
        ('Verificación', {
            'fields': ('status', 'verification_method', 'provider')
        }),
        ('Detalles de Verificación', {
            'fields': ('get_verification_details', 'get_mismatch_info', 'get_error_info'),
            'classes': ('collapse',)
        }),
        ('Datos Verificados', {
            'fields': ('academic_student',),
            'classes': ('collapse',)
        }),
        ('Tiempos', {
            'fields': ('attempted_at', 'verified_at'),
            'classes': ('collapse',)
        }),
        ('Auditoría', {
            'fields': ('created_at',),
            'classes': ('collapse',)
        })
    )

    def get_user_email(self, obj):
        """Email del usuario"""
        return obj.user.email
    get_user_email.short_description = 'Usuario'

    def get_status_badge(self, obj):
        """Estado de verificación con badge"""
        colors = {
            'pending': '#ffcc00',
            'verifying': '#0066cc',
            'verified': '#00cc00',
            'failed': '#cc0000',
            'mismatch': '#ff6600'
        }
        color = colors.get(obj.status, '#666666')
        return format_html(
            '<span style="background-color: {}; color: white; padding: 3px 8px; '
            'border-radius: 3px;">{}</span>',
            color, obj.get_status_display()
        )
    get_status_badge.short_description = 'Estado'

    def get_method_badge(self, obj):
        """Método de verificación"""
        if obj.verification_method:
            colors = {
                'mock': '#0066cc',
                'api': '#00cc00',
                'database': '#ff9900'
            }
            color = colors.get(obj.verification_method, '#666666')
            return format_html(
                '<span style="background-color: {}; color: white; padding: 3px 8px; '
                'border-radius: 3px;">{}</span>',
                color, obj.verification_method.upper()
            )
        return '-'
    get_method_badge.short_description = 'Método'

    def get_verification_details(self, obj):
        """Detalles de verificación"""
        info = f'Intento: {obj.attempted_at}\n'
        if obj.verified_at:
            info += f'Verificado: {obj.verified_at}\n'
        if obj.verification_method:
            info += f'Método: {obj.verification_method}'
        return format_html('<pre>{}</pre>', info)
    get_verification_details.short_description = 'Detalles'

    def get_mismatch_info(self, obj):
        """Información de desajustes"""
        if obj.mismatch_details:
            import json
            return format_html(
                '<pre style="background: #ffe6e6; padding: 10px; '
                'border-radius: 3px; overflow: auto;">{}</pre>',
                json.dumps(obj.mismatch_details, indent=2, ensure_ascii=False)
            )
        return 'Sin desajustes'
    get_mismatch_info.short_description = 'Desajustes'

    def get_error_info(self, obj):
        """Información de errores"""
        if obj.error_message:
            return format_html(
                '<pre style="background: #ffe6e6; padding: 10px; '
                'border-radius: 3px; overflow: auto;">{}</pre>',
                obj.error_message
            )
        return 'Sin errores'
    get_error_info.short_description = 'Errores'
