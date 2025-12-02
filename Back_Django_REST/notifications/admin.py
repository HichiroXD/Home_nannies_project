"""
Admin configuration para Notificaciones
"""

from django.contrib import admin
from django.utils.html import format_html
from .models import (
    Notification,
    NotificationTemplate,
    WebhookEndpoint,
    WebhookLog,
    NotificationPreference,
)


@admin.register(NotificationTemplate)
class NotificationTemplateAdmin(admin.ModelAdmin):
    list_display = ['name', 'template_type', 'is_active', 'created_at']
    list_filter = ['template_type', 'is_active', 'created_at']
    search_fields = ['name', 'subject']
    readonly_fields = ['created_at', 'updated_at']
    fieldsets = (
        ('Información', {
            'fields': ('name', 'template_type', 'is_active')
        }),
        ('Contenido', {
            'fields': ('subject', 'body_html', 'body_text')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ['subject', 'user', 'channel', 'status_badge', 'sent_at', 'created_at']
    list_filter = ['status', 'channel', 'created_at', 'sent_at']
    search_fields = ['subject', 'user__email', 'recipient_email']
    readonly_fields = ['created_at', 'updated_at', 'sent_at', 'read_at']
    fieldsets = (
        ('Información General', {
            'fields': ('user', 'template', 'channel', 'status')
        }),
        ('Contenido', {
            'fields': ('subject', 'message', 'recipient_email')
        }),
        ('Relaciones', {
            'fields': ('related_document_id', 'related_booking_id')
        }),
        ('Contexto', {
            'fields': ('context_data',),
            'classes': ('collapse',)
        }),
        ('Envío', {
            'fields': ('sent_at', 'read_at', 'attempts', 'last_error')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )

    def status_badge(self, obj):
        """Muestra estado como badge de color"""
        colors = {
            'pending': 'orange',
            'sent': 'green',
            'failed': 'red',
            'read': 'blue',
        }
        color = colors.get(obj.status, 'gray')
        return format_html(
            '<span style="background-color: {}; color: white; padding: 5px 10px; '
            'border-radius: 3px;">{}</span>',
            color,
            obj.get_status_display()
        )
    status_badge.short_description = 'Status'


@admin.register(WebhookEndpoint)
class WebhookEndpointAdmin(admin.ModelAdmin):
    list_display = ['name', 'event_type', 'is_active', 'last_triggered_at']
    list_filter = ['event_type', 'is_active', 'created_at']
    search_fields = ['name', 'url']
    readonly_fields = ['created_at', 'updated_at', 'last_triggered_at']
    fieldsets = (
        ('Información', {
            'fields': ('name', 'url', 'event_type', 'is_active')
        }),
        ('Configuración', {
            'fields': ('secret_key', 'retry_count', 'timeout')
        }),
        ('Estado', {
            'fields': ('last_triggered_at', 'last_error')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(WebhookLog)
class WebhookLogAdmin(admin.ModelAdmin):
    list_display = ['webhook', 'event_type', 'status_badge', 'attempts', 'created_at']
    list_filter = ['status', 'event_type', 'webhook', 'created_at']
    search_fields = ['webhook__name', 'event_type']
    readonly_fields = ['created_at', 'updated_at', 'completed_at']
    fieldsets = (
        ('Información', {
            'fields': ('webhook', 'event_type', 'status')
        }),
        ('Payload', {
            'fields': ('payload',)
        }),
        ('Respuesta', {
            'fields': ('response_status', 'response_body', 'error_message')
        }),
        ('Reintento', {
            'fields': ('attempts', 'next_retry_at')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at', 'completed_at'),
            'classes': ('collapse',)
        }),
    )

    def status_badge(self, obj):
        """Muestra estado como badge"""
        colors = {
            'pending': 'orange',
            'success': 'green',
            'failed': 'red',
            'retrying': 'yellow',
        }
        color = colors.get(obj.status, 'gray')
        return format_html(
            '<span style="background-color: {}; color: white; padding: 5px 10px; '
            'border-radius: 3px;">{}</span>',
            color,
            obj.get_status_display()
        )
    status_badge.short_description = 'Status'


@admin.register(NotificationPreference)
class NotificationPreferenceAdmin(admin.ModelAdmin):
    list_display = ['user', 'email_ocr_events', 'email_booking_events', 'in_app_notifications']
    list_filter = ['email_ocr_events', 'email_booking_events', 'in_app_notifications']
    search_fields = ['user__email']
    readonly_fields = ['created_at', 'updated_at']
    fieldsets = (
        ('Usuario', {
            'fields': ('user',)
        }),
        ('Notificaciones por Email', {
            'fields': ('email_ocr_events', 'email_booking_events', 'email_verification_events')
        }),
        ('Notificaciones In-App', {
            'fields': ('in_app_notifications',)
        }),
        ('Horas de No Molestar', {
            'fields': ('quiet_hours_start', 'quiet_hours_end')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
