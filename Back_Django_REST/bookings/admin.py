from django.contrib import admin
from django.utils.html import format_html
from django.urls import reverse
from django.utils.safestring import mark_safe
from .models import Booking, Availability

@admin.register(Booking)
class BookingAdmin(admin.ModelAdmin):
    """Admin profesional para gestionar reservas"""
    
    # Lista principal
    list_display = [
        'id_link', 
        'parent_link', 
        'nanny_link', 
        'start_time_formatted', 
        'end_time_formatted',
        'status_colored',
        'duration',
        'created_at'
    ]
    
    list_filter = [
        'status',
        'created_at',
        ('start_time', admin.DateFieldListFilter),
    ]
    
    search_fields = [
        'parent__username',
        'parent__email',
        'parent__first_name',
        'parent__last_name',
        'nanny__username',
        'nanny__email',
        'nanny__first_name',
        'nanny__last_name',
    ]
    
    date_hierarchy = 'start_time'
    
    readonly_fields = ['created_at', 'updated_at', 'duration']
    
    fieldsets = (
        ('Información de la Reserva', {
            'fields': ('parent', 'nanny', 'status')
        }),
        ('Fechas y Horarios', {
            'fields': ('start_time', 'end_time', 'duration')
        }),
        ('Metadatos', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    actions = ['marcar_confirmada', 'marcar_completada', 'marcar_cancelada']
    
    # Ordenamiento por defecto
    ordering = ['-created_at']
    
    # Métodos personalizados para list_display
    @admin.display(description='ID', ordering='id')
    def id_link(self, obj):
        url = reverse('admin:bookings_booking_change', args=[obj.pk])
        return format_html('<a href="{}">{}</a>', url, obj.id)
    
    @admin.display(description='Padre', ordering='parent__username')
    def parent_link(self, obj):
        url = reverse('admin:users_user_change', args=[obj.parent.pk])
        return format_html(
            '<a href="{}">{} {}</a>',
            url,
            obj.parent.first_name or obj.parent.username,
            obj.parent.last_name or ''
        )
    
    @admin.display(description='Niñera', ordering='nanny__username')
    def nanny_link(self, obj):
        url = reverse('admin:users_user_change', args=[obj.nanny.pk])
        return format_html(
            '<a href="{}">{} {}</a>',
            url,
            obj.nanny.first_name or obj.nanny.username,
            obj.nanny.last_name or ''
        )
    
    @admin.display(description='Inicio', ordering='start_time')
    def start_time_formatted(self, obj):
        return obj.start_time.strftime('%d/%m/%Y %H:%M')
    
    @admin.display(description='Fin', ordering='end_time')
    def end_time_formatted(self, obj):
        return obj.end_time.strftime('%d/%m/%Y %H:%M')
    
    @admin.display(description='Estado', ordering='status')
    def status_colored(self, obj):
        colors = {
            'pending': '#FFA500',  # Naranja
            'confirmed': '#2196F3',  # Azul
            'rejected': '#F44336',  # Rojo
            'cancelled': '#9E9E9E',  # Gris
            'completed': '#4CAF50',  # Verde
        }
        color = colors.get(obj.status, '#000000')
        return format_html(
            '<span style="color: {}; font-weight: bold;">{}</span>',
            color,
            obj.get_status_display()
        )
    
    @admin.display(description='Duración')
    def duration(self, obj):
        delta = obj.end_time - obj.start_time
        hours = delta.total_seconds() / 3600
        return f"{hours:.1f}h"
    
    # Acciones masivas
    @admin.action(description='Marcar como Confirmada')
    def marcar_confirmada(self, request, queryset):
        updated = queryset.update(status='confirmed')
        self.message_user(request, f'{updated} reserva(s) marcadas como confirmadas.')
    
    @admin.action(description='Marcar como Completada')
    def marcar_completada(self, request, queryset):
        updated = queryset.update(status='completed')
        self.message_user(request, f'{updated} reserva(s) marcadas como completadas.')
    
    @admin.action(description='Marcar como Cancelada')
    def marcar_cancelada(self, request, queryset):
        updated = queryset.update(status='cancelled')
        self.message_user(request, f'{updated} reserva(s) marcadas como canceladas.')


@admin.register(Availability)
class AvailabilityAdmin(admin.ModelAdmin):
    """Admin para gestionar disponibilidad de niñeras"""
    
    list_display = ['id', 'nanny_name', 'day', 'start_time', 'end_time', 'created_at']
    list_filter = ['day', 'created_at']
    search_fields = ['nanny__username', 'nanny__first_name', 'nanny__last_name']
    date_hierarchy = 'day'
    ordering = ['-day', 'start_time']
    
    @admin.display(description='Niñera', ordering='nanny__username')
    def nanny_name(self, obj):
        return f"{obj.nanny.first_name} {obj.nanny.last_name}" if obj.nanny.first_name else obj.nanny.username