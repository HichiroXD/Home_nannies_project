from rest_framework import serializers
from .models import User
from django.contrib.auth.password_validation import validate_password

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username", "email", "role", "is_verified"]
        read_only_fields = ["id", "is_verified"]

class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(
        write_only=True, required=True, min_length=10,
        validators=[validate_password]
    )
    password2 = serializers.CharField(
        write_only=True, required=True
    )
    role = serializers.ChoiceField(
        choices=User.ROLE_CHOICES,
        required=False,
        default="parent"   # Valor por defecto si no se manda
    )

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'role', 'password', 'password2']

    def validate(self, data):
        if data['password'] != data['password2']:
            raise serializers.ValidationError("Las contraseñas no coinciden")
        return data

    def create(self, validated_data):
        validated_data.pop('password2')
        role = validated_data.get('role', 'parent')  # fallback si viene vacío
        if role not in ['parent', 'nanny']:
            raise serializers.ValidationError("Rol inválido. Solo se permiten 'parent' o 'nanny'.")

        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            role=role,
            password=validated_data['password'],
            is_verified=False,
            pending_verification=True,
        )
        return user

class UserListSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            "id", "username", "email", "role", "is_verified",
            "pending_verification", "date_joined", "last_login"
        ]
        read_only_fields = fields
