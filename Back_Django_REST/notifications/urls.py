"""
URLs para Notificaciones API
"""

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    NotificationViewSet,
    NotificationTemplateViewSet,
    WebhookEndpointViewSet,
    NotificationPreferenceView,
)

app_name = 'notifications'

router = DefaultRouter()
router.register(r'list', NotificationViewSet, basename='notification')
router.register(r'templates', NotificationTemplateViewSet, basename='template')
router.register(r'webhooks', WebhookEndpointViewSet, basename='webhook')

urlpatterns = [
    # Preferencias de notificación (sin ID en URL)
    path('preferences/', NotificationPreferenceView.as_view({
        'get': 'list',
        'patch': 'update',
        'put': 'update',
    }), name='preferences'),
    
    # Rutas del router
    path('', include(router.urls)),
]
