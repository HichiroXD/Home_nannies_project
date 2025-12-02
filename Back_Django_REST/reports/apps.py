"""
Reports App Configuration - Phase 3
Configuración de la app de reportes
"""

from django.apps import AppConfig


class ReportsConfig(AppConfig):
    """Reports application config"""
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'reports'
    verbose_name = 'Reportes y Análisis'

    def ready(self):
        """Inicializa la app"""
        pass
