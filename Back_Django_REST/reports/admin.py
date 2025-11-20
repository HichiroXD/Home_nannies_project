"""
Reports Admin Interface - Phase 3
Configuración del panel administrativo para reportes
"""

from django.contrib import admin
from django.utils.html import format_html
from django.urls import reverse
from .models import (
    VerificationReport, OcrStatistics, AcademicStatistics,
    VerificationTrend, UserVerificationSummary
)


@admin.register(VerificationReport)
class VerificationReportAdmin(admin.ModelAdmin):
    """Admin para reportes de verificación consolidados"""

    list_display = [
        'title', 'get_type_badge', 'start_date', 'end_date',
        'get_ocr_success_rate', 'get_academic_success_rate',
        'unique_students', 'created_at'
    ]
    list_filter = ['report_type', 'created_at', 'created_by']
    search_fields = ['title', 'description']
    readonly_fields = [
        'created_at', 'updated_at', 'get_summary_info'
    ]
    fieldsets = (
        ('Información General', {
            'fields': ('report_type', 'title', 'description')
        }),
        ('Período', {
            'fields': ('start_date', 'end_date')
        }),
        ('Estadísticas OCR', {
            'fields': (
                'total_ocr_submissions', 'successful_ocr',
                'failed_ocr', 'rejected_ocr', 'ocr_success_rate'
            ),
            'classes': ('collapse',)
        }),
        ('Estadísticas Académicas', {
            'fields': (
                'total_academic_verifications', 'successful_academic',
                'failed_academic', 'academic_success_rate'
            ),
            'classes': ('collapse',)
        }),
        ('Resumen', {
            'fields': (
                'unique_students', 'average_verification_time',
                'get_summary_info'
            ),
            'classes': ('collapse',)
        }),
        ('Auditoría', {
            'fields': ('created_by', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        })
    )

    def get_type_badge(self, obj):
        """Muestra tipo de reporte con badge"""
        colors = {
            'daily': '#0066cc',
            'weekly': '#00cc00',
            'monthly': '#9933cc',
            'custom': '#ff9900'
        }
        color = colors.get(obj.report_type, '#666666')
        return format_html(
            '<span style="background-color: {}; color: white; padding: 3px 8px; '
            'border-radius: 3px;">{}</span>',
            color, obj.get_report_type_display()
        )
    get_type_badge.short_description = 'Tipo'

    def get_ocr_success_rate(self, obj):
        """Muestra tasa de éxito OCR"""
        color = '#00cc00' if obj.ocr_success_rate >= 80 else '#ff9900'
        return format_html(
            '<span style="background-color: {}; color: white; padding: 3px 8px; '
            'border-radius: 3px;">{:.1f}%</span>',
            color, obj.ocr_success_rate
        )
    get_ocr_success_rate.short_description = 'Tasa Éxito OCR'

    def get_academic_success_rate(self, obj):
        """Muestra tasa de éxito académica"""
        color = '#00cc00' if obj.academic_success_rate >= 80 else '#ff9900'
        return format_html(
            '<span style="background-color: {}; color: white; padding: 3px 8px; '
            'border-radius: 3px;">{:.1f}%</span>',
            color, obj.academic_success_rate
        )
    get_academic_success_rate.short_description = 'Tasa Éxito Académica'

    def get_summary_info(self, obj):
        """Información de resumen"""
        info = f'Estudiantes únicos: {obj.unique_students}\n'
        info += f'Tiempo promedio: {obj.average_verification_time:.2f}s'
        return format_html('<pre>{}</pre>', info)
    get_summary_info.short_description = 'Resumen'


@admin.register(OcrStatistics)
class OcrStatisticsAdmin(admin.ModelAdmin):
    """Admin para estadísticas OCR diarias"""

    list_display = [
        'date', 'total_submissions', 'get_successful_badge',
        'failed', 'get_success_rate_badge', 'unique_users'
    ]
    list_filter = ['date', 'success_rate']
    readonly_fields = ['date', 'get_details']
    fieldsets = (
        ('Fecha', {
            'fields': ('date',)
        }),
        ('Recuentos', {
            'fields': (
                'total_submissions', 'successful', 'failed',
                'rejected', 'pending'
            )
        }),
        ('Calidad', {
            'fields': (
                'average_confidence', 'average_processing_time',
                'success_rate'
            ),
            'classes': ('collapse',)
        }),
        ('Usuarios', {
            'fields': ('unique_users',)
        }),
        ('Detalles', {
            'fields': ('get_details',),
            'classes': ('collapse',)
        })
    )

    def get_successful_badge(self, obj):
        """Muestra exitosos con badge"""
        return format_html(
            '<span style="background-color: #00cc00; color: white; padding: 3px 8px; '
            'border-radius: 3px;"><strong>{}</strong></span>',
            obj.successful
        )
    get_successful_badge.short_description = 'Exitosos'

    def get_success_rate_badge(self, obj):
        """Muestra tasa de éxito"""
        color = '#00cc00' if obj.success_rate >= 80 else '#ff9900'
        return format_html(
            '<span style="background-color: {}; color: white; padding: 3px 8px; '
            'border-radius: 3px;">{:.1f}%</span>',
            color, obj.success_rate
        )
    get_success_rate_badge.short_description = 'Tasa Éxito'

    def get_details(self, obj):
        """Detalles completos"""
        info = f'Total: {obj.total_submissions}\n'
        info += f'Exitosos: {obj.successful}\n'
        info += f'Fallidos: {obj.failed}\n'
        info += f'Rechazados: {obj.rejected}\n'
        info += f'Pendientes: {obj.pending}\n'
        info += f'Confianza promedio: {obj.average_confidence:.2f}%\n'
        info += f'Tiempo procesamiento: {obj.average_processing_time:.2f}s\n'
        info += f'Usuarios únicos: {obj.unique_users}'
        return format_html('<pre>{}</pre>', info)
    get_details.short_description = 'Detalles'


@admin.register(AcademicStatistics)
class AcademicStatisticsAdmin(admin.ModelAdmin):
    """Admin para estadísticas académicas diarias"""

    list_display = [
        'date', 'total_verifications', 'get_successful_badge',
        'failed', 'get_success_rate_badge', 'unique_users'
    ]
    list_filter = ['date', 'success_rate']
    readonly_fields = ['date', 'get_details', 'get_providers_breakdown']
    fieldsets = (
        ('Fecha', {
            'fields': ('date',)
        }),
        ('Recuentos', {
            'fields': (
                'total_verifications', 'successful', 'failed', 'pending'
            )
        }),
        ('Proveedores', {
            'fields': (
                'mock_verifications', 'api_verifications',
                'database_verifications', 'get_providers_breakdown'
            ),
            'classes': ('collapse',)
        }),
        ('Análisis', {
            'fields': (
                'unique_users', 'top_programs',
                'success_rate', 'get_details'
            ),
            'classes': ('collapse',)
        })
    )

    def get_successful_badge(self, obj):
        """Muestra exitosos con badge"""
        return format_html(
            '<span style="background-color: #00cc00; color: white; padding: 3px 8px; '
            'border-radius: 3px;"><strong>{}</strong></span>',
            obj.successful
        )
    get_successful_badge.short_description = 'Exitosas'

    def get_success_rate_badge(self, obj):
        """Muestra tasa de éxito"""
        color = '#00cc00' if obj.success_rate >= 80 else '#ff9900'
        return format_html(
            '<span style="background-color: {}; color: white; padding: 3px 8px; '
            'border-radius: 3px;">{:.1f}%</span>',
            color, obj.success_rate
        )
    get_success_rate_badge.short_description = 'Tasa Éxito'

    def get_providers_breakdown(self, obj):
        """Desglose de proveedores"""
        info = f'Mock: {obj.mock_verifications}\n'
        info += f'API: {obj.api_verifications}\n'
        info += f'Base de datos: {obj.database_verifications}'
        return format_html('<pre>{}</pre>', info)
    get_providers_breakdown.short_description = 'Desglose Proveedores'

    def get_details(self, obj):
        """Detalles completos"""
        info = f'Total: {obj.total_verifications}\n'
        info += f'Exitosas: {obj.successful}\n'
        info += f'Fallidas: {obj.failed}\n'
        info += f'Pendientes: {obj.pending}\n'
        info += f'Usuarios únicos: {obj.unique_users}\n'
        if obj.top_programs:
            info += f'Programas populares:\n'
            for p in obj.top_programs[:5]:
                info += f'  - {p.get("program", "N/A")}: {p.get("count", 0)}\n'
        return format_html('<pre>{}</pre>', info)
    get_details.short_description = 'Detalles'


@admin.register(VerificationTrend)
class VerificationTrendAdmin(admin.ModelAdmin):
    """Admin para tendencias de verificación"""

    list_display = [
        'timestamp', 'get_type_badge', 'ocr_submissions',
        'academic_verifications', 'active_users'
    ]
    list_filter = ['trend_type', 'timestamp']
    readonly_fields = ['timestamp', 'get_summary']
    fieldsets = (
        ('Período', {
            'fields': ('trend_type', 'timestamp')
        }),
        ('OCR', {
            'fields': ('ocr_submissions', 'ocr_successful')
        }),
        ('Académico', {
            'fields': ('academic_verifications', 'academic_successful')
        }),
        ('Usuarios', {
            'fields': ('active_users',)
        }),
        ('Resumen', {
            'fields': ('get_summary',),
            'classes': ('collapse',)
        })
    )

    def get_type_badge(self, obj):
        """Muestra tipo de tendencia"""
        colors = {
            'hourly': '#0066cc',
            'daily': '#00cc00',
            'weekly': '#9933cc',
            'monthly': '#ff9900'
        }
        color = colors.get(obj.trend_type, '#666666')
        return format_html(
            '<span style="background-color: {}; color: white; padding: 3px 8px; '
            'border-radius: 3px;">{}</span>',
            color, obj.get_trend_type_display()
        )
    get_type_badge.short_description = 'Tipo'

    def get_summary(self, obj):
        """Resumen de tendencia"""
        info = f'Envíos OCR: {obj.ocr_submissions}\n'
        info += f'OCR exitosos: {obj.ocr_successful}\n'
        info += f'Verificaciones académicas: {obj.academic_verifications}\n'
        info += f'Académicas exitosas: {obj.academic_successful}\n'
        info += f'Usuarios activos: {obj.active_users}'
        return format_html('<pre>{}</pre>', info)
    get_summary.short_description = 'Resumen'


@admin.register(UserVerificationSummary)
class UserVerificationSummaryAdmin(admin.ModelAdmin):
    """Admin para resumen de verificación de usuarios"""

    list_display = [
        'get_user_email', 'get_ocr_badge', 'failed_ocr',
        'get_academic_badge', 'first_submission', 'last_submission'
    ]
    list_filter = ['academic_verified', 'last_submission']
    search_fields = ['user__email', 'user__first_name', 'user__last_name']
    readonly_fields = [
        'user', 'first_submission', 'updated_at', 'get_summary'
    ]
    fieldsets = (
        ('Usuario', {
            'fields': ('user',)
        }),
        ('OCR', {
            'fields': (
                'total_ocr_submissions', 'successful_ocr',
                'failed_ocr'
            )
        }),
        ('Académico', {
            'fields': (
                'academic_verified', 'last_academic_verification',
                'academic_verification_method'
            )
        }),
        ('Auditoría', {
            'fields': (
                'first_submission', 'last_submission', 'updated_at'
            )
        }),
        ('Resumen', {
            'fields': ('get_summary',),
            'classes': ('collapse',)
        })
    )

    def get_user_email(self, obj):
        """Email del usuario"""
        return obj.user.email
    get_user_email.short_description = 'Usuario'

    def get_ocr_badge(self, obj):
        """Muestra estado OCR"""
        status_text = f'{obj.successful_ocr} exitosos'
        color = '#00cc00' if obj.successful_ocr > 0 else '#cccccc'
        return format_html(
            '<span style="background-color: {}; color: white; padding: 3px 8px; '
            'border-radius: 3px;">{}</span>',
            color, status_text
        )
    get_ocr_badge.short_description = 'OCR'

    def get_academic_badge(self, obj):
        """Muestra estado académico"""
        if obj.academic_verified:
            return format_html(
                '<span style="background-color: #00cc00; color: white; padding: 3px 8px; '
                'border-radius: 3px;">✓ Verificado</span>'
            )
        return format_html(
            '<span style="background-color: #cccccc; color: black; padding: 3px 8px; '
            'border-radius: 3px;">✗ No Verificado</span>'
        )
    get_academic_badge.short_description = 'Académico'

    def get_summary(self, obj):
        """Resumen del usuario"""
        info = f'OCR total: {obj.total_ocr_submissions}\n'
        info += f'OCR exitosos: {obj.successful_ocr}\n'
        info += f'OCR fallidos: {obj.failed_ocr}\n'
        info += f'Tasa OCR: {obj.get_ocr_success_rate():.1f}%\n'
        info += f'Académico: {"Verificado" if obj.academic_verified else "No verificado"}\n'
        info += f'Estado general: {obj.get_verification_status().replace("_", " ").upper()}'
        return format_html('<pre>{}</pre>', info)
    get_summary.short_description = 'Resumen'
