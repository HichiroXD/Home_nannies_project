from rest_framework import serializers
from .models import NannyProfile


class NannyProfileSerializer(serializers.ModelSerializer):
    user_id = serializers.ReadOnlyField(source='user.id')
    username = serializers.ReadOnlyField(source='user.username')
    email = serializers.ReadOnlyField(source='user.email')
    first_name = serializers.CharField(source='user.first_name', required=False, allow_blank=True, max_length=150)
    last_name = serializers.CharField(source='user.last_name', required=False, allow_blank=True, max_length=150)
    role = serializers.ReadOnlyField(source='user.role')
    reviews = serializers.SerializerMethodField()
    total_bookings = serializers.SerializerMethodField()
    acceptance_rate = serializers.SerializerMethodField()

    class Meta:
        model = NannyProfile
        fields = [
            'id', 'user_id', 'username', 'email', 'first_name', 'last_name', 'role',
            'experience_years', 'hourly_rate', 'description', 'verified',
            'age', 'certifications', 'rating_avg', 'reviews',
            'total_bookings', 'acceptance_rate', 'profile_photo'
        ]

    def get_reviews(self, obj):
        from reviews.serializer import ReviewSerializer
        reviews = obj.reviews_received.all()
        return ReviewSerializer(reviews, many=True).data
    
    def get_total_bookings(self, obj):
        """Obtener el total de reservas completadas"""
        return obj.user.bookings_received.filter(status='completed').count()
    
    def get_acceptance_rate(self, obj):
        """Calcular tasa de aceptación de reservas"""
        from bookings.models import Booking
        total = obj.user.bookings_received.count()
        if total == 0:
            return None
        accepted = obj.user.bookings_received.filter(status__in=['confirmed', 'completed']).count()
        return round((accepted / total) * 100, 1)
    
    def update(self, instance, validated_data):
        # Extraer datos del usuario si vienen anidados
        user_data = validated_data.pop('user', {})
        
        # Actualizar perfil de niñera (solo campos del modelo NannyProfile)
        profile_fields = ['experience_years', 'hourly_rate', 'description', 'age', 'certifications', 'rating_avg', 'profile_photo']
        for attr in profile_fields:
            if attr in validated_data:
                setattr(instance, attr, validated_data[attr])
        instance.save()
        
        # Actualizar datos de usuario (first_name, last_name)
        if user_data:
            user = instance.user
            for attr, value in user_data.items():
                setattr(user, attr, value)
            user.save()
        
        return instance
