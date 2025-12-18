from django.contrib import admin
from django.utils.html import format_html
from django.urls import reverse
from django.db.models import Count, Avg
from .models import NannyProfile

@admin.register(NannyProfile)
class NannyProfileAdmin(admin.ModelAdmin):
    """Admin profesional para gestionar perfiles de niñeras"""
    
    # Lista principal
    list_display = [
        'id',
        'user_link',
        'photo_thumbnail',
        'hourly_rate_formatted',
        'experience_years',
        'rating_avg_stars',
        'verified_badge',
        'age',
        'bookings_count',
        'reviews_count'
    ]
    
    list_filter = [
        'verified',
        'experience_years',
        ('rating_avg', admin.NumericRangeFilter),
        ('user__date_joined', admin.DateFieldListFilter),
    ]
    
    search_fields = [
        'user__username',
        'user__email',
        'user__first_name',
        'user__last_name',
        'description',
        'certifications'
    ]
    
    readonly_fields = [
        'rating_avg',
        'photo_preview',
        'user_info_display',
        'bookings_count',
        'reviews_count'
    ]
    
    fieldsets = (
        ('Usuario Asociado', {
            'fields': ('user', 'user_info_display')
        }),
        ('Información Profesional', {
            'fields': ('experience_years', 'hourly_rate', 'description', 'certifications', 'verified')
        }),
        ('Datos Personales', {
            'fields': ('age', 'profile_photo', 'photo_preview')
        }),
        ('Estadísticas', {
            'fields': ('rating_avg', 'bookings_count', 'reviews_count'),
            'classes': ('collapse',)
        }),
    )
    
    actions = ['marcar_verificada', 'marcar_no_verificada', 'recalcular_rating']
    
    ordering = ['-rating_avg', '-verified']
    
    # Optimización de queries
    def get_queryset(self, request):
        qs = super().get_queryset(request)
        return qs.select_related('user').annotate(
            total_bookings=Count('user__bookings_received', distinct=True),
            total_reviews=Count('user__reviews_received', distinct=True)
        )
    
    # Métodos personalizados para list_display
    @admin.display(description='Niñera', ordering='user__username')
    def user_link(self, obj):
        url = reverse('admin:users_customuser_change', args=[obj.user.pk])
        name = f"{obj.user.first_name} {obj.user.last_name}" if obj.user.first_name else obj.user.username
        return format_html('<a href="{}">{}</a>', url, name)
    
    @admin.display(description='Foto')
    def photo_thumbnail(self, obj):
        if obj.profile_photo:
            return format_html(
                '<img src="{}" width="40" height="40" style="border-radius: 50%; object-fit: cover;" />',
                obj.profile_photo.url
            )
        return '—'
    
    @admin.display(description='Tarifa', ordering='hourly_rate')
    def hourly_rate_formatted(self, obj):
        return format_html('<strong>${}</strong>/hr', obj.hourly_rate)
    
    @admin.display(description='Rating', ordering='rating_avg')
    def rating_avg_stars(self, obj):
        stars = '★' * int(obj.rating_avg) + '☆' * (5 - int(obj.rating_avg))
        color = '#FFD700' if obj.rating_avg >= 4.0 else '#FFA500' if obj.rating_avg >= 3.0 else '#9E9E9E'
        return format_html(
            '<span style="color: {};">{}</span> <small>({:.2f})</small>',
            color,
            stars,
            obj.rating_avg
        )
    
    @admin.display(description='Verificada', ordering='verified')
    def verified_badge(self, obj):
        if obj.verified:
            return format_html('<span style="color: #4CAF50; font-weight: bold;">✓ Verificada</span>')
        return format_html('<span style="color: #F44336;">✗ No verificada</span>')
    
    @admin.display(description='Reservas')
    def bookings_count(self, obj):
        return obj.total_bookings if hasattr(obj, 'total_bookings') else '—'
    
    @admin.display(description='Reseñas')
    def reviews_count(self, obj):
        return obj.total_reviews if hasattr(obj, 'total_reviews') else '—'
    
    # Readonly fields personalizados
    @admin.display(description='Vista Previa de Foto')
    def photo_preview(self, obj):
        if obj.profile_photo:
            return format_html(
                '<img src="{}" width="200" style="border-radius: 8px;" />',
                obj.profile_photo.url
            )
        return 'Sin foto'
    
    @admin.display(description='Información del Usuario')
    def user_info_display(self, obj):
        return format_html(
            '<strong>Email:</strong> {}<br><strong>Rol:</strong> {}<br><strong>Miembro desde:</strong> {}',
            obj.user.email,
            obj.user.get_role_display() if hasattr(obj.user, 'get_role_display') else obj.role,
            obj.user.date_joined.strftime('%d/%m/%Y')
        )
    
    # Acciones masivas
    @admin.action(description='Marcar como Verificada')
    def marcar_verificada(self, request, queryset):
        updated = queryset.update(verified=True)
        self.message_user(request, f'{updated} niñera(s) marcadas como verificadas.')
    
    @admin.action(description='Marcar como No Verificada')
    def marcar_no_verificada(self, request, queryset):
        updated = queryset.update(verified=False)
        self.message_user(request, f'{updated} niñera(s) marcadas como no verificadas.')
    
    @admin.action(description='Recalcular Rating')
    def recalcular_rating(self, request, queryset):
        from reviews.models import Review
        updated_count = 0
        for nanny_profile in queryset:
            avg_rating = Review.objects.filter(
                nanny=nanny_profile.user
            ).aggregate(Avg('rating'))['rating__avg']
            if avg_rating is not None:
                nanny_profile.rating_avg = avg_rating
                nanny_profile.save()
                updated_count += 1
        self.message_user(request, f'Rating recalculado para {updated_count} niñera(s).')
