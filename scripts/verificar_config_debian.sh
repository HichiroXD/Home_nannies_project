#!/bin/bash

# Script de verificación para servidor Debian
echo "🔍 Verificando configuración del servidor..."
echo ""

cd ~/Home_nannies_project/Back_Django_REST

# 1. Verificar que existe .env
echo "1️⃣ Verificando archivo .env del Backend..."
if [ -f .env ]; then
    echo "   ✅ Archivo .env existe"
    echo ""
    echo "   📋 Contenido del .env:"
    cat .env | grep -E "DEBUG|SECRET_KEY|ALLOWED_HOSTS|CORS_ALLOWED_ORIGINS"
    echo ""
else
    echo "   ❌ Archivo .env NO existe"
    echo "   Crear desde: cp .env.debian.example .env"
    exit 1
fi

# 2. Verificar que python-dotenv esté instalado
echo "2️⃣ Verificando python-dotenv..."
source venv/bin/activate
if python -c "import dotenv" 2>/dev/null; then
    echo "   ✅ python-dotenv está instalado"
else
    echo "   ❌ python-dotenv NO está instalado"
    echo "   Instalar con: pip install python-dotenv"
fi
echo ""

# 3. Verificar que Django lee las variables correctamente
echo "3️⃣ Verificando que Django lee el .env correctamente..."
DEBUG_VALUE=$(python -c "import os; from dotenv import load_dotenv; load_dotenv(); print(os.getenv('DEBUG', 'NOT_SET'))")
echo "   DEBUG = $DEBUG_VALUE"

if [ "$DEBUG_VALUE" = "True" ]; then
    echo "   ✅ DEBUG=True (correcto para desarrollo)"
else
    echo "   ⚠️  DEBUG=$DEBUG_VALUE (debería ser 'True' para desarrollo)"
fi
echo ""

# 4. Verificar .env del frontend
echo "4️⃣ Verificando archivo .env del Frontend..."
cd ~/Home_nannies_project/frontend_nannies
if [ -f .env ]; then
    echo "   ✅ Archivo .env existe"
    echo ""
    echo "   📋 Contenido del .env:"
    cat .env
    echo ""
else
    echo "   ❌ Archivo .env NO existe"
    echo "   Crear desde: cp .env.debian.example .env"
fi

# 5. Verificar puertos en uso
echo "5️⃣ Verificando servicios corriendo..."
if netstat -tuln | grep -q ":8000"; then
    echo "   ✅ Puerto 8000 (Django) está en uso"
else
    echo "   ❌ Puerto 8000 (Django) NO está en uso - Django no está corriendo"
fi

if netstat -tuln | grep -q ":5173"; then
    echo "   ✅ Puerto 5173 (Frontend) está en uso"
else
    echo "   ❌ Puerto 5173 (Frontend) NO está en uso - Frontend no está corriendo"
fi
echo ""

# 6. Verificar IP del servidor
echo "6️⃣ IP del servidor:"
hostname -I | awk '{print "   " $1}'
echo ""

echo "✅ Verificación completada"
echo ""
echo "Si todo está correcto, reinicia los servicios:"
echo "   cd ~/Home_nannies_project/scripts"
echo "   ./start_debian_server.sh restart"
