# 🔒 Configurar HTTPS en Servidor Debian con Let's Encrypt

## ¿Por qué necesitas HTTPS?

Los warnings que estás viendo (`Cross-Origin-Opener-Policy`, `SESSION_COOKIE_SECURE`, etc.) ocurren porque:
- Estás usando HTTP (no seguro) con una IP pública
- Los headers de seguridad modernos requieren HTTPS
- Los navegadores modernos bloquean ciertas características en HTTP

## Soluciones

### Opción 1: Desarrollo con DEBUG=True (Temporal)

Para desarrollo rápido, puedes usar `DEBUG=True` en tu `.env`:

```env
DEBUG=True
ALLOWED_HOSTS=104.248.213.225,localhost
CORS_ALLOWED_ORIGINS=http://104.248.213.225:5173
```

**⚠️ NUNCA uses DEBUG=True en producción real**

### Opción 2: HTTPS con Nginx + Let's Encrypt (Recomendado)

Esta es la solución profesional y gratuita para producción.

## Pasos para Configurar HTTPS

### 1. Instalar Nginx y Certbot

```bash
sudo apt update
sudo apt install nginx certbot python3-certbot-nginx -y
```

### 2. Configurar un Dominio (Necesario para Let's Encrypt)

Let's Encrypt requiere un dominio, no funciona con IPs. Opciones:

**a) Comprar un dominio** (recomendado para producción):
- Namecheap, GoDaddy, Google Domains, etc.
- Apunta el dominio a tu IP: `104.248.213.225`

**b) Usar un subdominio gratuito**:
- [FreeDNS](https://freedns.afraid.org/)
- [No-IP](https://www.noip.com/)
- [DuckDNS](https://www.duckdns.org/)

### 3. Configurar Nginx

```bash
sudo nano /etc/nginx/sites-available/home_nannies
```

**Configuración inicial (HTTP):**

```nginx
# Configuración temporal para obtener certificado
server {
    listen 80;
    server_name tudominio.com www.tudominio.com;

    # Necesario para verificación de Let's Encrypt
    location /.well-known/acme-challenge/ {
        root /var/www/html;
    }

    location / {
        return 301 https://$server_name$request_uri;
    }
}
```

**Activar sitio:**

```bash
sudo ln -s /etc/nginx/sites-available/home_nannies /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 4. Obtener Certificado SSL

```bash
sudo certbot --nginx -d tudominio.com -d www.tudominio.com
```

Certbot te preguntará:
1. Email (para renovaciones): tu-email@ejemplo.com
2. Términos de servicio: Yes
3. Compartir email: No
4. Redirigir HTTP a HTTPS: Yes (opción 2)

### 5. Configuración Completa de Nginx con HTTPS

Después de obtener el certificado, edita la configuración:

```bash
sudo nano /etc/nginx/sites-available/home_nannies
```

```nginx
# HTTP - Redirigir a HTTPS
server {
    listen 80;
    server_name tudominio.com www.tudominio.com;
    return 301 https://$server_name$request_uri;
}

# HTTPS
server {
    listen 443 ssl http2;
    server_name tudominio.com www.tudominio.com;

    # Certificados SSL de Let's Encrypt
    ssl_certificate /etc/letsencrypt/live/tudominio.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/tudominio.com/privkey.pem;
    
    # Configuración SSL moderna
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_prefer_server_ciphers on;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
    ssl_session_timeout 10m;
    ssl_session_cache shared:SSL:10m;
    
    # Headers de seguridad
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;
    add_header X-Frame-Options "DENY" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    client_max_body_size 100M;

    # Frontend (React/Vite)
    location / {
        proxy_pass http://localhost:5173;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Backend API (Django)
    location /api {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Django Admin
    location /admin {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Archivos estáticos de Django
    location /static {
        alias /home/usuario/Home_nannies_project/Back_Django_REST/staticfiles;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }

    # Archivos de medios
    location /media {
        alias /home/usuario/Home_nannies_project/Back_Django_REST/media;
        expires 7d;
        add_header Cache-Control "public";
    }
}
```

**Reemplazar:**
- `tudominio.com` con tu dominio real
- `/home/usuario` con tu ruta real

**Reiniciar Nginx:**

```bash
sudo nginx -t
sudo systemctl restart nginx
```

### 6. Actualizar Configuración de Django

**Backend .env:**

```env
DEBUG=False
SECRET_KEY=tu-clave-secreta-segura
ALLOWED_HOSTS=tudominio.com,www.tudominio.com,localhost
CORS_ALLOWED_ORIGINS=https://tudominio.com,https://www.tudominio.com
CSRF_TRUSTED_ORIGINS=https://tudominio.com,https://www.tudominio.com
```

### 7. Actualizar Configuración de Frontend

**Frontend .env:**

```env
# Con Nginx, la API está en la misma URL
VITE_API_URL=/api
```

### 8. Configurar Renovación Automática de Certificados

Let's Encrypt certifica expiran cada 90 días. Certbot configura renovación automática:

```bash
# Verificar timer de renovación
sudo systemctl status certbot.timer

# Probar renovación (dry-run)
sudo certbot renew --dry-run

# Ver cuándo expiran los certificados
sudo certbot certificates
```

La renovación se ejecuta automáticamente 2 veces al día.

### 9. Abrir Puerto 443 en Firewall

```bash
sudo ufw allow 443/tcp
sudo ufw allow 80/tcp  # Necesario para renovación
sudo ufw status
```

### 10. Reiniciar Servicios

```bash
# Reiniciar Backend con nueva configuración
cd ~/Home_nannies_project/scripts
./start_debian_server.sh restart
```

## Verificación

### Verificar SSL

```bash
# Test de SSL
openssl s_client -connect tudominio.com:443 -servername tudominio.com

# O usar herramientas online:
# https://www.ssllabs.com/ssltest/
```

### Verificar que funciona

1. Accede a: `https://tudominio.com`
2. Verifica el candado 🔒 en el navegador
3. Los warnings de seguridad deberían desaparecer
4. Revisa la consola del navegador (F12) - no debería haber errores CORS

## Alternativa: Túnel SSH (Solo Desarrollo Local)

Si solo quieres probar localmente sin configurar dominio:

```bash
# En tu máquina local, crear túnel SSH
ssh -L 8000:localhost:8000 -L 5173:localhost:5173 usuario@104.248.213.225

# Luego accede a:
# http://localhost:5173
```

En este caso, tu `.env` local usa `localhost`:

```env
VITE_API_URL=http://localhost:8000/api
```

## Opción con Cloudflare (Alternativa Avanzada)

Si tienes un dominio, Cloudflare ofrece SSL gratuito:

1. Registra tu dominio en Cloudflare
2. Configura los DNS en Cloudflare apuntando a `104.248.213.225`
3. Activa "Flexible SSL" o "Full SSL"
4. Cloudflare se encarga del certificado SSL

**Backend .env con Cloudflare:**

```env
DEBUG=False
ALLOWED_HOSTS=tudominio.com
CORS_ALLOWED_ORIGINS=https://tudominio.com
CSRF_TRUSTED_ORIGINS=https://tudominio.com
```

## Troubleshooting

### Error: "Timeout during connect"

Verifica que el puerto 80 esté abierto:
```bash
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw reload
```

### Error: "Domain validation failed"

Asegúrate de que:
1. El dominio apunta a la IP correcta (verifica con `dig tudominio.com`)
2. El puerto 80 está accesible desde internet
3. Nginx está corriendo: `sudo systemctl status nginx`

### Los warnings persisten

Verifica que:
1. Estás accediendo con `https://` (no `http://`)
2. La configuración `.env` tiene `DEBUG=False`
3. Los headers de seguridad están configurados en Django
4. El certificado SSL es válido: `sudo certbot certificates`

### Error: "Mixed Content" en navegador

Asegúrate de que todas las URLs en tu frontend usen HTTPS o rutas relativas.

## Renovación Manual (si falla automática)

```bash
# Renovar manualmente
sudo certbot renew

# Si hay problemas
sudo certbot renew --force-renewal

# Reiniciar Nginx después de renovar
sudo systemctl reload nginx
```

## Resumen de URLs

**Antes (HTTP):**
- Frontend: `http://104.248.213.225:5173`
- Backend: `http://104.248.213.225:8000/api`

**Después (HTTPS con Nginx):**
- Frontend: `https://tudominio.com`
- Backend: `https://tudominio.com/api`
- Admin: `https://tudominio.com/admin`

**Beneficios:**
- ✅ Sin warnings de seguridad
- ✅ Un solo puerto (443)
- ✅ URLs limpias
- ✅ Certificado SSL gratuito
- ✅ Renovación automática
- ✅ Headers de seguridad configurados
- ✅ Mejor SEO y confianza del usuario

## Próximos Pasos Recomendados

1. **Configurar backup de base de datos**
2. **Configurar PM2 para mantener servicios corriendo**
3. **Configurar logs rotativos**
4. **Monitoreo con Uptime Robot o similar**
5. **Configurar email para notificaciones de Django**

---

Para más información:
- [Let's Encrypt](https://letsencrypt.org/)
- [Certbot Documentation](https://certbot.eff.org/)
- [Nginx SSL Configuration](https://ssl-config.mozilla.org/)
