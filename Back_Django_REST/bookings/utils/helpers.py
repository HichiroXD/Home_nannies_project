"""Utilidades compartidas para la app de bookings."""

import logging
from typing import Dict, Any
from django.db.models import Model

logger = logging.getLogger(__name__)


def get_user_profile_data(user, profile_model: type[Model], profile_attr: str) -> Dict[str, Any]:
    """
    Extrae datos de usuario con su perfil asociado.
    
    Args:
        user: Instancia de User
        profile_model: Modelo del perfil (ParentProfile o NannyProfile)
        profile_attr: Nombre del atributo del perfil ('parent_profile_id' o 'nanny_profile_id')
    
    Returns:
        dict con datos del usuario y perfil
    
    Example:
        >>> from parents.models import ParentProfile
        >>> data = get_user_profile_data(user, ParentProfile, 'parent_profile_id')
        >>> print(data['parent_profile_id'])
    """
    user_data = {
        "id": user.id,
        "username": user.username,
        "email": user.email,
        "role": user.role,
    }
    
    try:
        profile = profile_model.objects.get(user=user)
        user_data[profile_attr] = profile.id
        user_data["first_name"] = user.first_name or user.username
        user_data["last_name"] = user.last_name or ""
    except profile_model.DoesNotExist:
        logger.warning(f"{profile_model.__name__} not found for user {user.id}")
        user_data[profile_attr] = None
        user_data["first_name"] = user.first_name or user.username
        user_data["last_name"] = user.last_name or ""
    
    return user_data
