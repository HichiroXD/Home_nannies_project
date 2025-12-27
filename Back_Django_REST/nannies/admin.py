from django.contrib import admin
from django.utils.html import format_html
from django.urls import reverse
from django.db.models import Count, Avg
from django import forms
from .models import NannyProfile


class NannyProfileAdminForm(forms.ModelForm):
    """Formulario personalizado para convertir verified en lista desplegable"""
    
    verified = forms.TypedChoiceField(
        label='Estado de Verificación',
        choices=[(True, 'Verificada'), (False, 'No Verificada')],
        widget=forms.Select,
        coerce=lambda x: x == 'True' or x == True,
        required=True,
        help_text='Marca como verificada para aprobar a la niñera'
    )
    
    class Meta:
        model = NannyProfile
        fields = '__all__'
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        if self.instance and self.instance.pk:
            self.fields['verified'].initial = self.instance.verified


class VerificationCodeForm(forms.Form):
    """Formulario para verificar niñeras usando código"""
    verification_code = forms.CharField(
        max_length=8,
        label='Código de Verificación',
        help_text='Ingresa el código de 8 caracteres',
        widget=forms.TextInput(attrs={'placeholder': 'Ej: ABC12XYZ'})
    )


@admin.register(NannyProfile)
class NannyProfileAdmin(admin.ModelAdmin):
    """Admin profesional para gestionar perfiles de niñeras"""
    
    form = NannyProfileAdminForm
    
    # Lista principal
    list_display = [
        'id',
        'user_link',
        'photo_thumbnail',
        'hourly_rate_formatted',
        'experience_years',
        'rating_avg_stars',
        'verified_badge',
        'verification_code_display',
        'age',
        'bookings_count',
        'reviews_count'
    ]
    
    list_filter = [
        'verified',
        'experience_years',
        'rating_avg',  # Filtro simple por calificación
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
        'reviews_count',
        'verification_code_info'
    ]
    
    fieldsets = (
        ('Usuario Asociado', {
            'fields': ('user', 'user_info_display')
        }),
        ('✓ Estado de Verificación', {
            'fields': ('verified', 'verification_code', 'verification_code_info'),
            'description': 'Cambia el estado de verificación de la niñera. Selecciona "Verificada" para aprobar. Usa "Generar Códigos" en acciones para crear códigos automáticamente.'
        }),
        ('Información Profesional', {
            'fields': ('experience_years', 'hourly_rate', 'description', 'certifications')
        }),
        ('Datos Personales', {
            'fields': ('age', 'profile_photo', 'photo_preview')
        }),
        ('Estadísticas', {
            'fields': ('rating_avg', 'bookings_count', 'reviews_count'),
            'classes': ('collapse',)
        }),
    )
    
    actions = ['marcar_verificada', 'marcar_no_verificada', 'generar_codigos', 'verificar_todas', 'recalcular_rating']
    
    ordering = ['-rating_avg', '-verified']
    
    # Optimización de queries
    def get_queryset(self, request):
        qs = super().get_queryset(request)
        return qs.select_related('user').annotate(
            total_bookings=Count('user__bookings_received', distinct=True),
            total_reviews=Count('reviews_received', distinct=True)
        )
    
    # Métodos personalizados para list_display
    @admin.display(description='Niñera', ordering='user__username')
    def user_link(self, obj):
        url = reverse('admin:users_user_change', args=[obj.user.pk])
        name = f"{obj.user.first_name} {obj.user.last_name}" if obj.user.first_name else obj.user.username
        return format_html(
            '<div style="line-height: 1.4;">'
            '<strong>{}</strong><br>'
            '<small style="color: #666;">@{}</small><br>'
            '<small style="color: #666;">{}</small><br>'
            '<a href="{}" style="font-size: 11px; color: #2196F3;" target="_blank">Ver usuario →</a>'
            '</div>',
            name,
            obj.user.username,
            obj.user.email,
            url
        )
    
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
        rating_formatted = f'{obj.rating_avg:.2f}'
        return format_html(
            '<span style="color: {};">{}</span> <small>({})</small>',
            color,
            stars,
            rating_formatted
        )
    
    @admin.display(description='Verificada', ordering='verified')
    def verified_badge(self, obj):
        if obj.verified:
            return format_html('<span style="color: #4CAF50; font-weight: bold;">✓ Verificada</span>')
        return format_html('<span style="color: #F44336;">✗ No verificada</span>')
    
    @admin.display(description='Código')
    def verification_code_display(self, obj):
        if obj.verification_code:
            return format_html(
                '<code style="background: #e3f2fd; padding: 3px 8px; border-radius: 3px; font-size: 11px; font-weight: bold; color: #1976D2; cursor: pointer;" title="Haz clic para copiar" onclick="navigator.clipboard.writeText(\'{}\'); alert(\'Código copiado: {}\');">{}</code>',
                obj.verification_code,
                obj.verification_code,
                obj.verification_code
            )
        return format_html('<span style="color: #9E9E9E; font-size: 11px;">Sin código</span>')
    
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
            obj.user.get_role_display() if hasattr(obj.user, 'get_role_display') else obj.user.role,
            obj.user.date_joined.strftime('%d/%m/%Y')
        )
    
    @admin.display(description='Código de Verificación')
    def verification_code_info(self, obj):
        if obj.verification_code:
            return format_html(
                '<div style="padding: 10px; background: #f5f5f5; border-radius: 5px;">'
                '<strong>Código actual:</strong> '
                '<code style="background: #fff; padding: 5px 10px; border-radius: 3px; font-size: 14px; font-weight: bold; color: #2196F3; margin-left: 10px;">{}</code>'
                '<p style="margin-top: 10px; color: #666; font-size: 12px;">Este código puede ser usado para verificación manual.</p>'
                '</div>',
                obj.verification_code
            )
        return format_html(
            '<div style="padding: 10px; background: #fff3cd; border-radius: 5px; border-left: 3px solid #ffc107;">'
            '<strong style="color: #856404;">⚠️ Sin código generado</strong>'
            '<p style="margin-top: 5px; color: #856404; font-size: 12px;">Usa la acción "Generar Códigos de Verificación" para crear uno.</p>'
            '</div>'
        )
    
    # Acciones masivas
    @admin.action(description='✅ Marcar como Verificada')
    def marcar_verificada(self, request, queryset):
        updated = queryset.update(verified=True)
        nannies_list = [f"{n.user.username} (ID: {n.id})" for n in queryset[:5]]
        nannies_text = ", ".join(nannies_list)
        if queryset.count() > 5:
            nannies_text += f" y {queryset.count() - 5} más"
        self.message_user(request, f'✓ {updated} niñera(s) marcadas como verificadas: {nannies_text}')
    
    @admin.action(description='❌ Marcar como No Verificada')
    def marcar_no_verificada(self, request, queryset):
        updated = queryset.update(verified=False)
        self.message_user(request, f'{updated} niñera(s) marcadas como no verificadas.')
    
    @admin.action(description='🔑 Generar Códigos de Verificación')
    def generar_codigos(self, request, queryset):
        count = 0
        codes_generated = []
        for nanny_profile in queryset:
            if not nanny_profile.verification_code:
                code = nanny_profile.generate_verification_code()
                codes_generated.append(f"{nanny_profile.user.username}: {code}")
                count += 1
        
        if count > 0:
            if count <= 5:
                codes_text = "<br>".join(codes_generated)
                from django.contrib import messages
                messages.success(request, format_html(
                    '<strong>Códigos generados:</strong><br>{}<br><br>Total: {} código(s)',
                    codes_text, count
                ))
            else:
                self.message_user(request, f'✓ Códigos generados para {count} niñera(s).')
        else:
            self.message_user(request, 'Todas las niñeras seleccionadas ya tienen código.', level='warning')
    
    @admin.action(description='✓ Verificar Todas las Seleccionadas')
    def verificar_todas(self, request, queryset):
        """Verifica todas las niñeras seleccionadas"""
        count = queryset.filter(verified=False).count()
        queryset.update(verified=True)
        self.message_user(request, f'✓ {count} niñera(s) verificadas exitosamente.')
    
    @admin.action(description='📊 Recalcular Rating')
    def recalcular_rating(self, request, queryset):
        from reviews.models import Review
        from django.db.models import Avg
        updated_count = 0
        for nanny_profile in queryset:
            avg_rating = Review.objects.filter(
                nanny=nanny_profile
            ).aggregate(Avg('rating'))['rating__avg']
            if avg_rating is not None:
                nanny_profile.rating_avg = avg_rating
                nanny_profile.save()
                updated_count += 1
        self.message_user(request, f'Rating recalculado para {updated_count} niñera(s).')
