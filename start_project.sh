#!/bin/bash
# ============================================
# Script para iniciar el proyecto Home Nannies
# Backend Django + Frontend React
# ============================================

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
NC='\033[0m' # No Color

echo -e "${CYAN}>>> Iniciando Home Nannies Project...${NC}"
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
    echo -e "${RED}[ERROR] No se encuentra la carpeta del backend${NC}"
    exit 1
fi

if [ ! -d "$FRONTEND_PATH" ]; then
    echo -e "${RED}[ERROR] No se encuentra la carpeta del frontend${NC}"
    exit 1
fi

# Función para formatear timestamps
get_timestamp() {
    date +"%H:%M:%S"
}

# Limpiar logs anteriores
> "$BACKEND_LOG_FILE"
> "$FRONTEND_LOG_FILE"

# Función para matar procesos en puertos
cleanup_ports() {
    echo -e "${YELLOW}[INFO] Limpiando puertos...${NC}"
    
    # Matar proceso en puerto 8000 (Django)
    if lsof -Pi :8000 -sTCP:LISTEN -t >/dev/null 2>&1; then
        kill -9 $(lsof -Pi :8000 -sTCP:LISTEN -t) 2>/dev/null
        echo -e "${GREEN}[OK] Puerto 8000 liberado${NC}"
    fi
    
    # Matar proceso en puerto 5173 (Vite)
    if lsof -Pi :5173 -sTCP:LISTEN -t >/dev/null 2>&1; then
        kill -9 $(lsof -Pi :5173 -sTCP:LISTEN -t) 2>/dev/null
        echo -e "${GREEN}[OK] Puerto 5173 liberado${NC}"
    fi
}

# Función para manejar Ctrl+C
cleanup() {
    echo ""
    echo -e "${YELLOW}[STOP] Deteniendo servicios...${NC}"
    
    # Matar procesos
    if [ ! -z "$BACKEND_PID" ]; then
        kill $BACKEND_PID 2>/dev/null
        wait $BACKEND_PID 2>/dev/null
    fi
    
    if [ ! -z "$FRONTEND_PID" ]; then
        kill $FRONTEND_PID 2>/dev/null
        wait $FRONTEND_PID 2>/dev/null
    fi
    
    cleanup_ports
    
    echo -e "${GREEN}[OK] Servicios detenidos${NC}"
    echo -e "${CYAN}[INFO] Logs guardados en:${NC}"
    echo -e "  - Backend:  $BACKEND_LOG_FILE"
    echo -e "  - Frontend: $FRONTEND_LOG_FILE"
    exit 0
}

trap cleanup INT TERM

# Limpiar puertos antes de iniciar
cleanup_ports

# Iniciar Backend
echo -e "${BLUE}[INFO] Iniciando Backend Django...${NC}"
cd "$BACKEND_PATH"

# Verificar si existe entorno virtual
if [ ! -d "venv" ]; then
    echo -e "${YELLOW}[WARNING] No se encuentra entorno virtual. Creando...${NC}"
    python3 -m venv venv
    source venv/bin/activate
    pip install -r requirements.txt
else
    source venv/bin/activate
fi

# Configurar variables de entorno
export DEBUG=True
export PYTHONUNBUFFERED=1

# Iniciar Django en background
python manage.py runserver --noreload > "$BACKEND_LOG_FILE" 2>&1 &
BACKEND_PID=$!

echo -e "${GREEN}[OK] Backend Django iniciado en http://localhost:8000 (PID: $BACKEND_PID)${NC}"

# Esperar un poco para que el backend inicie
sleep 2

# Iniciar Frontend
echo -e "${MAGENTA}[INFO] Iniciando Frontend React...${NC}"
cd "$FRONTEND_PATH"

# Verificar si existen node_modules
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}[WARNING] No se encuentran node_modules. Instalando...${NC}"
    npm install
fi

# Iniciar Vite en background
npm run dev > "$FRONTEND_LOG_FILE" 2>&1 &
FRONTEND_PID=$!

echo -e "${GREEN}[OK] Frontend React iniciado en http://localhost:5173 (PID: $FRONTEND_PID)${NC}"

echo ""
echo -e "${YELLOW}=== Servicios iniciados ===${NC}"
echo -e "   - Backend:  http://localhost:8000"
echo -e "   - Frontend: http://localhost:5173"
echo -e "   - Logs guardados en: $LOGS_PATH"
echo ""
echo -e "${YELLOW}[INFO] Presiona Ctrl+C para detener ambos servicios${NC}"
echo ""

# Mostrar logs en tiempo real
tail -f "$BACKEND_LOG_FILE" "$FRONTEND_LOG_FILE" &
TAIL_PID=$!

# Esperar a que termine
wait $BACKEND_PID $FRONTEND_PID

# Limpiar al salir
cleanup
