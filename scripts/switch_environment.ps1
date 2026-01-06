# ============================================
# Script para Cambiar Entre Entornos
# ============================================
# Uso: .\switch_environment.ps1 -Env local|server|production
#
# Ejemplos:
#   .\switch_environment.ps1 -Env local
#   .\switch_environment.ps1 -Env server

param(
    [Parameter(Mandatory=$true)]
    [ValidateSet('local','server','production')]
    [string]$Env
)

$BackendDir = "Back_Django_REST"

# Colores para mensajes
function Write-Success { Write-Host $args -ForegroundColor Green }
function Write-Info { Write-Host $args -ForegroundColor Cyan }
function Write-Warning { Write-Host $args -ForegroundColor Yellow }
function Write-Error { Write-Host $args -ForegroundColor Red }

Write-Info "`n=========================================="
Write-Info "🔧 Cambio de Entorno: $Env"
Write-Info "==========================================`n"

# Verificar que estamos en el directorio correcto
if (-not (Test-Path $BackendDir)) {
    Write-Error "❌ Error: No se encuentra el directorio $BackendDir"
    Write-Error "Ejecuta este script desde la raíz del proyecto"
    exit 1
}

# Cambiar al directorio del backend
Set-Location $BackendDir

# Hacer backup del .env actual si existe
if (Test-Path ".env") {
    $timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
    $backupName = ".env.backup.$timestamp"
    Write-Info "📦 Creando backup: $backupName"
    Copy-Item ".env" $backupName
}

# Determinar el archivo fuente
$sourceFile = switch ($Env) {
    'local'      { '.env.local' }
    'server'     { '.env.server' }
    'production' { '.env.production.example' }
}

# Verificar que existe el archivo fuente
if (-not (Test-Path $sourceFile)) {
    Write-Error "❌ Error: No se encuentra el archivo $sourceFile"
    exit 1
}

# Copiar el archivo de configuración
Write-Info "📋 Copiando configuración desde $sourceFile"
Copy-Item $sourceFile ".env" -Force

Write-Success "`n✅ Entorno cambiado exitosamente a: $Env`n"

# Mostrar información según el entorno
switch ($Env) {
    'local' {
        Write-Info "📌 Configuración Local:"
        Write-Info "   - Base de datos: SQLite (db.sqlite3)"
        Write-Info "   - DEBUG: True"
        Write-Info "   - Email: Console backend"
        Write-Info ""
        Write-Warning "⚠️  Recuerda: Este entorno es solo para desarrollo local"
    }
    'server' {
        Write-Info "📌 Configuración Servidor:"
        Write-Info "   - Base de datos: PostgreSQL"
        Write-Info "   - Servidor: 104.248.213.225"
        Write-Info "   - DEBUG: True (cambiar a False para producción)"
        Write-Info ""
        Write-Warning "⚠️  Verifica las credenciales de PostgreSQL en .env"
        Write-Warning "⚠️  Asegúrate de que PostgreSQL esté corriendo"
    }
    'production' {
        Write-Info "📌 Configuración Producción (Droplet):"
        Write-Info "   - Base de datos: PostgreSQL"
        Write-Info "   - Servidor: 104.248.213.225"
        Write-Info "   - DEBUG: False"
        Write-Info "   - Seguridad: Completa"
        Write-Info ""
        Write-Error "🔐 IMPORTANTE:"
        Write-Error "   1. Edita .env con tus valores reales"
        Write-Error "   2. Genera una nueva SECRET_KEY"
        Write-Error "   3. Configura ALLOWED_HOSTS con tu dominio"
        Write-Error "   4. Configura CORS_ALLOWED_ORIGINS"
        Write-Error "   5. Configura EMAIL con credenciales reales"
        Write-Error "   6. Configura PostgreSQL en el Droplet"
    }
}

# Preguntar si quiere ver el contenido del .env
Write-Host ""
$response = Read-Host "¿Deseas ver el contenido de .env? (s/n)"
if ($response -eq 's' -or $response -eq 'S') {
    Write-Info "`n========== Contenido de .env =========="
    Get-Content ".env"
    Write-Info "========================================"
}

# Preguntar si quiere aplicar migraciones (solo para server/production)
if ($Env -ne 'local') {
    Write-Host ""
    $response = Read-Host "¿Deseas aplicar migraciones de base de datos? (s/n)"
    if ($response -eq 's' -or $response -eq 'S') {
        Write-Info "`n🔄 Aplicando migraciones..."
        python manage.py migrate
    }
}

Write-Success "`n✨ Listo! Puedes iniciar el servidor con: python manage.py runserver`n"

# Volver al directorio raíz
Set-Location ..
