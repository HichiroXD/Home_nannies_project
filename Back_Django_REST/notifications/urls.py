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
router.register(r'notifications', NotificationViewSet, basename='notification')
router.register(r'templates', NotificationTemplateViewSet, basename='template')
router.register(r'webhooks', WebhookEndpointViewSet, basename='webhook')
router.register(r'preferences', NotificationPreferenceView, basename='preference')

urlpatterns = [
    path('', include(router.urls)),
]
