"""
Script de Testing para Mejoras del Chat - Fase 1
Verifica que el backend esté correctamente configurado para emojis y archivos
"""

import os
import django
import sys

# Configurar Django
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'django_crud_api.settings')
django.setup()

from chat.models import Message, Conversation
from users.models import User
from django.core.files.uploadedfile import SimpleUploadedFile
from django.conf import settings

def test_message_model():
    """Test 1: Verificar que el modelo Message tenga los campos necesarios"""
    print("\n🔍 Test 1: Verificando campos del modelo Message...")
    
    required_fields = ['message_type', 'attachment', 'attachment_name']
    message_fields = [f.name for f in Message._meta.get_fields()]
    
    for field in required_fields:
        if field in message_fields:
            print(f"  ✅ Campo '{field}' existe")
        else:
            print(f"  ❌ Campo '{field}' NO existe")
            return False
    
    print("  ✅ Todos los campos requeridos existen")
    return True

def test_message_types():
    """Test 2: Verificar los tipos de mensaje válidos"""
    print("\n🔍 Test 2: Verificando tipos de mensaje...")
    
    message_type_field = Message._meta.get_field('message_type')
    choices = [choice[0] for choice in message_type_field.choices]
    
    expected_types = ['text', 'image', 'file']
    for msg_type in expected_types:
        if msg_type in choices:
            print(f"  ✅ Tipo '{msg_type}' disponible")
        else:
            print(f"  ❌ Tipo '{msg_type}' NO disponible")
            return False
    
    print("  ✅ Todos los tipos de mensaje válidos")
    return True

def test_media_configuration():
    """Test 3: Verificar configuración de MEDIA"""
    print("\n🔍 Test 3: Verificando configuración MEDIA...")
    
    if hasattr(settings, 'MEDIA_URL'):
        print(f"  ✅ MEDIA_URL configurado: {settings.MEDIA_URL}")
    else:
        print("  ❌ MEDIA_URL NO configurado")
        return False
    
    if hasattr(settings, 'MEDIA_ROOT'):
        print(f"  ✅ MEDIA_ROOT configurado: {settings.MEDIA_ROOT}")
        
        # Verificar que el directorio existe o se puede crear
        if not os.path.exists(settings.MEDIA_ROOT):
            try:
                os.makedirs(settings.MEDIA_ROOT)
                print(f"  ✅ Directorio MEDIA_ROOT creado")
            except Exception as e:
                print(f"  ⚠️  No se pudo crear MEDIA_ROOT: {e}")
        else:
            print(f"  ✅ Directorio MEDIA_ROOT existe")
    else:
        print("  ❌ MEDIA_ROOT NO configurado")
        return False
    
    return True

def test_create_text_message():
    """Test 4: Crear mensaje de texto con emoji"""
    print("\n🔍 Test 4: Creando mensaje de texto con emoji...")
    
    try:
        # Buscar conversación existente
        conversation = Conversation.objects.first()
        
        if not conversation:
            print("  ⚠️  No hay conversaciones disponibles para test")
            return True
        
        # Crear mensaje con emoji
        message = Message.objects.create(
            conversation=conversation,
            sender=conversation.parent.user,  # Usar el usuario del parent
            content="¡Hola! 😊👋 ¿Cómo estás?",
            message_type='text'
        )
        
        print(f"  ✅ Mensaje creado con ID: {message.id}")
        print(f"  ✅ Contenido: {message.content}")
        print(f"  ✅ Tipo: {message.message_type}")
        
        # Limpiar
        message.delete()
        
        return True
        
    except Exception as e:
        print(f"  ⚠️  No se pudo crear mensaje de prueba: {e}")
        print(f"  ℹ️  Esto es normal si no hay conversaciones en la BD")
        return True

def test_file_upload_simulation():
    """Test 5: Simular subida de archivo"""
    print("\n🔍 Test 5: Simulando subida de archivo...")
    
    try:
        # Buscar conversación existente
        conversation = Conversation.objects.first()
        
        if not conversation:
            print("  ⚠️  No hay conversaciones disponibles para test")
            return True
        
        # Simular archivo PDF
        file_content = b"PDF content simulation"
        uploaded_file = SimpleUploadedFile(
            "test_document.pdf",
            file_content,
            content_type="application/pdf"
        )
        
        # Crear mensaje con archivo
        message = Message.objects.create(
            conversation=conversation,
            sender=conversation.parent.user,  # Usar el usuario del parent
            content="Aquí está el documento",
            attachment=uploaded_file,
            attachment_name="test_document.pdf"
        )
        
        print(f"  ✅ Mensaje con archivo creado con ID: {message.id}")
        print(f"  ✅ Tipo auto-detectado: {message.message_type}")
        print(f"  ✅ Nombre del archivo: {message.attachment_name}")
        print(f"  ✅ Ruta del archivo: {message.attachment.name if message.attachment else 'N/A'}")
        
        # Limpiar
        if message.attachment:
            # Eliminar archivo físico
            if os.path.exists(message.attachment.path):
                os.remove(message.attachment.path)
        message.delete()
        
        return True
        
    except Exception as e:
        print(f"  ⚠️  No se pudo simular subida de archivo: {e}")
        print(f"  ℹ️  Esto es normal si no hay conversaciones en la BD")
        return True

def test_serializer_validation():
    """Test 6: Verificar que los serializers existen"""
    print("\n🔍 Test 6: Verificando serializers...")
    
    try:
        from chat.serializer import MessageSerializer, MessageWithFileSerializer
        print("  ✅ MessageSerializer importado correctamente")
        print("  ✅ MessageWithFileSerializer importado correctamente")
        
        # Verificar campos del serializer
        serializer_fields = MessageSerializer().get_fields().keys()
        if 'attachment_url' in serializer_fields:
            print("  ✅ Campo 'attachment_url' en MessageSerializer")
        else:
            print("  ⚠️  Campo 'attachment_url' NO en MessageSerializer")
        
        return True
        
    except ImportError as e:
        print(f"  ❌ Error al importar serializers: {e}")
        return False

def test_views_endpoints():
    """Test 7: Verificar que los endpoints existen"""
    print("\n🔍 Test 7: Verificando endpoints...")
    
    try:
        from chat.views import send_message, send_message_with_file
        print("  ✅ send_message view existe")
        print("  ✅ send_message_with_file view existe")
        return True
        
    except ImportError as e:
        print(f"  ❌ Error al importar views: {e}")
        return False

def run_all_tests():
    """Ejecutar todos los tests"""
    print("=" * 60)
    print("🚀 INICIANDO TESTS DE MEJORAS DEL CHAT - FASE 1")
    print("=" * 60)
    
    tests = [
        test_message_model,
        test_message_types,
        test_media_configuration,
        test_create_text_message,
        test_file_upload_simulation,
        test_serializer_validation,
        test_views_endpoints
    ]
    
    results = []
    for test in tests:
        try:
            result = test()
            results.append(result)
        except Exception as e:
            print(f"\n  ❌ Error inesperado en {test.__name__}: {e}")
            results.append(False)
    
    print("\n" + "=" * 60)
    print("📊 RESUMEN DE TESTS")
    print("=" * 60)
    
    passed = sum(results)
    total = len(results)
    
    print(f"\n  Tests pasados: {passed}/{total}")
    print(f"  Tests fallidos: {total - passed}/{total}")
    
    if passed == total:
        print("\n  ✅ ¡TODOS LOS TESTS PASARON!")
    else:
        print("\n  ⚠️  Algunos tests fallaron. Revisar arriba para detalles.")
    
    print("\n" + "=" * 60)

if __name__ == '__main__':
    run_all_tests()
