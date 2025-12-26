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
    
    # Permitir campos opcionales/vacíos
    description = serializers.CharField(required=False, allow_blank=True)
    certifications = serializers.CharField(required=False, allow_blank=True)
    age = serializers.IntegerField(required=False, allow_null=True)

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
        
        # Debug
        print("=== SERIALIZER UPDATE ===")
        print("validated_data:", validated_data)
        print("user_data:", user_data)
        
        # Limpiar campos vacíos que vienen como strings vacíos desde FormData
        if 'description' in validated_data and validated_data['description'] == '':
            validated_data['description'] = ''
        if 'certifications' in validated_data and validated_data['certifications'] == '':
            validated_data['certifications'] = ''
        if 'age' in validated_data:
            # Convertir a int o None si está vacío
            age_value = validated_data['age']
            if age_value == '' or age_value is None:
                validated_data['age'] = None
            else:
                try:
                    validated_data['age'] = int(age_value)
                except (ValueError, TypeError):
                    validated_data['age'] = None
        
        # Actualizar perfil de niñera
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        
        # Actualizar datos de usuario (first_name, last_name)
        if user_data:
            user = instance.user
            for attr, value in user_data.items():
                setattr(user, attr, value)
            user.save()
        
        return instance
