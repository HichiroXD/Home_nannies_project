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
    content = models.TextField(help_text="Contenido del mensaje")
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
