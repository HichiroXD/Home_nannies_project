from rest_framework import serializers
from .models import Favorite
from nannies.serializer import NannyProfileSerializer
from nannies.models import NannyProfile
from users.validators import validate_user_role


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
    
    def validate_nanny_id(self, value):
        """Valida que el perfil de niñera pertenece a un usuario con rol 'nanny'"""
        if value and value.user:
            validate_user_role(value.user, 'nanny', "La niñera seleccionada")
        return value
