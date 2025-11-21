from rest_framework import generics, filters, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.exceptions import NotFound
from .models import NannyProfile
from .serializer import NannyProfileSerializer
from bookings.models import Booking
from reviews.models import Review
from django.db.models import Q, Avg
import json

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


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def nanny_dashboard(request):
    """Endpoint para obtener datos del dashboard de la niñera."""
    try:
        # Obtener el perfil de niñera del usuario autenticado
        nanny = NannyProfile.objects.get(user=request.user)
    except NannyProfile.DoesNotExist:
        return Response(
            {'error': 'No eres una niñera registrada'},
            status=status.HTTP_404_NOT_FOUND
        )
    
    # Bookings activos
    active_bookings = Booking.objects.filter(
        nanny=nanny,
        status__in=['pending', 'confirmed']
    ).count()
    
    # Bookings completados
    completed_bookings = Booking.objects.filter(
        nanny=nanny,
        status='completed'
    ).count()
    
    # Rating promedio
    reviews = Review.objects.filter(nanny=nanny)
    avg_rating = reviews.aggregate(Avg('rating'))['rating__avg'] or 0
    
    # Próximas reservas
    upcoming_bookings = Booking.objects.filter(
        nanny=nanny,
        status__in=['pending', 'confirmed']
    ).order_by('start_date')[:5].values(
        'id', 'parent__user__first_name', 'parent__user__last_name',
        'start_date', 'end_date', 'status'
    )
    
    # Reseñas recientes
    recent_reviews = reviews.order_by('-created_at')[:5].values(
        'id', 'rating', 'comment', 'parent__user__first_name',
        'created_at'
    )
    
    dashboard_data = {
        'nanny': {
            'name': f"{request.user.first_name} {request.user.last_name}".strip(),
            'avatar': (request.user.first_name[0] if request.user.first_name else 'N') + (request.user.last_name[0] if request.user.last_name else 'A'),
            'memberSince': nanny.user.date_joined.isoformat(),
            'rating': float(avg_rating),
            'hourlyRate': nanny.hourly_rate,
        },
        'stats': {
            'activeBookings': active_bookings,
            'completedBookings': completed_bookings,
            'totalReviews': reviews.count(),
            'avgRating': float(avg_rating),
        },
        'upcomingBookings': list(upcoming_bookings),
        'recentReviews': list(recent_reviews),
        'earnings': {
            'thisMonth': completed_bookings * nanny.hourly_rate,
            'total': completed_bookings * nanny.hourly_rate,
        }
    }
    
    return Response(dashboard_data, status=status.HTTP_200_OK)
