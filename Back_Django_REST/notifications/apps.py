"""
Notificaciones App Configuration
"""

from django.apps import AppConfig


class NotificationsConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'notifications'
    verbose_name = 'Notificaciones del Sistema'

    def ready(self):
        """
        Importar señales cuando la app está lista
        """
        import notifications.signals  # noqa
