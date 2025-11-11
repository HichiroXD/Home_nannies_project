from rest_framework import generics, filters
from rest_framework.exceptions import NotFound
from .models import NannyProfile
from .serializer import NannyProfileSerializer

class NannyListView(generics.ListAPIView):
    """
    Vista para listar todas las niñeras verificadas.
    
    Filtrado por:
    - search: Busca en nombre, apellido y descripción
    - ordering: Ordena por tarifa, calificación o años de experiencia
    """
    queryset = NannyProfile.objects.filter(verified=True)
    serializer_class = NannyProfileSerializer
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['user__first_name', 'user__last_name', 'description']
    ordering_fields = ['hourly_rate', 'rating_avg', 'experience_years']

class NannyDetailView(generics.RetrieveAPIView):
    """Vista para obtener los detalles de una niñera específica."""
    queryset = NannyProfile.objects.filter(verified=True)
    serializer_class = NannyProfileSerializer
    
    def get_object(self):
        try:
            return super().get_object()
        except NannyProfile.DoesNotExist:
            raise NotFound("Niñera no encontrada o no verificada.")
