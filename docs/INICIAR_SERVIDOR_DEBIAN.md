# Guía para Iniciar el Servidor en Debian

## Requisitos Previos
- Servidor Debian configurado (IP: 104.248.213.225)
- Nginx instalado
- Python 3.13 y virtualenv
- Proyecto clonado en `/root/HNProject/Home_nannies_project`

## 1. Primera Vez: Configuración Inicial

### Instalar Gunicorn como Servicio Systemd

```bash
# Conectar al servidor
ssh root@104.248.213.225

# Navegar al proyecto
cd /root/HNProject/Home_nannies_project

# Actualizar código
git pull origin main

# Copiar el archivo de servicio
sudo cp scripts/gunicorn.service /etc/systemd/system/

# Recargar configuración de systemd
sudo systemctl daemon-reload

# Habilitar inicio automático
sudo systemctl enable gunicorn
```

## 2. Iniciar el Servidor

### Opción A: Con Systemd (Recomendado)

```bash
# Detener cualquier proceso anterior
sudo systemctl stop gunicorn
pkill -9 -f gunicorn

# Iniciar servicio
sudo systemctl start gunicorn

# Verificar estado
sudo systemctl status gunicorn

# Ver logs en tiempo real
sudo journalctl -u gunicorn -f
```

### Opción B: Manualmente (Desarrollo)

```bash
cd /root/HNProject/Home_nannies_project/Back_Django_REST

# Activar entorno virtual
source venv/bin/activate

# Iniciar Gunicorn
gunicorn --workers 3 \
         --bind 127.0.0.1:8000 \
         --timeout 60 \
         --access-logfile ../logs/gunicorn_access.log \
         --error-logfile ../logs/gunicorn_error.log \
         django_crud_api.wsgi:application
```

## 3. Gestión del Servicio

```bash
# Iniciar
sudo systemctl start gunicorn

# Detener
sudo systemctl stop gunicorn

# Reiniciar
sudo systemctl restart gunicorn

# Recargar configuración sin cortar conexiones
sudo systemctl reload gunicorn

# Ver estado
sudo systemctl status gunicorn

# Ver logs
sudo journalctl -u gunicorn -n 100 --no-pager
```

## 4. Verificar que Todo Funciona

```bash
# 1. Verificar que Gunicorn está corriendo
ps aux | grep gunicorn

# 2. Verificar que escucha en el puerto 8000
lsof -i:8000

# 3. Verificar Nginx
sudo systemctl status nginx

# 4. Probar el API
curl http://127.0.0.1:8000/api/users/

# 5. Probar desde el navegador
# http://104.248.213.225/
# http://104.248.213.225/api/
```

## 5. Después de Actualizar Código

```bash
cd /root/HNProject/Home_nannies_project

# Actualizar backend
git pull origin main

# Activar entorno virtual y aplicar migraciones
cd Back_Django_REST
source venv/bin/activate
python manage.py migrate

# Reiniciar Gunicorn
sudo systemctl restart gunicorn

# Actualizar frontend
cd ../frontend_nannies
npm run build

# Recargar Nginx
sudo systemctl reload nginx
```

## 6. Solución de Problemas

### Error: "Address already in use"

```bash
# Matar todos los procesos de Gunicorn
pkill -9 -f gunicorn

# Liberar puerto 8000
lsof -ti:8000 | xargs kill -9

# Reintentar
sudo systemctl start gunicorn
```

### Error: "Permission denied"

```bash
# Verificar permisos
ls -la /root/HNProject/Home_nannies_project
chmod +rx /root
chmod +rx /root/HNProject
chmod +rx /root/HNProject/Home_nannies_project
```

### Ver Logs Detallados

```bash
# Logs de Gunicorn
tail -f /root/HNProject/Home_nannies_project/logs/gunicorn_error.log
tail -f /root/HNProject/Home_nannies_project/logs/gunicorn_access.log

# Logs de Nginx
tail -f /var/log/nginx/error.log
tail -f /var/log/nginx/access.log

# Logs de systemd
sudo journalctl -xeu gunicorn.service --no-pager | tail -50
```

### Servicio No Inicia

```bash
# Verificar sintaxis del archivo .service
sudo systemd-analyze verify gunicorn.service

# Probar manualmente
cd /root/HNProject/Home_nannies_project/Back_Django_REST
source venv/bin/activate
gunicorn --bind 127.0.0.1:8000 django_crud_api.wsgi:application
# Si funciona, Ctrl+C y volver a systemd
```

## 7. Script de Inicio Rápido

Para facilitar el inicio, usa el script automatizado:

```bash
cd /root/HNProject/Home_nannies_project
./scripts/start_debian_server.sh
```

## 8. Arquitectura del Sistema

```
Internet → Nginx (puerto 80) → Gunicorn (puerto 8000) → Django
                             ↓
                    Frontend estático (dist/)
```

- **Frontend**: Servido por Nginx desde `frontend_nannies/dist/`
- **Backend API**: Proxy reverso de Nginx a Gunicorn en `127.0.0.1:8000`
- **Admin Panel**: Accesible en `http://104.248.213.225/admin/`

## 9. URLs del Sistema

- **Frontend**: http://104.248.213.225/
- **API**: http://104.248.213.225/api/
- **Admin**: http://104.248.213.225/admin/
- **API Docs**: http://104.248.213.225/api/docs/ (si está configurado)

## 10. Variables de Entorno Importantes

Ubicación: `/root/HNProject/Home_nannies_project/Back_Django_REST/.env`

```env
DEBUG=True
SECRET_KEY=tu-secret-key
ALLOWED_HOSTS=localhost,127.0.0.1,104.248.213.225
CORS_ALLOWED_ORIGINS=http://104.248.213.225
DATABASE_URL=sqlite:///db.sqlite3
```

## 11. Comandos de Mantenimiento

```bash
# Limpiar logs antiguos
truncate -s 0 /root/HNProject/Home_nannies_project/logs/gunicorn_*.log

# Ver uso de memoria
free -h
ps aux --sort=-%mem | head

# Ver uso de disco
df -h

# Reiniciar todo el sistema
sudo systemctl restart gunicorn nginx
```

## Notas Adicionales

- El servicio Gunicorn está configurado con **Restart=on-failure** para reinicio automático
- Usa **3 workers** para manejar múltiples conexiones simultáneas
- Los logs se guardan en `/root/HNProject/Home_nannies_project/logs/`
- Nginx sirve archivos estáticos directamente sin pasar por Django
