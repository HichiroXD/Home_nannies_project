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

        if nanny:
            if not hasattr(nanny, 'role'):
                raise serializers.ValidationError(f"El usuario con ID {nanny.id} no tiene rol definido.")
            if nanny.role != "nanny":
                raise serializers.ValidationError(f"El usuario seleccionado tiene rol '{nanny.role}', no es una niñera.")

        # Verificar disponibilidad de la niñera
        if start and end and nanny:
            availability_qs = Availability.objects.filter(
                nanny=nanny,
                day=start.date(),
                start_time__lte=start.time(),
                end_time__gte=end.time(),
            )
            if not availability_qs.exists():
                # Buscar disponibilidades en ese día para dar mejor feedback
                day_availabilities = Availability.objects.filter(
                    nanny=nanny,
                    day=start.date()
                )
                if day_availabilities.exists():
                    slots = ", ".join([f"{a.start_time.strftime('%H:%M')}-{a.end_time.strftime('%H:%M')}" for a in day_availabilities])
                    raise serializers.ValidationError(
                        f"La niñera no tiene disponibilidad en el horario {start.time().strftime('%H:%M')}-{end.time().strftime('%H:%M')}. "
                        f"Horarios disponibles ese día: {slots}"
                    )
                else:
                    raise serializers.ValidationError(
                        f"La niñera no tiene disponibilidad el {start.date().strftime('%d/%m/%Y')}."
                    )

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
        
        # Incluir información del padre/madre con su perfil
        parent_data = {
            "id": instance.parent.id,
            "username": instance.parent.username,
            "email": instance.parent.email,
            "role": instance.parent.role,
        }
        
        # Agregar información del perfil de padre si existe
        try:
            from parents.models import ParentProfile
            parent_profile = ParentProfile.objects.get(user=instance.parent)
            parent_data["parent_profile_id"] = parent_profile.id
            parent_data["first_name"] = parent_profile.first_name or instance.parent.username
            parent_data["last_name"] = parent_profile.last_name or ""
        except ParentProfile.DoesNotExist:
            import logging
            logger = logging.getLogger(__name__)
            logger.warning(f"ParentProfile not found for user {instance.parent.id}")
            parent_data["parent_profile_id"] = None
            parent_data["first_name"] = instance.parent.username
            parent_data["last_name"] = ""
        
        rep["parent"] = parent_data
        
        # Incluir información de la niñera con su perfil
        nanny_data = {
            "id": instance.nanny.id,
            "username": instance.nanny.username,
            "email": instance.nanny.email,
            "role": instance.nanny.role,
        }
        
        # Agregar información del perfil de niñera si existe
        try:
            from nannies.models import NannyProfile
            nanny_profile = NannyProfile.objects.get(user=instance.nanny)
            nanny_data["nanny_profile_id"] = nanny_profile.id
            nanny_data["first_name"] = instance.nanny.first_name or instance.nanny.username
            nanny_data["last_name"] = instance.nanny.last_name or ""
        except NannyProfile.DoesNotExist:
            import logging
            logger = logging.getLogger(__name__)
            logger.warning(f"NannyProfile not found for user {instance.nanny.id}")
            nanny_data["nanny_profile_id"] = None
            nanny_data["first_name"] = instance.nanny.first_name or instance.nanny.username
            nanny_data["last_name"] = instance.nanny.last_name or ""
        
        rep["nanny"] = nanny_data
        return rep


# --- Availability ---
class AvailabilitySerializer(serializers.ModelSerializer):
    is_booked = serializers.SerializerMethodField()
    booked_by_current_user = serializers.SerializerMethodField()
    
    class Meta:
        model = Availability
        fields = "__all__"
        read_only_fields = ["nanny"]

    def get_is_booked(self, obj):
        """Verifica si esta disponibilidad tiene una reserva confirmada o pendiente"""
        from datetime import datetime
        # Convertir day y times a datetime para comparar
        start_datetime = datetime.combine(obj.day, obj.start_time)
        end_datetime = datetime.combine(obj.day, obj.end_time)
        
        # Buscar reservas que se solapen con esta disponibilidad
        bookings = Booking.objects.filter(
            nanny=obj.nanny,
            status__in=['pending', 'confirmed'],
            start_time__lt=end_datetime,
            end_time__gt=start_datetime
        )
        return bookings.exists()
    
    def get_booked_by_current_user(self, obj):
        """Verifica si el usuario actual tiene una reserva en esta disponibilidad"""
        from datetime import datetime
        request = self.context.get('request')
        if not request or not request.user.is_authenticated:
            return False
            
        start_datetime = datetime.combine(obj.day, obj.start_time)
        end_datetime = datetime.combine(obj.day, obj.end_time)
        
        bookings = Booking.objects.filter(
            nanny=obj.nanny,
            parent=request.user,
            status__in=['pending', 'confirmed'],
            start_time__lt=end_datetime,
            end_time__gt=start_datetime
        )
        return bookings.exists()

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