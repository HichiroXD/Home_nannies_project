# Guía de Uso - Preferencias de Notificación

## 🎯 Funcionalidad Implementada

Las preferencias de notificación ahora están **completamente funcionales** y conectadas al backend.

## ✅ Características

### Backend
- **Modelo:** `NotificationPreference` (ya existente)
- **Endpoint:** `GET/PATCH /api/notifications/preferences/`
- **Campos disponibles:**
  - `email_booking_events` - Emails sobre reservas
  - `email_verification_events` - Emails sobre verificación
  - `email_ocr_events` - Emails sobre OCR
  - `in_app_notifications` - Notificaciones en la app

### Frontend
- **Carga automática:** Las preferencias se cargan al abrir el perfil
- **Guardado automático:** Los cambios se guardan instantáneamente
- **Feedback visual:** Indicador de "Actualizando..." mientras se guardan
- **Manejo de errores:** Muestra mensajes claros si algo falla
- **Revertir en error:** Si falla el guardado, revierte el cambio

## 🔧 Uso

### Para el Usuario
1. Ir a **Perfil de Administrador**
2. Scroll hasta **"Preferencias de Notificación"**
3. Marcar/desmarcar los checkboxes según preferencia
4. Los cambios se guardan automáticamente
5. Aparece mensaje de confirmación ✅

### Para el Desarrollador

#### Probar el Endpoint Manualmente

```bash
# 1. Obtener preferencias
curl -X GET "http://localhost:8000/api/notifications/preferences/" \
  -H "Authorization: Bearer YOUR_TOKEN"

# 2. Actualizar preferencias
curl -X PATCH "http://localhost:8000/api/notifications/preferences/" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "email_booking_events": true,
    "email_verification_events": false,
    "email_ocr_events": true,
    "in_app_notifications": true
  }'
```

#### Código del Frontend

```javascript
// Las preferencias se cargan automáticamente en loadProfile()
const loadProfile = async () => {
  // ... código existente ...
  
  // Cargar preferencias reales
  const prefsResponse = await API.get('/notifications/preferences/');
  setNotificationPrefs({
    email_booking_events: prefs.email_booking_events ?? true,
    // ... etc
  });
};

// Los cambios se guardan automáticamente
const handleNotificationChange = async (key) => {
  const newPrefs = { ...notificationPrefs, [key]: !notificationPrefs[key] };
  await API.patch('/notifications/preferences/', newPrefs);
  setNotificationPrefs(newPrefs);
  setAlert({ type: "success", message: "✅ Preferencias actualizadas" });
};
```

## 📊 Estructura de Datos

### Respuesta del GET
```json
{
  "id": 1,
  "email_ocr_events": true,
  "email_booking_events": true,
  "email_verification_events": true,
  "in_app_notifications": true,
  "quiet_hours_start": null,
  "quiet_hours_end": null,
  "created_at": "2024-01-01T10:00:00Z",
  "updated_at": "2024-01-01T10:00:00Z"
}
```

### Request del PATCH
```json
{
  "email_booking_events": false,
  "email_verification_events": true,
  "email_ocr_events": true,
  "in_app_notifications": false
}
```

## 🎨 UI/UX Mejorada

- ✅ Hover effects en cada opción
- ✅ Descripciones detalladas de cada preferencia
- ✅ Indicador de carga mientras actualiza
- ✅ Deshabilita checkboxes durante actualización
- ✅ Mensajes de éxito/error con emojis

## 🔒 Seguridad

- ✅ Solo usuarios autenticados pueden acceder
- ✅ Cada usuario solo ve/modifica sus propias preferencias
- ✅ Validación en backend con serializers
- ✅ Manejo de errores robusto

## 🐛 Manejo de Errores

### Si el backend no responde:
- Se muestran valores por defecto
- Se muestra warning en consola
- El usuario puede seguir usando la app

### Si falla el guardado:
- Se muestra mensaje de error descriptivo
- Se recargan las preferencias originales
- El usuario puede reintentar

## 📝 Logs

El sistema genera logs útiles:
```javascript
// Carga exitosa
console.log("Preferencias cargadas:", prefs);

// Error al cargar
console.warn("No se pudieron cargar las preferencias:", error);

// Error al guardar
console.error("Error al actualizar preferencias:", error);
```

## 🚀 Testing

### Test Manual
1. Abrir el perfil de admin
2. Cambiar una preferencia
3. Verificar mensaje de éxito
4. Recargar la página
5. Verificar que el cambio persistió

### Test con DevTools
```javascript
// En la consola del navegador
// Verificar estado actual
console.log(notificationPrefs);

// Simular cambio
handleNotificationChange('email_booking_events');
```

## 💡 Próximas Mejoras Opcionales

1. **Horarios de silencio:** Implementar `quiet_hours_start` y `quiet_hours_end`
2. **Frecuencia de emails:** Diario, semanal, instantáneo
3. **Tipos de notificación más granulares:** Por cada tipo de evento
4. **Preview de notificaciones:** Mostrar ejemplo de cada tipo
5. **Exportar/Importar preferencias:** Backup de configuración

## ✅ Estado Actual

**✅ COMPLETAMENTE FUNCIONAL**

- Backend configurado y probado
- Frontend conectado y funcional
- Manejo de errores implementado
- UI/UX mejorada
- Documentación completa

**Listo para usar en producción** 🎉
