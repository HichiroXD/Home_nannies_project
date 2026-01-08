#!/bin/bash

# ============================================
# Script de Inicio para Servidor Debian
# ============================================

set -e  # Salir si hay algún error

echo "🚀 Iniciando Home Nannies Project en Servidor Debian..."

# Colores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Directorio del proyecto
PROJECT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )/.." && pwd )"
BACKEND_DIR="$PROJECT_DIR/Back_Django_REST"
FRONTEND_DIR="$PROJECT_DIR/frontend_nannies"

echo "📂 Directorio del proyecto: $PROJECT_DIR"

# ============================================
# Función para verificar dependencias
# ============================================
check_dependencies() {
    echo -e "${YELLOW}📦 Verificando dependencias...${NC}"
    
    if ! command -v python3 &> /dev/null; then
        echo -e "${RED}❌ Python3 no está instalado${NC}"
        exit 1
    fi
    
    if ! command -v npm &> /dev/null; then
        echo -e "${RED}❌ Node.js/npm no está instalado${NC}"
        exit 1
    fi
    
    echo -e "${GREEN}✅ Dependencias verificadas${NC}"
}

# ============================================
# Configurar Backend Django
# ============================================
setup_backend() {
    echo -e "${YELLOW}🔧 Configurando Backend Django...${NC}"
    
    cd "$BACKEND_DIR"
    
    # Verificar archivo .env
    if [ ! -f .env ]; then
        echo -e "${RED}❌ Archivo .env no encontrado en Back_Django_REST/${NC}"
        echo -e "${YELLOW}📝 Copiando .env.debian.example a .env...${NC}"
        if [ -f .env.debian.example ]; then
            cp .env.debian.example .env
            echo -e "${YELLOW}⚠️  IMPORTANTE: Edita el archivo .env con tus configuraciones${NC}"
            echo -e "${YELLOW}   Ejecuta: nano $BACKEND_DIR/.env${NC}"
            exit 1
        else
            echo -e "${RED}❌ No se encuentra .env.debian.example${NC}"
            exit 1
        fi
    fi
    
    # Activar entorno virtual
    if [ ! -d "venv" ]; then
        echo -e "${YELLOW}📦 Creando entorno virtual...${NC}"
        python3 -m venv venv
    fi
    
    source venv/bin/activate
    
    # Instalar dependencias
    echo -e "${YELLOW}📦 Instalando dependencias de Python...${NC}"
    pip install -r requirements.txt
    
    # Aplicar migraciones
    echo -e "${YELLOW}🗄️  Aplicando migraciones...${NC}"
    python manage.py migrate
    
    # Recolectar archivos estáticos
    echo -e "${YELLOW}📁 Recolectando archivos estáticos...${NC}"
    python manage.py collectstatic --noinput
    
    echo -e "${GREEN}✅ Backend configurado${NC}"
}

# ============================================
# Configurar Frontend
# ============================================
setup_frontend() {
    echo -e "${YELLOW}🔧 Configurando Frontend...${NC}"
    
    cd "$FRONTEND_DIR"
    
    # Verificar archivo .env
    if [ ! -f .env ]; then
        echo -e "${RED}❌ Archivo .env no encontrado en frontend_nannies/${NC}"
        echo -e "${YELLOW}📝 Copiando .env.debian.example a .env...${NC}"
        if [ -f .env.debian.example ]; then
            cp .env.debian.example .env
            echo -e "${YELLOW}⚠️  IMPORTANTE: Edita el archivo .env con la IP de tu servidor${NC}"
            echo -e "${YELLOW}   Ejecuta: nano $FRONTEND_DIR/.env${NC}"
        fi
    fi
    
    # Instalar dependencias
    echo -e "${YELLOW}📦 Instalando dependencias de Node...${NC}"
    npm install
    
    echo -e "${GREEN}✅ Frontend configurado${NC}"
}

# ============================================
# Iniciar Servicios
# ============================================
start_services() {
    echo -e "${YELLOW}🚀 Iniciando servicios...${NC}"
    
    # Obtener IP del servidor
    SERVER_IP=$(hostname -I | awk '{print $1}')
    
    echo -e "${GREEN}📡 Servidor IP: $SERVER_IP${NC}"
    
    # Iniciar Backend
    echo -e "${YELLOW}🔄 Iniciando Backend Django en 0.0.0.0:8000...${NC}"
    cd "$BACKEND_DIR"
    source venv/bin/activate
    
    # Matar procesos previos si existen
    pkill -f "manage.py runserver" || true
    
    # Iniciar Django en segundo plano
    nohup python manage.py runserver 0.0.0.0:8000 > logs/django.log 2>&1 &
    BACKEND_PID=$!
    echo -e "${GREEN}✅ Backend iniciado (PID: $BACKEND_PID)${NC}"
    
    # Iniciar Frontend
    echo -e "${YELLOW}🔄 Iniciando Frontend en 0.0.0.0:5173...${NC}"
    cd "$FRONTEND_DIR"
    
    # Matar procesos previos si existen
    pkill -f "vite" || true
    
    # Iniciar Vite en segundo plano
    nohup npm run dev -- --host 0.0.0.0 --port 5173 > ../logs/vite.log 2>&1 &
    FRONTEND_PID=$!
    echo -e "${GREEN}✅ Frontend iniciado (PID: $FRONTEND_PID)${NC}"
    
    # Esperar a que los servicios inicien
    sleep 5
    
    echo ""
    echo -e "${GREEN}═══════════════════════════════════════════${NC}"
    echo -e "${GREEN}✅ Servicios iniciados correctamente!${NC}"
    echo -e "${GREEN}═══════════════════════════════════════════${NC}"
    echo ""
    echo -e "📱 Aplicación disponible en:"
    echo -e "   Frontend: ${GREEN}http://$SERVER_IP:5173${NC}"
    echo -e "   Backend API: ${GREEN}http://$SERVER_IP:8000/api${NC}"
    echo -e "   Admin Django: ${GREEN}http://$SERVER_IP:8000/admin${NC}"
    echo ""
    echo -e "📋 Ver logs:"
    echo -e "   Backend: tail -f $BACKEND_DIR/logs/django.log"
    echo -e "   Frontend: tail -f $PROJECT_DIR/logs/vite.log"
    echo ""
    echo -e "🛑 Detener servicios:"
    echo -e "   kill $BACKEND_PID $FRONTEND_PID"
    echo -e "   O ejecuta: pkill -f 'manage.py runserver|vite'"
    echo ""
    
    # Guardar PIDs para poder detenerlos después
    echo "$BACKEND_PID" > "$PROJECT_DIR/.backend.pid"
    echo "$FRONTEND_PID" > "$PROJECT_DIR/.frontend.pid"
}

# ============================================
# Función de ayuda
# ============================================
show_help() {
    echo "Uso: $0 [OPCIÓN]"
    echo ""
    echo "Opciones:"
    echo "  start      Iniciar servicios (por defecto)"
    echo "  stop       Detener servicios"
    echo "  restart    Reiniciar servicios"
    echo "  status     Ver estado de servicios"
    echo "  setup      Solo configurar (sin iniciar)"
    echo "  help       Mostrar esta ayuda"
}

# ============================================
# Detener servicios
# ============================================
stop_services() {
    echo -e "${YELLOW}🛑 Deteniendo servicios...${NC}"
    
    if [ -f "$PROJECT_DIR/.backend.pid" ]; then
        BACKEND_PID=$(cat "$PROJECT_DIR/.backend.pid")
        kill $BACKEND_PID 2>/dev/null && echo -e "${GREEN}✅ Backend detenido${NC}" || echo -e "${YELLOW}⚠️  Backend ya estaba detenido${NC}"
        rm "$PROJECT_DIR/.backend.pid"
    fi
    
    if [ -f "$PROJECT_DIR/.frontend.pid" ]; then
        FRONTEND_PID=$(cat "$PROJECT_DIR/.frontend.pid")
        kill $FRONTEND_PID 2>/dev/null && echo -e "${GREEN}✅ Frontend detenido${NC}" || echo -e "${YELLOW}⚠️  Frontend ya estaba detenido${NC}"
        rm "$PROJECT_DIR/.frontend.pid"
    fi
    
    # Forzar la terminación de cualquier proceso restante
    pkill -f "manage.py runserver" || true
    pkill -f "vite" || true
    
    echo -e "${GREEN}✅ Todos los servicios detenidos${NC}"
}

# ============================================
# Ver estado de servicios
# ============================================
check_status() {
    echo -e "${YELLOW}📊 Estado de servicios...${NC}"
    
    if pgrep -f "manage.py runserver" > /dev/null; then
        echo -e "${GREEN}✅ Backend Django: Corriendo${NC}"
        ps aux | grep "manage.py runserver" | grep -v grep
    else
        echo -e "${RED}❌ Backend Django: No está corriendo${NC}"
    fi
    
    echo ""
    
    if pgrep -f "vite" > /dev/null; then
        echo -e "${GREEN}✅ Frontend Vite: Corriendo${NC}"
        ps aux | grep "vite" | grep -v grep
    else
        echo -e "${RED}❌ Frontend Vite: No está corriendo${NC}"
    fi
}

# ============================================
# Programa Principal
# ============================================

# Crear directorio de logs si no existe
mkdir -p "$PROJECT_DIR/logs"

case "${1:-start}" in
    start)
        check_dependencies
        setup_backend
        setup_frontend
        start_services
        ;;
    stop)
        stop_services
        ;;
    restart)
        stop_services
        sleep 2
        setup_backend
        setup_frontend
        start_services
        ;;
    status)
        check_status
        ;;
    setup)
        check_dependencies
        setup_backend
        setup_frontend
        echo -e "${GREEN}✅ Configuración completada. Ejecuta '$0 start' para iniciar servicios${NC}"
        ;;
    help|--help|-h)
        show_help
        ;;
    *)
        echo -e "${RED}❌ Opción no válida: $1${NC}"
        show_help
        exit 1
        ;;
esac
