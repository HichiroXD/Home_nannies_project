# Scripts de Mantenimiento

Scripts para mantenimiento, migraciones de datos y utilidades del sistema.

## Scripts Disponibles

### `backup_database.py`
Realiza un backup de la base de datos.

### `migrate_to_postgresql.py`
Migra la base de datos de SQLite a PostgreSQL.

### `add_parent_role_to_nanny.py`
Añade el rol de padre a usuarios nanny existentes.

### `sync_nanny_verification.py`
Sincroniza el estado de verificación de nannies.

### `verify_nanny.py`
Verifica manualmente una cuenta de nanny.

### `load_programs.py`
Carga programas educativos iniciales en la base de datos.

### `apply_login_history_migrations.py`
Aplica migraciones específicas del historial de login.

### `profile_startup.py`
Perfilado del tiempo de inicio de la aplicación.

## Uso Típico

```bash
# Backup de base de datos
python scripts/maintenance/backup_database.py

# Verificar una nanny
python scripts/maintenance/verify_nanny.py <email>

# Cargar datos iniciales
python scripts/maintenance/load_programs.py
```

**⚠️ Importante:** Algunos scripts modifican datos en la base de datos. Realiza backups antes de ejecutarlos.
