# Plan de Mejora del Sistema de Chat - Características Avanzadas

**Fecha:** 14 de enero de 2026  
**Objetivo:** Implementar estados de mensajes (visto/entregado), archivos/imágenes, emojis y optimización con WebSockets

---

## 📋 Estado Actual del Sistema

### Backend (Django REST)
- ✅ Modelo `Conversation` entre parent y nanny
- ✅ Modelo `Message` con campo `read` (boolean)
- ✅ API REST con endpoints básicos
- ❌ No hay estados de "entregado" ni "visto por separado"
- ❌ No hay soporte para archivos/imágenes
- ❌ Polling cada 3-10 segundos (ineficiente)

### Frontend (React)
- ✅ Interfaz de chat funcional
- ✅ Lista de conversaciones
- ✅ Envío/recepción de mensajes
- ❌ No hay selector de emojis
- ❌ No hay preview de imágenes
- ❌ Polling constante (causa recargas)

---

## 🎯 Funcionalidades Solicitadas

### 1. Estados de Mensajes Mejorados
- ✅ **Enviado** (existe implícitamente al crear mensaje)
- ⚠️ **Entregado** (cuando llega al servidor) - nuevo
- ⚠️ **Visto** (cuando el receptor lo lee) - mejorar actual

### 2. Archivos e Imágenes
- 📎 Adjuntar archivos (PDF, DOC, etc.)
- 🖼️ Enviar imágenes
- 📷 Preview de imágenes en línea
- 💾 Límite de tamaño por archivo

### 3. Emojis
- 😊 Selector de emojis
- 🎨 Emojis en mensajes
- 👍 Reacciones rápidas (opcional)

### 4. Tiempo Real (Eliminar Polling)
- 🔌 WebSockets para comunicación en tiempo real
- 📡 Notificaciones instantáneas
- ⚡ Cero recargas, solo push del servidor

---

## 🛠️ Solución Recomendada - Stack Completo

### **Opción 1: Stack WebSockets Completo (RECOMENDADO)**

#### Backend: Django Channels
```bash
pip install channels channels-redis daphne
```

**Por qué Django Channels:**
- ✅ Integración nativa con Django
- ✅ WebSockets + HTTP en un solo servidor
- ✅ Redis para pub/sub y presencia
- ✅ Escalable y probado en producción
- ✅ Documentación excelente

#### Frontend: Socket.io-client
```bash
npm install socket.io-client
```

**Por qué Socket.io:**
- ✅ Fallback automático a polling si WebSockets falla
- ✅ Reconexión automática
- ✅ Rooms para conversaciones
- ✅ Compatible con Django Channels via adaptador

#### Emojis: emoji-mart
```bash
npm install @emoji-mart/react @emoji-mart/data
```

**Por qué emoji-mart:**
- ✅ Componente completo de selector de emojis
- ✅ Búsqueda, categorías, skin tones
- ✅ Ligero y rápido
- ✅ Muy personalizable

#### Archivos/Imágenes: react-dropzone + Previo
```bash
npm install react-dropzone react-image-lightbox
```

**Por qué:**
- ✅ Drag & drop intuitivo
- ✅ Preview de imágenes antes de enviar
- ✅ Validación de tipo y tamaño
- ✅ Lightbox para ver imágenes en grande

---

### **Opción 2: Stack Simplificado (Sin WebSockets)**

Si prefieres mantener HTTP por ahora y agregar solo las funcionalidades:

#### Emojis: emoji-picker-react
```bash
npm install emoji-picker-react
```

#### Archivos: react-file-drop
```bash
npm install react-file-drop
```

#### Polling Optimizado: SWR o React Query
```bash
npm install swr
# o
npm install @tanstack/react-query
```

**Ventajas:**
- ✅ Más simple de implementar
- ✅ No requiere cambios en infraestructura
- ❌ Sigue siendo polling (menos eficiente)

---

## 📐 Arquitectura Propuesta - Opción 1 (WebSockets)

### Backend (Django Channels)

```python
# chat/models.py - Actualización
class Message(models.Model):
    # ... campos existentes ...
    
    # Nuevos campos para estados
    delivered_at = models.DateTimeField(null=True, blank=True)
    read_at = models.DateTimeField(null=True, blank=True)
    
    # Nuevos campos para archivos
    attachment = models.FileField(
        upload_to='chat_attachments/%Y/%m/%d/',
        null=True,
        blank=True
    )
    attachment_type = models.CharField(
        max_length=20,
        choices=[
            ('image', 'Imagen'),
            ('file', 'Archivo'),
            ('text', 'Texto')
        ],
        default='text'
    )
    
    @property
    def status(self):
        """Retorna el estado actual del mensaje"""
        if self.read_at:
            return 'read'
        elif self.delivered_at:
            return 'delivered'
        return 'sent'
```

```python
# chat/consumers.py - Nuevo archivo para WebSockets
from channels.generic.websocket import AsyncJsonWebsocketConsumer
from channels.db import database_sync_to_async
from django.utils import timezone

class ChatConsumer(AsyncJsonWebsocketConsumer):
    async def connect(self):
        self.user = self.scope['user']
        self.user_group = f'user_{self.user.id}'
        
        # Unirse al grupo del usuario
        await self.channel_layer.group_add(
            self.user_group,
            self.channel_name
        )
        await self.accept()
    
    async def disconnect(self, close_code):
        # Salir del grupo
        await self.channel_layer.group_discard(
            self.user_group,
            self.channel_name
        )
    
    async def receive_json(self, content):
        """Recibe mensajes del cliente"""
        message_type = content.get('type')
        
        if message_type == 'chat_message':
            # Guardar mensaje en DB
            message = await self.save_message(content)
            
            # Enviar al receptor
            receiver_id = content.get('receiver_id')
            await self.channel_layer.group_send(
                f'user_{receiver_id}',
                {
                    'type': 'chat.message',
                    'message': message
                }
            )
            
            # Confirmar al emisor
            await self.send_json({
                'type': 'message_sent',
                'message': message
            })
            
        elif message_type == 'mark_delivered':
            # Actualizar estado a entregado
            await self.mark_delivered(content.get('message_id'))
            
        elif message_type == 'mark_read':
            # Actualizar estado a leído
            await self.mark_read(content.get('message_id'))
    
    async def chat_message(self, event):
        """Handler para enviar mensajes al cliente"""
        await self.send_json({
            'type': 'new_message',
            'message': event['message']
        })
    
    @database_sync_to_async
    def save_message(self, data):
        # Guardar mensaje en la base de datos
        from .models import Message, Conversation
        # ... lógica de guardado
        pass
    
    @database_sync_to_async
    def mark_delivered(self, message_id):
        from .models import Message
        message = Message.objects.get(id=message_id)
        message.delivered_at = timezone.now()
        message.save()
    
    @database_sync_to_async
    def mark_read(self, message_id):
        from .models import Message
        message = Message.objects.get(id=message_id)
        message.read_at = timezone.now()
        message.save()
```

```python
# chat/routing.py - Nuevo archivo
from django.urls import re_path
from . import consumers

websocket_urlpatterns = [
    re_path(r'ws/chat/$', consumers.ChatConsumer.as_asgi()),
]
```

```python
# django_crud_api/asgi.py - Actualizar
import os
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack
from django.core.asgi import get_asgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'django_crud_api.settings')

django_asgi_app = get_asgi_application()

from chat.routing import websocket_urlpatterns

application = ProtocolTypeRouter({
    "http": django_asgi_app,
    "websocket": AuthMiddlewareStack(
        URLRouter(websocket_urlpatterns)
    ),
})
```

```python
# settings.py - Agregar
INSTALLED_APPS = [
    'daphne',  # Debe ser PRIMERO
    # ... apps existentes
    'channels',
]

ASGI_APPLICATION = 'django_crud_api.asgi.application'

CHANNEL_LAYERS = {
    'default': {
        'BACKEND': 'channels_redis.core.RedisChannelLayer',
        'CONFIG': {
            "hosts": [('127.0.0.1', 6379)],
        },
    },
}
```

### Frontend (React + Socket.io)

```javascript
// hooks/useWebSocket.js - Nuevo hook personalizado
import { useEffect, useRef, useState, useCallback } from 'react';
import io from 'socket.io-client';

export const useWebSocket = (userId) => {
  const socketRef = useRef(null);
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState([]);
  
  useEffect(() => {
    // Conectar al WebSocket
    const token = localStorage.getItem('accessToken');
    
    socketRef.current = io('ws://localhost:8000/ws/chat/', {
      auth: { token },
      transports: ['websocket', 'polling'] // Fallback a polling
    });
    
    // Eventos de conexión
    socketRef.current.on('connect', () => {
      console.log('✅ WebSocket conectado');
      setIsConnected(true);
    });
    
    socketRef.current.on('disconnect', () => {
      console.log('❌ WebSocket desconectado');
      setIsConnected(false);
    });
    
    // Escuchar nuevos mensajes
    socketRef.current.on('new_message', (data) => {
      setMessages(prev => [...prev, data.message]);
      
      // Marcar como entregado automáticamente
      socketRef.current.emit('mark_delivered', {
        message_id: data.message.id
      });
    });
    
    // Cleanup al desmontar
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [userId]);
  
  // Enviar mensaje
  const sendMessage = useCallback((receiverId, content, attachment = null) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit('chat_message', {
        type: 'chat_message',
        receiver_id: receiverId,
        content,
        attachment
      });
    }
  }, [isConnected]);
  
  // Marcar mensaje como leído
  const markAsRead = useCallback((messageId) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit('mark_read', {
        type: 'mark_read',
        message_id: messageId
      });
    }
  }, [isConnected]);
  
  return {
    isConnected,
    messages,
    sendMessage,
    markAsRead
  };
};
```

```jsx
// components/EmojiPicker.jsx - Componente de emojis
import React, { useState } from 'react';
import data from '@emoji-mart/data';
import Picker from '@emoji-mart/react';
import { IconButton, Popover } from '@mui/material';
import { SmilePlus } from 'lucide-react';

export const EmojiPicker = ({ onEmojiSelect }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  
  const handleClose = () => {
    setAnchorEl(null);
  };
  
  const handleEmojiSelect = (emoji) => {
    onEmojiSelect(emoji.native);
    handleClose();
  };
  
  const open = Boolean(anchorEl);
  
  return (
    <>
      <IconButton onClick={handleClick} size="small">
        <SmilePlus size={20} />
      </IconButton>
      
      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
      >
        <Picker 
          data={data} 
          onEmojiSelect={handleEmojiSelect}
          theme="light"
          locale="es"
        />
      </Popover>
    </>
  );
};
```

```jsx
// components/FileUpload.jsx - Componente de subida de archivos
import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Box, Typography, IconButton } from '@mui/material';
import { Upload, X, Image, File } from 'lucide-react';

export const FileUpload = ({ onFileSelect, selectedFile, onClear }) => {
  const onDrop = useCallback((acceptedFiles) => {
    if (acceptedFiles && acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      
      // Validar tamaño (máximo 10MB)
      if (file.size > 10 * 1024 * 1024) {
        alert('El archivo es demasiado grande. Máximo 10MB');
        return;
      }
      
      onFileSelect(file);
    }
  }, [onFileSelect]);
  
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif'],
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
    },
    maxFiles: 1
  });
  
  if (selectedFile) {
    return (
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: 1,
        p: 1,
        bgcolor: '#f0f0f0',
        borderRadius: 1
      }}>
        {selectedFile.type.startsWith('image/') ? (
          <Image size={20} />
        ) : (
          <File size={20} />
        )}
        <Typography variant="body2" sx={{ flex: 1 }}>
          {selectedFile.name}
        </Typography>
        <IconButton size="small" onClick={onClear}>
          <X size={16} />
        </IconButton>
      </Box>
    );
  }
  
  return (
    <Box
      {...getRootProps()}
      sx={{
        border: '2px dashed #ccc',
        borderRadius: 2,
        p: 2,
        textAlign: 'center',
        cursor: 'pointer',
        bgcolor: isDragActive ? '#f0f0f0' : 'white',
        '&:hover': {
          bgcolor: '#f9f9f9'
        }
      }}
    >
      <input {...getInputProps()} />
      <Upload size={24} style={{ marginBottom: 8 }} />
      <Typography variant="body2">
        {isDragActive
          ? 'Suelta el archivo aquí'
          : 'Arrastra un archivo o haz clic para seleccionar'}
      </Typography>
      <Typography variant="caption" color="text.secondary">
        Imágenes, PDF, DOC (máx. 10MB)
      </Typography>
    </Box>
  );
};
```

```jsx
// components/MessageStatus.jsx - Indicadores de estado
import React from 'react';
import { Check, CheckCheck } from 'lucide-react';

export const MessageStatus = ({ status }) => {
  if (status === 'read') {
    return <CheckCheck size={14} color="#4CAF50" />; // Verde para leído
  }
  
  if (status === 'delivered') {
    return <CheckCheck size={14} color="rgba(255,255,255,0.9)" />; // Doble check
  }
  
  // sent
  return <Check size={14} color="rgba(255,255,255,0.9)" />; // Un solo check
};
```

---

## 📦 Instalación Paso a Paso

### Backend

```bash
# 1. Instalar dependencias
cd Back_Django_REST
pip install channels channels-redis daphne redis pillow

# 2. Instalar Redis (Windows)
# Descargar de: https://github.com/microsoftarchive/redis/releases
# O usar Docker:
docker run -d -p 6379:6379 redis:alpine

# 3. Ejecutar migraciones
python manage.py makemigrations chat
python manage.py migrate

# 4. Ejecutar con Daphne (en lugar de runserver)
daphne -b 0.0.0.0 -p 8000 django_crud_api.asgi:application
```

### Frontend

```bash
# 1. Instalar dependencias
cd frontend_nannies
npm install socket.io-client @emoji-mart/react @emoji-mart/data react-dropzone

# 2. Ejecutar desarrollo
npm run dev
```

---

## 🎨 Actualización de ChatView.jsx

```jsx
// Agregar imports
import { useWebSocket } from '@/hooks/useWebSocket';
import { EmojiPicker } from '@/components/EmojiPicker';
import { FileUpload } from '@/components/FileUpload';
import { MessageStatus } from '@/components/MessageStatus';

export const ChatView = () => {
  // ... estados existentes
  const [selectedFile, setSelectedFile] = useState(null);
  
  // Reemplazar polling con WebSocket
  const { isConnected, messages, sendMessage, markAsRead } = useWebSocket(userId);
  
  // Handler para emojis
  const handleEmojiSelect = (emoji) => {
    setNewMessage(prev => prev + emoji);
  };
  
  // Handler para enviar mensaje con archivo
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() && !selectedFile) return;
    
    // Si hay archivo, subirlo primero
    let attachmentUrl = null;
    if (selectedFile) {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('message', newMessage);
      
      // Enviar vía HTTP tradicional para archivos
      const response = await chatApi.sendMessageWithFile(
        receiverId,
        newMessage,
        formData
      );
      attachmentUrl = response.attachment_url;
    } else {
      // Enviar vía WebSocket para mensajes de texto
      sendMessage(receiverId, newMessage);
    }
    
    setNewMessage('');
    setSelectedFile(null);
  };
  
  // Marcar como leído cuando se ve el mensaje
  useEffect(() => {
    if (selectedConversation && messages.length > 0) {
      const unreadMessages = messages.filter(m => 
        !m.read_at && m.sender !== currentUserId
      );
      
      unreadMessages.forEach(msg => {
        markAsRead(msg.id);
      });
    }
  }, [messages, selectedConversation]);
  
  return (
    // ... JSX existente con modificaciones:
    
    // En el input de mensaje:
    <Stack direction="row" spacing={1} alignItems="flex-end">
      <EmojiPicker onEmojiSelect={handleEmojiSelect} />
      
      <TextField
        // ... props existentes
      />
      
      <IconButton
        onClick={() => setShowFileUpload(!showFileUpload)}
      >
        <Upload size={20} />
      </IconButton>
      
      <IconButton type="submit">
        <Send size={20} />
      </IconButton>
    </Stack>
    
    {showFileUpload && (
      <FileUpload
        onFileSelect={setSelectedFile}
        selectedFile={selectedFile}
        onClear={() => setSelectedFile(null)}
      />
    )}
    
    // En cada mensaje:
    <MessageStatus status={message.status} />
  );
};
```

---

## 📊 Comparación de Opciones

| Característica | Opción 1 (WebSockets) | Opción 2 (HTTP Polling) |
|----------------|----------------------|------------------------|
| **Tiempo real** | ✅ Instantáneo | ⚠️ Hasta 8-10s delay |
| **Carga servidor** | ✅ Baja (push) | ❌ Alta (polling) |
| **Complejidad** | ⚠️ Media-Alta | ✅ Baja |
| **Escalabilidad** | ✅ Excelente | ⚠️ Limitada |
| **Estados msg** | ✅ Tiempo real | ⚠️ Con delay |
| **Archivos** | ✅ Soportado | ✅ Soportado |
| **Emojis** | ✅ Soportado | ✅ Soportado |
| **Infraestructura** | ⚠️ Requiere Redis | ✅ Solo Django |
| **Costo** | ⚠️ Mayor | ✅ Menor |

---

## 🚀 Plan de Implementación Recomendado

### Fase 1: Mejoras Básicas (1-2 días)
1. ✅ Agregar emojis (emoji-mart)
2. ✅ Agregar subida de archivos (react-dropzone)
3. ✅ Mejorar modelo Message para archivos
4. ✅ Preview de imágenes

### Fase 2: Estados de Mensajes (1 día)
1. ✅ Agregar campos `delivered_at` y `read_at`
2. ✅ Crear endpoints para marcar entregado/leído
3. ✅ Actualizar frontend con indicadores visuales
4. ✅ Lógica automática de "entregado" y "leído"

### Fase 3: WebSockets (2-3 días)
1. ✅ Instalar Django Channels + Redis
2. ✅ Crear consumers para WebSocket
3. ✅ Configurar routing y ASGI
4. ✅ Crear hook useWebSocket en frontend
5. ✅ Reemplazar polling por WebSockets
6. ✅ Testing exhaustivo

### Fase 4: Pulido (1 día)
1. ✅ Optimizaciones de rendimiento
2. ✅ Manejo de errores
3. ✅ Notificaciones de escritura ("está escribiendo...")
4. ✅ Documentación

---

## 💰 Costos y Recursos

### Desarrollo
- **Fase 1:** 8-16 horas
- **Fase 2:** 4-8 horas
- **Fase 3:** 12-24 horas
- **Fase 4:** 4-8 horas
- **Total:** ~40-60 horas

### Infraestructura Adicional
- **Redis:** Gratuito (auto-hospedado) o ~$10-15/mes (cloud)
- **Almacenamiento archivos:** Depende del volumen
  - AWS S3: ~$0.023/GB
  - Cloudinary: Plan gratuito hasta 25GB

---

## 📚 Recursos y Documentación

### Django Channels
- https://channels.readthedocs.io/
- https://github.com/django/channels

### Socket.io
- https://socket.io/docs/v4/
- https://socket.io/docs/v4/client-api/

### Emoji Mart
- https://github.com/missive/emoji-mart

### React Dropzone
- https://react-dropzone.js.org/

---

## ⚠️ Consideraciones Importantes

### Seguridad
1. **Autenticación en WebSockets:** Validar token JWT
2. **Límite de tamaño de archivos:** Máximo 10MB recomendado
3. **Validación de tipos de archivo:** Solo permitir extensiones seguras
4. **Sanitización de mensajes:** Prevenir XSS

### Rendimiento
1. **Compresión de imágenes:** Reducir tamaño antes de subir
2. **CDN para archivos:** Usar Cloudinary o similar
3. **Paginación de mensajes:** Cargar por lotes
4. **Lazy loading de imágenes:** Cargar bajo demanda

### UX
1. **Indicador de conexión:** Mostrar si WebSocket está conectado
2. **Retry automático:** Reconectar si se pierde conexión
3. **Notificaciones:** Avisar de nuevos mensajes
4. **Typing indicator:** "Usuario está escribiendo..."

---

## ✅ Checklist de Implementación

### Backend
- [ ] Instalar Django Channels y Redis
- [ ] Actualizar modelo Message (delivered_at, read_at, attachment)
- [ ] Crear ChatConsumer para WebSockets
- [ ] Configurar routing y ASGI
- [ ] Crear endpoint para subir archivos
- [ ] Migrar base de datos
- [ ] Testing de WebSockets

### Frontend
- [ ] Instalar dependencias (socket.io, emoji-mart, dropzone)
- [ ] Crear hook useWebSocket
- [ ] Crear componente EmojiPicker
- [ ] Crear componente FileUpload
- [ ] Crear componente MessageStatus
- [ ] Actualizar ChatView con nuevos componentes
- [ ] Eliminar polling, usar WebSockets
- [ ] Testing de interfaz

### DevOps
- [ ] Configurar Redis en servidor
- [ ] Actualizar deployment para usar Daphne
- [ ] Configurar proxy (Nginx) para WebSockets
- [ ] Monitoreo de conexiones WebSocket

---

**Recomendación Final:** Comenzar con Fase 1 y 2 (emojis, archivos, estados) que son más rápidas de implementar. Luego evaluar si implementar WebSockets (Fase 3) según el volumen de usuarios y necesidad de tiempo real.
