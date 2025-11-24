from rest_framework import generics, permissions
from .models import Favorite
from .serializer import FavoriteSerializer
import logging

class FavoriteListCreateView(generics.ListCreateAPIView):
    """
    Vista para que los padres gestionen sus niñeras favoritas.
    
    GET:
    - Lista todas las niñeras marcadas como favoritas por el usuario autenticado
    
    POST:
    - Añade una niñera a la lista de favoritos
    """
    serializer_class = FavoriteSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Favorite.objects.filter(parent=self.request.user)

    def perform_create(self, serializer):
        serializer.save(parent=self.request.user)
        try:
            obj = serializer.instance
            logger = logging.getLogger('favorites')
            logger.info(f"favorite_created id={obj.id} parent={obj.parent.username} nanny={obj.nanny.user.username}")
        except Exception:
            pass

class FavoriteDeleteView(generics.DestroyAPIView):
    """
    Vista para eliminar una niñera de la lista de favoritos.
    
    DELETE:
    - Elimina una niñera de favoritos (solo el propietario puede eliminarla)
    """
    queryset = Favorite.objects.all()
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = FavoriteSerializer

    def get_queryset(self):
        return Favorite.objects.filter(parent=self.request.user)
