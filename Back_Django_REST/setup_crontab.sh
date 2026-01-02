#!/bin/bash

# Script para configurar tareas programadas con crontab en Linux/Mac
# Uso: ./setup_crontab.sh

echo "🏠 Configurando Tareas Programadas - Home Nannies"
echo ""

# Obtener directorio del proyecto
PROJECT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PYTHON_PATH=$(which python)
MANAGE_PY="$PROJECT_DIR/manage.py"

echo "📁 Directorio del proyecto: $PROJECT_DIR"
echo "🐍 Python: $PYTHON_PATH"
echo ""

# Crear archivo temporal con las tareas cron
CRON_FILE=$(mktemp)

# Agregar tareas existentes (si existen)
crontab -l 2>/dev/null | grep -v "Home Nannies" > "$CRON_FILE" || true

# Agregar comentario de identificación
echo "" >> "$CRON_FILE"
echo "# ========================================" >> "$CRON_FILE"
echo "# Home Nannies - Tareas Programadas" >> "$CRON_FILE"
echo "# ========================================" >> "$CRON_FILE"

# 1. Recordatorios de reservas (Diario 9:00 AM)
echo "0 9 * * * cd $PROJECT_DIR && $PYTHON_PATH manage.py send_booking_reminders >> $PROJECT_DIR/logs/cron_reminders.log 2>&1" >> "$CRON_FILE"

# 2. Verificar reservas expiradas (Diario 10:00 AM)
echo "0 10 * * * cd $PROJECT_DIR && $PYTHON_PATH manage.py check_expired_bookings >> $PROJECT_DIR/logs/cron_expired.log 2>&1" >> "$CRON_FILE"

# 3. Backup de base de datos (Diario 3:00 AM)
echo "0 3 * * * cd $PROJECT_DIR && $PYTHON_PATH manage.py database_backup >> $PROJECT_DIR/logs/cron_backup.log 2>&1" >> "$CRON_FILE"

# 4. Actualizar estadísticas de niñeras (Diario 4:00 AM)
echo "0 4 * * * cd $PROJECT_DIR && $PYTHON_PATH manage.py update_nanny_statistics >> $PROJECT_DIR/logs/cron_stats.log 2>&1" >> "$CRON_FILE"

# 5. Limpiar notificaciones antiguas (Semanal Domingo 2:00 AM)
echo "0 2 * * 0 cd $PROJECT_DIR && $PYTHON_PATH manage.py cleanup_old_notifications >> $PROJECT_DIR/logs/cron_cleanup.log 2>&1" >> "$CRON_FILE"

# Instalar el nuevo crontab
crontab "$CRON_FILE"
rm "$CRON_FILE"

echo ""
echo "=" | head -c 60
echo ""
echo "✅ Configuración completada exitosamente"
echo "=" | head -c 60
echo ""
echo ""
echo "📋 Tareas creadas:"
echo "   • Recordatorios de reservas (Diario 9:00 AM)"
echo "   • Verificar reservas expiradas (Diario 10:00 AM)"
echo "   • Backup de base de datos (Diario 3:00 AM)"
echo "   • Actualizar estadísticas (Diario 4:00 AM)"
echo "   • Limpiar notificaciones (Semanal Dom 2:00 AM)"
echo ""
echo "🔍 Ver tareas configuradas:"
echo "   crontab -l | grep 'Home Nannies'"
echo ""
echo "✏️  Editar tareas:"
echo "   crontab -e"
echo ""
echo "🗑️  Eliminar todas las tareas de Home Nannies:"
echo "   crontab -l | grep -v 'Home Nannies' | crontab -"
echo ""
echo "📝 Los logs se guardan en: $PROJECT_DIR/logs/"
echo ""
