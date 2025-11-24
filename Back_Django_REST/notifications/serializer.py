"""
Serializers para Notificaciones API
"""

from rest_framework import serializers
from .models import (
    Notification, 
    NotificationTemplate, 
    WebhookEndpoint,
    WebhookLog,
    NotificationPreference
)


class NotificationTemplateSerializer(serializers.ModelSerializer):
    """
    Serializer para NotificationTemplate
    """
    class Meta:
        model = NotificationTemplate
        fields = [
            'id',
            'name',
            'template_type',
            'subject',
            'body_html',
            'is_active',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['created_at', 'updated_at']


class NotificationSerializer(serializers.ModelSerializer):
    """
    Serializer para Notification
    """
    template_name = serializers.CharField(source='template.name', read_only=True)
    user_email = serializers.CharField(source='user.email', read_only=True)

    class Meta:
        model = Notification
        fields = [
            'id',
            'user',
            'user_email',
            'template',
            'template_name',
            'channel',
            'subject',
            'message',
            'status',
            'recipient_email',
            'related_document_id',
            'related_booking_id',
            'context_data',
            'sent_at',
            'read_at',
            'attempts',
            'last_error',
            'created_at',
            'updated_at',
        ]
        read_only_fields = [
            'id',
            'user',
            'template_name',
            'sent_at',
            'read_at',
            'attempts',
            'last_error',
            'created_at',
            'updated_at',
        ]


class NotificationListSerializer(serializers.ModelSerializer):
    """
    Serializer simplificado para listar notificaciones
    """
    template_name = serializers.CharField(source='template.name', read_only=True)

    class Meta:
        model = Notification
        fields = [
            'id',
            'template_name',
            'subject',
            'message',
            'status',
            'related_document_id',
            'related_booking_id',
            'created_at',
        ]


class WebhookLogSerializer(serializers.ModelSerializer):
    """
    Serializer para WebhookLog
    """
    webhook_name = serializers.CharField(source='webhook.name', read_only=True)

    class Meta:
        model = WebhookLog
        fields = [
            'id',
            'webhook',
            'webhook_name',
            'event_type',
            'payload',
            'status',
            'response_status',
            'response_body',
            'error_message',
            'attempts',
            'next_retry_at',
            'completed_at',
            'created_at',
            'updated_at',
        ]
        read_only_fields = [
            'id',
            'webhook_name',
            'response_status',
            'response_body',
            'error_message',
            'attempts',
            'completed_at',
            'created_at',
            'updated_at',
        ]


class WebhookEndpointSerializer(serializers.ModelSerializer):
    """
    Serializer para WebhookEndpoint
    """
    logs_count = serializers.SerializerMethodField()

    class Meta:
        model = WebhookEndpoint
        fields = [
            'id',
            'name',
            'url',
            'event_type',
            'is_active',
            'retry_count',
            'timeout',
            'last_triggered_at',
            'last_error',
            'logs_count',
            'created_at',
            'updated_at',
        ]
        read_only_fields = [
            'id',
            'last_triggered_at',
            'last_error',
            'logs_count',
            'created_at',
            'updated_at',
        ]
        extra_kwargs = {
            'secret_key': {'write_only': True},
        }

    def get_logs_count(self, obj):
        """Retorna cantidad de logs"""
        return obj.logs.count()


class NotificationPreferenceSerializer(serializers.ModelSerializer):
    """
    Serializer para NotificationPreference
    """
    class Meta:
        model = NotificationPreference
        fields = [
            'id',
            'email_ocr_events',
            'email_booking_events',
            'email_verification_events',
            'in_app_notifications',
            'quiet_hours_start',
            'quiet_hours_end',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class MarkNotificationsAsReadSerializer(serializers.Serializer):
    """
    Serializer para marcar notificaciones como leídas
    """
    notification_ids = serializers.ListField(
        child=serializers.IntegerField(),
        required=False,
        help_text='Lista de IDs de notificaciones (vacío = todas)'
    )

    def validate_notification_ids(self, value):
        """Validar IDs"""
        if value and not all(isinstance(x, int) and x > 0 for x in value):
            raise serializers.ValidationError('Invalid notification IDs')
        return value
