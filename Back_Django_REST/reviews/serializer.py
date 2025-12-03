# reviews/serializer.py
from rest_framework import serializers
from .models import Review
from nannies.models import NannyProfile
from parents.models import ParentProfile
from users.validators import validate_user_role

class ReviewSerializer(serializers.ModelSerializer):
    parent_username = serializers.CharField(source='parent.username', read_only=True)
    nanny_name = serializers.SerializerMethodField()
    parent_data = serializers.SerializerMethodField()
    nanny_data = serializers.SerializerMethodField()
    
    class Meta:
        model = Review
        fields = ['id', 'rating', 'comment', 'created_at', 'parent', 'nanny', 
                  'parent_username', 'nanny_name', 'parent_data', 'nanny_data']
        read_only_fields = ['parent']
    
    def get_nanny_name(self, obj):
        # NannyProfile no tiene first_name/last_name, están en el User asociado
        user = obj.nanny.user
        full_name = f"{user.first_name} {user.last_name}".strip()
        return full_name if full_name else user.username
    
    def get_parent_data(self, obj):
        """Obtiene datos del parent con su perfil usando utilidad reutilizable"""
        from bookings.utils import get_user_profile_data
        return get_user_profile_data(obj.parent, ParentProfile, 'parent_profile_id')
    
    def get_nanny_data(self, obj):
        """Obtiene datos de la nanny con su perfil usando utilidad reutilizable"""
        from bookings.utils import get_user_profile_data
        return get_user_profile_data(obj.nanny.user, NannyProfile, 'nanny_profile_id')

class ReviewCreateSerializer(serializers.Serializer):
    """Serializer para crear reseñas"""
    nanny = serializers.IntegerField(help_text="ID del perfil de niñera", required=True)
    rating = serializers.IntegerField(min_value=1, max_value=5, help_text="Calificación de 1 a 5", required=True)
    comment = serializers.CharField(required=False, allow_blank=True, allow_null=True, default="", help_text="Comentario opcional")
    
    def validate_nanny(self, value):
        """Valida que el ID de niñera exista y tenga el rol correcto"""
        if not value:
            raise serializers.ValidationError("Se requiere el ID de la niñera.")
        try:
            nanny_profile = NannyProfile.objects.get(pk=value)
            # Validar que el usuario asociado tiene rol 'nanny'
            validate_user_role(nanny_profile.user, 'nanny', "La niñera seleccionada")
        except NannyProfile.DoesNotExist:
            raise serializers.ValidationError(f"Niñera con ID {value} no encontrada.")
        return value
    
    def validate_rating(self, value):
        """Valida el rating"""
        if not value:
            raise serializers.ValidationError("La calificación es requerida.")
        if not isinstance(value, int):
            raise serializers.ValidationError("La calificación debe ser un número entero.")
        if value < 1 or value > 5:
            raise serializers.ValidationError("La calificación debe estar entre 1 y 5.")
        return value