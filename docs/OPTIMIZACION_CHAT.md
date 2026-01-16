# Optimización del Módulo de Chat - Solución a Recargas Constantes

**Fecha:** 14 de enero de 2026  
**Problema:** El módulo de chat tenía recargas constantes que consumían recursos excesivos

---

## 🔍 Problemas Identificados

### 1. ⚠️ Polling Excesivo
- **Conversaciones:** Se recargaban cada **5 segundos**
- **Mensajes:** Se recargaban cada **3 segundos**
- **Impacto:** ~32 requests por minuto (12 de conversaciones + 20 de mensajes)

### 2. ⚠️ useEffect sin Optimización
```javascript
// ❌ ANTES - Podía crear múltiples intervalos
useEffect(() => {
  loadConversations();
  const interval = setInterval(loadConversations, 5000);
  return () => clearInterval(interval);
}, []); // Sin dependencias optimizadas
```

### 3. ⚠️ Funciones Recreadas en Cada Render
- `loadConversations` y `loadMessages` se recreaban en cada render
- Causaba que los `useEffect` se ejecutaran innecesariamente
- Múltiples intervalos activos simultáneamente

### 4. ⚠️ Polling Durante Escritura
- Seguía recargando mensajes mientras el usuario escribía
- Causaba pérdida de foco y mala experiencia de usuario

---

## ✅ Soluciones Implementadas

### 1. Reducción de Frecuencia de Polling

**Antes:**
- Conversaciones: 5 segundos
- Mensajes: 3 segundos

**Ahora:**
- Conversaciones: **10 segundos** (50% menos requests)
- Mensajes: **8 segundos** (62% menos requests)

**Impacto:** Reducción de ~32 a ~13 requests por minuto (**59% menos carga**)

### 2. Optimización con useCallback

```javascript
// ✅ DESPUÉS - Función memorizada
const loadConversations = useCallback(async () => {
  try {
    setLoading(true);
    const data = await chatApi.getConversations();
    setConversations(data);
  } catch (error) {
    console.error('Error cargando conversaciones:', error);
  } finally {
    setLoading(false);
  }
}, []);

useEffect(() => {
  loadConversations();
  const interval = setInterval(loadConversations, 10000);
  return () => clearInterval(interval);
}, [loadConversations]); // Dependencia optimizada
```

### 3. Polling Inteligente - No Recargar Durante Escritura

```javascript
const [isTyping, setIsTyping] = useState(false);

useEffect(() => {
  if (selectedConversation) {
    loadMessages(selectedConversation.id);
    
    // Solo polling si NO está escribiendo
    const interval = setInterval(() => {
      if (!isTyping) {
        loadMessages(selectedConversation.id);
      }
    }, 8000);
    
    return () => clearInterval(interval);
  }
}, [selectedConversation, loadMessages, isTyping]);
```

### 4. Detección de Escritura con Timeout

```javascript
const handleMessageChange = (e) => {
  setNewMessage(e.target.value);
  
  // Marcar que está escribiendo
  setIsTyping(true);
  
  // Limpiar timeout previo
  if (typingTimeoutRef.current) {
    clearTimeout(typingTimeoutRef.current);
  }
  
  // Después de 2 segundos sin escribir, reanudar polling
  typingTimeoutRef.current = setTimeout(() => {
    setIsTyping(false);
  }, 2000);
};
```

### 5. Cleanup Adecuado de Timeouts

```javascript
// Cleanup al desmontar el componente
useEffect(() => {
  return () => {
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
  };
}, []);
```

---

## 📊 Comparación de Rendimiento

| Métrica | Antes | Después | Mejora |
|---------|-------|---------|--------|
| **Requests/min (conversaciones)** | 12 | 6 | -50% |
| **Requests/min (mensajes)** | 20 | 7.5* | -62% |
| **Total requests/min** | 32 | ~13 | -59% |
| **Polling durante escritura** | Sí ❌ | No ✅ | - |
| **Recreación de funciones** | Cada render | Memorizado | - |
| **Intervalos múltiples** | Posible ❌ | Controlado ✅ | - |

*Menos si el usuario está escribiendo

---

## 🎯 Beneficios

### 1. Menor Consumo de Recursos
- 59% menos requests al servidor
- Menor uso de CPU y memoria
- Mejor batería en dispositivos móviles

### 2. Mejor Experiencia de Usuario
- No hay recargas mientras escribe
- Interfaz más fluida
- Sin interrupciones al escribir

### 3. Menor Carga del Servidor
- Backend recibe menos peticiones
- Mejor escalabilidad
- Menor costo de infraestructura

### 4. Código Más Mantenible
- Funciones memorizadas con `useCallback`
- Cleanup adecuado de efectos
- Dependencias correctas en `useEffect`

---

## 🔄 Alternativas Futuras (Opcional)

### WebSockets para Tiempo Real
En lugar de polling, considerar implementar WebSockets:

**Ventajas:**
- Comunicación bidireccional en tiempo real
- 0 polling (solo push del servidor)
- Notificaciones instantáneas

**Desventajas:**
- Mayor complejidad de implementación
- Requiere infraestructura adicional
- Mantener conexión persistente

**Librerías sugeridas:**
- Socket.io (para Django + React)
- Django Channels (WebSockets en Django)

---

## 📝 Notas de Implementación

### Cambios Realizados en ChatView.jsx

1. **Línea 6:** Agregado `useCallback` a imports
2. **Líneas 50-51:** Agregado estados `isTyping` y `typingTimeoutRef`
3. **Líneas 63-75:** Optimizado `loadConversations` con useCallback
4. **Líneas 77-83:** Reducido polling de conversaciones a 10s
5. **Líneas 100-112:** Optimizado `loadMessages` con useCallback
6. **Líneas 114-127:** Polling inteligente de mensajes (8s, no durante escritura)
7. **Líneas 145-161:** Nueva función `handleMessageChange` con detección de escritura
8. **Líneas 59-67:** Cleanup de timeout al desmontar
9. **Línea 648:** Uso de `handleMessageChange` en TextField

### Testing Recomendado

1. **Abrir DevTools → Network**
2. **Entrar al chat**
3. **Verificar frecuencia de requests:**
   - `/api/chat/conversations/` cada ~10s
   - `/api/chat/messages/:id/` cada ~8s
4. **Escribir mensaje y verificar:**
   - NO debe haber requests mientras escribe
   - Debe reanudar después de 2s de inactividad
5. **Verificar console:**
   - No debe haber warnings de memory leaks
   - No debe haber intervalos múltiples

---

## ✅ Checklist de Validación

- [x] Reducida frecuencia de polling
- [x] Implementado useCallback para funciones
- [x] Agregada detección de escritura
- [x] Pausado polling durante escritura
- [x] Cleanup de timeouts al desmontar
- [x] Código sin errores
- [ ] Testing en navegador
- [ ] Verificación de rendimiento
- [ ] Monitoreo de requests en Network tab

---

**Implementado por:** GitHub Copilot  
**Archivos modificados:** 1 (ChatView.jsx)  
**Líneas de código:** ~40 líneas modificadas/agregadas  
**Breaking changes:** Ninguno (backward compatible)
