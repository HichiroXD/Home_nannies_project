from rest_framework import serializers
from .models import Favorite
from nannies.serializer import NannyProfileSerializer

class FavoriteSerializer(serializers.ModelSerializer):
    nanny = NannyProfileSerializer(read_only=True)

    class Meta:
        model = Favorite
        fields = ['id', 'nanny', 'created_at']
