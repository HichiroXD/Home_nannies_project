"""
Serializers para Auditoría
"""
from rest_framework import serializers
from .audit_models import AuditLog, UserPermission
from django.contrib.auth import get_user_model

User = get_user_model()


class AuditLogSerializer(serializers.ModelSerializer):
    """Serializer para logs de auditoría"""
    
    user_username = serializers.CharField(source='user.username', read_only=True)
    user_role = serializers.CharField(source='user.role', read_only=True)
    action_display = serializers.CharField(source='get_action_display', read_only=True)
    changes_display = serializers.SerializerMethodField()
    object_type = serializers.SerializerMethodField()
    
    class Meta:
        model = AuditLog
        fields = [
            'id',
            'user',
            'user_username',
            'user_role',
            'action',
            'action_display',
            'description',
            'changes',
            'changes_display',
            'object_type',
            'object_id',
            'ip_address',
            'timestamp',
            'metadata'
        ]
        read_only_fields = fields
    
    def get_changes_display(self, obj):
        """Retorna los cambios en formato legible"""
        return obj.get_changes_display()
    
    def get_object_type(self, obj):
        """Retorna el tipo de objeto afectado"""
        if obj.content_type:
            return obj.content_type.model
        return None


class UserPermissionSerializer(serializers.ModelSerializer):
    """Serializer para permisos de usuarios"""
    
    user_username = serializers.CharField(source='user.username', read_only=True)
    granted_by_username = serializers.CharField(source='granted_by.username', read_only=True)
    permission_display = serializers.CharField(source='get_permission_display', read_only=True)
    
    class Meta:
        model = UserPermission
        fields = [
            'id',
            'user',
            'user_username',
            'permission',
            'permission_display',
            'granted_by',
            'granted_by_username',
            'granted_at',
            'reason'
        ]
        read_only_fields = ['granted_at']
