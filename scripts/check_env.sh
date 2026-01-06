#!/bin/bash

# Script de diagnóstico rápido
echo "==================================="
echo "DIAGNÓSTICO CONFIGURACIÓN DEBIAN"
echo "==================================="
echo ""

# Verificar archivo .env del backend
echo "1. Verificando .env del Backend:"
if [ -f ~/Home_nannies_project/Back_Django_REST/.env ]; then
    echo "   ✅ Archivo existe"
    echo ""
    echo "   Contenido:"
    cat ~/Home_nannies_project/Back_Django_REST/.env
else
    echo "   ❌ Archivo NO existe"
    echo ""
    echo "   SOLUCIÓN: Crear el archivo .env"
    echo "   Ejecuta:"
    echo "   cd ~/Home_nannies_project/Back_Django_REST"
    echo "   nano .env"
    echo ""
    echo "   Y agrega estas líneas:"
    echo "   DEBUG=True"
    echo "   SECRET_KEY=tu-clave-secreta-aqui"
    echo "   ALLOWED_HOSTS=localhost,127.0.0.1,104.248.213.225"
    echo "   CORS_ALLOWED_ORIGINS=http://104.248.213.225:5173"
fi

echo ""
echo "==================================="
