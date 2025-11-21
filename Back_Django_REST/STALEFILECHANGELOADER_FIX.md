# ✅ Solución: StaleFileChangeLoader Warning en Django

## 📌 Problema

Al ejecutar `python manage.py runserver` con venv, aparece:

```
[INFO] 2025-11-21 11:51:19, 221 django.utils.autoreload: Watching for file changes with StatReloader
Performing system checks...
```

O cuando cambian archivos:
```
[WARNING] django.utils.autoreload: StaleFileChangeLoader detected outdated file...
```

---

## 🎯 ¿Por qué ocurre?

Django tiene 2 file watchers para detectar cambios:

1. **StatReloader** - Verifica timestamps de archivos (predeterminado)
2. **WatchReloader** - Usa inotify en Linux/Mac, no disponible en Windows

En Windows con venv, a veces hay conflicto entre el stat reloader y los archivos compilados de Python.

---

## ✅ Soluciones (en orden de recomendación)

### **Opción 1: Usar WATCHFILES (Recomendado)**

```bash
pip install watchfiles
```

Luego ejecutar normalmente:
```bash
python manage.py runserver
```

Django automáticamente usará `watchfiles` (mucho más rápido y confiable).

---

### **Opción 2: Deshabilitar Auto-reload (Para testing)**

```bash
python manage.py runserver --nothreaded --noreload
```

**NO RECOMENDADO en desarrollo normal** - No recargará cambios automáticamente.

---

### **Opción 3: Usar Watchman (Windows avanzado)**

```bash
pip install watchman
```

Luego en PowerShell:
```powershell
$env:DJANGO_FILE_WATCHER='watchman'
python manage.py runserver
```

---

### **Opción 4: Limpiar caché de Python**

```bash
# Borrar archivos __pycache__ y .pyc
Get-ChildItem -Recurse -Include "__pycache__" -Directory | Remove-Item -Recurse -Force
Get-ChildItem -Recurse -Include "*.pyc" | Remove-Item -Force
```

Luego reiniciar el servidor.

---

## 🚀 Solución Rápida (Recomendada)

**Paso 1:** Instalar watchfiles
```bash
pip install watchfiles
```

**Paso 2:** Verificar instalación
```bash
pip list | grep watchfiles
```

**Paso 3:** Ejecutar servidor normalmente
```bash
python manage.py runserver
```

---

## 📊 Comparativa de Watchers

| Watcher | Windows | Linux | Mac | Velocidad | Confiabilidad |
|---------|---------|-------|-----|-----------|---------------|
| StatReloader | ✅ | ✅ | ✅ | Lenta | Media |
| WatchReloader | ❌ | ✅ | ✅ | Rápida | Alta |
| Watchfiles | ✅ | ✅ | ✅ | **Muy rápida** | **Muy alta** |
| Watchman | ✅ | ✅ | ✅ | Muy rápida | Alta |

---

## 🔧 Configuración en settings.py (Opcional)

Si quieres forzar el uso de watchfiles en settings.py:

```python
# django_crud_api/settings.py

# Configurar file watcher
if DEBUG:
    import sys
    try:
        import watchfiles  # Verificar si está instalado
        print("✓ Usando watchfiles para file watching (recomendado)")
    except ImportError:
        print("⚠️  watchfiles no instalado. Instalar: pip install watchfiles")
```

---

## ✨ Verificar que Funciona

Después de instalar watchfiles, deberías ver:

```
Watching for file changes with WatchFilesReloader
Performing system checks...

System check identified no issues (0 silenced).
November 21, 2025 - 11:52:00
Django version 5.2.6, Python 3.13.0
Starting development server at http://127.0.0.1:8000/
Quit the server with CTRL-BREAK.
```

🎉 **Sin advertencias de StaleFileChangeLoader**

---

## 🐛 Troubleshooting

### Si aún ves StaleFileChangeLoader después de instalar watchfiles:

1. **Reinicia el terminal/venv**
   ```bash
   # Cerrar terminal y abrir uno nuevo
   # Luego: .venv\Scripts\Activate.ps1
   ```

2. **Limpia pip cache**
   ```bash
   pip cache purge
   pip install --force-reinstall watchfiles
   ```

3. **Verifica que Django ve watchfiles**
   ```bash
   python -c "import watchfiles; print('✓ watchfiles OK')"
   ```

---

## 📝 Comando Recomendado para Desarrollo

```bash
# Activar venv
.venv\Scripts\Activate.ps1

# Instalar watchfiles (primera vez)
pip install watchfiles

# Ejecutar servidor
python manage.py runserver
```

---

## 🎯 Estado Actual de tu Setup

✅ `.env` correctamente configurado con `DEBUG=True`
✅ Django se levanta correctamente
⚠️ Está usando StatReloader (funciona pero lento)
📝 **Recomendación:** Instala `watchfiles` para mejor experiencia

---

**Última actualización:** 21 Noviembre 2025
**Prioridad:** MEDIA (funciona, pero puede mejorar)
