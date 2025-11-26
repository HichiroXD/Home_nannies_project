# reviews/serializer.py
from rest_framework import serializers
from .models import Review
from nannies.models import NannyProfile

class ReviewSerializer(serializers.ModelSerializer):
    parent_username = serializers.CharField(source='parent.username', read_only=True)
    nanny_name = serializers.SerializerMethodField()
    
    class Meta:
        model = Review
        fields = ['id', 'rating', 'comment', 'created_at', 'parent', 'nanny', 'parent_username', 'nanny_name']
        read_only_fields = ['parent']
    
    def get_nanny_name(self, obj):
        # NannyProfile no tiene first_name/last_name, están en el User asociado
        user = obj.nanny.user
        full_name = f"{user.first_name} {user.last_name}".strip()
        return full_name if full_name else user.username

class ReviewCreateSerializer(serializers.Serializer):
    """Serializer para crear reseñas"""
    nanny = serializers.IntegerField(help_text="ID del perfil de niñera", required=True)
    rating = serializers.IntegerField(min_value=1, max_value=5, help_text="Calificación de 1 a 5", required=True)
    comment = serializers.CharField(required=False, allow_blank=True, allow_null=True, default="", help_text="Comentario opcional")
    
    def validate_nanny(self, value):
        """Valida que el ID de niñera exista"""
        if not value:
            raise serializers.ValidationError("Se requiere el ID de la niñera.")
        try:
            NannyProfile.objects.get(pk=value)
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