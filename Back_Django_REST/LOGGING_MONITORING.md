# 📊 Sistema de Logging y Monitoreo

## Configuración

El sistema de logging está completamente configurado en `django_crud_api/settings.py` y registra automáticamente eventos importantes del sistema.

### Archivos de Log

Los logs se guardan en la carpeta `Back_Django_REST/logs/`:

```
logs/
├── home_nannies.log      # Log general del sistema
├── bookings.log          # Eventos de reservas, favoritos, notificaciones
├── users.log             # Eventos de usuarios (registro, actualización)
└── errors.log            # Errores y advertencias (WARNING+)
```

---

## Eventos Registrados

### 📋 Reservas (Bookings)

Cada evento en reservas se registra automáticamente:

```
[INFO] Booking creada: ID=5 | Padre=juan | Niñera=maria | Estado=pendiente | Fecha: 2025-12-21
[INFO] Booking actualizada: ID=5 | Estado=confirmed | Padre=juan | Niñera=maria
[INFO] Booking eliminada: ID=5 | Padre=juan | Niñera=maria
```

### 👤 Usuarios

```
[INFO] Usuario creado: ID=3 | Username=carlos | Email=carlos@mail.com | Verificado=False
[INFO] Usuario actualizado: ID=3 | Username=carlos | Verificado=True
```

### ❤️ Favoritos

```
[INFO] Favorito añadido: ID=1 | Padre=juan | Niñera=maria
[INFO] Favorito eliminado: Padre=juan | Niñera=maria
```

### 🔔 Notificaciones

```
[INFO] Notificación creada: ID=1 | Usuario=maria | Mensaje: Tienes una nueva solicitud de reserva... | Leída=False
```

---

## Cómo Ver los Logs

### En tiempo real (consola)
Mientras ejecutas Django en modo DEBUG:
```bash
python manage.py runserver
```

Los logs se mostrarán en tiempo real en la consola.

### Archivos históricos
```bash
# Ver todos los logs
cat logs/home_nannies.log

# Ver últimas 50 líneas
tail -50 logs/home_nannies.log

# Ver logs de reservas
tail -100 logs/bookings.log

# Ver solo errores
tail -50 logs/errors.log

# Buscar un usuario específico
grep "username=juan" logs/home_nannies.log
```

### Con PowerShell (Windows)
```powershell
# Ver archivo de log
Get-Content logs\home_nannies.log

# Últimas 50 líneas
Get-Content logs\home_nannies.log -Tail 50

# Buscar patrón
Select-String "juan" logs\home_nannies.log
```

---

## Niveles de Log

| Nivel | Descripción | Ejemplo |
|-------|-------------|---------|
| `DEBUG` | Información detallada para diagnóstico | Escritura en archivos |
| `INFO` | Información general de eventos | Creación de reservas |
| `WARNING` | Advertencias (se guardan en errors.log) | Validación fallida |
| `ERROR` | Errores en operaciones | Conexión DB fallida |
| `CRITICAL` | Problemas graves | Sistema no operativo |

---

## Señales Automáticas

El sistema usa **Django Signals** para registrar eventos automáticamente sin modificar la lógica de negocio.

### Ubicación de Signals
- `bookings/signals.py` - Eventos de reservas, favoritos, notificaciones
- `users/signals.py` - Eventos de usuarios

### Cómo se registran
```python
# Ejemplo: cuando se crea una reserva
@receiver(post_save, sender=Booking)
def log_booking_event(sender, instance, created, **kwargs):
    if created:
        logger.info(f"Booking creada: ID={instance.id} | ...")
```

---

## Monitoreo en Producción

### Recomendaciones para producción:

1. **Rotación de logs**: Usar `RotatingFileHandler` para limitar tamaño
   ```python
   'file': {
       'class': 'logging.handlers.RotatingFileHandler',
       'filename': 'logs/home_nannies.log',
       'maxBytes': 10485760,  # 10MB
       'backupCount': 5,
   }
   ```

2. **Servicios de monitoreo**:
   - **Sentry** para captura de errores
   - **Datadog** o **New Relic** para APM
   - **ELK Stack** para análisis de logs

3. **Alertas**:
   - Configurar alertas para WARNING+ en errors.log
   - Notificar al equipo de errors críticos

4. **Análisis**:
   ```bash
   # Contar eventos por tipo
   grep "Booking creada" logs/bookings.log | wc -l
   
   # Errores por hora
   grep "ERROR" logs/errors.log | cut -d' ' -f2 | sort | uniq -c
   ```

---

## Ejemplo: Auditoría de Actividad

Para auditar qué hizo un usuario:
```bash
grep "username=juan" logs/*.log
```

Resultado:
```
logs/users.log: [INFO] Usuario creado: ID=3 | Username=juan
logs/bookings.log: [INFO] Booking creada: ID=1 | Padre=juan | ...
logs/bookings.log: [INFO] Favorito añadido: ID=1 | Padre=juan | ...
```

---

## Próximas Mejoras

- [ ] Implementar Sentry para captura automática de errores
- [ ] Dashboard de logs en admin de Django
- [ ] Exportar logs a formato CSV/JSON
- [ ] Estadísticas de uso (usuarios activos, reservas por hora, etc.)
- [ ] Alertas automáticas para eventos críticos

---

**Estado:** ✅ Implementado | **Última actualización:** 21 de noviembre de 2025
