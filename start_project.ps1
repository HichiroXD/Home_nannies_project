# Script para iniciar el proyecto Home Nannies
# Backend Django + Frontend React

Write-Host ">>> Iniciando Home Nannies Project..." -ForegroundColor Cyan
Write-Host ""

# Ruta del proyecto
$projectRoot = $PSScriptRoot
$backendPath = Join-Path $projectRoot "Back_Django_REST"
$frontendPath = Join-Path $projectRoot "frontend_nannies"

# Verificar que existen las carpetas
if (-not (Test-Path $backendPath)) {
    Write-Host "[ERROR] No se encuentra la carpeta del backend" -ForegroundColor Red
    exit 1
}

if (-not (Test-Path $frontendPath)) {
    Write-Host "[ERROR] No se encuentra la carpeta del frontend" -ForegroundColor Red
    exit 1
}

# Función para iniciar el backend
$backendJob = Start-Job -ScriptBlock {
    param($path)
    Set-Location $path
    
    # Activar entorno virtual
    & .\venv\Scripts\Activate.ps1
    
    # Iniciar servidor Django
    python manage.py runserver
} -ArgumentList $backendPath

Write-Host "[OK] Backend Django iniciando en http://localhost:8000" -ForegroundColor Green

# Esperar un poco para que el backend inicie
Start-Sleep -Seconds 2

# Función para iniciar el frontend
$frontendJob = Start-Job -ScriptBlock {
    param($path)
    Set-Location $path
    
    # Iniciar servidor Vite
    npm run dev
} -ArgumentList $frontendPath

Write-Host "[OK] Frontend React iniciando en http://localhost:5173" -ForegroundColor Green
Write-Host ""
Write-Host "=== Servicios iniciados ===" -ForegroundColor Yellow
Write-Host "   - Backend:  http://localhost:8000" -ForegroundColor White
Write-Host "   - Frontend: http://localhost:5173" -ForegroundColor White
Write-Host ""
Write-Host "[INFO] Presiona Ctrl+C para detener ambos servicios" -ForegroundColor Yellow
Write-Host ""

# Mostrar logs de ambos servicios
try {
    while ($true) {
        $backendOutput = Receive-Job -Job $backendJob -ErrorAction SilentlyContinue
        $frontendOutput = Receive-Job -Job $frontendJob -ErrorAction SilentlyContinue
        
        if ($backendOutput) {
            Write-Host "[BACKEND] $backendOutput" -ForegroundColor Blue
        }
        
        if ($frontendOutput) {
            Write-Host "[FRONTEND] $frontendOutput" -ForegroundColor Magenta
        }
        
        # Verificar si los jobs siguen corriendo
        if ($backendJob.State -ne "Running" -and $frontendJob.State -ne "Running") {
            break
        }
        
        Start-Sleep -Milliseconds 100
    }
}
finally {
    # Limpiar jobs al salir
    Write-Host ""
    Write-Host "[STOP] Deteniendo servicios..." -ForegroundColor Yellow
    Stop-Job -Job $backendJob -ErrorAction SilentlyContinue
    Stop-Job -Job $frontendJob -ErrorAction SilentlyContinue
    Remove-Job -Job $backendJob -ErrorAction SilentlyContinue
    Remove-Job -Job $frontendJob -ErrorAction SilentlyContinue
    Write-Host "[OK] Servicios detenidos" -ForegroundColor Green
}