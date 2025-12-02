"""
Constantes para la app de bookings.
Centraliza todos los mensajes y constantes para facilitar traducción y mantenimiento.
"""

# ===== STATUS DE BOOKING =====
BOOKING_STATUS_PENDING = 'pending'
BOOKING_STATUS_CONFIRMED = 'confirmed'
BOOKING_STATUS_REJECTED = 'rejected'
BOOKING_STATUS_CANCELLED = 'cancelled'
BOOKING_STATUS_COMPLETED = 'completed'

BOOKING_STATUS_CHOICES = [
    (BOOKING_STATUS_PENDING, 'Pendiente'),
    (BOOKING_STATUS_CONFIRMED, 'Confirmada'),
    (BOOKING_STATUS_REJECTED, 'Rechazada'),
    (BOOKING_STATUS_CANCELLED, 'Cancelada'),
    (BOOKING_STATUS_COMPLETED, 'Completada'),
]

STATUS_LABELS = {
    'pending': 'Pendiente de confirmación',
    'confirmed': 'Confirmada',
    'rejected': 'Rechazada',
    'cancelled': 'Cancelada',
    'completed': 'Completada',
}

# ===== MENSAJES DE NOTIFICACIÓN =====
BOOKING_NOTIFICATION_MESSAGES = {
    # Mensajes al crear reserva
    'created': {
        'parent_to_nanny': (
            'Tienes una nueva solicitud de reserva de {parent_name} '
            'para el {date} de {start_time} a {end_time}. '
            'Revisa los detalles y responde lo antes posible.'
        ),
        'system': 'Reserva creada exitosamente. La niñera será notificada.',
    },
    
    # Mensajes al aceptar reserva
    'accepted': {
        'nanny_to_parent': (
            '¡Excelente noticia! {nanny_name} ha confirmado tu reserva '
            'para el {date} de {start_time} a {end_time}. '
            'Recibirás un recordatorio antes de la fecha.'
        ),
        'system': 'Reserva confirmada exitosamente.',
    },
    
    # Mensajes al rechazar reserva
    'rejected': {
        'nanny_to_parent': (
            'Tu solicitud de reserva con {nanny_name} para el {date} '
            'no pudo ser aceptada en este momento. '
            'Te invitamos a revisar otras niñeras disponibles en nuestro catálogo.'
        ),
        'system': 'Reserva rechazada. El padre ha sido notificado.',
    },
    
    # Mensajes al cancelar reserva
    'cancelled': {
        'parent_to_nanny': (
            'El padre {parent_name} ha cancelado la reserva del {date} '
            'de {start_time} a {end_time}. '
            'Tu disponibilidad ha sido liberada automáticamente.'
        ),
        'system': 'Reserva cancelada exitosamente.',
    },
    
    # Mensajes al completar reserva
    'completed': {
        'nanny_to_parent': (
            '¡Tu servicio con {nanny_name} ha sido completado! '
            'Esperamos que todo haya salido bien. '
            'Te invitamos a dejar una reseña sobre tu experiencia.'
        ),
        'system': 'Reserva marcada como completada.',
    },
}

# Mensajes de respuesta (compatibilidad con código existente)
BOOKING_MESSAGES = {
    'ACCEPTED': "Reserva aceptada.",
    'REJECTED': "Reserva rechazada.",
    'CANCELLED': "Reserva cancelada.",
    'COMPLETED': "Reserva completada.",
    'NOT_FOUND': "Reserva no encontrada o no autorizada.",
}

# Mensajes de notificación (compatibilidad)
NOTIFICATION_SUBJECTS = {
    BOOKING_STATUS_CONFIRMED: 'Reserva Confirmada',
    BOOKING_STATUS_REJECTED: 'Reserva Rechazada',
    BOOKING_STATUS_CANCELLED: 'Reserva Cancelada',
    BOOKING_STATUS_COMPLETED: 'Reserva Completada',
}

NOTIFICATION_ACTIONS = {
    BOOKING_STATUS_CONFIRMED: 'confirmada',
    BOOKING_STATUS_REJECTED: 'rechazada',
    BOOKING_STATUS_CANCELLED: 'cancelada',
    BOOKING_STATUS_COMPLETED: 'completada',
}

# ===== MENSAJES DE ERROR =====
ERROR_MESSAGES = {
    # Errores generales
    'not_found': 'Reserva no encontrada o no autorizada.',
    'unauthorized': 'No tienes permisos para realizar esta acción.',
    'invalid_status': 'Estado de reserva inválido.',
    'already_processed': 'Esta reserva ya ha sido procesada.',
    
    # Errores de disponibilidad
    'no_availability': 'La niñera no está disponible en el horario seleccionado.',
    'overlap': 'Ya existe una disponibilidad registrada en este rango de tiempo.',
    'invalid_time_range': 'La hora de inicio debe ser anterior a la hora de fin.',
    'past_date': 'No puedes crear disponibilidad para fechas pasadas.',
    'unreasonable_hours': 'El horario debe estar entre las 6:00 AM y las 11:00 PM.',
    'minimum_duration': 'La disponibilidad debe ser de al menos 1 hora.',
    
    # Errores de notificación
    'notification_not_found': 'Notificación no encontrada.',
    'notification_unauthorized': 'No tienes permiso para acceder a esta notificación.',
}

# ===== MENSAJES DE DISPONIBILIDAD =====
AVAILABILITY_MESSAGES = {
    'conflict_detected': '⚠️ Conflicto de disponibilidad detectado',
    'existing_slot': (
        'Ya tienes disponibilidad registrada el {date} '
        'de {start_time} a {end_time}.'
    ),
    'overlap_explanation': (
        'Tu nueva disponibilidad ({new_start} - {new_end}) '
        'se traslapa con la existente.'
    ),
    'suggestions_header': '💡 Sugerencias:',
    'suggestion_edit': '• Edita la disponibilidad existente en lugar de crear una nueva',
    'suggestion_different_time': (
        '• Elige un horario que no se traslape '
        '(antes de {before} o después de {after})'
    ),
}

# Días de la semana (para Availability)
WEEKDAY_CHOICES = [
    ('monday', 'Lunes'),
    ('tuesday', 'Martes'),
    ('wednesday', 'Miércoles'),
    ('thursday', 'Jueves'),
    ('friday', 'Viernes'),
    ('saturday', 'Sábado'),
    ('sunday', 'Domingo'),
]
