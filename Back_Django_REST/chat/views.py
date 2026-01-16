# chat/views.py  
from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes, parser_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from django.db.models import Q
from django.contrib.auth import get_user_model
from .models import Conversation, Message
from .serializer import ConversationSerializer, MessageSerializer, MessageCreateSerializer, MessageWithFileSerializer
import sys


def _safe_print(*args, **kwargs):
    """Print helper that avoids UnicodeEncodeError on consoles with limited encodings.
    It will replace unencodable characters when necessary.
    """
    enc = getattr(sys.stdout, 'encoding', None) or 'utf-8'
    safe_args = []
    for a in args:
        s = str(a)
        try:
            s.encode(enc)
        except Exception:
            s = s.encode('utf-8', errors='replace').decode(enc, errors='replace')
        safe_args.append(s)
    print(*safe_args, **kwargs)

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
    """Enviar mensaje de texto simple"""
    _safe_print(f"=== SEND MESSAGE DEBUG ===")
    _safe_print(f"Request data: {request.data}")
    _safe_print(f"User: {request.user}, ID: {request.user.id}")
    
    serializer = MessageCreateSerializer(data=request.data)
    if not serializer.is_valid():
        _safe_print(f"Serializer errors: {serializer.errors}")
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    sender = request.user
    receiver_id = serializer.validated_data['receiver_id']
    content = serializer.validated_data.get('content', '').strip()
    
    # Validar que haya contenido
    if not content:
        return Response({'error': 'El mensaje no puede estar vacío'}, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        receiver = User.objects.get(id=receiver_id)
        _safe_print(f"Receiver found: {receiver.username} (ID: {receiver.id})")
        
        # Verificar que no sea el mismo usuario
        if sender.id == receiver.id:
            _safe_print(f"ERROR: Same user! Sender ID: {sender.id}, Receiver ID: {receiver.id}")
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
    message = Message.objects.create(
        conversation=conversation, 
        sender=sender, 
        content=content,
        message_type='text'
    )
    conversation.save()
    
    serializer = MessageSerializer(message, context={'request': request})
    return Response(serializer.data, status=status.HTTP_201_CREATED)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
@parser_classes([MultiPartParser, FormParser])
def send_message_with_file(request):
    """Enviar mensaje con archivo adjunto"""
    _safe_print(f"=== SEND MESSAGE WITH FILE DEBUG ===")
    _safe_print(f"Request data: {request.data}")
    _safe_print(f"Files: {request.FILES}")
    
    receiver_id = request.data.get('receiver_id')
    if not receiver_id:
        return Response({'error': 'receiver_id es requerido'}, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        receiver_id = int(receiver_id)
    except (ValueError, TypeError):
        return Response({'error': 'receiver_id debe ser un número'}, status=status.HTTP_400_BAD_REQUEST)
    
    sender = request.user
    
    try:
        receiver = User.objects.get(id=receiver_id)
    except User.DoesNotExist:
        return Response({'error': 'Usuario receptor no encontrado'}, status=status.HTTP_404_NOT_FOUND)
    
    # Verificar que no sea el mismo usuario
    if sender.id == receiver.id:
        return Response({'error': 'No puedes enviarte mensajes a ti mismo'}, status=status.HTTP_400_BAD_REQUEST)
    
    # Validar roles
    sender_role = getattr(sender, 'active_role', None) or getattr(sender, 'role', None)
    receiver_role = getattr(receiver, 'active_role', None) or getattr(receiver, 'role', None)
    
    if not sender_role or not receiver_role:
        return Response({'error': 'Los usuarios deben tener roles asignados'}, status=status.HTTP_400_BAD_REQUEST)
    
    if not ((sender_role == 'parent' and receiver_role == 'nanny') or (sender_role == 'nanny' and receiver_role == 'parent')):
        return Response({
            'error': f'Solo puedes enviar mensajes entre padres y niñeras'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    # Determinar parent y nanny
    if sender_role == 'parent':
        parent, nanny = sender, receiver
    else:
        parent, nanny = receiver, sender
    
    # Crear/obtener conversación
    conversation, created = Conversation.objects.get_or_create(parent=parent, nanny=nanny)
    
    # Crear mensaje con archivo
    content = request.data.get('content', '')
    attachment = request.FILES.get('attachment')
    
    if not attachment:
        return Response({'error': 'Archivo adjunto es requerido'}, status=status.HTTP_400_BAD_REQUEST)
    
    # Validar archivo usando el serializer
    serializer = MessageWithFileSerializer(data={
        'receiver_id': receiver_id,
        'content': content,
        'attachment': attachment
    })
    
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    # Crear mensaje
    message = Message.objects.create(
        conversation=conversation,
        sender=sender,
        content=content,
        attachment=attachment
    )
    conversation.save()
    
    response_serializer = MessageSerializer(message, context={'request': request})
    return Response(response_serializer.data, status=status.HTTP_201_CREATED)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def unread_count(request):
    user = request.user
    count = Message.objects.filter(conversation__in=Conversation.objects.filter(Q(parent=user) | Q(nanny=user)), read=False).exclude(sender=user).count()
    return Response({'unread_count': count})

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def get_or_create_conversation(request):
    """
    Obtiene o crea una conversación entre el usuario actual y otro usuario.
    Útil para iniciar conversaciones desde el catálogo de niñeras.
    
    Body: { "other_user_id": <id> }
    
    Returns:
    - conversation_id: ID de la conversación
    - created: true si se creó nueva, false si ya existía
    - other_user: información del otro usuario
    """
    other_user_id = request.data.get('other_user_id')
    
    if not other_user_id:
        return Response(
            {'error': 'other_user_id es requerido'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    try:
        other_user = User.objects.get(id=other_user_id)
    except User.DoesNotExist:
        return Response(
            {'error': 'Usuario no encontrado'},
            status=status.HTTP_404_NOT_FOUND
        )
    
    current_user = request.user
    
    # Validar que no sea el mismo usuario
    if current_user.id == other_user.id:
        return Response(
            {'error': 'No puedes crear una conversación contigo mismo'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Obtener roles
    current_role = current_user.get_active_role()
    other_role = other_user.get_active_role()
    
    # Validar que sea comunicación parent-nanny
    if not ((current_role == 'parent' and other_role == 'nanny') or 
            (current_role == 'nanny' and other_role == 'parent')):
        return Response({
            'error': f'Solo puedes crear conversaciones entre padres y niñeras. Tu rol: {current_role}, otro usuario: {other_role}'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    # Determinar parent y nanny
    if current_role == 'parent':
        parent, nanny = current_user, other_user
    else:
        parent, nanny = other_user, current_user
    
    # Obtener o crear conversación
    conversation, created = Conversation.objects.get_or_create(
        parent=parent,
        nanny=nanny
    )
    
    # Serializar y devolver
    serializer = ConversationSerializer(conversation, context={'request': request})
    
    return Response({
        'conversation_id': conversation.id,
        'created': created,
        'conversation': serializer.data,
        'message': 'Conversación creada' if created else 'Conversación existente'
    }, status=status.HTTP_201_CREATED if created else status.HTTP_200_OK)
