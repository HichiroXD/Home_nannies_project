# Script para iniciar el proyecto Home Nannies
# Backend Django + Frontend React

Write-Host ">>> Iniciando Home Nannies Project..." -ForegroundColor Cyan
Write-Host ""

# Ruta del proyecto
$projectRoot = $PSScriptRoot
$backendPath = Join-Path $projectRoot "..\Back_Django_REST"
$frontendPath = Join-Path $projectRoot "..\frontend_nannies"
$logsPath = Join-Path $projectRoot "logs"

# Crear carpeta de logs si no existe
if (-not (Test-Path $logsPath)) {
    New-Item -ItemType Directory -Path $logsPath -Force | Out-Null
}

$backendLogFile = Join-Path $logsPath "backend_console.log"
$frontendLogFile = Join-Path $logsPath "frontend_console.log"

# Verificar que existen las carpetas
if (-not (Test-Path $backendPath)) {
    Write-Host "[ERROR] No se encuentra la carpeta del backend" -ForegroundColor Red
    exit 1
}

if (-not (Test-Path $frontendPath)) {
    Write-Host "[ERROR] No se encuentra la carpeta del frontend" -ForegroundColor Red
    exit 1
}

# Función para formatear timestamps
function Get-Timestamp {
    return (Get-Date).ToString("HH:mm:ss")
}

# Función para colorear errores
function Write-ColoredOutput {
    param($Message, $Source)
    
    $timestamp = Get-Timestamp
    $color = if ($Source -eq "BACKEND") { "Blue" } else { "Magenta" }
    
    # Detectar errores y warnings
    if ($Message -match "error|exception|failed|traceback|ERROR|Exception" -and $Message -notmatch "0 errors") {
        $color = "Red"
        $prefix = "❌"
    }
    elseif ($Message -match "warning|WARNING|WARN") {
        $color = "Yellow"
        $prefix = "⚠️"
    }
    elseif ($Message -match "success|SUCCESS|OK|✅") {
        $color = "Green"
        $prefix = "✅"
    }
    else {
        $prefix = "  "
    }
    
    $output = "[$timestamp] [$Source] $prefix $Message"
    Write-Host $output -ForegroundColor $color
    
    # Guardar en archivo de log
    $logFile = if ($Source -eq "BACKEND") { $backendLogFile } else { $frontendLogFile }
    Add-Content -Path $logFile -Value $output
}

# Limpiar logs anteriores
if (Test-Path $backendLogFile) { Clear-Content $backendLogFile }
if (Test-Path $frontendLogFile) { Clear-Content $frontendLogFile }

# Función para iniciar el backend con debug
$backendJob = Start-Job -ScriptBlock {
    param($path)
    Set-Location $path
    
    # Activar entorno virtual y configurar DEBUG
    & .\venv\Scripts\Activate.ps1
    $env:DEBUG = "True"
    $env:PYTHONUNBUFFERED = "1"
    
    # Iniciar servidor Django con modo verbose
    python manage.py runserver --noreload 2>&1
} -ArgumentList $backendPath

Write-Host "[OK] Backend Django iniciando en http://localhost:8000" -ForegroundColor Green

# Esperar un poco para que el backend inicie
Start-Sleep -Seconds 2

# Función para iniciar el frontend
$frontendJob = Start-Job -ScriptBlock {
    param($path)
    Set-Location $path
    
    # Iniciar servidor Vite
    npm run dev 2>&1
} -ArgumentList $frontendPath

Write-Host "[OK] Frontend React iniciando en http://localhost:5173" -ForegroundColor Green
Write-Host ""
Write-Host "=== Servicios iniciados ===" -ForegroundColor Yellow
Write-Host "   - Backend:  http://localhost:8000" -ForegroundColor White
Write-Host "   - Frontend: http://localhost:5173" -ForegroundColor White
Write-Host "   - Logs guardados en: $logsPath" -ForegroundColor White
Write-Host ""
Write-Host "[INFO] Presiona Ctrl+C para detener ambos servicios" -ForegroundColor Yellow
Write-Host ""

# Contador de mensajes para debugging
$backendMsgCount = 0
$frontendMsgCount = 0

# Mostrar logs de ambos servicios con mejor formato
try {
    while ($true) {
        # Recibir output del backend
        $backendOutput = Receive-Job -Job $backendJob -ErrorAction SilentlyContinue
        if ($backendOutput) {
            $backendOutput -split "`n" | ForEach-Object {
                if ($_.Trim()) {
                    Write-ColoredOutput $_ "BACKEND"
                    $backendMsgCount++
                }
            }
        }
        
        # Recibir output del frontend
        $frontendOutput = Receive-Job -Job $frontendJob -ErrorAction SilentlyContinue
        if ($frontendOutput) {
            $frontendOutput -split "`n" | ForEach-Object {
                if ($_.Trim()) {
                    Write-ColoredOutput $_ "FRONTEND"
                    $frontendMsgCount++
                }
            }
        }
        
        # Verificar si los jobs siguen corriendo
        if ($backendJob.State -ne "Running" -and $frontendJob.State -ne "Running") {
            Write-Host ""
            Write-Host "[WARNING] Ambos servicios se detuvieron inesperadamente" -ForegroundColor Yellow
            Write-Host "Backend mensajes: $backendMsgCount | Frontend mensajes: $frontendMsgCount" -ForegroundColor Gray
            break
        }
        
        # Verificar estado individual
        if ($backendJob.State -ne "Running") {
            Write-Host "[WARNING] Backend detenido. Estado: $($backendJob.State)" -ForegroundColor Yellow
        }
        
        if ($frontendJob.State -ne "Running") {
            Write-Host "[WARNING] Frontend detenido. Estado: $($frontendJob.State)" -ForegroundColor Yellow
        }
        
        Start-Sleep -Milliseconds 100
    }
}
catch {
    Write-Host ""
    Write-Host "[ERROR] Excepción capturada: $($_.Exception.Message)" -ForegroundColor Red
}
finally {
    # Limpiar jobs al salir
    Write-Host ""
    Write-Host "[STOP] Deteniendo servicios..." -ForegroundColor Yellow
    
    # Capturar output final antes de detener
    $finalBackend = Receive-Job -Job $backendJob -ErrorAction SilentlyContinue
    $finalFrontend = Receive-Job -Job $frontendJob -ErrorAction SilentlyContinue
    
    if ($finalBackend) {
        Write-Host "[BACKEND] Output final:" -ForegroundColor Blue
        Write-Host $finalBackend -ForegroundColor DarkGray
    }
    
    if ($finalFrontend) {
        Write-Host "[FRONTEND] Output final:" -ForegroundColor Magenta
        Write-Host $finalFrontend -ForegroundColor DarkGray
    }
    
    Stop-Job -Job $backendJob -ErrorAction SilentlyContinue
    Stop-Job -Job $frontendJob -ErrorAction SilentlyContinue
    Remove-Job -Job $backendJob -Force -ErrorAction SilentlyContinue
    Remove-Job -Job $frontendJob -Force -ErrorAction SilentlyContinue
    
    Write-Host "[OK] Servicios detenidos" -ForegroundColor Green
    Write-Host "[INFO] Logs guardados en:" -ForegroundColor Cyan
    Write-Host "  - Backend:  $backendLogFile" -ForegroundColor White
    Write-Host "  - Frontend: $frontendLogFile" -ForegroundColor White
}