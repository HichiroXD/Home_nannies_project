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
            from users.validators import validate_user_role
            validate_user_role(nanny, 'nanny', "La niñera seleccionada")

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
        """Incluye información extendida de parent y nanny con sus perfiles."""
        from parents.models import ParentProfile
        from nannies.models import NannyProfile
        from .utils import get_user_profile_data
        
        rep = super().to_representation(instance)
        
        # Incluir información del padre/madre con su perfil
        rep["parent"] = get_user_profile_data(
            instance.parent, ParentProfile, 'parent_profile_id'
        )
        
        # Incluir información de la niñera con su perfil
        rep["nanny"] = get_user_profile_data(
            instance.nanny, NannyProfile, 'nanny_profile_id'
        )
        
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
        from datetime import datetime, time
        from .constants import ERROR_MESSAGES, AVAILABILITY_MESSAGES
        
        start_time = data["start_time"]
        end_time = data["end_time"]
        day = data["day"]
        
        # Validación 1: Hora de inicio antes de fin
        if start_time >= end_time:
            raise serializers.ValidationError({
                "start_time": "La hora de inicio debe ser anterior a la hora de fin.",
                "end_time": f"La hora de fin ({end_time.strftime('%H:%M')}) debe ser posterior a la de inicio ({start_time.strftime('%H:%M')})."
            })
        
        # Validación 2: Horario razonable (6 AM - 11 PM)
        if start_time < time(6, 0) or end_time > time(23, 0):
            raise serializers.ValidationError({
                "non_field_errors": ["⏰ " + ERROR_MESSAGES['unreasonable_hours']]
            })
        
        # Validación 3: Duración mínima de 1 hora
        duration = (datetime.combine(day, end_time) - datetime.combine(day, start_time)).seconds / 3600
        if duration < 1:
            raise serializers.ValidationError({
                "non_field_errors": ["⏱️ " + ERROR_MESSAGES['minimum_duration']]
            })

        # Validación 4: Traslapes con disponibilidad existente
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
            existing = qs.first()
            error_lines = [
                f"{AVAILABILITY_MESSAGES['conflict_detected']}:",
                "",
                AVAILABILITY_MESSAGES['existing_slot'].format(
                    date=day.strftime('%d/%m/%Y'),
                    start_time=existing.start_time.strftime('%H:%M'),
                    end_time=existing.end_time.strftime('%H:%M')
                ),
                "",
                AVAILABILITY_MESSAGES['overlap_explanation'].format(
                    new_start=start_time.strftime('%H:%M'),
                    new_end=end_time.strftime('%H:%M')
                ),
                "",
                AVAILABILITY_MESSAGES['suggestions_header'],
                AVAILABILITY_MESSAGES['suggestion_edit'],
                AVAILABILITY_MESSAGES['suggestion_different_time'].format(
                    before=existing.start_time.strftime('%H:%M'),
                    after=existing.end_time.strftime('%H:%M')
                )
            ]
            raise serializers.ValidationError({
                "non_field_errors": error_lines
            })
        
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