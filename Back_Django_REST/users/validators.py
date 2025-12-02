"""Validadores reutilizables para la aplicación."""

from rest_framework import serializers
from users.models import User


def validate_user_role(user, expected_role: str, error_prefix: str = "El usuario"):
    """
    Valida que un usuario tenga el rol esperado.
    
    Args:
        user: Instancia de User o ID
        expected_role: 'parent' o 'nanny'
        error_prefix: Prefijo para el mensaje de error
        
    Returns:
        User: Instancia validada del usuario
        
    Raises:
        ValidationError: Si el rol no coincide o el usuario no existe
        
    Example:
        >>> validate_user_role(user, 'nanny', "La niñera seleccionada")
    """
    # Si es un ID, obtener la instancia
    if isinstance(user, int):
        try:
            user = User.objects.get(pk=user)
        except User.DoesNotExist:
            raise serializers.ValidationError(f"{error_prefix} con ID {user} no existe.")
    
    # Validar que tenga atributo role
    if not hasattr(user, 'role'):
        raise serializers.ValidationError(f"{error_prefix} no tiene rol definido.")
    
    # Validar el rol
    if user.role != expected_role:
        role_names = {'parent': 'padre/madre', 'nanny': 'niñera'}
        expected_name = role_names.get(expected_role, expected_role)
        raise serializers.ValidationError(
            f"{error_prefix} tiene rol '{user.role}', se esperaba '{expected_name}'."
        )
    
    return user
