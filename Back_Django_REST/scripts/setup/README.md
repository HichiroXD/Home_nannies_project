# Scripts de Configuración

Scripts para la configuración inicial y gestión de tareas del sistema.

## Scripts Disponibles

### `setup_admin.py`
Crea un usuario administrador inicial para el sistema.

### `generate_secret_key.py`
Genera una nueva SECRET_KEY para Django.

### `setup_crontab.sh`
Configura tareas programadas usando crontab (Linux/Mac).

### `setup_scheduled_tasks.ps1`
Configura tareas programadas usando Task Scheduler (Windows).

### `setup_tasks.ps1`
Script auxiliar para configuración de tareas (Windows).

### `run_tasks.bat`
Ejecuta tareas programadas manualmente (Windows).

## Guías de Configuración

- **DEPLOYMENT_DROPLET.md**: Guía de despliegue en DigitalOcean Droplet
- **GUIA_CONFIGURACION_ENTORNOS.md**: Configuración de entornos de desarrollo/producción
- **GUIA_CONFIGURACION_TAREAS.md**: Configuración de tareas programadas

## Uso Típico

```bash
# Crear administrador
python scripts/setup/setup_admin.py

# Generar nueva SECRET_KEY
python scripts/setup/generate_secret_key.py
```
