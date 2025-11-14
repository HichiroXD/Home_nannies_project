from rest_framework import serializers
from .models import Favorite
from nannies.serializer import NannyProfileSerializer
from nannies.models import NannyProfile


class FavoriteSerializer(serializers.ModelSerializer):
    # Represent nanny as nested object in responses
    nanny = NannyProfileSerializer(read_only=True)
    # Accept nanny id on write operations
    nanny_id = serializers.PrimaryKeyRelatedField(
        source='nanny', queryset=NannyProfile.objects.all(), write_only=True
    )

    class Meta:
        model = Favorite
        fields = ['id', 'nanny', 'nanny_id', 'created_at']
