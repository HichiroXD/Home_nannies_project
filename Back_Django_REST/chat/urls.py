# chat/urls.py
from django.urls import path
from .views import ConversationListView, MessageListView, send_message, unread_count

app_name = 'chat'

urlpatterns = [
    path('conversations/', ConversationListView.as_view(), name='conversation-list'),
    path('conversations/<int:conversation_id>/messages/', MessageListView.as_view(), name='message-list'),
    path('send/', send_message, name='send-message'),
    path('unread-count/', unread_count, name='unread-count'),
]
