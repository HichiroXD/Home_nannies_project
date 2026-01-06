# chat/views.py  
from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Q
from django.contrib.auth import get_user_model
from .models import Conversation, Message
from .serializer import ConversationSerializer, MessageSerializer, MessageCreateSerializer

User = get_user_model()

class ConversationListView(generics.ListAPIView):
    serializer_class = ConversationSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        return Conversation.objects.filter(
            Q(parent=user) | Q(nanny=user)
        ).select_related('parent', 'nanny').order_by('-updated_at')
    
    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context

class MessageListView(generics.ListAPIView):
    serializer_class = MessageSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        conversation_id = self.kwargs.get('conversation_id')
        user = self.request.user
        try:
            # Verificar que el usuario sea parte de la conversación
            conversation = Conversation.objects.get(
                Q(id=conversation_id) & (Q(parent=user) | Q(nanny=user))
            )
        except Conversation.DoesNotExist:
            return Message.objects.none()
        Message.objects.filter(conversation=conversation, read=False).exclude(sender=user).update(read=True)
        return Message.objects.filter(conversation=conversation).select_related('sender')

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def send_message(request):
    print(f"=== SEND MESSAGE DEBUG ===")
    print(f"Request data: {request.data}")
    print(f"User: {request.user}, ID: {request.user.id}")
    
    serializer = MessageCreateSerializer(data=request.data)
    if not serializer.is_valid():
        print(f"Serializer errors: {serializer.errors}")
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    sender = request.user
    receiver_id = serializer.validated_data['receiver_id']
    content = serializer.validated_data['content']
    
    try:
        receiver = User.objects.get(id=receiver_id)
        print(f"Receiver found: {receiver.username} (ID: {receiver.id})")
        
        # Verificar que no sea el mismo usuario
        if sender.id == receiver.id:
            print(f"ERROR: Same user! Sender ID: {sender.id}, Receiver ID: {receiver.id}")
            return Response({'error': 'No puedes enviarte mensajes a ti mismo'}, status=status.HTTP_400_BAD_REQUEST)
            
    except User.DoesNotExist:
        return Response({'error': f'Usuario receptor con ID {receiver_id} no encontrado'}, status=status.HTTP_404_NOT_FOUND)
    
    # Obtener roles de manera segura
    sender_role = getattr(sender, 'active_role', None) or getattr(sender, 'role', None)
    receiver_role = getattr(receiver, 'active_role', None) or getattr(receiver, 'role', None)
    
    # Validar que ambos usuarios tengan roles
    if not sender_role or not receiver_role:
        return Response({'error': 'Los usuarios deben tener roles asignados'}, status=status.HTTP_400_BAD_REQUEST)
    
    # Validar que sea comunicación parent-nanny
    if not ((sender_role == 'parent' and receiver_role == 'nanny') or (sender_role == 'nanny' and receiver_role == 'parent')):
        return Response({
            'error': f'Solo puedes enviar mensajes entre padres y niñeras. Tu rol: {sender_role}, receptor: {receiver_role}'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    # Determinar parent y nanny
    if sender_role == 'parent':
        parent, nanny = sender, receiver
    else:
        parent, nanny = receiver, sender
    
    conversation, created = Conversation.objects.get_or_create(parent=parent, nanny=nanny)
    message = Message.objects.create(conversation=conversation, sender=sender, content=content)
    conversation.save()
    
    serializer = MessageSerializer(message, context={'request': request})
    return Response(serializer.data, status=status.HTTP_201_CREATED)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def unread_count(request):
    user = request.user
    count = Message.objects.filter(conversation__in=Conversation.objects.filter(Q(parent=user) | Q(nanny=user)), read=False).exclude(sender=user).count()
    return Response({'unread_count': count})
