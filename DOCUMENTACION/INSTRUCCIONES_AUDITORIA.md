# Instrucciones para activar el Sistema de Auditoría

## Paso 1: Crear migraciones para los nuevos modelos

Ejecuta los siguientes comandos en el terminal de PowerShell desde la carpeta Back_Django_REST:

```powershell
# Crear migraciones para los modelos de auditoría
python manage.py makemigrations core

# Aplicar las migraciones
python manage.py migrate core
```

## Paso 2: Verificar que el middleware esté activo

El middleware ya está configurado en `settings.py`:
```python
MIDDLEWARE = [
    ...
    'core.audit_signals.AuditMiddleware',  # ✅ Ya agregado
    ...
]
```

## Paso 3: Verificar que los signals estén activos

Los signals se cargan automáticamente desde `core/apps.py`:
```python
def ready(self):
    import core.audit_signals  # ✅ Ya configurado
```

## Paso 4: Probar el sistema de auditoría

### Consultar logs propios:
```bash
GET http://localhost:8000/api/core/audit/logs/
Authorization: Bearer {token}
```

### Consultar estadísticas (solo admin):
```bash
GET http://localhost:8000/api/core/audit/stats/
Authorization: Bearer {token}
```

### Consultar permisos del usuario actual:
```bash
GET http://localhost:8000/api/core/permissions/me/
Authorization: Bearer {token}
```

### Otorgar permiso personalizado (solo admin):
```bash
POST http://localhost:8000/api/core/permissions/grant/
Authorization: Bearer {token}
Content-Type: application/json

{
  "user_id": 5,
  "permission": "verify_documents",
  "reason": "Usuario designado para verificar documentos"
}
```

## Paso 5: Ver logs en el admin de Django

Los logs también se pueden ver desde el panel de administración:

1. Ir a: http://localhost:8000/admin/
2. Buscar la sección "Core - Validación Institucional"
3. Hacer clic en "Registros de Auditoría"

## Ejemplos de Uso en Código

### Registrar acción manualmente:
```python
from core.audit_models import AuditLog

# En cualquier vista
AuditLog.log_action(
    user=request.user,
    action='custom_action',
    description='Usuario realizó acción personalizada',
    content_object=objeto_afectado,
    changes={
        'campo': {'old': 'valor_anterior', 'new': 'valor_nuevo'}
    },
    ip_address=request.META.get('REMOTE_ADDR'),
    user_agent=request.META.get('HTTP_USER_AGENT')
)
```

### Verificar permisos en una vista:
```python
from core.audit_views import get_role_permissions

def mi_vista(request):
    permisos = get_role_permissions(request.user.role)
    
    if 'view_audit_logs' not in permisos:
        return Response(
            {'error': 'No tienes permiso para ver los logs'},
            status=403
        )
    
    # Continuar con la lógica...
```

## Acciones que se registran automáticamente:

✅ Creación de usuarios
✅ Actualización de usuarios  
✅ Eliminación de usuarios
✅ Creación de reservas
✅ Actualización de reservas
✅ Cancelación de reservas
✅ Creación de reseñas
✅ Eliminación de reseñas
✅ Actualización de perfiles de niñeras
✅ Actualización de perfiles de padres
✅ Subida de documentos académicos
✅ Verificación de documentos

## Información registrada en cada log:

- Usuario que realizó la acción
- Tipo de acción
- Objeto afectado
- Descripción de la acción
- Cambios realizados (antes/después)
- IP desde donde se realizó
- User Agent (navegador)
- Timestamp
- Metadata adicional
