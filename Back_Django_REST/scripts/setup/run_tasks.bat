@echo off
REM Script para ejecutar tareas de Home Nannies manualmente
REM No requiere permisos de administrador

echo ========================================
echo  Home Nannies - Ejecutar Tareas
echo ========================================
echo.

cd /d "%~dp0"

:MENU
echo Selecciona una tarea:
echo.
echo 1. Enviar recordatorios de reservas
echo 2. Verificar reservas expiradas
echo 3. Hacer backup de base de datos
echo 4. Actualizar estadisticas de nanieras
echo 5. Limpiar notificaciones antiguas
echo 6. Ejecutar TODAS las tareas
echo 7. Salir
echo.

set /p option="Opcion: "

if "%option%"=="1" goto REMINDERS
if "%option%"=="2" goto EXPIRED
if "%option%"=="3" goto BACKUP
if "%option%"=="4" goto STATS
if "%option%"=="5" goto CLEANUP
if "%option%"=="6" goto ALL
if "%option%"=="7" goto END

echo Opcion invalida
goto MENU

:REMINDERS
echo.
echo [1/5] Enviando recordatorios...
python manage.py send_booking_reminders --verbosity 2
echo.
pause
goto MENU

:EXPIRED
echo.
echo [2/5] Verificando reservas expiradas...
python manage.py check_expired_bookings --verbosity 2
echo.
pause
goto MENU

:BACKUP
echo.
echo [3/5] Creando backup de base de datos...
python manage.py database_backup --verbosity 2
echo.
pause
goto MENU

:STATS
echo.
echo [4/5] Actualizando estadisticas...
python manage.py update_nanny_statistics --verbosity 2
echo.
pause
goto MENU

:CLEANUP
echo.
echo [5/5] Limpiando notificaciones antiguas...
python manage.py cleanup_old_notifications --verbosity 2
echo.
pause
goto MENU

:ALL
echo.
echo Ejecutando TODAS las tareas...
echo.
echo [1/5] Enviando recordatorios...
python manage.py send_booking_reminders --verbosity 1
echo.
echo [2/5] Verificando reservas expiradas...
python manage.py check_expired_bookings --verbosity 1
echo.
echo [3/5] Creando backup de base de datos...
python manage.py database_backup --verbosity 1
echo.
echo [4/5] Actualizando estadisticas...
python manage.py update_nanny_statistics --verbosity 1
echo.
echo [5/5] Limpiando notificaciones antiguas...
python manage.py cleanup_old_notifications --verbosity 1
echo.
echo ========================================
echo  Todas las tareas completadas
echo ========================================
pause
goto MENU

:END
echo.
echo Hasta luego!
exit
