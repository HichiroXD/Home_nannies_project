from rest_framework import serializers
from .models import Booking

class BookingSerializer(serializers.ModelSerializer):
    parent = serializers.ReadOnlyField(source="parent.id")  # se toma del usuario autenticado

    class Meta:
        model = Booking
        fields = ['id', 'parent', 'nanny', 'date', 'status', 'created_at']
        read_only_fields = ['status', 'created_at']

    def validate_nanny(self, value):
        if value.role != "nanny":
            raise serializers.ValidationError("El usuario seleccionado no es una niñera")
        return value
    
    def validate_date(self, value):
        from django.utils import timezone
        if value <= timezone.now():
            raise serializers.ValidationError("La fecha debe ser futura")
        return value
    
    def create(self, validated_data):
        return Booking.objects.create(**validated_data)
    
    def update(self, instance, validated_data):
        instance.date = validated_data.get('date', instance.date)
        instance.status = validated_data.get('status', instance.status)
        instance.save()
        return instance
    
    def to_representation(self, instance):
        representation = super().to_representation(instance)
        representation['parent'] = {
            'id': instance.parent.id,
            'username': instance.parent.username,
            'email': instance.parent.email,
            'role': instance.parent.role,
        }
        representation['nanny'] = {
            'id': instance.nanny.id,
            'username': instance.nanny.username,
            'email': instance.nanny.email,
            'role': instance.nanny.role,
        }
        return representation
