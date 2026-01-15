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
    attachment_url = serializers.SerializerMethodField()
    
    class Meta:
        model = Message
        fields = [
            'id', 'conversation', 'sender', 'sender_info', 
            'content', 'message_type', 'attachment', 'attachment_url', 
            'attachment_name', 'read', 'created_at'
        ]
        read_only_fields = ['sender', 'created_at', 'sender_info', 'message_type']
    
    def get_attachment_url(self, obj):
        """Retorna URL completa del archivo adjunto"""
        if obj.attachment:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.attachment.url)
            return obj.attachment.url
        return None


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
    """Serializer para crear mensajes (texto simple)"""
    receiver_id = serializers.IntegerField(required=True, help_text="ID del usuario receptor")
    content = serializers.CharField(required=False, allow_blank=True, max_length=2000, help_text="Contenido del mensaje")
    
    def validate_receiver_id(self, value):
        """Valida que el receptor exista"""
        try:
            User.objects.get(id=value)
        except User.DoesNotExist:
            raise serializers.ValidationError("El usuario receptor no existe")
        return value


class MessageWithFileSerializer(serializers.ModelSerializer):
    """Serializer para crear mensajes con archivos"""
    receiver_id = serializers.IntegerField(write_only=True, required=True)
    
    class Meta:
        model = Message
        fields = ['receiver_id', 'content', 'attachment']
    
    def validate_attachment(self, value):
        """Valida el archivo adjunto"""
        if value:
            # Validar tamaño (máximo 10MB)
            if value.size > 10 * 1024 * 1024:
                raise serializers.ValidationError("El archivo es demasiado grande. Máximo 10MB.")
            
            # Validar extensión
            allowed_extensions = [
                'jpg', 'jpeg', 'png', 'gif', 'webp', 'svg',  # Imágenes
                'pdf', 'doc', 'docx', 'txt', 'xlsx', 'xls'   # Documentos
            ]
            file_ext = value.name.lower().split('.')[-1]
            if file_ext not in allowed_extensions:
                raise serializers.ValidationError(
                    f"Tipo de archivo no permitido. Extensiones permitidas: {', '.join(allowed_extensions)}"
                )
        return value
