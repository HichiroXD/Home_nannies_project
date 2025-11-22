from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from .models import ParentProfile
from .serializer import ParentProfileSerializer


class ParentProfileDetailView(generics.RetrieveUpdateAPIView):
    """Vista para ver y actualizar el perfil de padre del usuario autenticado"""
    serializer_class = ParentProfileSerializer
    permission_classes = [IsAuthenticated]
    
    def get_object(self):
        return self.request.user.parent_profile
