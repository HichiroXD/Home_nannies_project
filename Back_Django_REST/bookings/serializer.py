from rest_framework import serializers, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from .models import Booking, Availability, Notification

class BookingSerializer(serializers.ModelSerializer):
    parent = serializers.ReadOnlyField(source="parent.id")  # se toma del usuario autenticado

    class Meta:
        model = Booking
        fields = "__all__"
        read_only_fields = ["status", "created_at"]

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

class BookingDetailView(serializers.ModelSerializer):
    parent = serializers.ReadOnlyField(source="parent.id")  # se toma del usuario autenticado

    class Meta:
        model = Booking
        fields = "__all__"
        read_only_fields = ["created_at"]

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

class EmptySerializer(serializers.Serializer):
    pass

class AvailabilitySerializer(serializers.ModelSerializer):
    class Meta:
        model = Availability
        fields = "__all__"
        read_only_fields = ["nanny"]

    def validate(self, data):
        if data["start_time"] >= data["end_time"]:
            raise serializers.ValidationError("La hora de inicio debe ser menor a la de fin.")

        # Evitar traslapes con disponibilidad existente
        qs = Availability.objects.filter(
            nanny=self.context["request"].user,
            day=data["day"],
            start_time__lt=data["end_time"],
            end_time__gt=data["start_time"]
        )
        if qs.exists():
            raise serializers.ValidationError("Ya existe disponibilidad en este rango.")
        return data
    
    def create(self, validated_data):
        validated_data["nanny"] = self.context["request"].user
        return super().create(validated_data)
    
    def to_representation(self, instance):
        representation = super().to_representation(instance)
        representation["nanny"] = {
            "id": instance.nanny.id,
            "username": instance.nanny.username,
            "email": instance.nanny.email,
            "role": instance.nanny.role,
        }
        return representation

class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = "__all__"
        read_only_fields = ["user", "created_at"]

    def create(self, validated_data):
        validated_data["user"] = self.context["request"].user
        return super().create(validated_data)
    
    def to_representation(self, instance):
        representation = super().to_representation(instance)
        representation["user"] = {
            "id": instance.user.id,
            "username": instance.user.username,
            "email": instance.user.email,
            "role": instance.user.role,
        }
        return representation

@api_view(["POST"])
@permission_classes([permissions.IsAuthenticated])
def accept_booking(request, pk):
    try:
        booking = Booking.objects.get(pk=pk, nanny=request.user)
    except Booking.DoesNotExist:
        return Response({"error": "Reserva no encontrada o no autorizada."},
                        status=status.HTTP_404_NOT_FOUND)

    booking.status = "confirmed"
    booking.save()
    return Response({"message": "Reserva aceptada"}, status=200)

@api_view(["POST"])
@permission_classes([permissions.IsAuthenticated])
def reject_booking(request, pk):
    try:
        booking = Booking.objects.get(pk=pk, nanny=request.user)
    except Booking.DoesNotExist:
        return Response({"error": "Reserva no encontrada o no autorizada."},
                        status=status.HTTP_404_NOT_FOUND)

    booking.status = "rejected"
    booking.save()
    return Response({"message": "Reserva rechazada"}, status=200)
@api_view(["POST"])
@permission_classes([permissions.IsAuthenticated])
def cancel_booking(request, pk):
    try:
        booking = Booking.objects.get(pk=pk, parent=request.user)
    except Booking.DoesNotExist:
        return Response({"error": "Reserva no encontrada o no autorizada."},
                        status=status.HTTP_404_NOT_FOUND)

    booking.status = "cancelled"
    booking.save()
    return Response({"message": "Reserva cancelada"}, status=200)

@api_view(["POST"])
@permission_classes([permissions.IsAuthenticated])
def complete_booking(request, pk):
    try:
        booking = Booking.objects.get(pk=pk, nanny=request.user)
    except Booking.DoesNotExist:
        return Response({"error": "Reserva no encontrada o no autorizada."},
                        status=status.HTTP_404_NOT_FOUND)

    booking.status = "completed"
    booking.save()
    return Response({"message": "Reserva completada"}, status=200)

