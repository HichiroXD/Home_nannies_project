# chat/admin.py
from django.contrib import admin
from .models import Conversation, Message

@admin.register(Conversation)
class ConversationAdmin(admin.ModelAdmin):
    list_display = ['id', 'parent', 'nanny', 'created_at', 'updated_at']
    list_filter = ['created_at', 'updated_at']
    search_fields = ['parent__username', 'nanny__username']
    readonly_fields = ['created_at', 'updated_at']

@admin.register(Message)
class MessageAdmin(admin.ModelAdmin):
    list_display = ['id', 'conversation', 'sender', 'content_preview', 'read', 'created_at']
    list_filter = ['read', 'created_at']
    search_fields = ['sender__username', 'content']
    readonly_fields = ['created_at']
    
    def content_preview(self, obj):
        return obj.content[:50] + '...' if len(obj.content) > 50 else obj.content
    content_preview.short_description = 'Contenido'
