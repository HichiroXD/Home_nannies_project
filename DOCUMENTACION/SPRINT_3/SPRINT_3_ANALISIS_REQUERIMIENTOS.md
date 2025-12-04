# 🚀 Sprint 3 - Análisis de Requerimientos y Estado Actual

**Fecha de análisis:** 3 de diciembre de 2025  
**Estado:** 📊 En Planificación  
**Sprints anteriores:** Sprint 1 ✅ | Sprint 2 ✅

---

## 📋 Índice
1. [Requerimientos Nuevos del Cliente](#requerimientos-nuevos)
2. [Historias de Usuario Funcionales](#historias-funcionales)
3. [Historias de Usuario - Ciberseguridad](#historias-ciberseguridad)
4. [Historias de Usuario - No Funcionales](#historias-no-funcionales)
5. [Análisis de Estado Actual](#estado-actual)
6. [Tareas del Sprint 3 (Jira)](#tareas-jira)
7. [Plan de Implementación](#plan-implementacion)

---

## 🎯 Requerimientos Nuevos del Cliente {#requerimientos-nuevos}

### 1. Privacidad del Historial de Niñera
**Requerimiento:** Como padre/madre quiero que el historial de la niñera solo vea mis datos y no los del infante.

**Estado actual:** ⚠️ **PENDIENTE**
- Actualmente no hay restricción de visibilidad en los datos de bookings
- Los datos del infante pueden ser visibles en el historial

**Acciones necesarias:**
- [ ] Implementar filtro de privacidad en modelo Booking
- [ ] Crear campo `show_child_info` en Booking
- [ ] Modificar serializers para ocultar información del niño antes de aceptar
- [ ] Actualizar vista de historial de niñera

---

### 2. Información del Infante Solo Después de Aceptación
**Requerimiento:** Los padres pueden permitir dar información de los niños solo si la niñera acepta el encargo.

**Estado actual:** ⚠️ **PENDIENTE**
- No hay modelo de "Children" o "Dependents"
- No existe restricción basada en estado del booking

**Acciones necesarias:**
- [ ] Crear modelo `Child` con relación a Parent
- [ ] Agregar lógica condicional en serializer de Booking
- [ ] Mostrar info básica en estado "pending", info completa en "confirmed"
- [ ] Actualizar frontend para mostrar info progresivamente

---

## 👥 Historias de Usuario Funcionales {#historias-funcionales}

### ✅ HU-1: Registro de Padres
**Historia:** Como padre/madre, quiero registrarme en la aplicación para poder usar el servicio de niñeras.

**Estado:** ✅ **IMPLEMENTADO** (Sprint 1)
- Endpoint: `POST /api/users/register/`
- Vista: `frontend/src/views/auth/Register.jsx`
- Roles: parent, nanny, admin
- Verificación por email

---

### ✅ HU-2: Agendar Niñera en Día/Hora Específica
**Historia:** Como padre/madre, quiero agendar una niñera en un día y hora específica para asegurar cuidado en los momentos que lo necesito.

**Estado:** ✅ **IMPLEMENTADO** (Sprint 1)
- Endpoint: `POST /api/bookings/`
- Vista: `frontend/src/views/BookingCreate.jsx`
- Componente: `AvailabilitySelector` con calendario
- Validación de disponibilidad en tiempo real

---

### ✅ HU-3: Filtrar Niñeras por Disponibilidad
**Historia:** Como padre/madre, quiero filtrar niñeras por disponibilidad para encontrar rápidamente quién puede cuidar en mi horario requerido.

**Estado:** ✅ **IMPLEMENTADO** (Sprint 1)
- Endpoint: `GET /api/nannies/?date_from=&date_to=`
- Vista: `frontend/src/views/Catalog.jsx`
- Filtros: fecha, horario, especialización, rating

---

### ✅ HU-4: Confirmación de Reserva
**Historia:** Como padre/madre, quiero recibir una confirmación de la reserva para estar seguro de que la niñera atenderá a mi hijo/a.

**Estado:** ✅ **IMPLEMENTADO** (Sprint 2)
- Sistema de notificaciones in-app y email
- Endpoint: `GET /api/notifications/`
- Vista: `frontend/src/components/layout/NotificationCenter.jsx`
- Email automático al crear booking

---

### ✅ HU-6: Registrar Horarios Disponibles (Niñera)
**Historia:** Como niñera, quiero registrar mis horarios disponibles para que los padres sepan cuándo puedo trabajar.

**Estado:** ✅ **IMPLEMENTADO** (Sprint 1)
- Endpoint: `POST /api/bookings/availabilities/`
- Vista: `frontend/src/views/AvailabilityManagement.jsx`
- CRUD completo de disponibilidad

---

### ✅ HU-7: Notificaciones de Nuevas Reservas (Niñera)
**Historia:** Como niñera, quiero recibir notificaciones de nuevas reservas para estar informada de mis compromisos.

**Estado:** ✅ **IMPLEMENTADO** (Sprint 2)
- Sistema de notificaciones centralizado
- Email + In-app notifications
- Centro de notificaciones en tiempo real

---

### ✅ HU-8: Aceptar/Rechazar Solicitudes (Niñera)
**Historia:** Como niñera, quiero aceptar o rechazar solicitudes para tener control sobre mi disponibilidad.

**Estado:** ✅ **IMPLEMENTADO** (Sprint 1)
- Endpoint: `PATCH /api/bookings/{id}/`
- Vista: `frontend/src/views/NannyRequests.jsx`
- Estados: pending → confirmed/rejected
- Notificación automática al padre

---

### ✅ HU-9: Estadísticas de Uso (Admin)
**Historia:** Como administrador, quiero ver estadísticas de uso (número de reservas, usuarios activos) para monitorear el impacto del servicio.

**Estado:** ✅ **IMPLEMENTADO** (Reciente)
- Endpoint: `GET /api/dashboard/admin/`
- Vista: `frontend/src/views/dashboard/admin/AdminDashboard.jsx`
- Métricas: usuarios, bookings, tasa de éxito, reportes mensuales

---

### ⚠️ HU-10: Gestionar Usuarios (Admin)
**Historia:** Como administrador, quiero gestionar usuarios (aprobar, suspender, eliminar) para mantener el orden y cumplimiento de las reglas.

**Estado:** ⚠️ **PARCIALMENTE IMPLEMENTADO**
- ✅ Vista de usuarios en admin dashboard
- ✅ Filtrado y búsqueda
- ❌ Falta: Aprobar usuarios pendientes
- ❌ Falta: Suspender usuarios
- ❌ Falta: Sistema de reportes/denuncias

**Acciones necesarias:**
- [ ] Agregar campo `is_suspended` en User model
- [ ] Crear endpoint `POST /api/users/{id}/suspend/`
- [ ] Crear endpoint `POST /api/users/{id}/approve/`
- [ ] UI para gestión de usuarios en admin dashboard

---

### ✅ HU-11: Calificar Servicio
**Historia:** Como padre/madre, quiero calificar el servicio de una niñera para ayudar a otros usuarios a elegir con confianza.

**Estado:** ✅ **IMPLEMENTADO** (Sprint 1)
- Endpoint: `POST /api/reviews/`
- Sistema de 1-5 estrellas + comentarios
- Cálculo automático de rating promedio

---

### ✅ HU-12: Historial de Reservas (Niñera)
**Historia:** Como niñera, quiero ver mi historial de reservas para tener un registro de mis actividades.

**Estado:** ✅ **IMPLEMENTADO** (Sprint 1)
- Endpoint: `GET /api/bookings/?status=completed`
- Vista: `frontend/src/views/NannyBookingHistory.jsx`

---

### ✅ HU-13: Guardar Favoritos
**Historia:** Como padre/madre, quiero guardar niñeras como favoritas para reservarlas fácilmente en futuras ocasiones.

**Estado:** ✅ **IMPLEMENTADO** (Sprint 1)
- Endpoint: `POST /api/favorites/`, `GET /api/favorites/`
- Vista: `frontend/src/views/FavoriteList.jsx`
- Icono de corazón en tarjetas de niñeras

---

### ❌ HU-16: Recordatorios Previos (Niñera)
**Historia:** Como niñera, quiero recibir recordatorios previos a mis reservas para no olvidar mis compromisos.

**Estado:** ❌ **NO IMPLEMENTADO**

**Acciones necesarias:**
- [ ] Implementar Celery + Redis para tareas programadas
- [ ] Crear tarea: enviar recordatorio 24h antes
- [ ] Crear tarea: enviar recordatorio 1h antes
- [ ] Email + notificación in-app

---

### ❌ HU-17: Modificar Detalles de Reserva
**Historia:** Como padre/madre, quiero modificar los detalles de una reserva (hora o lugar dentro del campus) para ajustar cambios sin cancelar todo.

**Estado:** ❌ **NO IMPLEMENTADO**

**Acciones necesarias:**
- [ ] Agregar campos editables: `location`, `notes`
- [ ] Crear endpoint `PATCH /api/bookings/{id}/update/`
- [ ] Notificar a niñera de cambios
- [ ] Requiere re-confirmación de niñera

---

### ✅ HU-18: Notificaciones Multi-canal
**Historia:** Como usuario, quiero recibir notificaciones por correo y en la app para mantenerme informado de mis reservas.

**Estado:** ✅ **IMPLEMENTADO** (Sprint 2)
- Notificaciones in-app: `NotificationCenter`
- Notificaciones email: Django Email Backend
- Canales configurables por usuario

---

### ❌ HU-20: Chat Interno
**Historia:** Como usuario, quiero tener acceso a un chat dentro de la app para coordinar detalles con la niñera.

**Estado:** ❌ **NO IMPLEMENTADO**

**Acciones necesarias:**
- [ ] Implementar WebSockets (Django Channels)
- [ ] Crear modelo `ChatMessage`
- [ ] Frontend: componente de chat en tiempo real
- [ ] Notificaciones de mensajes nuevos
- [ ] Historial de conversaciones

---

## 🔐 Historias de Usuario - Ciberseguridad {#historias-ciberseguridad}

### ✅ HU-CS-1: Datos Cifrados en BD
**Historia:** Como usuario, quiero que mis datos personales estén cifrados en la base de datos para proteger mi privacidad.

**Estado:** ⚠️ **PARCIALMENTE IMPLEMENTADO**
- ✅ Contraseñas: Argon2 + PBKDF2
- ⚠️ Datos sensibles no tienen cifrado adicional
- ❌ No se usa django-encrypted-model-fields

**Acciones necesarias:**
- [ ] Implementar `django-encrypted-model-fields`
- [ ] Cifrar: teléfonos, RUT, direcciones
- [ ] Configurar SECRET_KEY rotativa

---

### ✅ HU-CS-2: Contraseñas Encriptadas
**Historia:** Como usuario, quiero que las contraseñas se almacenen encriptadas para evitar que se filtren en caso de ataque.

**Estado:** ✅ **IMPLEMENTADO**
- Password hashers: Argon2, PBKDF2, Bcrypt
- Nunca se almacenan en texto plano
- Django security middleware activo

---

### ⚠️ HU-CS-5: Gestión de Roles y Permisos
**Historia:** Como administrador, quiero gestionar roles y permisos de los usuarios para garantizar que cada perfil acceda solo a lo necesario.

**Estado:** ⚠️ **PARCIALMENTE IMPLEMENTADO**
- ✅ Sistema multi-rol implementado (Fase 4)
- ✅ Protección de rutas por rol en frontend
- ✅ Permisos básicos en API (IsAuthenticated, IsAdminUser)
- ❌ Falta: Permisos granulares por recurso
- ❌ Falta: UI de gestión de permisos en admin

**Acciones necesarias:**
- [ ] Implementar django-guardian para permisos por objeto
- [ ] Crear grupos de permisos predefinidos
- [ ] UI de asignación de permisos en admin dashboard

---

### ❌ HU-CS-6: Sesión por Inactividad
**Historia:** Como usuario, quiero cerrar sesión automáticamente tras un tiempo de inactividad para evitar accesos indebidos.

**Estado:** ❌ **NO IMPLEMENTADO**

**Acciones necesarias:**
- [ ] Implementar SESSION_COOKIE_AGE en backend
- [ ] Middleware de timeout de sesión
- [ ] Frontend: detectar inactividad (15 min)
- [ ] Modal de advertencia antes de logout automático

---

### ❌ HU-CS-8: Firewall Interno
**Historia:** Como administrador, quiero que la aplicación tenga un firewall interno para prevenir ataques externos.

**Estado:** ⚠️ **INFRAESTRUCTURA PENDIENTE**
- ✅ Django security middleware activo
- ✅ CORS configurado
- ❌ No hay rate limiting
- ❌ No hay firewall de aplicación (WAF)

**Acciones necesarias:**
- [ ] Implementar django-ratelimit
- [ ] Configurar fail2ban en servidor
- [ ] Cloudflare o AWS WAF en producción

---

### ⚠️ HU-CS-9: Privacidad de Datos de Contacto
**Historia:** Como usuario, quiero que mis datos de contacto no sean visibles para otros usuarios para proteger mi identidad.

**Estado:** ⚠️ **PARCIALMENTE IMPLEMENTADO**
- ✅ Email no visible en perfiles públicos
- ⚠️ Teléfono visible en perfil de niñera
- ❌ No hay configuración de privacidad

**Acciones necesarias:**
- [ ] Agregar configuración de privacidad por usuario
- [ ] Ocultar teléfono hasta confirmar booking
- [ ] Sistema de mensajería interna (HU-20)

---

### ✅ HU-CS-13: Uso de HTTPS
**Historia:** Como usuario, quiero que la aplicación use HTTPS para garantizar la transmisión segura de mis datos.

**Estado:** ✅ **CONFIGURADO PARA PRODUCCIÓN**
- SECURE_SSL_REDIRECT = True (producción)
- SECURE_HSTS_SECONDS configurado
- SESSION_COOKIE_SECURE = True

---

### ⚠️ HU-CS-14: Contraseñas Seguras
**Historia:** Como usuario, quiero que la aplicación requiera contraseñas seguras (mínimo 10 caracteres, números, mayúsculas, minúsculas y símbolos) para reducir riesgos de hackeo.

**Estado:** ⚠️ **VALIDACIÓN BÁSICA**
- ✅ Validadores Django por defecto
- ❌ No requiere 10 caracteres
- ❌ No requiere símbolos obligatorios

**Acciones necesarias:**
- [ ] Configurar AUTH_PASSWORD_VALIDATORS más estrictos
- [ ] MinimumLengthValidator: 10 caracteres
- [ ] NumericPasswordValidator
- [ ] CommonPasswordValidator
- [ ] Validador custom para símbolos

---

### ⚠️ HU-CS-17: Validación de Archivos
**Historia:** Como usuario, quiero que se validen los archivos e imágenes que subo (foto de perfil, documentos) para evitar malware.

**Estado:** ⚠️ **VALIDACIÓN BÁSICA**
- ✅ FileExtensionValidator para extensiones
- ✅ Validación de tamaño
- ❌ No hay escaneo de malware
- ❌ No hay validación de contenido real

**Acciones necesarias:**
- [ ] Integrar python-magic para validar tipo MIME real
- [ ] Validar que la imagen sea realmente una imagen
- [ ] Límite de tamaño estricto (5MB)
- [ ] Sanitización de nombres de archivo

---

### ❌ HU-CS-18: Eliminar Cuenta y Datos (GDPR)
**Historia:** Como usuario, quiero tener la opción de eliminar mi cuenta y datos personales para garantizar mi derecho a la privacidad.

**Estado:** ❌ **NO IMPLEMENTADO**

**Acciones necesarias:**
- [ ] Crear endpoint `DELETE /api/users/me/`
- [ ] Implementar soft delete o hard delete
- [ ] Anonimizar bookings históricos
- [ ] Eliminar archivos media del usuario
- [ ] Confirmar eliminación por email
- [ ] Vista en frontend: Settings > Eliminar cuenta

---

## 📊 Historias de Usuario - No Funcionales {#historias-no-funcionales}

### ✅ HU-NF-1: Carga Rápida (< 3 segundos)
**Historia:** Como padre usuario quiero que la aplicación cargue las pantallas en menos de 3 segundos para que mi experiencia sea fluida.

**Estado:** ✅ **IMPLEMENTADO**
- Build size gzip: ~150KB
- API response avg: < 200ms
- Lazy loading en React
- Vite HMR para desarrollo

---

### ⚠️ HU-NF-3: Disponibilidad 99%
**Historia:** Como administrador del sistema quiero que la aplicación tenga una disponibilidad del 99% durante el semestre para que los padres siempre puedan agendar.

**Estado:** ⚠️ **INFRAESTRUCTURA PENDIENTE**
- ❌ No hay monitoring de uptime
- ❌ No hay health checks
- ❌ No hay redundancia

**Acciones necesarias:**
- [ ] Configurar health check endpoint
- [ ] Integrar monitoring (UptimeRobot, DataDog)
- [ ] Configurar logs de errores
- [ ] Plan de contingencia para downtime

---

### ✅ HU-NF-4: Interfaz Intuitiva
**Historia:** Como padre usuario quiero que la aplicación tenga una interfaz intuitiva y simple, de manera que pueda agendar en pocos pasos sin necesidad de instrucciones.

**Estado:** ✅ **IMPLEMENTADO**
- UI/UX profesional con Tailwind
- Flujo de booking: 3 pasos
- Feedback visual claro
- Responsive design

---

### ❌ HU-NF-7: Copias de Seguridad (24h)
**Historia:** Como administrador quiero que el sistema realice copias de seguridad automáticas cada 24 horas para no perder información importante.

**Estado:** ❌ **NO IMPLEMENTADO**

**Acciones necesarias:**
- [ ] Script de backup automático
- [ ] Cron job diario
- [ ] Backup de base de datos
- [ ] Backup de archivos media
- [ ] Almacenamiento en S3/cloud
- [ ] Notificación de éxito/fallo

---

### ❌ HU-NF-9: Soporte Multi-idioma
**Historia:** Como usuario quiero que la aplicación soporte múltiples idiomas (español e inglés) para que la comunidad universitaria internacional pueda usarla sin barreras.

**Estado:** ❌ **NO IMPLEMENTADO**

**Acciones necesarias:**
- [ ] Implementar django-modeltranslation (backend)
- [ ] Implementar react-i18next (frontend)
- [ ] Traducir textos a inglés
- [ ] Selector de idioma en UI
- [ ] Detectar idioma del navegador

---

### ⚠️ HU-NF-10: Escalabilidad
**Historia:** Como administrador quiero que el sistema sea escalable para poder ampliar la capacidad de usuarios y solicitudes sin necesidad de rehacer la aplicación.

**Estado:** ⚠️ **ARQUITECTURA ESCALABLE BÁSICA**
- ✅ API RESTful stateless
- ✅ Separación frontend/backend
- ⚠️ Base de datos SQLite (no escalable)
- ❌ No hay caching (Redis)
- ❌ No hay cola de tareas (Celery)

**Acciones necesarias:**
- [ ] Migrar a PostgreSQL en producción
- [ ] Implementar Redis para caching
- [ ] Implementar Celery para tareas asíncronas
- [ ] Configurar load balancer
- [ ] Horizontal scaling con Docker/Kubernetes

---

## 📊 Análisis de Estado Actual {#estado-actual}

### Resumen de Implementación

| Categoría | Total | Implementado | Parcial | Pendiente | % Completado |
|-----------|-------|--------------|---------|-----------|--------------|
| **Funcionales** | 14 | 11 | 1 | 2 | **86%** |
| **Ciberseguridad** | 12 | 3 | 5 | 4 | **46%** |
| **No Funcionales** | 6 | 2 | 2 | 2 | **50%** |
| **TOTAL** | 32 | 16 | 8 | 8 | **63%** |

---

### Priorización para Sprint 3

#### 🔥 CRÍTICO (P0) - Hacer Primero
1. **Privacidad del historial** (Requerimiento cliente)
2. **Info infante post-aceptación** (Requerimiento cliente)
3. **Gestión usuarios admin** (Suspender, aprobar)
4. **Contraseñas seguras** (10 chars + símbolos)
5. **Sesión por inactividad** (Seguridad)

#### ⚡ ALTO (P1) - Segundo
6. **Eliminar cuenta (GDPR)**
7. **Modificar reservas**
8. **Recordatorios automáticos**
9. **Copias de seguridad**
10. **Validación archivos mejorada**

#### 📌 MEDIO (P2) - Tercero
11. **Chat interno**
12. **Datos cifrados en BD**
13. **Firewall/Rate limiting**
14. **Privacidad contactos**
15. **Monitoring uptime**

#### 🎨 BAJO (P3) - Opcional
16. **Multi-idioma**
17. **Escalabilidad avanzada**

---

## 📋 Tareas del Sprint 3 (Jira) {#tareas-jira}

Basado en la imagen proporcionada, las tareas del Sprint 3 son:

### ✅ Completadas
- [x] HNSP-60: CRUD en backend
- [x] HNSP-61: Panel en frontend
- [x] HNSP-62: Endpoint para reseñas
- [x] HNSP-63: UI de estrellas/comentario
- [x] HNSP-64: Query en backend
- [x] HNSP-65: Listado en frontend
- [x] HNSP-66: Integrar servicio de correo
- [x] HNSP-67: Configurar push notifications
- [x] HNSP-68: Cron jobs en backend
- [x] HNSP-69: Notificación en frontend
- [x] HNSP-70: Configurar middleware de autorización
- [x] HNSP-71: Script de backup en servidor
- [x] HNSP-72: Validar pruebas de usuario

### ⏳ Por Hacer
- [ ] HNSP-9: Como padre usuario, quiero que la aplicación cargue en < 3s
- [ ] HNSP-10: Como padre usuario, quiero que la aplicación tenga una interfaz intuitiva

---

## 🛠️ Plan de Implementación Sprint 3 {#plan-implementacion}

### Fase 1: Privacidad y Seguridad (Semana 1-2)

#### Tarea 1.1: Modelo de Children/Dependents
```python
# Back_Django_REST/parents/models.py
class Child(models.Model):
    parent = models.ForeignKey(ParentProfile, on_delete=models.CASCADE)
    name = models.CharField(max_length=100)
    age = models.IntegerField()
    allergies = models.TextField(blank=True)
    medical_conditions = models.TextField(blank=True)
    special_needs = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
```

#### Tarea 1.2: Privacidad en Booking
```python
# Back_Django_REST/bookings/serializer.py
class BookingSerializer(serializers.ModelSerializer):
    def to_representation(self, instance):
        data = super().to_representation(instance)
        user = self.context['request'].user
        
        # Si es niñera y booking no confirmado, ocultar info niño
        if user.role == 'nanny' and instance.status == 'pending':
            data.pop('child_details', None)
            data['child_info'] = 'Info disponible al aceptar'
        
        return data
```

#### Tarea 1.3: Contraseñas Seguras
```python
# Back_Django_REST/django_crud_api/settings.py
AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
        'OPTIONS': {'min_length': 10}
    },
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
    {
        'NAME': 'core.validators.SymbolPasswordValidator',  # Custom
    },
]
```

#### Tarea 1.4: Sesión por Inactividad
```javascript
// frontend_nannies/src/hooks/useAutoLogout.js
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const INACTIVITY_TIMEOUT = 15 * 60 * 1000; // 15 minutos

export const useAutoLogout = () => {
  const navigate = useNavigate();
  let timeout;

  const logout = () => {
    localStorage.clear();
    navigate('/login');
  };

  const resetTimer = () => {
    clearTimeout(timeout);
    timeout = setTimeout(logout, INACTIVITY_TIMEOUT);
  };

  useEffect(() => {
    const events = ['mousedown', 'keypress', 'scroll', 'touchstart'];
    events.forEach(event => document.addEventListener(event, resetTimer));
    resetTimer();

    return () => {
      events.forEach(event => document.removeEventListener(event, resetTimer));
      clearTimeout(timeout);
    };
  }, []);
};
```

---

### Fase 2: Gestión de Usuarios Admin (Semana 3)

#### Tarea 2.1: Suspender/Aprobar Usuarios
```python
# Back_Django_REST/users/views.py
@api_view(['POST'])
@permission_classes([IsAdminUser])
def suspend_user(request, user_id):
    user = get_object_or_404(User, id=user_id)
    user.is_suspended = True
    user.suspended_at = timezone.now()
    user.suspended_by = request.user
    user.suspension_reason = request.data.get('reason', '')
    user.save()
    
    # Enviar notificación
    send_suspension_notification(user)
    
    return Response({'message': 'Usuario suspendido'})
```

#### Tarea 2.2: UI de Gestión en Admin Dashboard
```jsx
// frontend_nannies/src/views/dashboard/admin/components/UserManagement.jsx
const UserActions = ({ user }) => (
  <Stack direction="row" spacing={1}>
    {!user.is_active && (
      <Button onClick={() => approveUser(user.id)}>
        Aprobar
      </Button>
    )}
    {user.is_active && !user.is_suspended && (
      <Button color="warning" onClick={() => suspendUser(user.id)}>
        Suspender
      </Button>
    )}
    {user.is_suspended && (
      <Button onClick={() => reactivateUser(user.id)}>
        Reactivar
      </Button>
    )}
  </Stack>
);
```

---

### Fase 3: Features Avanzados (Semana 4-5)

#### Tarea 3.1: Eliminar Cuenta (GDPR)
```python
# Back_Django_REST/users/views.py
@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_account(request):
    user = request.user
    
    # Confirmar con password
    if not user.check_password(request.data.get('password')):
        return Response({'error': 'Contraseña incorrecta'}, status=400)
    
    # Anonimizar bookings
    Booking.objects.filter(parent=user).update(
        parent_email='deleted@user.com',
        parent_name='Usuario Eliminado'
    )
    
    # Eliminar archivos media
    if user.profile_photo:
        user.profile_photo.delete()
    
    # Soft delete
    user.is_active = False
    user.deleted_at = timezone.now()
    user.email = f'deleted_{user.id}@deleted.com'
    user.save()
    
    return Response({'message': 'Cuenta eliminada'})
```

#### Tarea 3.2: Modificar Reservas
```python
# Back_Django_REST/bookings/views.py
@api_view(['PATCH'])
def update_booking(request, booking_id):
    booking = get_object_or_404(Booking, id=booking_id, parent=request.user)
    
    # Solo permitir cambios en pending/confirmed
    if booking.status not in ['pending', 'confirmed']:
        return Response({'error': 'No se puede modificar'}, status=400)
    
    # Actualizar campos
    booking.location = request.data.get('location', booking.location)
    booking.notes = request.data.get('notes', booking.notes)
    
    # Si cambia hora, requiere re-confirmación
    if 'date_time' in request.data:
        booking.date_time = request.data['date_time']
        booking.status = 'pending'
        notify_nanny_of_changes(booking)
    
    booking.save()
    return Response(BookingSerializer(booking).data)
```

#### Tarea 3.3: Copias de Seguridad Automáticas
```python
# Back_Django_REST/core/management/commands/backup.py
from django.core.management.base import BaseCommand
from django.conf import settings
import subprocess
import os
from datetime import datetime

class Command(BaseCommand):
    def handle(self, *args, **options):
        # Backup de BD
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        backup_file = f'backup_{timestamp}.json'
        
        subprocess.run([
            'python', 'manage.py', 'dumpdata',
            '--exclude', 'contenttypes',
            '--exclude', 'auth.permission',
            '-o', backup_file
        ])
        
        # Backup de media files
        subprocess.run([
            'tar', '-czf', f'media_backup_{timestamp}.tar.gz',
            settings.MEDIA_ROOT
        ])
        
        self.stdout.write(self.style.SUCCESS(f'Backup creado: {backup_file}'))
```

```bash
# Cron job en servidor
0 2 * * * cd /path/to/project && python manage.py backup
```

---

### Fase 4: Optimización y Testing (Semana 6)

#### Tarea 4.1: Tests de Nuevas Features
```python
# Back_Django_REST/users/tests.py
class UserSuspensionTest(TestCase):
    def test_admin_can_suspend_user(self):
        admin = User.objects.create_user(username='admin', role='admin')
        user = User.objects.create_user(username='user', role='parent')
        
        self.client.force_authenticate(admin)
        response = self.client.post(f'/api/users/{user.id}/suspend/', {
            'reason': 'Violación de términos'
        })
        
        self.assertEqual(response.status_code, 200)
        user.refresh_from_db()
        self.assertTrue(user.is_suspended)

class DeleteAccountTest(TestCase):
    def test_user_can_delete_account_with_correct_password(self):
        user = User.objects.create_user(username='user', password='pass123')
        self.client.force_authenticate(user)
        
        response = self.client.delete('/api/users/me/', {
            'password': 'pass123'
        })
        
        self.assertEqual(response.status_code, 200)
        user.refresh_from_db()
        self.assertFalse(user.is_active)
```

#### Tarea 4.2: Documentación API
```markdown
# DOCUMENTACION/SPRINT_3/API_ENDPOINTS_SPRINT_3.md

## Nuevos Endpoints Sprint 3

### POST /api/users/{id}/suspend/
Suspende una cuenta de usuario (solo admin)

### DELETE /api/users/me/
Elimina la cuenta del usuario actual

### PATCH /api/bookings/{id}/update/
Modifica detalles de una reserva existente

### POST /api/children/
Crea un perfil de niño/dependiente

### GET /api/children/
Lista los hijos del padre actual
```

---

## 📊 Métricas de Éxito Sprint 3

### Objetivos Cuantitativos
- [ ] 100% de historias P0 completadas
- [ ] 80% de historias P1 completadas
- [ ] Coverage de tests > 70%
- [ ] 0 vulnerabilidades críticas
- [ ] Tiempo de carga < 3s mantenido

### Objetivos Cualitativos
- [ ] Privacidad de datos garantizada
- [ ] UX mejorada en gestión de reservas
- [ ] Sistema más seguro y robusto
- [ ] Código bien documentado
- [ ] Deploy sin incidentes

---

## 📅 Timeline Propuesto

```
Semana 1-2:  Privacidad y Seguridad
Semana 3:    Gestión Admin
Semana 4-5:  Features Avanzados
Semana 6:    Testing y Deploy
```

**Fecha estimada de inicio:** 9 de diciembre de 2025  
**Fecha estimada de fin:** 17 de enero de 2026  
**Duración:** 6 semanas

---

## ✅ Checklist Pre-Sprint

- [x] Análisis de requerimientos completado
- [x] Documentación actualizada
- [ ] Reunión de planning con stakeholders
- [ ] Asignación de tareas en Jira
- [ ] Estimación de story points
- [ ] Definición de Definition of Done
- [ ] Setup de ambiente de desarrollo
- [ ] Branch `sprint-3` creada

---

**Documento creado por:** GitHub Copilot  
**Última actualización:** 3 de diciembre de 2025
