from rest_framework import generics, filters
from .models import NannyProfile
from .serializer import NannyProfileSerializer

class NannyListView(generics.ListAPIView):
    queryset = NannyProfile.objects.filter(verified=True)
    serializer_class = NannyProfileSerializer
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['user__first_name', 'user__last_name', 'description']
    ordering_fields = ['hourly_rate', 'rating_avg', 'experience_years']

class NannyDetailView(generics.RetrieveAPIView):
    queryset = NannyProfile.objects.all()
    serializer_class = NannyProfileSerializer
