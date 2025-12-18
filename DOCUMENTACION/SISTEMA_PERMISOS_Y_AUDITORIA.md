# MAPEO DE PERMISOS Y CONTROL DE ACCESO POR ROL

## Sistema de Roles y Permisos

### Roles Disponibles en el Sistema

1. **Admin (Administrador)**
2. **Nanny (Niñera)**
3. **Parent (Padre/Madre)**

---

## Mapeo de Acceso por Rol

### 1. ADMINISTRADOR (admin)

#### Permisos Completos:
- ✅ **Gestión de Usuarios**
  - Ver todos los usuarios
  - Crear nuevos usuarios
  - Editar perfiles de cualquier usuario
  - Eliminar usuarios
  - Cambiar roles y permisos

- ✅ **Gestión de Niñeras**
  - Ver todos los perfiles de niñeras
  - Verificar/rechazar niñeras
  - Editar información de niñeras
  - Ver documentos OCR y académicos
  - Aprobar/rechazar documentación

- ✅ **Gestión de Padres**
  - Ver todos los perfiles de padres
  - Editar información de padres
  - Ver historial de hijos registrados

- ✅ **Gestión de Reservas (Bookings)**
  - Ver todas las reservas del sistema
  - Crear reservas en nombre de usuarios
  - Modificar cualquier reserva
  - Cancelar cualquier reserva
  - Ver estadísticas de reservas

- ✅ **Gestión de Reseñas**
  - Ver todas las reseñas
  - Moderar contenido inapropiado
  - Eliminar reseñas
  - Ver estadísticas de calificaciones

- ✅ **Documentos y Verificación**
  - Ver todos los documentos subidos
  - Verificar documentos OCR (RUT, carnet)
  - Verificar títulos académicos
  - Aprobar/rechazar documentación

- ✅ **Reportes y Auditoría**
  - Ver dashboard administrativo
  - Generar reportes del sistema
  - Exportar datos
  - Ver logs de auditoría completos
  - Ver estadísticas globales

- ✅ **Configuración del Sistema**
  - Acceder panel de administración
  - Modificar configuraciones
  - Gestionar programas universitarios
  - Otorgar permisos personalizados

#### Rutas Frontend Permitidas:
```
/dashboard/admin          - Dashboard administrativo
/admin/users              - Gestión de usuarios
/admin/nannies            - Gestión de niñeras
/admin/parents            - Gestión de padres
/admin/bookings           - Todas las reservas
/admin/reviews            - Gestión de reseñas
/admin/documents          - Verificación de documentos
/admin/reports            - Reportes y estadísticas
/admin/audit-logs         - Logs de auditoría
/admin/settings           - Configuración del sistema
```

#### Endpoints API Permitidos:
- `GET /core/audit/logs/` - Ver logs de auditoría
- `GET /core/audit/stats/` - Estadísticas de auditoría
- `POST /core/permissions/grant/` - Otorgar permisos
- `GET /dashboard/admin/` - Dashboard administrativo
- `GET/POST/PUT/DELETE /users/*` - Gestión completa de usuarios
- `GET /nannies/*` - Ver todas las niñeras
- `PATCH /nannies/*/verify/` - Verificar niñeras
- `GET /parents/*` - Ver todos los padres
- `GET /bookings/*` - Ver todas las reservas
- `GET/DELETE /reviews/*` - Gestionar reseñas
- `GET/PATCH /academic/*/verify/` - Verificar documentos académicos

---

### 2. NIÑERA (nanny)

#### Permisos Limitados:
- ✅ **Perfil Propio**
  - Ver su propio perfil
  - Editar su información personal
  - Subir foto de perfil
  - Actualizar tarifa por hora
  - Modificar experiencia y descripción

- ✅ **Disponibilidad**
  - Crear horarios disponibles
  - Editar su disponibilidad
  - Eliminar horarios propios

- ✅ **Reservas Propias**
  - Ver sus reservas (recibidas)
  - Aceptar/rechazar solicitudes de reserva
  - Marcar reservas como completadas
  - Ver historial de reservas

- ✅ **Reseñas Recibidas**
  - Ver reseñas que le han dejado
  - Ver su calificación promedio
  - NO puede eliminar reseñas

- ✅ **Ingresos**
  - Ver dashboard de ingresos
  - Ver historial de pagos
  - Ver estadísticas mensuales

- ✅ **Catálogo**
  - Ver otras niñeras (solo lectura)
  - NO puede hacer reservas

- ✅ **Documentación**
  - Subir documentos de identidad (RUT/carnet)
  - Subir títulos académicos
  - Ver estado de verificación

#### Rutas Frontend Bloqueadas:
```
❌ /catalog/book/:id       - NO puede hacer reservas
❌ /admin/*                - Sin acceso administrativo
❌ /dashboard/parent       - Sin acceso a dashboard de padres
```

#### Rutas Frontend Permitidas:
```
/dashboard/nanny           - Dashboard de niñera
/profile/nanny             - Su perfil
/availability              - Gestión de disponibilidad
/bookings/nanny            - Sus reservas
/earnings                  - Sus ingresos
/reviews/received          - Reseñas recibidas
/documents/upload          - Subir documentos
```

#### Endpoints API Permitidos:
- `GET/PUT/PATCH /nannies/profile/` - Su perfil
- `GET/POST /bookings/availabilities/` - Su disponibilidad
- `GET /bookings/?nanny=me` - Sus reservas
- `PATCH /bookings/{id}/accept/` - Aceptar reservas
- `PATCH /bookings/{id}/reject/` - Rechazar reservas
- `GET /reviews/?nanny=me` - Sus reseñas
- `GET /nannies/dashboard/` - Su dashboard
- `POST /core/ocr/upload-document/` - Subir documentos

---

### 3. PADRE/MADRE (parent)

#### Permisos:
- ✅ **Perfil Propio**
  - Ver su propio perfil
  - Editar su información
  - Subir foto de perfil
  - Gestionar contactos de emergencia

- ✅ **Gestión de Hijos**
  - Agregar información de hijos
  - Editar datos de hijos
  - Eliminar registros de hijos

- ✅ **Catálogo de Niñeras**
  - Ver catálogo completo de niñeras verificadas
  - Filtrar por experiencia, tarifa, calificación
  - Ver perfiles detallados de niñeras
  - Agregar niñeras a favoritos

- ✅ **Reservas**
  - Crear nuevas reservas
  - Ver sus reservas activas
  - Cancelar sus propias reservas
  - Ver historial de reservas
  - NO puede ver reservas de otros padres

- ✅ **Reseñas**
  - Dejar reseñas a niñeras contratadas
  - Editar sus propias reseñas
  - Ver reseñas de otras niñeras

- ✅ **Pagos**
  - Ver historial de pagos
  - Ver resumen de gastos
  - Descargar comprobantes

- ❌ **NO Puede**:
  - Ver información de otros padres
  - Ver reservas de otros usuarios
  - Acceder panel administrativo
  - Modificar perfiles de niñeras
  - Eliminar reseñas de otros

#### Rutas Frontend Bloqueadas:
```
❌ /admin/*                - Sin acceso administrativo
❌ /dashboard/nanny        - Sin acceso a dashboard de niñeras
❌ /availability           - No gestiona disponibilidad
```

#### Rutas Frontend Permitidas:
```
/dashboard/parent          - Dashboard de padre
/profile/parent            - Su perfil
/kids                      - Gestión de hijos
/catalog                   - Catálogo de niñeras
/catalog/:id               - Ver perfil de niñera
/booking/create            - Crear reserva
/bookings/parent           - Sus reservas
/payments                  - Historial de pagos
/favorites                 - Niñeras favoritas
/reviews/create            - Dejar reseña
```

#### Endpoints API Permitidos:
- `GET/PUT/PATCH /parents/profile/` - Su perfil
- `GET/POST /parents/children/` - Gestión de hijos
- `GET /nannies/` - Catálogo de niñeras
- `GET /nannies/{id}/` - Ver niñera específica
- `POST /bookings/` - Crear reserva
- `GET /bookings/?parent=me` - Sus reservas
- `DELETE /bookings/{id}/` - Cancelar su reserva
- `POST /reviews/` - Crear reseña
- `GET /parents/dashboard/` - Su dashboard
- `GET/POST /favorites/` - Gestionar favoritos

---

## Tabla de Auditoría (AuditLog)

### Campos de la Tabla:
- `id` - ID único del log
- `user` - Usuario que realizó la acción
- `action` - Tipo de acción (create, update, delete, login, etc.)
- `content_type` - Tipo de objeto afectado
- `object_id` - ID del objeto afectado
- `description` - Descripción de la acción
- `changes` - JSON con cambios (antes/después)
- `ip_address` - IP desde donde se realizó
- `user_agent` - Navegador/dispositivo
- `timestamp` - Fecha y hora
- `metadata` - Información adicional

### Acciones Registradas Automáticamente:
1. **Usuarios**
   - Creación de usuario
   - Actualización de perfil
   - Eliminación de usuario
   - Cambios de rol/permisos

2. **Reservas**
   - Crear reserva
   - Aceptar/rechazar reserva
   - Cancelar reserva
   - Completar reserva

3. **Reseñas**
   - Crear reseña
   - Eliminar reseña

4. **Perfiles**
   - Actualizar perfil de niñera
   - Actualizar perfil de padre
   - Cambiar foto de perfil

5. **Documentos**
   - Subir documento
   - Verificar documento académico
   - Aprobar/rechazar documentación

### Consultas de Auditoría:

#### Ver logs propios (cualquier usuario):
```
GET /core/audit/logs/
```

#### Ver todos los logs (solo admin):
```
GET /core/audit/logs/?user_id=123
GET /core/audit/logs/?action=booking_create
GET /core/audit/logs/?start_date=2025-12-01&end_date=2025-12-31
```

#### Estadísticas (solo admin):
```
GET /core/audit/stats/
```

---

## Middleware de Auditoría

### Configuración en settings.py:
```python
MIDDLEWARE = [
    ...
    'core.audit_signals.AuditMiddleware',  # Agregar esta línea
    ...
]
```

### Uso Manual en Código:
```python
from core.audit_models import AuditLog

# Registrar acción manualmente
AuditLog.log_action(
    user=request.user,
    action='custom_action',
    description='Descripción de la acción',
    content_object=objeto_afectado,
    changes={'field': {'old': 'valor_antiguo', 'new': 'valor_nuevo'}},
    ip_address=request.META.get('REMOTE_ADDR'),
    user_agent=request.META.get('HTTP_USER_AGENT')
)
```

---

## Sistema de Permisos Personalizados

### Tabla UserPermission
Permite otorgar permisos adicionales más allá del rol base.

### Consultar permisos del usuario:
```
GET /core/permissions/me/
```

### Otorgar permiso personalizado (solo admin):
```
POST /core/permissions/grant/
{
  "user_id": 123,
  "permission": "verify_documents",
  "reason": "Usuario designado para verificar documentos"
}
```

---

## Resumen de Acceso

| Funcionalidad | Admin | Nanny | Parent |
|--------------|-------|-------|--------|
| Ver usuarios | ✅ | ❌ | ❌ |
| Gestionar usuarios | ✅ | ❌ | ❌ |
| Ver todas las niñeras | ✅ | ✅ | ✅ |
| Verificar niñeras | ✅ | ❌ | ❌ |
| Editar perfil propio | ✅ | ✅ | ✅ |
| Ver catálogo | ✅ | ✅ | ✅ |
| Crear reserva | ✅ | ❌ | ✅ |
| Gestionar disponibilidad | ❌ | ✅ | ❌ |
| Ver todas las reservas | ✅ | ❌ | ❌ |
| Ver reservas propias | ✅ | ✅ | ✅ |
| Dejar reseñas | ✅ | ❌ | ✅ |
| Eliminar reseñas | ✅ | ❌ | ❌ |
| Ver auditoría completa | ✅ | ❌ | ❌ |
| Ver logs propios | ✅ | ✅ | ✅ |
| Otorgar permisos | ✅ | ❌ | ❌ |
| Verificar documentos | ✅ | ❌ | ❌ |
| Dashboard admin | ✅ | ❌ | ❌ |
