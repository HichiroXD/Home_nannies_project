from django.apps import AppConfig


class BookingsConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'bookings'
    
    def ready(self):
        """Registrar signals cuando la app esté lista"""
        import bookings.signals  # noqa
