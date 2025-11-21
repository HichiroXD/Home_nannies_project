"""
URL configuration for django_crud_api project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView, SpectacularRedocView

urlpatterns = [
    path('admin/', admin.site.urls),

    # JWT
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),

    # Core - Phase 1: Validación Institucional
    path('api/core/', include('core.urls')),

    # Usuarios
    path('api/users/', include('users.urls')),

    # Reservas
    path('api/bookings/', include('bookings.urls')),

    # Documentación API
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/schema/swagger-ui/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
    path('api/schema/redoc/', SpectacularRedocView.as_view(url_name='schema'), name='redoc'),

    # Nannies
    path('api/nannies/', include('nannies.urls')),

    # Dashboards
    path('api/dashboard/', include('django_crud_api.dashboard_urls')),

    # Favoritos
    path('api/favorites/', include('favorites.urls')),

    # Reseñas
    path('api/reviews/', include('reviews.urls')),

    # Notificaciones - Phase 3
    path('api/', include('notifications.urls')),

    # Validación Académica - Phase 3
    path('api/academic/', include('academic.urls')),

    # Reportes y Análisis - Phase 3
    path('api/reports/', include('reports.urls')),

]
