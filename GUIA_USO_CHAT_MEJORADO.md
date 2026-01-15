# 🎉 Guía de Uso - Chat Mejorado (Fase 1)

## 📱 Cómo Usar las Nuevas Funcionalidades

### 1️⃣ Enviar Emojis 😊

1. **Abre una conversación** en el módulo de chat
2. **Localiza el botón de emoji** 🙂 (a la izquierda del campo de texto)
3. **Haz clic** en el botón - Se abrirá el picker de emojis
4. **Busca o selecciona** el emoji que quieras:
   - Usa la búsqueda rápida arriba
   - Navega por categorías (Emoticonos, Personas, Animales, Comida, etc.)
5. **Haz clic en un emoji** - Se insertará en el campo de texto
6. **Escribe tu mensaje** (opcional - puedes enviar solo emojis)
7. **Presiona el botón de enviar** ✈️

**Ejemplo:**
```
"¡Hola! 👋 ¿Cómo estás hoy? 😊"
```

---

### 2️⃣ Enviar Imágenes 🖼️

#### Opción A: Clic en el Botón
1. **Haz clic en el botón de clip** 📎 (junto al campo de texto)
2. **Selecciona una imagen** de tu computadora
   - Formatos permitidos: JPG, PNG, GIF, WEBP
   - Tamaño máximo: 10 MB
3. **Verás un preview** de la imagen arriba del campo de texto
4. **(Opcional)** Agrega un comentario en el campo de texto
5. **Haz clic en enviar** ✈️

#### Opción B: Drag & Drop
1. **Arrastra una imagen** desde tu explorador de archivos
2. **Suéltala sobre el botón de clip** 📎
3. Continúa desde el paso 3 de la Opción A

**Resultado:**
- El destinatario verá la imagen en tamaño completo en la conversación
- Puede hacer clic en la imagen para abrirla en una nueva pestaña

---

### 3️⃣ Enviar Documentos 📄

#### Archivos Soportados
- **PDF**: Documentos, contratos, formularios
- **Word**: DOC, DOCX
- **Texto**: TXT

#### Proceso:
1. **Haz clic en el botón de clip** 📎
2. **Selecciona un archivo** de tu computadora (máx. 10 MB)
3. **Verás el nombre del archivo** en el preview
4. **(Opcional)** Agrega un mensaje descriptivo
5. **Haz clic en enviar** ✈️

**Resultado:**
- El destinatario verá un ícono de archivo 📎 con el nombre
- Puede hacer clic para descargar el documento

---

## 🎨 Interfaz Mejorada

### Botones en el Input de Mensajes:
```
[😊] [📎] [________________ Escribe un mensaje...] [✈️]
Emoji Clip    Campo de texto                      Enviar
```

### Preview de Archivo (cuando seleccionas uno):
```
┌─────────────────────────────────────┐
│ [🖼️ imagen.jpg]           [❌]      │  ← Vista previa
└─────────────────────────────────────┘
[😊] [📎] [Agrega un comentario...] [✈️]
```

---

## ✅ Validaciones Automáticas

### El sistema NO permitirá:
- ❌ Archivos mayores a 10 MB
- ❌ Formatos no soportados (ej: EXE, ZIP)
- ❌ Enviar mensaje vacío sin archivo
- ❌ Subir múltiples archivos a la vez

### El sistema SÍ permite:
- ✅ Solo emojis (sin texto)
- ✅ Solo imagen/archivo (sin texto)
- ✅ Imagen + texto
- ✅ Archivo + texto
- ✅ Múltiples emojis en un mensaje

---

## 🔍 Visualización de Mensajes

### Mensajes con Imagen:
```
┌─────────────────────────┐
│  [Vista de la imagen]   │
│                         │
│  "Mira esta foto 😊"    │
│                  10:30  │
└─────────────────────────┘
```

### Mensajes con Archivo:
```
┌─────────────────────────┐
│ 📎 contrato.pdf         │
│                         │
│ "Aquí está el contrato" │
│                  10:35  │
└─────────────────────────┘
```

### Mensajes de Texto con Emojis:
```
┌─────────────────────────┐
│ ¡Perfecto! 👍😊         │
│                  10:40  │
└─────────────────────────┘
```

---

## 🚀 Consejos de Uso

### Para Mejores Resultados:

1. **Imágenes:**
   - Usa JPG para fotos (mejor compresión)
   - Usa PNG para capturas de pantalla (mejor calidad)
   - Reduce el tamaño si es > 10 MB antes de subir

2. **Documentos:**
   - Usa PDF para documentos finales (mejor compatibilidad)
   - Usa nombres descriptivos para los archivos
   - Verifica que el archivo no esté corrupto antes de enviar

3. **Emojis:**
   - Usa emojis para expresar emociones rápidamente
   - Combina emojis con texto para mayor claridad
   - Evita enviar solo muchos emojis sin contexto

4. **Rendimiento:**
   - El chat sigue usando polling (cada 8-10 segundos)
   - Los mensajes pueden tardar unos segundos en aparecer
   - No envíes múltiples archivos grandes seguidos

---

## 🐛 Solución de Problemas

### "El archivo es demasiado grande"
**Solución:** Reduce el tamaño del archivo a menos de 10 MB usando:
- Herramientas de compresión online
- Reducir resolución de imágenes
- Dividir documentos grandes

### "Formato de archivo no permitido"
**Solución:** Convierte el archivo a un formato soportado:
- Imágenes: JPG, PNG, GIF, WEBP
- Documentos: PDF, DOC, DOCX, TXT

### "El archivo no se muestra en la conversación"
**Posibles causas:**
1. El mensaje aún no se ha sincronizado (espera 8-10 segundos)
2. Refresca la página (F5)
3. Verifica que el archivo se haya subido correctamente (revisa el backend)

### "No puedo hacer clic en el botón de emoji/clip"
**Solución:**
1. Verifica que no estés enviando un mensaje (spinner activo)
2. Refresca la página
3. Limpia el cache del navegador

---

## 📊 Límites y Restricciones

| Característica | Límite |
|----------------|--------|
| Tamaño máximo de archivo | 10 MB |
| Archivos por mensaje | 1 |
| Emojis por mensaje | Ilimitados |
| Longitud del mensaje | Sin límite técnico |
| Tipos de archivo | 8 (jpg, jpeg, png, gif, webp, pdf, doc, docx, txt) |

---

## 🔜 Próximas Mejoras (Fases 2 y 3)

### Fase 2: Estado de Mensajes
- ✓ Enviado (un check)
- ✓✓ Entregado (doble check)
- ✓✓ Leído (doble check azul)

### Fase 3: Tiempo Real con WebSockets
- Chat en tiempo real (sin polling)
- Notificaciones instantáneas
- Indicador "escribiendo..."
- **Requiere:** Dominio y certificado HTTPS en producción

---

## 📞 ¿Necesitas Ayuda?

Si encuentras algún problema:
1. Verifica que el backend esté ejecutándose (`http://localhost:8000`)
2. Verifica que el frontend esté ejecutándose (`http://localhost:5173`)
3. Revisa la consola del navegador (F12) para errores
4. Revisa los logs del servidor Django

---

## 🎯 Resumen Rápido

| Acción | Cómo Hacerlo |
|--------|--------------|
| Agregar emoji | Clic en 🙂 → Seleccionar emoji |
| Enviar imagen | Clic en 📎 → Seleccionar JPG/PNG |
| Enviar documento | Clic en 📎 → Seleccionar PDF/DOC |
| Ver imagen | Clic en la imagen en la conversación |
| Descargar archivo | Clic en el nombre del archivo |
| Eliminar archivo antes de enviar | Clic en ❌ en el preview |

---

**¡Disfruta del chat mejorado!** 🎉
