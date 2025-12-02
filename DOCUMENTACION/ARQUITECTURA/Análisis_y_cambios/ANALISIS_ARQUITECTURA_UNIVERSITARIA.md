# Análisis Arquitectónico: Home Nannies - Sistema Universitario

**Fecha:** 20 de noviembre de 2025  
**Versión:** 1.0  
**Estado:** Análisis Arquitectónico Inicial

---

## 1. CONTEXTO Y ALCANCE

### 1.1 Descripción General
Home Nannies es un **sistema de gestión de niñeras interno para instituciones universitarias** que permite a estudiantes, docentes y funcionarios acceder a servicios de cuidado infantil mientras se enfocan en sus actividades académicas y laborales.

### 1.2 Objetivos Principales
- ✅ Conectar padres/madres universitarios con niñeras (estudiantes de educación)
- ✅ Validación institucional mediante correo y documentación
- ✅ Gestión de reservas y disponibilidades
- ✅ Sistema de calificaciones y favoritos
- ✅ Comunicación coordinada (chat, notificaciones)
- ✅ Restricciones geográficas y de horario

### 1.3 Usuarios Objetivo
| Rol | Descripción | Validación Requerida |
|-----|-------------|----------------------|
| **Padre/Madre** | Estudiante, docente o funcionario con hijos | Correo institucional, RUT, Certificado de matrícula |
| **Niñera** | Estudiante de carrera Educación | Correo institucional, RUT, Certificado matrícula, Validación programa |
| **Administrador** | Personal universitario | Asignación manual por admin |

---

## 2. ARQUITECTURA ACTUAL vs REQUERIDA

### 2.1 Estado Actual del Sistema
```
Frontend (React + Vite)
├── Dashboards por rol ✅
├── Profiles editables ✅
└── Header con menú ✅

Backend (Django REST)
├── Autenticación JWT ✅
├── Modelos: User, Nanny, Booking, Review, Favorite ✅
└── Endpoints básicos ✅

Restricciones
└── Solo roles (parent, nanny, admin) ✅
```

### 2.2 Cambios Requeridos
```
NUEVOS MODELOS:
├── UniversityProgram (Carrera/Programa)
├── EducationProgram (Programa específico de Educación)
├── StudentVerification (Validación de estudiante)
├── DocumentVerification (RUT, Certificado matrícula)
├── LocationRestriction (Dependencias universitarias)
├── OperatingHours (Horario operativo)
└── ChatMessage (Sistema de mensajería)

NUEVAS VALIDACIONES:
├── Verificación correo institucional (@universidad.edu.co)
├── Validación de documentos (RUT, certificado)
├── Confirmación de programa académico
├── Restricción geográfica (GPS/dependencias)
├── Restricción de horario (solo horas de funcionamiento)
└── Validación de edad mínima para niñeras

NUEVAS FUNCIONALIDADES:
├── Sistema de chat en tiempo real
├── Notificaciones push/email
├── Recordatorios automáticos
├── Cifrado de datos sensibles
├── Control de privacidad (solo datos del padre, no del niño)
├── Aceptación de encargos antes de compartir info del niño
└── Historial auditado
```

---

## 3. REQUERIMIENTOS FUNCIONALES DETALLADOS

### 3.1 Gestión de Usuarios (Padre/Madre)

#### RF-PAD-001: Registro como Padre
**Historia de Usuario:** Como padre/madre, quiero registrarme en la aplicación para poder usar el servicio de niñeras.

**Requisitos:**
- Correo institucional obligatorio (@universidad.edu.co)
- Validación de RUT contra base de datos
- Carga de certificado de matrícula en vigor
- Aceptación de términos y condiciones
- Verificación por email

**Datos a Capturar:**
```json
{
  "email": "padre@universidad.edu.co",
  "nombre": "Juan Pérez",
  "rut": "12345678-9",
  "telefono": "+56987654321",
  "num_hijos": 2,
  "documento_matricula": "file.pdf",
  "programa": "Doctorado en Ingeniería",
  "fecha_vencimiento_matricula": "2025-12-31"
}
```

#### RF-PAD-002: Perfil Padre Protegido
**Requisito:** El historial de la niñera solo ve los datos del padre, NO del infante.

**Restricciones:**
- Niñera NO puede ver: nombres de hijos, fotos, fecha nacimiento
- Niñera SOLO ve: nombre padre, teléfono, ubicación punto de encuentro
- Solo después de aceptar encargo: info mínima del cuidado necesario

#### RF-PAD-003: Privacidad de Información de Niños
**Historia de Usuario:** Los padres pueden permitir dar información de los niños solo si la niñera acepta el encargo.

**Flujo:**
1. Padre crea reserva
2. Niñera recibe solicitud (sin datos de niños)
3. Niñera **ACEPTA** solicitud
4. Sistema notifica: "Comparte info de tu hijo/a"
5. Padre decide compartir detalles

---

### 3.2 Gestión de Usuarios (Niñera)

#### RF-NIN-001: Registro como Niñera
**Historia de Usuario:** Como niñera, quiero registrarme en la aplicación para ofrecer servicios.

**Validaciones Específicas:**
- Correo institucional (@universidad.edu.co)
- RUT obligatorio
- Certificado matrícula activa
- **VALIDACIÓN CRÍTICA:** Programa académico = "Educación" o similar
- Edad mínima: 18 años

**Datos Adicionales:**
```json
{
  "email": "niñera@universidad.edu.co",
  "nombre": "María González",
  "rut": "11223344-5",
  "programa": "Licenciatura en Educación Inicial",
  "semestre": 4,
  "documento_matricula": "file.pdf",
  "especialidades": ["Educación Inicial", "Primaria"],
  "edad_minima_cuidado": "3 meses",
  "edad_maxima_cuidado": "12 años",
  "tasa_horaria": 25000
}
```

#### RF-NIN-002: Gestión de Disponibilidad
**Historia de Usuario:** Como niñera, quiero registrar mis horarios disponibles para que los padres sepan cuándo puedo trabajar.

**Restricciones:**
- Solo durante horario operativo universidad (08:00 - 20:00 lunes-viernes)
- Solo en dependencias universitarias
- Validación: no puede superponer reservas

#### RF-NIN-003: Notificaciones de Reservas
**Historia de Usuario:** Como niñera, quiero recibir notificaciones de nuevas reservas para estar informada de mis compromisos.

**Notificaciones:**
- Push en app (en tiempo real)
- Email (inmediato)
- SMS (si disponible)

#### RF-NIN-004: Aceptar/Rechazar Solicitudes
**Historia de Usuario:** Como niñera, quiero aceptar o rechazar solicitudes para tener control sobre mi disponibilidad.

**Estados de Solicitud:**
- PENDIENTE → Niñera tiene 2 horas para responder
- ACEPTADA → Niñera acepta, espera info del niño
- RECHAZADA → Niñera rechaza, sistema busca alternativas
- CANCELADA → Padre cancela
- COMPLETADA → Servicio terminado

---

### 3.3 Gestión de Reservas (Padre/Madre)

#### RF-RES-001: Agendar Niñera
**Historia de Usuario:** Como padre/madre, quiero agendar una niñera en un día y hora específica para asegurar cuidado en los momentos que lo necesito.

**Validaciones:**
- Solo horario operativo (08:00 - 20:00, lunes-viernes)
- Solo en dependencias universitarias
- Niñera disponible en ese horario
- Mínimo 24 horas de anticipación

**Datos de Reserva:**
```json
{
  "padre_id": 1,
  "niñera_id": 5,
  "fecha_inicio": "2025-11-25 14:00:00",
  "fecha_fin": "2025-11-25 16:00:00",
  "ubicacion": "Sala 205, Edificio A",
  "duracion_horas": 2,
  "precio_total": 50000,
  "estado": "PENDIENTE"
}
```

#### RF-RES-002: Filtrar Niñeras por Disponibilidad
**Historia de Usuario:** Como padre/madre, quiero filtrar niñeras por disponibilidad para encontrar rápidamente quién puede cuidar en mi horario requerido.

**Filtros:**
- Fecha y hora
- Ubicación (dependencia)
- Rango de precio
- Calificación mínima
- Edad de cuidado
- Especialidades

#### RF-RES-003: Confirmación de Reserva
**Historia de Usuario:** Como padre/madre, quiero recibir una confirmación de la reserva para estar seguro de que la niñera atenderá a mi hijo/a.

**Notificación:**
- Email con detalles completos
- QR de verificación
- Datos contacto niñera (solo después de aceptación)

#### RF-RES-004: Modificar Reserva
**Historia de Usuario:** Como padre/madre, quiero modificar los detalles de una reserva (hora o lugar dentro del campus) para ajustar cambios sin cancelar todo.

**Limitaciones:**
- Solo si niñera no ha confirmado
- Cambios menores de horario (máximo ±30 minutos)
- Ubicación dentro del campus universitario

---

### 3.4 Sistema de Evaluación y Favoritos

#### RF-CAL-001: Calificar Servicio
**Historia de Usuario:** Como padre/madre, quiero calificar el servicio de una niñera para ayudar a otros usuarios a elegir con confianza.

**Sistema de Calificación:**
- Escala 1-5 estrellas
- Comentario (máx 500 caracteres)
- Dimensiones: puntualidad, responsabilidad, comunicación
- Anónimo (solo admin ve nombre del padre)

#### RF-FAV-001: Guardar Favoritos
**Historia de Usuario:** Como padre/madre, quiero guardar niñeras como favoritas para reservarlas fácilmente en futuras ocasiones.

**Funcionalidad:**
- Botón "Favorito" en perfil de niñera
- Lista de favoritos en dashboard
- Filtro "Solo favoritos" al buscar

---

### 3.5 Comunicación y Notificaciones

#### RF-COM-001: Sistema de Chat
**Historia de Usuario:** Como usuario, quiero tener acceso a un chat dentro de la app para coordinar detalles con la niñera.

**Características:**
- Chat en tiempo real (WebSocket)
- Historial de conversaciones
- Mensajes archivados
- Notificaciones de nuevos mensajes
- Typing indicator

**Protección de Privacidad en Chat:**
- No se pueden compartir números personales directos
- Solo coordinación a través de la app
- Admin puede revisar en caso de reporte

#### RF-NOT-001: Notificaciones Multicanal
**Historia de Usuario:** Como usuario, quiero recibir notificaciones por correo y en la app para mantenerme informado de mis reservas.

**Canales:**
- Push (aplicación en tiempo real)
- Email (resumen)
- SMS (confirmaciones críticas)

**Eventos que disparan notificaciones:**
- Solicitud de reserva recibida (niñera)
- Reserva confirmada (padre)
- Recordatorio 1 hora antes
- Reserva completada
- Nueva calificación recibida

#### RF-REC-001: Recordatorios Automáticos
**Historia de Usuario:** Como niñera, quiero recibir recordatorios previos a mis reservas para no olvidar mis compromisos.

**Recordatorios:**
- 24 horas antes: email
- 1 hora antes: push + email
- 15 minutos antes: push

---

### 3.6 Gestión de Administrador

#### RF-ADM-001: Estadísticas de Uso
**Historia de Usuario:** Como administrador, quiero ver estadísticas de uso (número de reservas, usuarios activos) para monitorear el impacto del servicio.

**Dashboard:**
- Total de reservas (período)
- Usuarios activos
- Ingresos generados
- Calificación promedio
- Gráficos de uso por hora/día/semana

#### RF-ADM-002: Gestión de Usuarios
**Historia de Usuario:** Como administrador, quiero gestionar usuarios (aprobar, suspender, eliminar) para mantener el orden y cumplimiento de las reglas.

**Acciones:**
- Aprobar registro (validar documentos)
- Suspender (temporal/indefinida)
- Eliminar (con auditoría)
- Resetear contraseña
- Ver historial de actividades

#### RF-ADM-003: Verificación de Documentos
**Requisito:** Validación de documentos cargados

**Proceso:**
1. Usuario carga PDF (RUT, certificado matrícula)
2. Admin revisa documento
3. Admin marca como: Válido / Rechazar / Pedir reenvío
4. Sistema bloquea operaciones si documento inválido

---

## 4. REQUERIMIENTOS NO FUNCIONALES

### 4.1 Rendimiento
| Requisito | Especificación |
|-----------|----------------|
| Tiempo de carga | < 3 segundos por página |
| API response | < 500ms para búsquedas |
| Chat latencia | < 100ms mensajes |
| Disponibilidad | 99% durante semestre |

### 4.2 Seguridad
| Requisito | Especificación |
|-----------|----------------|
| Encriptación datos | AES-256 para info sensible |
| Contraseñas | Mín 10 caracteres, números, mayúsculas, minúsculas, símbolos |
| Transmisión | HTTPS/TLS 1.3 obligatorio |
| Sesiones | Timeout 30 minutos inactividad |
| Firewall | WAF interno, rate limiting |
| Validación archivos | Escaneo malware, extensiones permitidas |

### 4.3 Privacidad
| Requisito | Especificación |
|-----------|----------------|
| Privacidad datos | GDPR/LGPD compliant |
| Eliminación cuenta | Derecho al olvido (30 días) |
| Cifrado DB | Todos campos sensibles |
| Auditoría | Log de todos accesos a datos sensibles |
| Datos niños | NO visibles a niñera hasta aceptación |

### 4.4 Disponibilidad y Mantenimiento
| Requisito | Especificación |
|-----------|----------------|
| Backups | Cada 24 horas, replicación |
| RTO | < 4 horas |
| RPO | < 1 hora |
| Logs | Retención 90 días |

### 4.5 Escalabilidad
| Requisito | Especificación |
|-----------|----------------|
| Usuarios concurrentes | Mínimo 1000 |
| Reservas/día | Escalar a 10,000+ |
| Almacenamiento | Estructura para crecimiento |
| CDN | Para archivos estáticos |

### 4.6 Internacionalización
| Requisito | Especificación |
|-----------|----------------|
| Idiomas | Español, Inglés (inicialmente) |
| Zonas horarias | Relativa a ubicación universidad |
| Formatos | Fecha, moneda, distancia localizadas |

---

## 5. RESTRICCIONES TÉCNICAS

### 5.1 Restricciones Geográficas
```python
# Solo dentro del campus
ALLOWED_CAMPUS_LOCATIONS = [
    {
        "name": "Campus Principal",
        "latitude": -33.4489,
        "longitude": -70.6693,
        "radius_meters": 2000  # 2km radio
    },
    {
        "name": "Centro de Extensión",
        "latitude": -33.4450,
        "longitude": -70.6650,
        "radius_meters": 1000
    }
]
```

### 5.2 Restricciones de Horario
```python
# Horario operativo
OPERATING_HOURS = {
    "monday_to_friday": {
        "start": "08:00",
        "end": "20:00"
    },
    "saturday": "CLOSED",
    "sunday": "CLOSED",
    "holidays": "CLOSED"
}

# Anticipación mínima
MINIMUM_BOOKING_ADVANCE_HOURS = 24
```

### 5.3 Restricciones de Niñera
```python
NANNY_REQUIREMENTS = {
    "program": "Educación",  # Carrera específica
    "min_age": 18,
    "active_enrollment": True,  # Matrícula vigente
    "email_domain": "@universidad.edu.co",
    "max_overlapping_bookings": 1,  # No sobrecargar
    "min_response_time": 120  # minutos para aceptar/rechazar
}
```

---

## 6. IMPACTO EN MODELOS DJANGO

### 6.1 Nuevos Modelos Requeridos

#### UniversityProgram
```python
class UniversityProgram(models.Model):
    name = models.CharField(max_length=200)  # "Educación Inicial", "Doctorado"
    code = models.CharField(max_length=50, unique=True)
    is_education = models.BooleanField(default=False)  # Es programa de Educación?
    description = models.TextField()
    active = models.BooleanField(default=True)
    
    class Meta:
        db_table = 'university_programs'
```

#### StudentVerification
```python
class StudentVerification(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    program = models.ForeignKey(UniversityProgram, on_delete=models.PROTECT)
    rut = models.CharField(max_length=20, unique=True)
    enrollment_certificate = models.FileField(upload_to='documents/enrollment/')
    enrollment_expiry = models.DateField()
    verified = models.BooleanField(default=False)
    verified_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='verified_students')
    verified_date = models.DateTimeField(null=True)
    rejection_reason = models.TextField(blank=True)
    
    class Meta:
        db_table = 'student_verifications'
```

#### LocationRestriction
```python
class LocationRestriction(models.Model):
    name = models.CharField(max_length=200)
    latitude = models.DecimalField(max_digits=9, decimal_places=6)
    longitude = models.DecimalField(max_digits=9, decimal_places=6)
    radius_meters = models.IntegerField()
    active = models.BooleanField(default=True)
    
    class Meta:
        db_table = 'location_restrictions'
```

#### OperatingHours
```python
class OperatingHours(models.Model):
    day_of_week = models.IntegerField(choices=[(i, day) for i, day in enumerate(['Lunes', 'Martes', ...])])
    start_time = models.TimeField()
    end_time = models.TimeField()
    is_open = models.BooleanField(default=True)
    
    class Meta:
        db_table = 'operating_hours'
```

#### ChatMessage
```python
class ChatMessage(models.Model):
    booking = models.ForeignKey(Booking, on_delete=models.CASCADE, related_name='chat_messages')
    sender = models.ForeignKey(User, on_delete=models.CASCADE)
    content = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)
    read = models.BooleanField(default=False)
    
    class Meta:
        db_table = 'chat_messages'
        ordering = ['timestamp']
```

### 6.2 Modificaciones a Modelos Existentes

#### User
```python
# Agregar campos
email_verified = models.BooleanField(default=False)
email_verification_token = models.CharField(max_length=255, blank=True)
institutional_email = models.EmailField(unique=True)  # Reemplazar email normal
require_mfa = models.BooleanField(default=False)
mfa_secret = models.CharField(max_length=255, blank=True)
last_login_location = models.ForeignKey(LocationRestriction, null=True)
```

#### Booking
```python
# Agregar campos
share_child_info = models.BooleanField(default=False)  # Padre autorizó compartir info?
child_info_shared_date = models.DateTimeField(null=True)
modification_count = models.IntegerField(default=0)
audit_log = models.JSONField(default=dict)  # Log de cambios
```

#### Review
```python
# Modificar
parent_name_visible = models.BooleanField(default=False)  # Anónimo al niñera?
dimensions = models.JSONField(  # Calificación por dimensiones
    default={
        "punctuality": 0,
        "responsibility": 0,
        "communication": 0
    }
)
```

---

## 7. CAMBIOS EN FRONTEND

### 7.1 Componentes de Registro/Validación
```
components/
├── auth/
│   ├── InstitutionalEmailVerification.jsx
│   ├── DocumentUpload.jsx
│   ├── RUTValidator.jsx
│   └── EnrollmentCertificateUpload.jsx
├── validation/
│   ├── LocationValidator.jsx
│   └── OperatingHoursValidator.jsx
└── chat/
    ├── ChatInterface.jsx
    ├── ChatWindow.jsx
    └── MessageInput.jsx
```

### 7.2 Vistas Nuevas/Modificadas
```
views/
├── registration/
│   ├── RegisterParent.jsx (con validaciones)
│   ├── RegisterNanny.jsx (con validación programa)
│   └── DocumentVerification.jsx
├── chat/
│   └── ChatView.jsx
├── admin/
│   ├── AdminDashboard.jsx (con estadísticas)
│   ├── UserApproval.jsx
│   ├── DocumentReview.jsx
│   └── UserManagement.jsx
└── restricted/
    ├── LocationRestricted.jsx
    └── HourRestricted.jsx
```

---

## 8. IMPACTO EN BACKEND

### 8.1 Nuevos Endpoints

#### Autenticación Institucional
```
POST /api/auth/register/parent/
POST /api/auth/register/nanny/
POST /api/auth/verify-email/
POST /api/auth/verify-documents/
GET /api/auth/verify-status/
```

#### Gestión de Disponibilidad (Niñera)
```
POST /api/nanny/availability/
GET /api/nanny/availability/
PUT /api/nanny/availability/{id}/
DELETE /api/nanny/availability/{id}/
```

#### Búsqueda y Filtrado
```
GET /api/nannies/search/?date=2025-11-25&time=14:00&location=1
GET /api/nannies/{id}/
```

#### Reservas
```
POST /api/bookings/
GET /api/bookings/
PUT /api/bookings/{id}/
DELETE /api/bookings/{id}/
PATCH /api/bookings/{id}/modify/
PATCH /api/bookings/{id}/share-child-info/
PATCH /api/bookings/{id}/accept/
PATCH /api/bookings/{id}/reject/
```

#### Chat
```
POST /api/chat/messages/
GET /api/chat/conversations/
GET /api/chat/messages/?booking={booking_id}
```

#### Administrativo
```
GET /api/admin/statistics/
GET /api/admin/pending-verifications/
PATCH /api/admin/verify-user/{id}/
PATCH /api/admin/suspend-user/{id}/
DELETE /api/admin/user/{id}/
```

### 8.2 Validadores Personalizados
```python
# validators.py
- validate_institutional_email()
- validate_rut()
- validate_enrollment_certificate()
- validate_location_restriction()
- validate_operating_hours()
- validate_program_is_education()
- validate_document_file()
```

### 8.3 Middleware y Servicios
```python
# middleware.py
- LocationRestrictionMiddleware
- OperatingHoursMiddleware
- RateLimitMiddleware

# services.py
- EmailVerificationService
- DocumentProcessingService
- NotificationService
- ChatService
- LocationService
- AuditLogService
```

---

## 9. PLAN DE IMPLEMENTACIÓN FASEADO

### **Fase 1: Validación Institucional (Sprint 1-2)**
- [ ] Modelos de validación de estudiante
- [ ] Endpoints de registro con validación
- [ ] Upload de documentos
- [ ] Verificación de correo institucional

### **Fase 2: Restricciones Geográficas y Horarias (Sprint 2-3)**
- [ ] Modelos de ubicación y horario
- [ ] Validadores de restricciones
- [ ] Interfaz de búsqueda mejorada
- [ ] Protección de endpoints

### **Fase 3: Privacidad de Datos (Sprint 3-4)**
- [ ] Modelo de compartición de info
- [ ] Workflow de aceptación de encargos
- [ ] Protección de datos de niños
- [ ] Auditoría de accesos

### **Fase 4: Sistema de Chat (Sprint 4-5)**
- [ ] Modelo de mensajes
- [ ] Endpoint de chat
- [ ] Interfaz en tiempo real (WebSocket)
- [ ] Notificaciones

### **Fase 5: Admin y Estadísticas (Sprint 5-6)**
- [ ] Dashboard de admin mejorado
- [ ] Sistema de aprobación de usuarios
- [ ] Estadísticas y reportes
- [ ] Gestión de documentos

### **Fase 6: Seguridad y Cifrado (Sprint 6-7)**
- [ ] Implementar AES-256
- [ ] Validación de contraseñas fuerte
- [ ] MFA (opcional)
- [ ] Auditoría completa

### **Fase 7: Notificaciones Multicanal (Sprint 7-8)**
- [ ] Sistema de email
- [ ] Push notifications
- [ ] SMS (si aplica)
- [ ] Recordatorios automáticos

### **Fase 8: Testing y Deployment (Sprint 8+)**
- [ ] Tests unitarios
- [ ] Tests integración
- [ ] Performance testing
- [ ] Security audit
- [ ] Deployment a producción

---

## 10. RIESGOS Y CONSIDERACIONES

### 10.1 Riesgos Técnicos
| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|-------------|--------|-----------|
| Validación de documentos manual (cuello de botella) | Alta | Medio | Automatizar con OCR |
| Restricción GPS (precisión) | Media | Bajo | Usar WiFi + GPS |
| Chat en tiempo real (escalabilidad) | Media | Alto | WebSocket pool, Redis |
| Volumen de notificaciones | Baja | Alto | Queue system (Celery) |

### 10.2 Riesgos de Privacidad
| Riesgo | Mitigación |
|--------|-----------|
| Filtración de datos niños | Compartición controlada, cifrado, auditoría |
| Exposición de email | Validación institucional, no mostrar al público |
| Datos en tránsito | HTTPS obligatorio, TLS 1.3 |

### 10.3 Riesgos Operacionales
| Riesgo | Mitigación |
|--------|-----------|
| Rechazo de niñeras no calificadas | Validación automática programa |
| Abuso del sistema | Rate limiting, reportes, moderación |
| Sobrecarga administrativa | Automatizar verificaciones |

---

## 11. CONCLUSIONES Y PRÓXIMOS PASOS

### 11.1 Cambios Críticos
1. **Validación institucional** es el eje central
2. **Privacidad de datos de niños** es requisito GDPR
3. **Restricciones geográficas/horarias** limitan scope pero mejoran calidad
4. **Sistema de chat** es diferenciador clave

### 11.2 Prioridades
1. ✅ Fase 1: Validación (bloquea todo lo demás)
2. ✅ Fase 2: Restricciones (clarifica scope)
3. ✅ Fase 3: Privacidad (requisito legal)
4. ✅ Fase 4+: Features adicionales

### 11.3 Próximo Paso
Proceder a crear **documentación técnica detallada** de modelos Django y endpoints REST para Fase 1.

---

**Documento preparado para:** Equipo de Desarrollo  
**Requiere aprobación de:** Product Owner, Arquitecto  
**Versión siguiente:** Plan detallado Fase 1
