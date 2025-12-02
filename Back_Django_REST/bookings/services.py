"""
Servicios para gestionar lógica de negocio de bookings.

DEPRECATED: NotificationService se ha movido a notifications/services.py
Mantener este archivo solo para compatibilidad con imports existentes.
"""

import logging

logger = logging.getLogger(__name__)

# Re-exportar NotificationService desde su nueva ubicación
from notifications.services import NotificationService

__all__ = ['NotificationService']
