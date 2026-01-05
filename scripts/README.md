# Scripts de Gestión del Proyecto

Esta carpeta contiene scripts para gestionar el entorno y la ejecución del proyecto.

## Scripts Disponibles

### `start_project.ps1` / `start_project.sh`
Inicia el proyecto completo (backend y frontend) en el entorno actual.

**Uso:**
- Windows: `.\scripts\start_project.ps1`
- Linux/Mac: `./scripts/start_project.sh`

### `switch_environment.ps1` / `switch_environment.sh`
Cambia entre diferentes entornos (desarrollo, producción, local).

**Uso:**
- Windows: `.\scripts\switch_environment.ps1 [local|production]`
- Linux/Mac: `./scripts/switch_environment.sh [local|production]`

## Notas
- Ejecutar siempre desde la raíz del proyecto
- Los scripts .ps1 requieren PowerShell
- Los scripts .sh requieren bash y permisos de ejecución
