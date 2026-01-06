# chat/serializer.py
from rest_framework import serializers
from .models import Conversation, Message
from django.contrib.auth import get_user_model

User = get_user_model()


class UserBasicSerializer(serializers.ModelSerializer):
    """Serializer básico para mostrar info del usuario en mensajes"""
    full_name = serializers.SerializerMethodField()
    role = serializers.SerializerMethodField()
    profile_image = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'full_name', 'role', 'profile_image']
    
    def get_full_name(self, obj):
        return obj.get_full_name() or obj.username
    
    def get_role(self, obj):
        return obj.active_role or obj.role
    
    def get_profile_image(self, obj):
        # Intentar obtener foto de perfil según el rol
        try:
            if hasattr(obj, 'nanny_profile') and obj.nanny_profile:
                if obj.nanny_profile.profile_image:
                    return self.context.get('request').build_absolute_uri(obj.nanny_profile.profile_image.url)
            elif hasattr(obj, 'parent_profile') and obj.parent_profile:
                if obj.parent_profile.profile_image:
                    return self.context.get('request').build_absolute_uri(obj.parent_profile.profile_image.url)
        except:
            pass
        return None


class MessageSerializer(serializers.ModelSerializer):
    """Serializer para mensajes individuales"""
    sender_info = UserBasicSerializer(source='sender', read_only=True)
    
    class Meta:
        model = Message
        fields = ['id', 'conversation', 'sender', 'sender_info', 'content', 'read', 'created_at']
        read_only_fields = ['sender', 'created_at', 'sender_info']


class ConversationSerializer(serializers.ModelSerializer):
    """Serializer para conversaciones"""
    parent_info = UserBasicSerializer(source='parent', read_only=True)
    nanny_info = UserBasicSerializer(source='nanny', read_only=True)
    last_message = MessageSerializer(read_only=True)
    unread_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Conversation
        fields = [
            'id', 'parent', 'nanny', 'parent_info', 'nanny_info',
            'last_message', 'unread_count', 'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']
    
    def get_unread_count(self, obj):
        request = self.context.get('request')
        if request and request.user:
            return obj.unread_count_for_user(request.user)
        return 0


class MessageCreateSerializer(serializers.Serializer):
    """Serializer para crear mensajes"""
    receiver_id = serializers.IntegerField(required=True, help_text="ID del usuario receptor")
    content = serializers.CharField(required=True, max_length=2000, help_text="Contenido del mensaje")
    
    def validate_receiver_id(self, value):
        """Valida que el receptor exista"""
        try:
            User.objects.get(id=value)
        except User.DoesNotExist:
            raise serializers.ValidationError("El usuario receptor no existe")
        return value
    
    def validate_content(self, value):
        """Valida el contenido del mensaje"""
        if not value.strip():
            raise serializers.ValidationError("El mensaje no puede estar vacío")
        return value.strip()
