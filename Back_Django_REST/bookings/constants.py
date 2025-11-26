"""Constantes para la app de bookings."""

# Status de Booking
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

# Mensajes de respuesta
BOOKING_MESSAGES = {
    'ACCEPTED': "Reserva aceptada.",
    'REJECTED': "Reserva rechazada.",
    'CANCELLED': "Reserva cancelada.",
    'COMPLETED': "Reserva completada.",
    'NOT_FOUND': "Reserva no encontrada o no autorizada.",
}

# Mensajes de notificación
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
