from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .role_models import UserRole, ActiveRole
from .role_serializers import (
    UserRoleSerializer,
    ActiveRoleSerializer,
    UserRolesListSerializer
)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_user_roles(request):
    """
    Obtiene todos los roles del usuario autenticado.
    
    Returns:
        - primary_role: Rol principal del usuario
        - additional_roles: Lista de roles adicionales
        - all_roles: Lista con todos los roles
        - active_role: Rol actualmente activo en la sesión
    """
    user = request.user
    additional_roles = user.additional_roles.filter(is_active=True)
    
    try:
        active_role_obj = ActiveRole.objects.get(user=user)
        active_role = active_role_obj.active_role
    except ActiveRole.DoesNotExist:
        active_role = user.role
    
    data = {
        'primary_role': user.role,
        'primary_role_display': user.get_role_display(),
        'additional_roles': UserRoleSerializer(additional_roles, many=True).data,
        'all_roles': user.get_all_roles(),
        'active_role': active_role
    }
    
    serializer = UserRolesListSerializer(data)
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def add_role(request):
    """
    Agrega un rol adicional al usuario.
    
    Body:
        - role: Rol a agregar ('parent' o 'nanny')
    
    Returns:
        - success: True si se agregó correctamente
        - message: Mensaje descriptivo
        - role: Datos del rol agregado
    """
    role = request.data.get('role')
    
    if not role or role not in ['parent', 'nanny']:
        return Response(
            {'error': 'Rol inválido. Use "parent" o "nanny".'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    user = request.user
    
    # Verificar que tenga el perfil correspondiente
    if role == 'parent' and not hasattr(user, 'parent_profile'):
        return Response(
            {'error': 'Debe completar su perfil de padre primero.'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    if role == 'nanny' and not hasattr(user, 'nanny_profile'):
        return Response(
            {'error': 'Debe completar su perfil de niñera primero.'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    created = user.add_role(role)
    
    if not created and user.role == role:
        return Response(
            {'message': 'Este ya es su rol principal.'},
            status=status.HTTP_200_OK
        )
    
    role_obj = user.additional_roles.get(role=role)
    serializer = UserRoleSerializer(role_obj)
    
    return Response({
        'success': True,
        'message': f'Rol {role_obj.get_role_display()} agregado correctamente.',
        'role': serializer.data
    }, status=status.HTTP_201_CREATED if created else status.HTTP_200_OK)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def remove_role(request, role):
    """
    Remueve un rol adicional del usuario.
    No puede remover el rol principal.
    
    Args:
        role: Rol a remover ('parent' o 'nanny')
    
    Returns:
        - success: True si se removió correctamente
        - message: Mensaje descriptivo
    """
    if role not in ['parent', 'nanny']:
        return Response(
            {'error': 'Rol inválido.'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    user = request.user
    
    if role == user.role:
        return Response(
            {'error': 'No puede remover su rol principal.'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    removed = user.remove_role(role)
    
    if not removed:
        return Response(
            {'error': 'El usuario no tiene este rol.'},
            status=status.HTTP_404_NOT_FOUND
        )
    
    return Response({
        'success': True,
        'message': f'Rol {role} removido correctamente.'
    })


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def switch_active_role(request):
    """
    Cambia el rol activo del usuario en la sesión actual.
    Solo puede cambiar a roles que el usuario posea.
    
    Body:
        - role: Rol a activar
    
    Returns:
        - success: True si cambió correctamente
        - active_role: Nuevo rol activo
        - message: Mensaje descriptivo
    """
    new_role = request.data.get('role')
    user = request.user
    
    if not new_role:
        return Response(
            {'error': 'Debe proporcionar un rol.'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Verificar que el usuario tenga este rol
    if not user.has_role(new_role):
        return Response(
            {'error': 'No tiene permisos para usar este rol.'},
            status=status.HTTP_403_FORBIDDEN
        )
    
    # Actualizar o crear el rol activo
    active_role_obj, created = ActiveRole.objects.update_or_create(
        user=user,
        defaults={'active_role': new_role}
    )
    
    serializer = ActiveRoleSerializer(active_role_obj)
    
    return Response({
        'success': True,
        'message': f'Rol activo cambiado a {active_role_obj.get_active_role_display()}.',
        'active_role_data': serializer.data
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_active_role(request):
    """
    Obtiene el rol actualmente activo del usuario.
    
    Returns:
        - active_role: Rol activo
        - available_roles: Lista de roles disponibles
    """
    user = request.user
    
    try:
        active_role_obj = ActiveRole.objects.get(user=user)
        serializer = ActiveRoleSerializer(active_role_obj)
        return Response(serializer.data)
    except ActiveRole.DoesNotExist:
        return Response({
            'active_role': user.role,
            'active_role_display': user.get_role_display(),
            'available_roles': user.get_all_roles(),
            'updated_at': None
        })
