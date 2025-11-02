from rest_framework import generics, permissions
from .models import Review
from .serializer import ReviewSerializer, ReviewCreateSerializer
from nannies.models import NannyProfile

class ReviewListCreateView(generics.ListCreateAPIView):
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
        nanny = self.request.data.get('nanny')
        try:
            nanny_profile = NannyProfile.objects.get(pk=nanny)
        except NannyProfile.DoesNotExist:
            raise serializer.ValidationError("Niñera no encontrada.")
        serializer.save(parent=self.request.user, nanny=nanny_profile)


class ReviewDetailView(generics.RetrieveDestroyAPIView):
    queryset = Review.objects.all()
    serializer_class = ReviewSerializer
    permission_classes = [permissions.IsAuthenticated]
