from rest_framework import serializers
from .models import NannyProfile


class NannyProfileSerializer(serializers.ModelSerializer):
    username = serializers.ReadOnlyField(source='user.username')
    email = serializers.ReadOnlyField(source='user.email')
    role = serializers.ReadOnlyField(source='user.role')
    reviews = serializers.SerializerMethodField()

    class Meta:
        model = NannyProfile
        fields = [
            'id', 'username', 'email', 'role',
            'experience_years', 'hourly_rate', 'description', 'verified',
            'age', 'certifications', 'rating_avg', 'reviews'
        ]

    def get_reviews(self, obj):
        from reviews.serializer import ReviewSerializer
        reviews = obj.reviews_received.all()
        return ReviewSerializer(reviews, many=True).data
