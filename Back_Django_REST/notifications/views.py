"""
Views para Notificaciones API - Phase 3
"""

from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone
from django.shortcuts import get_object_or_404
import logging

from .models import (
    Notification,
    NotificationTemplate,
    WebhookEndpoint,
    NotificationPreference,
)
from .serializer import (
    NotificationSerializer,
    NotificationListSerializer,
    NotificationTemplateSerializer,
    WebhookEndpointSerializer,
    NotificationPreferenceSerializer,
    MarkNotificationsAsReadSerializer,
)
from .service import NotificationService

logger = logging.getLogger(__name__)


class NotificationViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet para gestionar notificaciones del usuario actual
    
    GET /api/notifications/ - Listar notificaciones
    GET /api/notifications/{id}/ - Detalle de notificación
    GET /api/notifications/unread/ - Listar no leídas
    POST /api/notifications/mark-as-read/ - Marcar como leídas
    """
    permission_classes = [IsAuthenticated]
    serializer_class = NotificationSerializer

    def get_queryset(self):
        """Solo retorna notificaciones del usuario actual"""
        return Notification.objects.filter(user=self.request.user).order_by('-created_at')

    def get_serializer_class(self):
        """Usa serializer simplificado para list"""
        if self.action == 'list':
            return NotificationListSerializer
        return self.serializer_class

    @action(detail=False, methods=['get'])
    def unread(self, request):
        """
        Retorna notificaciones no leídas
        GET /api/notifications/unread/
        """
        unread = self.get_queryset().filter(status__in=['pending', 'sent'])
        serializer = NotificationListSerializer(unread, many=True)
        return Response({
            'count': unread.count(),
            'results': serializer.data,
        })

    @action(detail=False, methods=['post'])
    def mark_as_read(self, request):
        """
        Marca notificaciones como leídas
        POST /api/notifications/mark-as-read/
        
        Body:
        {
            "notification_ids": [1, 2, 3]  # opcional, vacío marca todas
        }
        """
        serializer = MarkNotificationsAsReadSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        notification_ids = serializer.validated_data.get('notification_ids')
        count = NotificationService.mark_notifications_as_read(
            user=request.user,
            notification_ids=notification_ids
        )

        return Response({
            'message': f'{count} notifications marked as read',
            'count': count,
        })

    @action(detail=True, methods=['delete'])
    def delete_notification(self, request, pk=None):
        """
        Elimina una notificación
        DELETE /api/notifications/{id}/delete-notification/
        """
        notification = self.get_object()
        
        if notification.user != request.user:
            return Response(
                {'detail': 'No permission'},
                status=status.HTTP_403_FORBIDDEN
            )

        notification.delete()
        return Response({'detail': 'Notification deleted'})


class NotificationTemplateViewSet(viewsets.ModelViewSet):
    """
    ViewSet para plantillas de notificación (admin only)
    """
    queryset = NotificationTemplate.objects.all()
    serializer_class = NotificationTemplateSerializer
    permission_classes = [permissions.IsAdminUser]
    filterset_fields = ['template_type', 'is_active']
    search_fields = ['name', 'subject']


class WebhookEndpointViewSet(viewsets.ModelViewSet):
    """
    ViewSet para webhooks (admin only)
    """
    queryset = WebhookEndpoint.objects.all()
    serializer_class = WebhookEndpointSerializer
    permission_classes = [permissions.IsAdminUser]
    filterset_fields = ['event_type', 'is_active']
    search_fields = ['name', 'url']

    @action(detail=True, methods=['post'])
    def test_webhook(self, request, pk=None):
        """
        Prueba un webhook enviando evento de prueba
        POST /api/webhooks/{id}/test-webhook/
        """
        webhook = self.get_object()
        
        # TODO: Implementar envío de webhook de prueba
        
        return Response({
            'detail': 'Test webhook sent',
            'webhook_id': webhook.id,
        })


class NotificationPreferenceView(viewsets.ViewSet):
    """
    ViewSet para preferencias de notificación del usuario actual
    """
    permission_classes = [IsAuthenticated]

    def list(self, request):
        """
        GET /api/notification-preferences/
        """
        preference, created = NotificationPreference.objects.get_or_create(
            user=request.user
        )
        serializer = NotificationPreferenceSerializer(preference)
        return Response(serializer.data)

    def update(self, request, pk=None):
        """
        PATCH /api/notification-preferences/
        """
        preference, created = NotificationPreference.objects.get_or_create(
            user=request.user
        )
        serializer = NotificationPreferenceSerializer(
            preference,
            data=request.data,
            partial=True
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def my_preferences(self, request):
        """
        GET /api/notification-preferences/my-preferences/
        Alias para list
        """
        return self.list(request)
