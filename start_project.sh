#!/bin/bash
# filepath: start_project.sh
# Script para iniciar el proyecto Home Nannies
# Backend Django + Frontend React

echo -e "\033[0;36m>>> Iniciando Home Nannies Project...\033[0m"
echo ""

# Ruta del proyecto
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_PATH="$PROJECT_ROOT/Back_Django_REST"
FRONTEND_PATH="$PROJECT_ROOT/frontend_nannies"
LOGS_PATH="$PROJECT_ROOT/logs"

# Crear carpeta de logs si no existe
mkdir -p "$LOGS_PATH"

BACKEND_LOG_FILE="$LOGS_PATH/backend_console.log"
FRONTEND_LOG_FILE="$LOGS_PATH/frontend_console.log"

# Verificar que existen las carpetas
if [ ! -d "$BACKEND_PATH" ]; then
    echo -e "\033[0;31m[ERROR] No se encuentra la carpeta del backend\033[0m"
    exit 1
fi

if [ ! -d "$FRONTEND_PATH" ]; then
    echo -e "\033[0;31m[ERROR] No se encuentra la carpeta del frontend\033[0m"
    exit 1
fi

# Función para formatear timestamps
get_timestamp() {
    date +"%H:%M:%S"
}

# Función para colorear output
write_colored_output() {
    local message="$1"
    local source="$2"
    local timestamp=$(get_timestamp)
    local color=""
    local prefix="  "
    
    # Determinar color por fuente
    if [ "$source" == "BACKEND" ]; then
        color="\033[0;34m"  # Blue
    else
        color="\033[0;35m"  # Magenta
    fi
    
    # Detectar errores y warnings
    if echo "$message" | grep -iE "error|exception|failed|traceback" | grep -vq "0 errors"; then
        color="\033[0;31m"  # Red
        prefix="❌"
    elif echo "$message" | grep -iqE "warning|warn"; then
        color="\033[0;33m"  # Yellow
        prefix="⚠️"
    elif echo "$message" | grep -iqE "success|ok|✅"; then
        color="\033[0;32m"  # Green
        prefix="✅"
    fi
    
    local output="[$timestamp] [$source] $prefix $message"
    echo -e "${color}${output}\033[0m"
    
    # Guardar en archivo de log
    local log_file=""
    if [ "$source" == "BACKEND" ]; then
        log_file="$BACKEND_LOG_FILE"
    else
        log_file="$FRONTEND_LOG_FILE"
    fi
    echo "$output" >> "$log_file"
}

# Limpiar logs anteriores
> "$BACKEND_LOG_FILE"
> "$FRONTEND_LOG_FILE"

# Variables para almacenar PIDs
BACKEND_PID=""
FRONTEND_PID=""

# Función para limpiar al salir
cleanup() {
    echo ""
    echo -e "\033[0;33m[STOP] Deteniendo servicios...\033[0m"
    
    if [ ! -z "$BACKEND_PID" ] && kill -0 $BACKEND_PID 2>/dev/null; then
        kill $BACKEND_PID 2>/dev/null
        wait $BACKEND_PID 2>/dev/null
    fi
    
    if [ ! -z "$FRONTEND_PID" ] && kill -0 $FRONTEND_PID 2>/dev/null; then
        kill $FRONTEND_PID 2>/dev/null
        wait $FRONTEND_PID 2>/dev/null
    fi
    
    echo -e "\033[0;32m[OK] Servicios detenidos\033[0m"
    echo -e "\033[0;36m[INFO] Logs guardados en:\033[0m"
    echo -e "\033[0;37m  - Backend:  $BACKEND_LOG_FILE\033[0m"
    echo -e "\033[0;37m  - Frontend: $FRONTEND_LOG_FILE\033[0m"
    exit 0
}

# Configurar trap para Ctrl+C
trap cleanup SIGINT SIGTERM

# Función para iniciar el backend
start_backend() {
    cd "$BACKEND_PATH"
    
    # Activar entorno virtual
    if [ -f "venv/bin/activate" ]; then
        source venv/bin/activate
    else
        echo -e "\033[0;31m[ERROR] No se encuentra el entorno virtual del backend\033[0m"
        exit 1
    fi
    
    # Configurar variables de entorno
    export DEBUG="True"
    export PYTHONUNBUFFERED="1"
    
    # Iniciar servidor Django en 0.0.0.0:8000
    python manage.py runserver 0.0.0.0:8000 --noreload 2>&1 | while IFS= read -r line; do
        write_colored_output "$line" "BACKEND"
    done
}

# Función para iniciar el frontend
start_frontend() {
    cd "$FRONTEND_PATH"
    
    # Verificar que node_modules existe
    if [ ! -d "node_modules" ]; then
        echo -e "\033[0;33m[WARNING] node_modules no encontrado. Ejecutando npm install...\033[0m"
        npm install
    fi
    
    # Iniciar servidor Vite en 0.0.0.0:5173
    npm run dev -- --host 0.0.0.0 2>&1 | while IFS= read -r line; do
        write_colored_output "$line" "FRONTEND"
    done
}

# Iniciar backend en background
start_backend &
BACKEND_PID=$!

echo -e "\033[0;32m[OK] Backend Django iniciando en http://0.0.0.0:8000\033[0m"

# Esperar un poco para que el backend inicie
sleep 2

# Iniciar frontend en background
start_frontend &
FRONTEND_PID=$!

echo -e "\033[0;32m[OK] Frontend React iniciando en http://0.0.0.0:5173\033[0m"
echo ""
echo -e "\033[0;33m=== Servicios iniciados ===\033[0m"
echo -e "\033[0;37m   - Backend:  http://0.0.0.0:8000 (accesible desde cualquier interfaz)\033[0m"
echo -e "\033[0;37m   - Frontend: http://0.0.0.0:5173 (accesible desde cualquier interfaz)\033[0m"
echo -e "\033[0;37m   - Logs guardados en: $LOGS_PATH\033[0m"
echo ""
echo -e "\033[0;33m[INFO] Presiona Ctrl+C para detener ambos servicios\033[0m"
echo ""

# Mantener el script corriendo y monitorear los procesos
while true; do
    # Verificar si el backend sigue corriendo
    if ! kill -0 $BACKEND_PID 2>/dev/null; then
        echo -e "\033[0;33m[WARNING] Backend detenido inesperadamente\033[0m"
        cleanup
    fi
    
    # Verificar si el frontend sigue corriendo
    if ! kill -0 $FRONTEND_PID 2>/dev/null; then
        echo -e "\033[0;33m[WARNING] Frontend detenido inesperadamente\033[0m"
        cleanup
    fi
    
    sleep 1
done
