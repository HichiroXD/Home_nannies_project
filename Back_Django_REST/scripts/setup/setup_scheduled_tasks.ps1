# Script para configurar Tareas Programadas en Windows
# Ejecutar como Administrador: .\setup_scheduled_tasks.ps1

Write-Host "🏠 Configurando Tareas Programadas - Home Nannies" -ForegroundColor Green
Write-Host ""

# Obtener rutas
$ProjectPath = $PWD.Path
$PythonPath = (Get-Command python).Source
$ManagePath = Join-Path $ProjectPath "manage.py"

Write-Host "📁 Directorio del proyecto: $ProjectPath" -ForegroundColor Cyan
Write-Host "🐍 Python: $PythonPath" -ForegroundColor Cyan
Write-Host ""

# Función para crear tarea programada
function New-ScheduledTask-HomeNannies {
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
    switch ($Schedule) {
        "Daily" {
            $Trigger = New-ScheduledTaskTrigger -Daily -At $Time
        }
        "Weekly" {
            $Trigger = New-ScheduledTaskTrigger -Weekly -DaysOfWeek Sunday -At $Time
        }
    }
    
    # Registrar tarea
    Register-ScheduledTask `
        -TaskName $TaskName `
        -Action $Action `
        -Trigger $Trigger `
        -Description "Home Nannies - $Command" `
        -RunLevel Highest | Out-Null
    
    Write-Host "  ✅ Creada: $TaskName" -ForegroundColor Green
}

Write-Host "📅 Creando tareas programadas..." -ForegroundColor Cyan
Write-Host ""

# 1. Recordatorios de reservas (Diario 9:00 AM)
New-ScheduledTask-HomeNannies `
    -TaskName "HomeNannies_BookingReminders" `
    -Command "send_booking_reminders" `
    -Schedule "Daily" `
    -Time "09:00"

# 2. Verificar reservas expiradas (Diario 10:00 AM)
New-ScheduledTask-HomeNannies `
    -TaskName "HomeNannies_CheckExpiredBookings" `
    -Command "check_expired_bookings" `
    -Schedule "Daily" `
    -Time "10:00"

# 3. Backup de base de datos (Diario 3:00 AM)
New-ScheduledTask-HomeNannies `
    -TaskName "HomeNannies_DatabaseBackup" `
    -Command "database_backup" `
    -Schedule "Daily" `
    -Time "03:00"

# 4. Actualizar estadísticas de niñeras (Diario 4:00 AM)
New-ScheduledTask-HomeNannies `
    -TaskName "HomeNannies_UpdateNannyStats" `
    -Command "update_nanny_statistics" `
    -Schedule "Daily" `
    -Time "04:00"

# 5. Limpiar notificaciones antiguas (Semanal Domingo 2:00 AM)
New-ScheduledTask-HomeNannies `
    -TaskName "HomeNannies_CleanupNotifications" `
    -Command "cleanup_old_notifications" `
    -Schedule "Weekly" `
    -Time "02:00"

Write-Host ""
Write-Host "=" * 60 -ForegroundColor Green
Write-Host "✅ Configuración completada exitosamente" -ForegroundColor Green
Write-Host "=" * 60 -ForegroundColor Green
Write-Host ""
Write-Host "📋 Tareas creadas:" -ForegroundColor Cyan
Write-Host "   • Recordatorios de reservas (Diario 9:00 AM)" -ForegroundColor White
Write-Host "   • Verificar reservas expiradas (Diario 10:00 AM)" -ForegroundColor White
Write-Host "   • Backup de base de datos (Diario 3:00 AM)" -ForegroundColor White
Write-Host "   • Actualizar estadísticas (Diario 4:00 AM)" -ForegroundColor White
Write-Host "   • Limpiar notificaciones (Semanal Dom 2:00 AM)" -ForegroundColor White
Write-Host ""
Write-Host "🔍 Ver tareas:" -ForegroundColor Yellow
Write-Host "   Get-ScheduledTask | Where-Object {$_.TaskName -like 'HomeNannies*'}" -ForegroundColor Gray
Write-Host ""
Write-Host "🗑️  Eliminar todas las tareas:" -ForegroundColor Yellow
Write-Host "   Get-ScheduledTask | Where-Object {$_.TaskName -like 'HomeNannies*'} | Unregister-ScheduledTask -Confirm:$false" -ForegroundColor Gray
Write-Host ""
Write-Host "▶️  Ejecutar tarea manualmente:" -ForegroundColor Yellow
Write-Host "   Start-ScheduledTask -TaskName 'HomeNannies_BookingReminders'" -ForegroundColor Gray
Write-Host ""
