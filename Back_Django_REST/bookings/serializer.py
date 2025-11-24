from rest_framework import serializers
from .models import Booking, Availability
from notifications.models import Notification
# Favorite model/serializer now lives in the `favorites` app. Import serializer from there.
from favorites.serializer import FavoriteSerializer
from django.utils import timezone

# --- Booking ---
class BookingSerializer(serializers.ModelSerializer):
    parent = serializers.ReadOnlyField(source="parent.id")

    class Meta:
        model = Booking
        fields = "__all__"
        read_only_fields = ["status", "created_at", "updated_at", "parent"]

    def validate(self, data):
        start = data.get("start_time", None)
        end = data.get("end_time", None)
        nanny = data.get("nanny", None)

        if start and end and start >= end:
            raise serializers.ValidationError("La hora de inicio debe ser menor que la hora de fin.")

        if start and start <= timezone.now():
            raise serializers.ValidationError("La fecha y hora de inicio debe ser futura.")

        if nanny and nanny.role != "nanny":
            raise serializers.ValidationError("El usuario seleccionado no es una niñera.")

        # Verificar disponibilidad de la niñera
        if start and end and nanny:
            availability_qs = Availability.objects.filter(
                nanny=nanny,
                day=start.date(),
                start_time__lte=start.time(),
                end_time__gte=end.time(),
            )
            if not availability_qs.exists():
                raise serializers.ValidationError("La niñera no tiene disponibilidad en este horario.")

            # Verificar choques con otras reservas confirmadas
            overlap_qs = Booking.objects.filter(
                nanny=nanny,
                status="confirmed",
                start_time__lt=end,
                end_time__gt=start,
            ).exclude(pk=self.instance.pk if self.instance else None)

            if overlap_qs.exists():
                raise serializers.ValidationError("La niñera ya tiene una reserva confirmada en ese rango.")

        return data

    def to_representation(self, instance):
        rep = super().to_representation(instance)
        rep["parent"] = {
            "id": instance.parent.id,
            "username": instance.parent.username,
            "email": instance.parent.email,
            "role": instance.parent.role,
        }
        rep["nanny"] = {
            "id": instance.nanny.id,
            "username": instance.nanny.username,
            "email": instance.nanny.email,
            "role": instance.nanny.role,
        }
        return rep


# --- Availability ---
class AvailabilitySerializer(serializers.ModelSerializer):
    class Meta:
        model = Availability
        fields = "__all__"
        read_only_fields = ["nanny"]

    def validate(self, data):
        if data["start_time"] >= data["end_time"]:
            raise serializers.ValidationError("La hora de inicio debe ser menor a la de fin.")

        qs = Availability.objects.filter(
            nanny=self.context["request"].user,
            day=data["day"],
            start_time__lt=data["end_time"],
            end_time__gt=data["start_time"]
        )
        
        # Excluir la instancia actual si estamos actualizando
        if self.instance:
            qs = qs.exclude(pk=self.instance.pk)
        
        if qs.exists():
            raise serializers.ValidationError("Ya existe disponibilidad en este rango.")
        return data

    def create(self, validated_data):
        validated_data["nanny"] = self.context["request"].user
        return super().create(validated_data)

    def to_representation(self, instance):
        rep = super().to_representation(instance)
        rep["nanny"] = {
            "id": instance.nanny.id,
            "username": instance.nanny.username,
            "email": instance.nanny.email,
            "role": instance.nanny.role,
        }
        return rep


# --- Notification ---
class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = "__all__"
        read_only_fields = ["user", "created_at", "updated_at"]

    def create(self, validated_data):
        validated_data["user"] = self.context["request"].user
        return super().create(validated_data)

    def to_representation(self, instance):
        rep = super().to_representation(instance)
        rep["user"] = {
            "id": instance.user.id,
            "username": instance.user.username,
            "email": instance.user.email,
            "role": instance.user.role,
        }
        return rep

# Favorites are handled by the `favorites` app; serializer imported above.