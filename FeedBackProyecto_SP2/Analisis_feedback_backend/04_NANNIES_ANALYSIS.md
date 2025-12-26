# 👶 Análisis: Aplicación `nannies`

**Fecha:** 14 de Diciembre, 2025  
**Aplicación:** `nannies` - Gestión de perfiles de niñeras  
**Archivos analizados:** models.py, serializer.py, views.py, urls.py, admin.py, tests.py

---

## 📊 Resumen Ejecutivo

| Aspecto | Calificación | Comentario |
|---------|--------------|------------|
| **Modelos** | ⭐⭐⭐☆☆ (3/5) | Muy simple, le faltan campos importantes |
| **Serializadores** | ⭐⭐⭐⭐☆ (4/5) | Bien con métodos, algunas mejoras |
| **Vistas** | ⭐⭐⭐⭐☆ (4/5) | Funcionales, filtros buenos |
| **URLs** | ⭐⭐⭐⭐⭐ (5/5) | Simples y claras |
| **Admin** | ⭐⭐☆☆☆ (2/5) | Muy básico, puede mejorar mucho |
| **Tests** | ⭐☆☆☆☆ (1/5) | Vacío, sin tests |
| **Código Limpio** | ⭐⭐⭐⭐☆ (4/5) | Limpio pero muy simple |

**Puntuación General:** **3.3/5** ⭐⭐⭐☆☆

---

## ✅ FORTALEZAS DESTACADAS

### 1. **Serializer con Métodos Útiles** 📊

```python
# ✅ BUENA PRÁCTICA: SerializerMethodField para datos calculados
class NannyProfileSerializer(serializers.ModelSerializer):
    reviews = serializers.SerializerMethodField()
    total_bookings = serializers.SerializerMethodField()
    acceptance_rate = serializers.SerializerMethodField()
    
    def get_acceptance_rate(self, obj):
        """Calcular tasa de aceptación"""
        total = obj.user.bookings_received.count()
        if total == 0:
            return None
        accepted = obj.user.bookings_received.filter(
            status__in=['confirmed', 'completed']
        ).count()
        return round((accepted / total) * 100, 1)
```

### 2. **Filtros Flexibles en ListView** 🔍

```python
# ✅ BUENA PRÁCTICA: Múltiples filtros query params
def get_queryset(self):
    queryset = NannyProfile.objects.all().select_related('user')
    
    # Filtros: verified, max_rate, min_experience
    max_rate = self.request.query_params.get('max_rate', None)
    if max_rate:
        queryset = queryset.filter(hourly_rate__lte=float(max_rate))
    
    # Search y ordering configurados
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
```

### 3. **Dashboard con Métricas Relevantes** 📈

```python
# ✅ FUNCIONALIDAD ÚTIL: Dashboard con stats
dashboard_data = {
    'stats': {
        'activeBookings': active_bookings,
        'completedBookings': completed_bookings,
        'totalReviews': reviews.count(),
        'avgRating': float(avg_rating),
    },
    'earnings': {
        'thisMonth': completed_bookings * nanny.hourly_rate,
        # ...
    }
}
```

### 4. **Select Related para Optimización** 🚀

```python
# ✅ BUENA PRÁCTICA: select_related para evitar N+1
queryset = NannyProfile.objects.all().select_related('user')
```

### 5. **Property en Modelo** 💡

```python
# ✅ BUENA PRÁCTICA: Property method
@property
def role(self):
    """Retorna el rol del usuario asociado"""
    return self.user.role
```

---

## 🔴 PROBLEMAS CRÍTICOS

### 1. **Sin Tests** 🚨
**Ubicación:** `tests.py`  
**Severidad:** 🔴 CRÍTICA

```python
# ❌ PROBLEMA CRÍTICO: Archivo vacío
from django.test import TestCase

# Create your tests here.
```

**Impacto:** Sin tests, no hay garantía de que el código funcione correctamente.

**Solución:** Ver sección de Tests Recomendados.

---

## 🟠 PROBLEMAS DE PRIORIDAD ALTA

### 1. **Modelo Muy Simplificado** 📋
**Ubicación:** `models.py` - NannyProfile  
**Severidad:** 🟠 ALTA

```python
# ⚠️ PROBLEMA: Modelo demasiado simple para dominio complejo
class NannyProfile(models.Model):
    # Solo 8 campos básicos
    # ❌ FALTAN: Disponibilidad, ubicación, idiomas, referencias, etc.
```

**Impacto:** Funcionalidad limitada para matching y búsqueda avanzada.

**Solución:**
```python
from django.contrib.postgres.fields import ArrayField

class NannyProfile(models.Model):
    # Campos existentes...
    user = models.OneToOneField(...)
    experience_years = models.PositiveIntegerField(default=0)
    hourly_rate = models.PositiveIntegerField(default=0)
    description = models.TextField(blank=True)
    verified = models.BooleanField(default=False)
    age = models.PositiveIntegerField(null=True, blank=True)
    certifications = models.TextField(blank=True)
    rating_avg = models.DecimalField(max_digits=3, decimal_places=2, default=0.0)
    profile_photo = models.ImageField(upload_to='nanny_profiles/', blank=True, null=True)
    
    # ✅ AGREGAR: Campos importantes
    # Ubicación
    city = models.CharField(max_length=100, blank=True)
    neighborhood = models.CharField(max_length=100, blank=True)
    latitude = models.DecimalField(
        max_digits=9, decimal_places=6, 
        null=True, blank=True,
        help_text="Para búsqueda geográfica"
    )
    longitude = models.DecimalField(
        max_digits=9, decimal_places=6,
        null=True, blank=True
    )
    
    # Disponibilidad
    available_weekdays = ArrayField(
        models.CharField(max_length=10),
        default=list,
        blank=True,
        help_text="['monday', 'tuesday', ...]"
    )
    available_from_time = models.TimeField(
        null=True, blank=True,
        help_text="Hora de inicio disponibilidad"
    )
    available_to_time = models.TimeField(
        null=True, blank=True,
        help_text="Hora fin disponibilidad"
    )
    
    # Capacidades
    languages = ArrayField(
        models.CharField(max_length=50),
        default=list,
        blank=True,
        help_text="['español', 'inglés', ...]"
    )
    age_groups = ArrayField(
        models.CharField(max_length=20),
        default=list,
        blank=True,
        help_text="['0-2', '3-5', '6-12']"
    )
    special_needs_experience = models.BooleanField(
        default=False,
        help_text="Experiencia con niños con necesidades especiales"
    )
    max_children = models.PositiveIntegerField(
        default=3,
        help_text="Máximo número de niños que puede cuidar"
    )
    
    # Servicios adicionales
    cooking_skills = models.BooleanField(default=False)
    homework_help = models.BooleanField(default=False)
    transport_available = models.BooleanField(default=False)
    
    # Verificaciones
    background_check_verified = models.BooleanField(default=False)
    background_check_date = models.DateField(null=True, blank=True)
    first_aid_certified = models.BooleanField(default=False)
    first_aid_expiry = models.DateField(null=True, blank=True)
    
    # Referencias
    reference_count = models.PositiveIntegerField(default=0)
    
    # Estado
    is_available = models.BooleanField(
        default=True,
        help_text="Disponible para nuevas reservas"
    )
    last_active = models.DateTimeField(auto_now=True)
    
    # Auditoría
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = "Nanny Profile"
        verbose_name_plural = "Nanny Profiles"
        ordering = ['-rating_avg', '-verified']
        indexes = [
            models.Index(fields=['verified', 'is_available']),
            models.Index(fields=['city', 'hourly_rate']),
            models.Index(fields=['rating_avg']),
        ]
    
    def __str__(self):
        return f"{self.user.get_full_name()} - ${self.hourly_rate}/hr"
    
    def is_verified_and_available(self):
        """¿Verificada y disponible?"""
        return self.verified and self.is_available
    
    def can_care_for(self, num_children):
        """¿Puede cuidar X niños?"""
        return num_children <= self.max_children
```

### 2. **Sin Validaciones en Modelo** ✔️
**Ubicación:** `models.py`  
**Severidad:** 🟠 ALTA

```python
# ⚠️ PROBLEMA: Sin validaciones de negocio
hourly_rate = models.PositiveIntegerField(default=0)  
# ¿0 pesos por hora? ¿Sin máximo razonable?
```

**Solución:**
```python
from django.core.validators import MinValueValidator, MaxValueValidator

class NannyProfile(models.Model):
    hourly_rate = models.PositiveIntegerField(
        default=5000,  # Valor por defecto razonable
        validators=[
            MinValueValidator(2000, message="Tarifa mínima: $2.000/hora"),
            MaxValueValidator(50000, message="Tarifa máxima: $50.000/hora")
        ],
        help_text="Tarifa por hora en pesos chilenos"
    )
    
    experience_years = models.PositiveIntegerField(
        default=0,
        validators=[MaxValueValidator(50, message="Máximo 50 años de experiencia")]
    )
    
    age = models.PositiveIntegerField(
        null=True,
        blank=True,
        validators=[
            MinValueValidator(18, message="Debe ser mayor de 18 años"),
            MaxValueValidator(100, message="Edad máxima: 100 años")
        ]
    )
    
    def clean(self):
        """Validaciones adicionales"""
        from django.core.exceptions import ValidationError
        
        if self.available_from_time and self.available_to_time:
            if self.available_from_time >= self.available_to_time:
                raise ValidationError({
                    'available_to_time': 'Hora fin debe ser después de hora inicio'
                })
```

### 3. **Dashboard Sin Caché** 💾
**Ubicación:** `views.py` - nanny_dashboard  
**Severidad:** 🟠 ALTA

```python
# ⚠️ PROBLEMA: Queries pesados en cada request
@api_view(['GET'])
def nanny_dashboard(request):
    # Múltiples queries sin caché
    active_bookings = Booking.objects.filter(...).count()
    completed_bookings = Booking.objects.filter(...).count()
    reviews = Review.objects.filter(...)
    # ...
```

**Solución:**
```python
from django.core.cache import cache
from django.db.models import Count, Avg, Q

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def nanny_dashboard(request):
    """Dashboard con caché de 5 minutos"""
    user = request.user
    
    # Clave de caché única por usuario
    cache_key = f'nanny_dashboard_{user.id}'
    cached_data = cache.get(cache_key)
    
    if cached_data:
        return Response(cached_data, status=status.HTTP_200_OK)
    
    try:
        nanny = NannyProfile.objects.select_related('user').get(user=user)
    except NannyProfile.DoesNotExist:
        return Response(
            {'error': 'No eres una niñera registrada'},
            status=status.HTTP_404_NOT_FOUND
        )
    
    # Optimizar con aggregation en una sola query
    booking_stats = Booking.objects.filter(nanny=user).aggregate(
        active=Count('id', filter=Q(status__in=['pending', 'confirmed'])),
        completed=Count('id', filter=Q(status='completed')),
        total=Count('id')
    )
    
    review_stats = Review.objects.filter(nanny=nanny).aggregate(
        count=Count('id'),
        avg_rating=Avg('rating')
    )
    
    # Prefetch para upcoming bookings
    upcoming_bookings = Booking.objects.filter(
        nanny=user,
        status__in=['pending', 'confirmed']
    ).select_related(
        'parent'
    ).order_by('start_time')[:5].values(
        'id', 'parent__first_name', 'parent__last_name',
        'start_time', 'end_time', 'status'
    )
    
    dashboard_data = {
        'nanny': {
            'name': user.get_full_name(),
            'avatar': f"{user.first_name[0]}{user.last_name[0]}",
            'memberSince': user.date_joined.isoformat(),
            'rating': float(review_stats['avg_rating'] or 0),
            'hourlyRate': nanny.hourly_rate,
        },
        'stats': {
            'activeBookings': booking_stats['active'],
            'completedBookings': booking_stats['completed'],
            'totalReviews': review_stats['count'],
            'avgRating': float(review_stats['avg_rating'] or 0),
        },
        'upcomingBookings': list(upcoming_bookings),
        'earnings': {
            'thisMonth': booking_stats['completed'] * nanny.hourly_rate,
            'total': booking_stats['total'] * nanny.hourly_rate,
        }
    }
    
    # Cachear por 5 minutos
    cache.set(cache_key, dashboard_data, 300)
    
    return Response(dashboard_data, status=status.HTTP_200_OK)
```

### 4. **Serializer Update Sin Validaciones** 📝
**Ubicación:** `serializer.py` - update method  
**Severidad:** 🟠 ALTA

```python
# ⚠️ PROBLEMA: Update manual sin validar campos permitidos
def update(self, instance, validated_data):
    user_data = validated_data.pop('user', {})
    
    # Actualiza todos los campos sin filtrar
    profile_fields = ['experience_years', 'hourly_rate', ...]
    for attr in profile_fields:
        if attr in validated_data:
            setattr(instance, attr, validated_data[attr])
```

**Solución:**
```python
def update(self, instance, validated_data):
    """Update con validaciones y campos permitidos"""
    user_data = validated_data.pop('user', {})
    
    # Campos que el usuario puede actualizar
    ALLOWED_PROFILE_FIELDS = [
        'experience_years', 'hourly_rate', 'description',
        'age', 'certifications', 'profile_photo',
        'city', 'neighborhood', 'available_weekdays',
        'languages', 'age_groups', 'max_children',
        'cooking_skills', 'homework_help'
    ]
    
    # Campos que solo admin puede actualizar
    ADMIN_ONLY_FIELDS = ['verified', 'rating_avg']
    
    # Actualizar solo campos permitidos
    for attr in ALLOWED_PROFILE_FIELDS:
        if attr in validated_data:
            setattr(instance, attr, validated_data[attr])
    
    instance.save()
    
    # Actualizar usuario (solo first_name, last_name)
    ALLOWED_USER_FIELDS = ['first_name', 'last_name']
    if user_data:
        user = instance.user
        for attr in ALLOWED_USER_FIELDS:
            if attr in user_data:
                setattr(user, attr, user_data[attr])
        user.save()
    
    return instance
```

### 5. **Admin Muy Básico** 🎨
**Ubicación:** `admin.py`  
**Severidad:** 🟠 ALTA

```python
# ⚠️ PROBLEMA: Admin muy simple
@admin.register(NannyProfile)
class NannyProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'hourly_rate', 'verified', 'rating_avg')
    # Sin filtros avanzados, sin acciones, sin inlines
```

**Solución:**
```python
from django.contrib import admin
from django.utils.html import format_html
from .models import NannyProfile

@admin.register(NannyProfile)
class NannyProfileAdmin(admin.ModelAdmin):
    list_display = [
        'get_name', 'get_photo_thumbnail', 'hourly_rate',
        'experience_years', 'get_verification_badge',
        'rating_avg', 'get_bookings_count', 'is_available',
        'last_active'
    ]
    
    list_filter = [
        'verified', 'is_available', 'city',
        'background_check_verified', 'first_aid_certified',
        'created_at'
    ]
    
    search_fields = [
        'user__username', 'user__first_name', 'user__last_name',
        'user__email', 'description', 'city'
    ]
    
    readonly_fields = [
        'rating_avg', 'reference_count', 'created_at',
        'updated_at', 'last_active', 'get_stats_summary'
    ]
    
    fieldsets = (
        ('Usuario', {
            'fields': ('user',)
        }),
        ('Información Básica', {
            'fields': (
                'age', 'profile_photo', 'description',
                'experience_years', 'hourly_rate'
            )
        }),
        ('Ubicación', {
            'fields': ('city', 'neighborhood', 'latitude', 'longitude'),
            'classes': ('collapse',)
        }),
        ('Disponibilidad', {
            'fields': (
                'is_available', 'available_weekdays',
                'available_from_time', 'available_to_time'
            )
        }),
        ('Capacidades', {
            'fields': (
                'languages', 'age_groups', 'max_children',
                'special_needs_experience', 'cooking_skills',
                'homework_help', 'transport_available'
            ),
            'classes': ('collapse',)
        }),
        ('Verificaciones', {
            'fields': (
                'verified', 'background_check_verified',
                'background_check_date', 'first_aid_certified',
                'first_aid_expiry'
            )
        }),
        ('Certificaciones', {
            'fields': ('certifications',),
            'classes': ('collapse',)
        }),
        ('Estadísticas', {
            'fields': (
                'rating_avg', 'reference_count',
                'get_stats_summary'
            ),
            'classes': ('collapse',)
        }),
        ('Auditoría', {
            'fields': ('created_at', 'updated_at', 'last_active'),
            'classes': ('collapse',)
        })
    )
    
    actions = ['verify_nannies', 'unverify_nannies', 'mark_available', 'mark_unavailable']
    
    def get_name(self, obj):
        """Nombre completo"""
        return obj.user.get_full_name() or obj.user.username
    get_name.short_description = 'Nombre'
    get_name.admin_order_field = 'user__first_name'
    
    def get_photo_thumbnail(self, obj):
        """Thumbnail de foto de perfil"""
        if obj.profile_photo:
            return format_html(
                '<img src="{}" width="50" height="50" style="border-radius: 50%;" />',
                obj.profile_photo.url
            )
        return '—'
    get_photo_thumbnail.short_description = 'Foto'
    
    def get_verification_badge(self, obj):
        """Badge de verificación"""
        if obj.verified:
            return format_html(
                '<span style="color: green; font-weight: bold;">✓ Verificada</span>'
            )
        return format_html(
            '<span style="color: orange;">⏳ Pendiente</span>'
        )
    get_verification_badge.short_description = 'Estado'
    get_verification_badge.admin_order_field = 'verified'
    
    def get_bookings_count(self, obj):
        """Total de bookings"""
        return obj.user.bookings_received.count()
    get_bookings_count.short_description = 'Reservas'
    
    def get_stats_summary(self, obj):
        """Resumen de estadísticas"""
        from bookings.models import Booking
        total = obj.user.bookings_received.count()
        completed = obj.user.bookings_received.filter(status='completed').count()
        reviews = obj.reviews_received.count()
        
        return format_html(
            '<strong>Reservas:</strong> {} ({} completadas)<br>'
            '<strong>Reseñas:</strong> {}<br>'
            '<strong>Rating:</strong> {}/5.0',
            total, completed, reviews, obj.rating_avg
        )
    get_stats_summary.short_description = 'Resumen'
    
    # Acciones
    def verify_nannies(self, request, queryset):
        """Verificar niñeras seleccionadas"""
        count = queryset.update(verified=True)
        self.message_user(request, f'{count} niñeras verificadas correctamente.')
    verify_nannies.short_description = 'Verificar niñeras seleccionadas'
    
    def unverify_nannies(self, request, queryset):
        """Quitar verificación"""
        count = queryset.update(verified=False)
        self.message_user(request, f'{count} niñeras des-verificadas.')
    unverify_nannies.short_description = 'Quitar verificación'
    
    def mark_available(self, request, queryset):
        """Marcar como disponibles"""
        count = queryset.update(is_available=True)
        self.message_user(request, f'{count} niñeras marcadas como disponibles.')
    mark_available.short_description = 'Marcar como disponibles'
    
    def mark_unavailable(self, request, queryset):
        """Marcar como no disponibles"""
        count = queryset.update(is_available=False)
        self.message_user(request, f'{count} niñeras marcadas como no disponibles.')
    mark_unavailable.short_description = 'Marcar como no disponibles'
```

---

## 🟡 PROBLEMAS DE PRIORIDAD MEDIA

### 1. **Sin Paginación Configurada** 📄
**Ubicación:** `views.py` - NannyListView  
**Severidad:** 🟡 MEDIA

```python
# ⚠️ FALTA: Paginación explícita
class NannyListView(generics.ListAPIView):
    serializer_class = NannyProfileSerializer
    # Sin pagination_class configurada
```

**Solución:**
```python
from rest_framework.pagination import PageNumberPagination

class NannyPagination(PageNumberPagination):
    page_size = 12  # 12 niñeras por página (múltiplo de 3 o 4 para grids)
    page_size_query_param = 'page_size'
    max_page_size = 50

class NannyListView(generics.ListAPIView):
    serializer_class = NannyProfileSerializer
    pagination_class = NannyPagination
```

### 2. **Earnings Calculation Incorrecta** 💰
**Ubicación:** `views.py` - nanny_dashboard  
**Severidad:** 🟡 MEDIA

```python
# ⚠️ PROBLEMA: Cálculo simplificado sin considerar horas reales
'earnings': {
    'thisMonth': completed_bookings * nanny.hourly_rate,  # ❌ Incorrecto
    'total': completed_bookings * nanny.hourly_rate,  # ❌ Incorrecto
}
```

**Solución:**
```python
from django.db.models import Sum, F, ExpressionWrapper, DurationField
from django.utils import timezone
from datetime import timedelta

# Calcular earnings reales basados en horas trabajadas
this_month_start = timezone.now().replace(day=1, hour=0, minute=0, second=0)

earnings_this_month = Booking.objects.filter(
    nanny=user,
    status='completed',
    start_time__gte=this_month_start
).annotate(
    duration_hours=ExpressionWrapper(
        (F('end_time') - F('start_time')),
        output_field=DurationField()
    )
).aggregate(
    total=Sum(
        ExpressionWrapper(
            F('duration_hours') / timedelta(hours=1) * nanny.hourly_rate,
            output_field=models.DecimalField()
        )
    )
)['total'] or 0

earnings_total = Booking.objects.filter(
    nanny=user,
    status='completed'
).annotate(
    duration_hours=ExpressionWrapper(
        (F('end_time') - F('start_time')),
        output_field=DurationField()
    )
).aggregate(
    total=Sum(
        ExpressionWrapper(
            F('duration_hours') / timedelta(hours=1) * nanny.hourly_rate,
            output_field=models.DecimalField()
        )
    )
)['total'] or 0

'earnings': {
    'thisMonth': float(earnings_this_month),
    'total': float(earnings_total),
}
```

### 3. **Sin Manejo de Errores en Filtros** ⚠️
**Ubicación:** `views.py` - NannyListView.get_queryset  
**Severidad:** 🟡 MEDIA

```python
# ⚠️ PROBLEMA: Try-except silencioso
try:
    queryset = queryset.filter(hourly_rate__lte=float(max_rate))
except ValueError:
    pass  # Silenciosamente ignora el error
```

**Solución:**
```python
from rest_framework.exceptions import ValidationError

def get_queryset(self):
    queryset = NannyProfile.objects.all().select_related('user')
    
    # Filtro por tarifa máxima
    max_rate = self.request.query_params.get('max_rate', None)
    if max_rate:
        try:
            max_rate_float = float(max_rate)
            if max_rate_float < 0:
                raise ValidationError({
                    'max_rate': 'Tarifa debe ser positiva'
                })
            queryset = queryset.filter(hourly_rate__lte=max_rate_float)
        except ValueError:
            raise ValidationError({
                'max_rate': 'Tarifa debe ser un número válido'
            })
    
    # Similar para otros filtros...
    return queryset
```

### 4. **Rating Average Sin Recalcular** 📊
**Ubicación:** `models.py` - rating_avg  
**Severidad:** 🟡 MEDIA

```python
# ⚠️ PROBLEMA: Campo manual que puede desincronizarse
rating_avg = models.DecimalField(max_digits=3, decimal_places=2, default=0.0)
```

**Solución:**
```python
# Opción 1: Property calculada (sin campo en BD)
@property
def rating_avg(self):
    """Calcula rating promedio en tiempo real"""
    from django.db.models import Avg
    avg = self.reviews_received.aggregate(Avg('rating'))['rating__avg']
    return round(avg, 2) if avg else 0.0

# Opción 2: Actualizar con signal
# reviews/signals.py
from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from reviews.models import Review
from nannies.models import NannyProfile

@receiver([post_save, post_delete], sender=Review)
def update_nanny_rating(sender, instance, **kwargs):
    """Actualizar rating promedio de niñera"""
    from django.db.models import Avg
    nanny = instance.nanny
    avg = nanny.reviews_received.aggregate(Avg('rating'))['rating__avg']
    nanny.rating_avg = round(avg, 2) if avg else 0.0
    nanny.save(update_fields=['rating_avg'])
```

### 5. **Sin Filtro Geográfico** 🗺️
**Ubicación:** `views.py` - NannyListView  
**Severidad:** 🟡 MEDIA

```python
# ⚠️ FALTA: Búsqueda por cercanía geográfica
# No hay filtro por ciudad, coordenadas, o radio
```

**Solución:**
```python
from django.contrib.gis.geos import Point
from django.contrib.gis.db.models.functions import Distance

def get_queryset(self):
    queryset = NannyProfile.objects.all().select_related('user')
    
    # Filtro por ciudad
    city = self.request.query_params.get('city', None)
    if city:
        queryset = queryset.filter(city__icontains=city)
    
    # Filtro por cercanía (requiere latitude/longitude)
    lat = self.request.query_params.get('lat', None)
    lng = self.request.query_params.get('lng', None)
    radius = self.request.query_params.get('radius', 10)  # km
    
    if lat and lng:
        try:
            user_location = Point(float(lng), float(lat), srid=4326)
            queryset = queryset.filter(
                latitude__isnull=False,
                longitude__isnull=False
            ).annotate(
                distance=Distance('location', user_location)
            ).filter(
                distance__lte=radius * 1000  # metros
            ).order_by('distance')
        except (ValueError, TypeError):
            pass
    
    return queryset
```

---

## 🟢 PROBLEMAS DE PRIORIDAD BAJA

### 1. **__str__ Puede Mejorar** 📝
**Severidad:** 🟢 BAJA

```python
# ⚠️ MEJORABLE
def __str__(self):
    return f"{self.user.first_name} {self.user.last_name} - ${self.hourly_rate}/hr"
    # Puede fallar si first_name o last_name están vacíos
```

**Solución:**
```python
def __str__(self):
    name = self.user.get_full_name() or self.user.username
    return f"{name} - ${self.hourly_rate}/hr ({'✓' if self.verified else '⏳'})"
```

### 2. **Falta Verbose Name en Modelo** 📛
**Severidad:** 🟢 BAJA

```python
# ⚠️ FALTA: Meta class completa
class NannyProfile(models.Model):
    # Sin Meta class
```

### 3. **Import Sin Usar** 🧹
**Severidad:** 🟢 BAJA

```python
# ⚠️ MEJORABLE
import json  # No se usa en views.py
```

---

## 💡 OPORTUNIDADES DE MEJORA

### 1. **Sistema de Disponibilidad en Tiempo Real** 📅

```python
class NannyAvailability(models.Model):
    """Calendario de disponibilidad de niñera"""
    nanny = models.ForeignKey(NannyProfile, on_delete=models.CASCADE)
    date = models.DateField()
    start_time = models.TimeField()
    end_time = models.TimeField()
    is_booked = models.BooleanField(default=False)
    
    class Meta:
        unique_together = ('nanny', 'date', 'start_time')
```

### 2. **Sistema de Referencias** 📜

```python
class NannyReference(models.Model):
    """Referencias de niñeras"""
    nanny = models.ForeignKey(NannyProfile, related_name='references')
    reference_name = models.CharField(max_length=100)
    reference_phone = models.CharField(max_length=20)
    reference_email = models.EmailField()
    relationship = models.CharField(max_length=100)
    verified = models.BooleanField(default=False)
    verified_date = models.DateTimeField(null=True, blank=True)
```

### 3. **Historial de Verificaciones** 📋

```python
class VerificationHistory(models.Model):
    """Historial de verificaciones"""
    nanny = models.ForeignKey(NannyProfile, related_name='verifications')
    verification_type = models.CharField(
        max_length=50,
        choices=[
            ('background', 'Antecedentes'),
            ('first_aid', 'Primeros Auxilios'),
            ('reference', 'Referencia'),
            ('document', 'Documento'),
        ]
    )
    verified_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
```

### 4. **Matching Score** 🎯

```python
@api_view(['POST'])
def calculate_match_score(request):
    """Calcular score de matching entre parent y nanny"""
    parent_id = request.data.get('parent_id')
    nanny_id = request.data.get('nanny_id')
    
    # Factores: ubicación, tarifa, disponibilidad, experiencia, reviews
    score = {
        'location_match': 0,  # 0-25 puntos
        'rate_match': 0,  # 0-20 puntos
        'availability_match': 0,  # 0-25 puntos
        'experience_match': 0,  # 0-15 puntos
        'rating_match': 0,  # 0-15 puntos
        'total': 0  # 0-100 puntos
    }
    
    return Response(score)
```

### 5. **Notificaciones de Perfil** 🔔

```python
def send_profile_completion_reminder(nanny_profile):
    """Recordar completar perfil"""
    completion_percentage = calculate_profile_completion(nanny_profile)
    
    if completion_percentage < 80:
        # Enviar email/notificación
        pass

def calculate_profile_completion(nanny_profile):
    """Calcular % de completitud de perfil"""
    total_fields = 20
    completed_fields = 0
    
    if nanny_profile.profile_photo:
        completed_fields += 1
    if nanny_profile.description:
        completed_fields += 1
    # ... más campos
    
    return (completed_fields / total_fields) * 100
```

### 6. **Export de Datos** 📊

```python
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def export_nanny_data(request):
    """Exportar datos de niñera en CSV/PDF"""
    # GDPR compliance - derecho a portabilidad de datos
    pass
```

---

## 🧪 COBERTURA DE TESTS

### Estado Actual
- ❌ Sin tests (archivo vacío)

### Tests Recomendados

```python
from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APITestCase, APIClient
from rest_framework import status
from .models import NannyProfile

User = get_user_model()

class NannyProfileModelTests(TestCase):
    """Tests del modelo NannyProfile"""
    
    def setUp(self):
        self.user = User.objects.create_user(
            username='nanny1',
            email='nanny1@test.com',
            password='pass123',
            role='nanny'
        )
        self.nanny = NannyProfile.objects.create(
            user=self.user,
            hourly_rate=10000,
            experience_years=3
        )
    
    def test_nanny_creation(self):
        """Test creación de perfil de niñera"""
        self.assertEqual(self.nanny.user, self.user)
        self.assertEqual(self.nanny.hourly_rate, 10000)
    
    def test_str_method(self):
        """Test método __str__"""
        self.user.first_name = "Ana"
        self.user.last_name = "García"
        self.user.save()
        expected = "Ana García - $10000/hr"
        self.assertEqual(str(self.nanny), expected)
    
    def test_role_property(self):
        """Test property role"""
        self.assertEqual(self.nanny.role, 'nanny')
    
    def test_hourly_rate_validation(self):
        """Test validación de tarifa"""
        from django.core.exceptions import ValidationError
        self.nanny.hourly_rate = -1000
        with self.assertRaises(ValidationError):
            self.nanny.full_clean()


class NannyAPITests(APITestCase):
    """Tests de endpoints de niñeras"""
    
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            username='nanny1',
            email='nanny1@test.com',
            password='pass123',
            role='nanny'
        )
        self.nanny = NannyProfile.objects.create(
            user=self.user,
            hourly_rate=10000,
            experience_years=3,
            verified=True
        )
    
    def test_list_nannies(self):
        """Test listar niñeras"""
        response = self.client.get('/api/nannies/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 1)
    
    def test_filter_by_max_rate(self):
        """Test filtrar por tarifa máxima"""
        response = self.client.get('/api/nannies/?max_rate=15000')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 1)
        
        response = self.client.get('/api/nannies/?max_rate=5000')
        self.assertEqual(len(response.data['results']), 0)
    
    def test_nanny_detail(self):
        """Test detalle de niñera"""
        response = self.client.get(f'/api/nannies/{self.nanny.id}/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['hourly_rate'], 10000)
    
    def test_dashboard_requires_auth(self):
        """Test dashboard requiere autenticación"""
        response = self.client.get('/api/nannies/dashboard/')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
    
    def test_dashboard_nanny_only(self):
        """Test dashboard solo para niñeras"""
        parent = User.objects.create_user(
            username='parent1',
            email='parent1@test.com',
            password='pass123',
            role='parent'
        )
        self.client.force_authenticate(user=parent)
        response = self.client.get('/api/nannies/dashboard/')
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
    
    def test_update_profile(self):
        """Test actualizar perfil"""
        self.client.force_authenticate(user=self.user)
        data = {'hourly_rate': 12000, 'description': 'Niñera experimentada'}
        response = self.client.patch('/api/nannies/profile/', data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.nanny.refresh_from_db()
        self.assertEqual(self.nanny.hourly_rate, 12000)
```

---

## 📈 MÉTRICAS DE CÓDIGO

| Métrica | Valor | Estado |
|---------|-------|--------|
| Líneas de código (models) | 26 | 🔴 Muy simple |
| Líneas de código (serializer) | 62 | ✅ Aceptable |
| Líneas de código (views) | 165 | ✅ Aceptable |
| Líneas de código (admin) | 9 | 🔴 Muy básico |
| Líneas de código (tests) | 4 | 🔴 Vacío |
| Complejidad ciclomática | Baja | ✅ Simple |
| Cobertura de tests | 0% | 🔴 Sin tests |
| Campos en modelo | 9 | 🔴 Insuficiente |

---

## 🎯 PRIORIZACIÓN DE ACCIONES

### Inmediato (Sprint Actual)
1. 🧪 Crear tests básicos (CRÍTICO)
2. 📋 Agregar validaciones al modelo (hourly_rate, age, experience)
3. 💾 Implementar caché en dashboard
4. 📄 Agregar paginación a NannyListView

### Corto Plazo (Próximo Sprint)
5. 📊 Expandir modelo con campos faltantes (ubicación, disponibilidad, idiomas)
6. 🎨 Mejorar admin con filtros, acciones y fieldsets
7. 💰 Corregir cálculo de earnings
8. ⚠️ Mejorar manejo de errores en filtros
9. 🔄 Implementar actualización de rating_avg con signals

### Mediano Plazo
10. 📅 Sistema de disponibilidad en tiempo real
11. 📜 Sistema de referencias
12. 🗺️ Filtros geográficos (cercanía)
13. 📋 Historial de verificaciones
14. 🎯 Sistema de matching score

### Largo Plazo (Mejoras Continuas)
15. 🔔 Notificaciones de completitud de perfil
16. 📊 Export de datos (GDPR)
17. 📸 Galería de fotos
18. 🏆 Sistema de badges/certificaciones

---

## 🏆 PUNTOS DESTACABLES

1. **Serializer con métodos calculados** - acceptance_rate, total_bookings
2. **Dashboard funcional** - métricas relevantes
3. **Filtros flexibles** - max_rate, min_experience, search
4. **Select related** - optimización de queries
5. **Property en modelo** - role property

---

## ✍️ CONCLUSIÓN

La aplicación **nannies** es **funcional pero muy simple** para un dominio de negocio complejo:

**Fortalezas principales:**
- ✅ Serializer con métodos útiles
- ✅ Dashboard con métricas
- ✅ Filtros flexibles
- ✅ Optimización con select_related

**Prioridades URGENTES:**
- 🚨 Crear tests (0% cobertura)
- 📋 Expandir modelo con campos críticos
- 💾 Implementar caché en dashboard
- 🎨 Mejorar admin dramáticamente
- ✔️ Agregar validaciones al modelo

**Recomendación:** El modelo actual es un **MVP mínimo**. Para un sistema de producción robusto, necesita expandirse significativamente con campos de ubicación, disponibilidad, verificaciones, y referencias. Los tests son **CRÍTICOS** antes de cualquier despliegue.

---

**Próximo análisis:** [05_PARENTS_ANALYSIS.md](./05_PARENTS_ANALYSIS.md) - Aplicación `parents`
