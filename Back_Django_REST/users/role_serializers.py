from rest_framework import serializers
from .role_models import UserRole, ActiveRole


class UserRoleSerializer(serializers.ModelSerializer):
    """Serializer para roles adicionales de usuario"""
    role_display = serializers.CharField(source='get_role_display', read_only=True)
    
    class Meta:
        model = UserRole
        fields = ['id', 'role', 'role_display', 'is_active', 'created_at']
        read_only_fields = ['created_at']


class ActiveRoleSerializer(serializers.ModelSerializer):
    """Serializer para el rol activo de la sesión"""
    active_role_display = serializers.CharField(source='get_active_role_display', read_only=True)
    available_roles = serializers.SerializerMethodField()
    
    class Meta:
        model = ActiveRole
        fields = ['active_role', 'active_role_display', 'available_roles', 'updated_at']
        read_only_fields = ['updated_at']
    
    def get_available_roles(self, obj):
        """Obtiene todos los roles disponibles para el usuario"""
        return obj.user.get_all_roles()


class UserRolesListSerializer(serializers.Serializer):
    """Serializer para listar todos los roles de un usuario"""
    primary_role = serializers.CharField()
    primary_role_display = serializers.CharField()
    additional_roles = UserRoleSerializer(many=True)
    all_roles = serializers.ListField(child=serializers.CharField())
    active_role = serializers.CharField(allow_null=True)
