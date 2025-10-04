from rest_framework import generics, permissions
from .models import Favorite
from .serializer import FavoriteSerializer

class FavoriteListCreateView(generics.ListCreateAPIView):
    serializer_class = FavoriteSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Favorite.objects.filter(parent=self.request.user)

    def perform_create(self, serializer):
        serializer.save(parent=self.request.user)

class FavoriteDeleteView(generics.DestroyAPIView):
    queryset = Favorite.objects.all()
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = FavoriteSerializer

    def get_queryset(self):
        return Favorite.objects.filter(parent=self.request.user)
