from rest_framework import serializers
from .models import ParentProfile


class ParentProfileSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    email = serializers.EmailField(source='user.email', read_only=True)
    first_name = serializers.CharField(source='user.first_name', required=False, allow_blank=True)
    last_name = serializers.CharField(source='user.last_name', required=False, allow_blank=True)
    full_name = serializers.SerializerMethodField()
    role = serializers.CharField(source='user.role', read_only=True)
    total_bookings = serializers.SerializerMethodField()
    
    class Meta:
        model = ParentProfile
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name', 'full_name', 'role',
            'phone', 'address', 'emergency_contact',
            'children_count', 'preferences', 'total_bookings',
            'profile_photo', 'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at', 'role']
    
    def get_full_name(self, obj):
        return obj.user.get_full_name() or obj.user.username
    
    def get_total_bookings(self, obj):
        """Obtener el total de reservas del padre"""
        return obj.user.bookings_made.count()
    
    def update(self, instance, validated_data):
        # Actualizar datos del usuario si vienen
        user_data = {}
        if 'user' in validated_data:
            user_data = validated_data.pop('user')
        
        # Debug
        print("=== PARENT SERIALIZER UPDATE ===")
        print("validated_data:", validated_data)
        print("user_data:", user_data)
        
        # Normalizar children_count en caso de que venga como array o string
        if 'children_count' in validated_data:
            value = validated_data['children_count']
            if isinstance(value, list):
                value = value[0] if value else 1
            try:
                validated_data['children_count'] = int(value) if value else 1
            except (ValueError, TypeError):
                validated_data['children_count'] = 1
        
        # Limpiar campos vacíos que vienen como strings vacíos desde FormData
        for field in ['phone', 'address', 'emergency_contact', 'preferences']:
            if field in validated_data and validated_data[field] == '':
                validated_data[field] = ''
        
        print("validated_data después de normalización:", validated_data)
        
        # Actualizar perfil de padre
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        
        # Actualizar datos de usuario
        if user_data:
            user = instance.user
            for attr, value in user_data.items():
                setattr(user, attr, value)
            user.save()
        
        return instance
