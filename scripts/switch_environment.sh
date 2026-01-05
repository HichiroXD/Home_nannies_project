#!/bin/bash
# ============================================
# Script para Cambiar Entre Entornos (Linux/Mac)
# ============================================
# Uso: ./switch_environment.sh local|server|production
#
# Ejemplos:
#   ./switch_environment.sh local
#   ./switch_environment.sh server

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

ENV=$1
BACKEND_DIR="Back_Django_REST"

if [ -z "$ENV" ]; then
    echo -e "${RED}❌ Error: Debes especificar un entorno${NC}"
    echo "Uso: ./switch_environment.sh local|server|production"
    exit 1
fi

if [ "$ENV" != "local" ] && [ "$ENV" != "server" ] && [ "$ENV" != "production" ]; then
    echo -e "${RED}❌ Error: Entorno inválido. Usa: local, server o production${NC}"
    exit 1
fi

echo -e "${CYAN}"
echo "=========================================="
echo "🔧 Cambio de Entorno: $ENV"
echo "=========================================="
echo -e "${NC}"

# Verificar que estamos en el directorio correcto
if [ ! -d "$BACKEND_DIR" ]; then
    echo -e "${RED}❌ Error: No se encuentra el directorio $BACKEND_DIR${NC}"
    echo "Ejecuta este script desde la raíz del proyecto"
    exit 1
fi

cd $BACKEND_DIR

# Hacer backup del .env actual si existe
if [ -f ".env" ]; then
    TIMESTAMP=$(date +%Y%m%d_%H%M%S)
    BACKUP_NAME=".env.backup.$TIMESTAMP"
    echo -e "${CYAN}📦 Creando backup: $BACKUP_NAME${NC}"
    cp .env "$BACKUP_NAME"
fi

# Determinar el archivo fuente
case $ENV in
    local)
        SOURCE_FILE=".env.local"
        ;;
    server)
        SOURCE_FILE=".env.server"
        ;;
    production)
        SOURCE_FILE=".env.production.example"
        ;;
esac

# Verificar que existe el archivo fuente
if [ ! -f "$SOURCE_FILE" ]; then
    echo -e "${RED}❌ Error: No se encuentra el archivo $SOURCE_FILE${NC}"
    exit 1
fi

# Copiar el archivo de configuración
echo -e "${CYAN}📋 Copiando configuración desde $SOURCE_FILE${NC}"
cp "$SOURCE_FILE" .env

echo -e "${GREEN}"
echo "✅ Entorno cambiado exitosamente a: $ENV"
echo -e "${NC}"

# Mostrar información según el entorno
case $ENV in
    local)
        echo -e "${CYAN}📌 Configuración Local:${NC}"
        echo "   - Base de datos: SQLite (db.sqlite3)"
        echo "   - DEBUG: True"
        echo "   - Email: Console backend"
        echo ""
        echo -e "${YELLOW}⚠️  Recuerda: Este entorno es solo para desarrollo local${NC}"
        ;;
    server)
        echo -e "${CYAN}📌 Configuración Servidor:${NC}"
        echo "   - Base de datos: PostgreSQL"
        echo "   - Servidor: 104.248.213.225"
        echo "   - DEBUG: True (cambiar a False para producción)"
        echo ""
        echo -e "${YELLOW}⚠️  Verifica las credenciales de PostgreSQL en .env${NC}"
        echo -e "${YELLOW}⚠️  Asegúrate de que PostgreSQL esté corriendo${NC}"
        ;;
    production)
        echo -e "${CYAN}📌 Configuración Producción (Droplet):${NC}"
        echo "   - Base de datos: PostgreSQL"
        echo "   - Servidor: 104.248.213.225"
        echo "   - DEBUG: False"
        echo "   - Seguridad: Completa"
        echo ""
        echo -e "${RED}🔐 IMPORTANTE:${NC}"
        echo "   1. Edita .env con tus valores reales"
        echo "   2. Genera una nueva SECRET_KEY"
        echo "   3. Configura ALLOWED_HOSTS con tu dominio"
        echo "   4. Configura CORS_ALLOWED_ORIGINS"
        echo "   5. Configura EMAIL con credenciales reales"
        echo "   6. Configura PostgreSQL en el Droplet"
        ;;
esac

# Preguntar si quiere ver el contenido del .env
echo ""
read -p "¿Deseas ver el contenido de .env? (s/n) " response
if [ "$response" = "s" ] || [ "$response" = "S" ]; then
    echo -e "${CYAN}"
    echo "========== Contenido de .env =========="
    cat .env
    echo "========================================"
    echo -e "${NC}"
fi

# Preguntar si quiere aplicar migraciones (solo para server/production)
if [ "$ENV" != "local" ]; then
    echo ""
    read -p "¿Deseas aplicar migraciones de base de datos? (s/n) " response
    if [ "$response" = "s" ] || [ "$response" = "S" ]; then
        echo -e "${CYAN}🔄 Aplicando migraciones...${NC}"
        python manage.py migrate
    fi
fi

echo -e "${GREEN}"
echo "✨ Listo! Puedes iniciar el servidor con: python manage.py runserver"
echo -e "${NC}"

cd ..
