from django.apps import AppConfig


class FavoritesConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'favorites'
    
    def ready(self):
        """Registrar signals cuando la app esté lista"""
        import favorites.signals  # noqa
