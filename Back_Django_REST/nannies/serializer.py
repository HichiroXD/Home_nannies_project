from rest_framework import serializers
from .models import NannyProfile

class NannyProfileSerializer(serializers.ModelSerializer):
    full_name = serializers.CharField(source='user.get_full_name', read_only=True)
    email = serializers.EmailField(source='user.email', read_only=True)

    class Meta:
        model = NannyProfile
        fields = [
            'id', 'full_name', 'email', 'experience_years',
            'hourly_rate', 'description', 'verified',
            'age', 'certifications', 'rating_avg'
        ]
