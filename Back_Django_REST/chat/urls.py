# chat/urls.py
from django.urls import path
from .views import (
    ConversationListView, MessageListView, 
    send_message, send_message_with_file,
    unread_count, get_or_create_conversation
)

app_name = 'chat'

urlpatterns = [
    path('conversations/', ConversationListView.as_view(), name='conversation-list'),
    path('conversations/<int:conversation_id>/messages/', MessageListView.as_view(), name='message-list'),
    path('conversations/get-or-create/', get_or_create_conversation, name='get-or-create-conversation'),
    path('send/', send_message, name='send-message'),
    path('send-file/', send_message_with_file, name='send-message-with-file'),
    path('unread-count/', unread_count, name='unread-count'),
]
