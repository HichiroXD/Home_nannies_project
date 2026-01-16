# ============================================
# SOLUCIÓN RÁPIDA - ERROR HTTPS EN SERVIDOR DEBIAN
# ============================================

## Problema
El servidor Django no inicia o muestra warnings de HTTPS porque falta el archivo .env con DEBUG=True

## Solución en 3 Pasos

### Paso 1: Crear archivo .env del Backend

```bash
cd ~/Home_nannies_project/Back_Django_REST
cat > .env << 'EOF'
DEBUG=True
SECRET_KEY=dev-debian-insecure-key-change-me-in-production
ALLOWED_HOSTS=localhost,127.0.0.1,104.248.213.225
CORS_ALLOWED_ORIGINS=http://104.248.213.225:5173,http://104.248.213.225:5174
CSRF_TRUSTED_ORIGINS=http://104.248.213.225:5173,http://104.248.213.225:8000
EOF
```

### Paso 2: Crear archivo .env del Frontend

```bash
cd ~/Home_nannies_project/frontend_nannies
cat > .env << 'EOF'
VITE_API_URL=http://104.248.213.225:8000/api
EOF
```

### Paso 3: Verificar que python-dotenv está instalado

```bash
cd ~/Home_nannies_project/Back_Django_REST
source venv/bin/activate
pip install python-dotenv
```

### Paso 4: Iniciar los servicios

Opción A - Usar el script automático:
```bash
cd ~/Home_nannies_project/scripts
chmod +x start_debian_server.sh
./start_debian_server.sh restart
```

Opción B - Manual (si el script falla):
```bash
# Terminal 1 - Backend
cd ~/Home_nannies_project/Back_Django_REST
source venv/bin/activate
python manage.py runserver 0.0.0.0:8000

# Terminal 2 - Frontend
cd ~/Home_nannies_project/frontend_nannies
npm run dev -- --host 0.0.0.0 --port 5173
```

## Verificación

### Verificar que Django lee el .env correctamente:
```bash
cd ~/Home_nannies_project/Back_Django_REST
source venv/bin/activate
python -c "import os; from dotenv import load_dotenv; load_dotenv(); print('DEBUG:', os.getenv('DEBUG')); print('SECRET_KEY:', 'OK' if os.getenv('SECRET_KEY') else 'MISSING')"
```

Debe mostrar:
```
DEBUG: True
SECRET_KEY: OK
```

### Verificar puertos abiertos:
```bash
sudo netstat -tulpn | grep -E '8000|5173'
```

Debe mostrar:
```
tcp        0      0 0.0.0.0:8000            0.0.0.0:*               LISTEN      <PID>/python
tcp        0      0 0.0.0.0:5173            0.0.0.0:*               LISTEN      <PID>/node
```

### Probar el API desde el servidor:
```bash
curl http://localhost:8000/api/users/me/
```

### Probar desde tu navegador:
Accede a: `http://104.248.213.225:5173`

## Si el error persiste

1. **Revisar logs del backend:**
```bash
tail -f ~/Home_nannies_project/logs/django.log
```

2. **Revisar que Django esté usando DEBUG=True:**
Deberías ver mensajes detallados de error si hay algún problema

3. **Verificar firewall:**
```bash
sudo ufw status
sudo ufw allow 8000/tcp
sudo ufw allow 5173/tcp
```

4. **Reiniciar todo:**
```bash
# Matar procesos
pkill -f "manage.py runserver"
pkill -f "vite"

# Esperar 2 segundos
sleep 2

# Iniciar de nuevo
cd ~/Home_nannies_project/scripts
./start_debian_server.sh start
```

## Nota Importante

Con `DEBUG=True`:
- ✅ No habrá warnings de HTTPS
- ✅ Los headers de seguridad estarán desactivados
- ✅ Verás errores detallados para debugging
- ⚠️ **NO usar en producción real**

Cuando estés listo para producción, cambia `DEBUG=False` y configura HTTPS con la guía:
`docs/CONFIGURAR_HTTPS_DEBIAN.md`
