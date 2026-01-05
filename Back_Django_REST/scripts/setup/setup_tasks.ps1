# Script para configurar Tareas Programadas en Windows
# Ejecutar como Administrador

Write-Host "=== Configurando Tareas Programadas - Home Nannies ===" -ForegroundColor Green
Write-Host ""

# Obtener rutas
$ProjectPath = $PWD.Path
$PythonPath = (Get-Command python).Source
$ManagePath = Join-Path $ProjectPath "manage.py"

Write-Host "Directorio del proyecto: $ProjectPath" -ForegroundColor Cyan
Write-Host "Python: $PythonPath" -ForegroundColor Cyan
Write-Host ""

# Función para crear tarea programada
function CreateScheduledTask {
    param(
        [string]$TaskName,
        [string]$Command,
        [string]$Schedule,
        [string]$Time
    )
    
    Write-Host "Creando tarea: $TaskName..." -ForegroundColor Yellow
    
    # Eliminar tarea si ya existe
    Unregister-ScheduledTask -TaskName $TaskName -Confirm:$false -ErrorAction SilentlyContinue
    
    # Crear acción
    $Action = New-ScheduledTaskAction `
        -Execute $PythonPath `
        -Argument "$ManagePath $Command" `
        -WorkingDirectory $ProjectPath
    
    # Crear trigger según el tipo
    if ($Schedule -eq "Daily") {
        $Trigger = New-ScheduledTaskTrigger -Daily -At $Time
    } elseif ($Schedule -eq "Weekly") {
        $Trigger = New-ScheduledTaskTrigger -Weekly -DaysOfWeek Sunday -At $Time
    }
    
    # Registrar tarea
    Register-ScheduledTask `
        -TaskName $TaskName `
        -Action $Action `
        -Trigger $Trigger `
        -Description "Home Nannies - $Command" `
        -RunLevel Highest | Out-Null
    
    Write-Host "  OK - Creada: $TaskName" -ForegroundColor Green
}

Write-Host "Creando 5 tareas programadas..." -ForegroundColor Yellow
Write-Host ""

# 1. Recordatorios de reservas (Diario 9:00 AM)
CreateScheduledTask `
    -TaskName "HomeNannies_BookingReminders" `
    -Command "send_booking_reminders" `
    -Schedule "Daily" `
    -Time "09:00"

# 2. Verificar reservas expiradas (Diario 10:00 AM)
CreateScheduledTask `
    -TaskName "HomeNannies_ExpiredBookings" `
    -Command "check_expired_bookings" `
    -Schedule "Daily" `
    -Time "10:00"

# 3. Backup de base de datos (Diario 3:00 AM)
CreateScheduledTask `
    -TaskName "HomeNannies_DatabaseBackup" `
    -Command "database_backup" `
    -Schedule "Daily" `
    -Time "03:00"

# 4. Actualizar estadísticas (Diario 4:00 AM)
CreateScheduledTask `
    -TaskName "HomeNannies_UpdateStats" `
    -Command "update_nanny_statistics" `
    -Schedule "Daily" `
    -Time "04:00"

# 5. Limpiar notificaciones antiguas (Semanal Domingo 2:00 AM)
CreateScheduledTask `
    -TaskName "HomeNannies_CleanupNotifications" `
    -Command "cleanup_old_notifications" `
    -Schedule "Weekly" `
    -Time "02:00"

Write-Host ""
Write-Host "============================================" -ForegroundColor Green
Write-Host "  Configuracion completada exitosamente" -ForegroundColor Green
Write-Host "============================================" -ForegroundColor Green
Write-Host ""

Write-Host "Tareas creadas:" -ForegroundColor Cyan
Write-Host "  - Recordatorios de reservas (Diario 9:00 AM)"
Write-Host "  - Verificar expiradas (Diario 10:00 AM)"
Write-Host "  - Backup BD (Diario 3:00 AM)"
Write-Host "  - Actualizar stats (Diario 4:00 AM)"
Write-Host "  - Limpiar notificaciones (Semanal Domingo 2:00 AM)"
Write-Host ""

Write-Host "Comandos utiles:" -ForegroundColor Yellow
Write-Host "  Ver tareas:"
Write-Host "   Get-ScheduledTask | Where-Object {`$_.TaskName -like 'HomeNannies*'}" -ForegroundColor Gray
Write-Host ""
Write-Host "  Ejecutar tarea manualmente:"
Write-Host "   Start-ScheduledTask -TaskName 'HomeNannies_BookingReminders'" -ForegroundColor Gray
Write-Host ""
Write-Host "  Eliminar todas las tareas:"
Write-Host "   Get-ScheduledTask | Where-Object {`$_.TaskName -like 'HomeNannies*'} | Unregister-ScheduledTask -Confirm:`$false" -ForegroundColor Gray
Write-Host ""
