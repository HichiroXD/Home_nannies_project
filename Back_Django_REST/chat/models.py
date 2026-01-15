# chat/models.py
from django.db import models
from django.conf import settings
from django.utils import timezone


class Conversation(models.Model):
    """
    Conversación entre un padre y una niñera
    """
    parent = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='parent_conversations',
        limit_choices_to={'role': 'parent'}
    )
    nanny = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='nanny_conversations',
        limit_choices_to={'role': 'nanny'}
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        unique_together = ['parent', 'nanny']
        ordering = ['-updated_at']
        verbose_name = 'Conversación'
        verbose_name_plural = 'Conversaciones'
    
    def __str__(self):
        return f"Conversación: {self.parent.username} - {self.nanny.username}"
    
    @property
    def last_message(self):
        """Obtiene el último mensaje de la conversación"""
        return self.messages.first()
    
    def unread_count_for_user(self, user):
        """Cuenta mensajes no leídos para un usuario"""
        return self.messages.filter(read=False).exclude(sender=user).count()


class Message(models.Model):
    """
    Mensaje individual dentro de una conversación
    """
    MESSAGE_TYPE_CHOICES = [
        ('text', 'Texto'),
        ('image', 'Imagen'),
        ('file', 'Archivo'),
    ]
    
    conversation = models.ForeignKey(
        Conversation,
        on_delete=models.CASCADE,
        related_name='messages'
    )
    sender = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='sent_messages'
    )
    content = models.TextField(blank=True, help_text="Contenido del mensaje")
    message_type = models.CharField(
        max_length=10,
        choices=MESSAGE_TYPE_CHOICES,
        default='text',
        help_text="Tipo de mensaje"
    )
    attachment = models.FileField(
        upload_to='chat_attachments/%Y/%m/%d/',
        null=True,
        blank=True,
        help_text="Archivo adjunto (imagen o documento)"
    )
    attachment_name = models.CharField(
        max_length=255,
        blank=True,
        help_text="Nombre original del archivo"
    )
    read = models.BooleanField(default=False, help_text="Mensaje leído")
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Mensaje'
        verbose_name_plural = 'Mensajes'
    
    def __str__(self):
        return f"Mensaje de {self.sender.username} ({self.created_at})"
    
    def mark_as_read(self):
        """Marca el mensaje como leído"""
        if not self.read:
            self.read = True
            self.save(update_fields=['read'])
    
    def save(self, *args, **kwargs):
        """Override save para detectar tipo de archivo automáticamente"""
        if self.attachment:
            # Guardar nombre original del archivo
            if not self.attachment_name:
                self.attachment_name = self.attachment.name
            
            # Detectar tipo basado en extensión
            file_ext = self.attachment.name.lower().split('.')[-1]
            image_extensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg']
            
            if file_ext in image_extensions:
                self.message_type = 'image'
            else:
                self.message_type = 'file'
        
        super().save(*args, **kwargs)
