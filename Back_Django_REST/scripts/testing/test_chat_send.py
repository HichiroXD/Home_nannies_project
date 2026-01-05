#!/usr/bin/env python
"""Script para probar el envío de mensajes en el chat"""
import os
import sys
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'django_crud_api.settings')
sys.path.insert(0, os.path.dirname(__file__))
django.setup()

from django.contrib.auth import get_user_model
from chat.views import send_message
from rest_framework.test import APIRequestFactory
from rest_framework.request import Request

User = get_user_model()

# Obtener usuarios
try:
    # Buscar un parent y una nanny
    parent = User.objects.filter(role='parent').first() or User.objects.filter(active_role='parent').first()
    nanny = User.objects.filter(role='nanny').first() or User.objects.filter(active_role='nanny').first()
    
    if not parent:
        print("❌ No se encontró ningún usuario con rol 'parent'")
        print(f"Usuarios disponibles: {list(User.objects.values_list('id', 'username', 'role', 'active_role'))}")
        sys.exit(1)
    
    if not nanny:
        print("❌ No se encontró ningún usuario con rol 'nanny'")
        print(f"Usuarios disponibles: {list(User.objects.values_list('id', 'username', 'role', 'active_role'))}")
        sys.exit(1)
    
    print(f"✅ Parent encontrado: {parent.username} (ID: {parent.id})")
    print(f"   - role: {getattr(parent, 'role', 'N/A')}")
    print(f"   - active_role: {getattr(parent, 'active_role', 'N/A')}")
    
    print(f"✅ Nanny encontrada: {nanny.username} (ID: {nanny.id})")
    print(f"   - role: {getattr(nanny, 'role', 'N/A')}")
    print(f"   - active_role: {getattr(nanny, 'active_role', 'N/A')}")
    
    # Crear request simulado
    factory = APIRequestFactory()
    request = factory.post('/api/chat/send/', {
        'receiver_id': nanny.id,
        'content': 'Mensaje de prueba'
    }, format='json')
    
    # Forzar autenticación
    from rest_framework.test import force_authenticate
    force_authenticate(request, user=parent)
    
    # Enviar mensaje
    print("\n📤 Intentando enviar mensaje...")
    response = send_message(request)
    
    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.data}")
    
    if response.status_code == 201:
        print("✅ Mensaje enviado correctamente")
    else:
        print("❌ Error al enviar mensaje")
        
except Exception as e:
    print(f"❌ Error: {e}")
    import traceback
    traceback.print_exc()
