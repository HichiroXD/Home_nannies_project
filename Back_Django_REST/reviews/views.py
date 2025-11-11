from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.exceptions import ValidationError
from .models import Review
from .serializer import ReviewSerializer, ReviewCreateSerializer
from nannies.models import NannyProfile

class ReviewListCreateView(generics.ListCreateAPIView):
    """
    Vista para listar y crear reseñas.
    
    GET:
    - Padres ven las reseñas que escribieron
    - Niñeras ven las reseñas que recibieron
    
    POST:
    - Crea una nueva reseña (solo padres pueden dejar reseñas)
    - Actualiza automáticamente la calificación promedio de la niñera
    """
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'parent':
            return Review.objects.filter(parent=user)
        elif user.role == 'nanny':
            return Review.objects.filter(nanny__user=user)
        return Review.objects.none()

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return ReviewCreateSerializer
        return ReviewSerializer

    def perform_create(self, serializer):
        nanny_id = self.request.data.get('nanny')
        try:
            nanny_profile = NannyProfile.objects.get(pk=nanny_id)
        except NannyProfile.DoesNotExist:
            raise ValidationError({"nanny": "Niñera no encontrada."})
        
        serializer.save(parent=self.request.user, nanny=nanny_profile)


class ReviewDetailView(generics.RetrieveDestroyAPIView):
    """
    Vista para obtener o eliminar una reseña específica.
    
    GET: Obtiene los detalles de una reseña
    DELETE: Elimina una reseña (solo el autor puede eliminarla)
    """
    queryset = Review.objects.all()
    serializer_class = ReviewSerializer
    permission_classes = [permissions.IsAuthenticated]
