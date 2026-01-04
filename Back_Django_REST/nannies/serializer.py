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
        """Obtener reseñas de la niñera"""
        try:
            from reviews.serializer import ReviewSerializer
            # Intentar obtener reviews del usuario
            if hasattr(obj.user, 'reviews_made'):
                reviews = obj.user.reviews_made.all()[:5]  # Limitar a 5
                return ReviewSerializer(reviews, many=True).data
            return []
        except Exception as e:
            return []
    
    def get_total_bookings(self, obj):
        """Obtener el total de reservas completadas"""
        try:
            if hasattr(obj, 'user') and hasattr(obj.user, 'bookings_received'):
                return obj.user.bookings_received.filter(status='completed').count()
            return 0
        except Exception:
            return 0
    
    def get_acceptance_rate(self, obj):
        """Calcular tasa de aceptación de reservas"""
        try:
            if not hasattr(obj, 'user') or not hasattr(obj.user, 'bookings_received'):
                return None
            
            total = obj.user.bookings_received.count()
            if total == 0:
                return None
            accepted = obj.user.bookings_received.filter(status__in=['confirmed', 'completed']).count()
            return round((accepted / total) * 100, 1)
        except Exception:
            return None
    
    def update(self, instance, validated_data):
        # Extraer datos del usuario si vienen anidados
        user_data = validated_data.pop('user', {})
        
        # Debug
        print("=== SERIALIZER UPDATE ===")
        print("validated_data:", validated_data)
        print("user_data:", user_data)
        
        # Normalizar valores numéricos (hourly_rate, experience_years, age)
        # En caso de que vengan como arrays o strings, convertirlos correctamente
        if 'hourly_rate' in validated_data:
            value = validated_data['hourly_rate']
            if isinstance(value, list):
                value = value[0] if value else 0
            try:
                validated_data['hourly_rate'] = int(value) if value else 0
            except (ValueError, TypeError):
                validated_data['hourly_rate'] = 0
                
        if 'experience_years' in validated_data:
            value = validated_data['experience_years']
            if isinstance(value, list):
                value = value[0] if value else 0
            try:
                validated_data['experience_years'] = int(value) if value else 0
            except (ValueError, TypeError):
                validated_data['experience_years'] = 0
        
        # Limpiar campos vacíos que vienen como strings vacíos desde FormData
        if 'description' in validated_data and validated_data['description'] == '':
            validated_data['description'] = ''
        if 'certifications' in validated_data and validated_data['certifications'] == '':
            validated_data['certifications'] = ''
        if 'age' in validated_data:
            # Convertir a int o None si está vacío
            age_value = validated_data['age']
            if isinstance(age_value, list):
                age_value = age_value[0] if age_value else None
            if age_value == '' or age_value is None:
                validated_data['age'] = None
            else:
                try:
                    validated_data['age'] = int(age_value)
                except (ValueError, TypeError):
                    validated_data['age'] = None
        
        print("validated_data después de normalización:", validated_data)
        
        try:
            # Actualizar perfil de niñera
            for attr, value in validated_data.items():
                print(f"Setting {attr} = {value}")
                setattr(instance, attr, value)
            
            print("Guardando instancia...")
            instance.save()
            print("Instancia guardada exitosamente")
        except Exception as e:
            print(f"Error al guardar perfil de niñera: {str(e)}")
            import traceback
            print(traceback.format_exc())
            raise
        
        # Actualizar datos de usuario (first_name, last_name)
        if user_data:
            try:
                user = instance.user
                for attr, value in user_data.items():
                    print(f"Setting user.{attr} = {value}")
                    setattr(user, attr, value)
                user.save()
                print("Usuario actualizado exitosamente")
            except Exception as e:
                print(f"Error al actualizar usuario: {str(e)}")
                import traceback
                print(traceback.format_exc())
                raise
        
        return instance
