# 🚀 Guía: Configurar Tareas Programadas

**Fecha:** 2 de enero de 2026

---

## ✅ Opción 1: Tareas Automáticas (Recomendado)

### Requisito: Permisos de Administrador

**Pasos:**

1. **Abrir PowerShell como Administrador:**
   - Click derecho en el menú Inicio
   - Seleccionar "Windows PowerShell (Administrador)"
   - O "Terminal (Administrador)" en Windows 11

2. **Navegar al directorio del proyecto:**
   ```powershell
   cd "C:\Users\saeze\OneDrive\Documentos\GitHub\Home_nannies_project\Back_Django_REST"
   ```

3. **Ejecutar el script de configuración:**
   ```powershell
   .\setup_tasks.ps1
   ```

4. **Verificar que las tareas se crearon:**
   ```powershell
   Get-ScheduledTask | Where-Object {$_.TaskName -like 'HomeNannies*'}
   ```

### ✅ Tareas que se crean:

| Nombre | Comando | Frecuencia | Hora |
|--------|---------|-----------|------|
| HomeNannies_BookingReminders | send_booking_reminders | Diario | 9:00 AM |
| HomeNannies_ExpiredBookings | check_expired_bookings | Diario | 10:00 AM |
| HomeNannies_DatabaseBackup | database_backup | Diario | 3:00 AM |
| HomeNannies_UpdateStats | update_nanny_statistics | Diario | 4:00 AM |
| HomeNannies_CleanupNotifications | cleanup_old_notifications | Semanal (Domingo) | 2:00 AM |

### 🔍 Verificar ejecución:

**Ver historial de una tarea:**
1. Abrir "Programador de tareas" (taskschd.msc)
2. Buscar tareas "HomeNannies_*"
3. Click derecho → "Propiedades" → Pestaña "Historial"

**Ejecutar una tarea manualmente:**
```powershell
Start-ScheduledTask -TaskName 'HomeNannies_DatabaseBackup'
```

**Ver logs de ejecución:**
```powershell
Get-ScheduledTaskInfo -TaskName 'HomeNannies_DatabaseBackup'
```

---

## 🛠️ Opción 2: Ejecución Manual (Sin permisos admin)

Si no tienes permisos de administrador, usa el script interactivo:

### Pasos:

1. **Abrir PowerShell o CMD normal** (sin admin)

2. **Navegar al directorio:**
   ```cmd
   cd "C:\Users\saeze\OneDrive\Documentos\GitHub\Home_nannies_project\Back_Django_REST"
   ```

3. **Ejecutar el script batch:**
   ```cmd
   run_tasks.bat
   ```

4. **Seleccionar la tarea a ejecutar del menú interactivo**

### Programar manualmente:

Puedes crear una tarea personal en el Programador de Tareas:

1. Abrir "Programador de tareas" (taskschd.msc)
2. Click derecho en "Biblioteca del Programador de tareas"
3. Seleccionar "Crear tarea básica..."
4. Seguir el asistente:
   - **Nombre:** HomeNannies_Backup
   - **Desencadenador:** Diariamente a las 3:00 AM
   - **Acción:** Iniciar un programa
   - **Programa:** `python`
   - **Argumentos:** `manage.py database_backup`
   - **Iniciar en:** `C:\Users\saeze\OneDrive\Documentos\GitHub\Home_nannies_project\Back_Django_REST`

---

## 🧪 Probar Tareas Manualmente

Antes de programarlas, prueba cada comando:

```powershell
# Recordatorios
python manage.py send_booking_reminders --verbosity 2

# Expiradas
python manage.py check_expired_bookings --verbosity 2

# Backup
python manage.py database_backup --verbosity 2

# Estadísticas
python manage.py update_nanny_statistics --verbosity 2

# Limpieza
python manage.py cleanup_old_notifications --verbosity 2
```

---

## 📊 Monitoreo

### Ver logs de backups:
```powershell
Get-ChildItem backups\ | Sort-Object LastWriteTime -Descending | Select-Object -First 5
```

### Ver tamaño de backups:
```powershell
Get-ChildItem backups\*.json | Measure-Object -Property Length -Sum
```

### Verificar que los comandos funcionen:
```powershell
# Ver ayuda de cualquier comando
python manage.py database_backup --help
```

---

## ⚠️ Troubleshooting

### Error: "Acceso denegado"
**Solución:** Ejecutar PowerShell como Administrador

### Error: "python no se reconoce"
**Solución:** Verificar que Python esté en el PATH:
```powershell
python --version
```

### Error: "No such file manage.py"
**Solución:** Verificar que estás en el directorio correcto:
```powershell
cd Back_Django_REST
```

### Las tareas no se ejecutan automáticamente
**Verificar:**
1. Servicio "Task Scheduler" está corriendo:
   ```powershell
   Get-Service -Name "Schedule"
   ```
2. La tarea está habilitada en el Programador de tareas
3. La cuenta de usuario tiene permisos

---

## 🗑️ Eliminar Tareas

**Eliminar todas las tareas de Home Nannies:**
```powershell
Get-ScheduledTask | Where-Object {$_.TaskName -like 'HomeNannies*'} | Unregister-ScheduledTask -Confirm:$false
```

**Eliminar una tarea específica:**
```powershell
Unregister-ScheduledTask -TaskName 'HomeNannies_DatabaseBackup' -Confirm:$false
```

---

## 📝 Recomendaciones

### Para Desarrollo:
- Ejecutar tareas manualmente con `run_tasks.bat`
- No programar tareas automáticas

### Para Producción:
- Usar `setup_tasks.ps1` con permisos de administrador
- Monitorear logs semanalmente
- Verificar espacio en disco para backups

---

## ✅ Checklist de Configuración

- [ ] PowerShell ejecutado como Administrador
- [ ] Script `setup_tasks.ps1` ejecutado sin errores
- [ ] 5 tareas visibles en Programador de tareas
- [ ] Probado al menos una tarea manualmente
- [ ] Verificado que el backup se crea correctamente
- [ ] Configurado monitoreo de logs (opcional)

---

**Última actualización:** 2 de enero de 2026  
**Estado:** Documentación completa para Windows
