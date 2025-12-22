"""
Vistas para el historial de acceso de usuarios
"""
from rest_framework import permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from .models import User, LoginHistory


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def login_history(request):
    """
    Obtiene el historial de accesos del usuario autenticado.
    Los administradores pueden ver el historial de cualquier usuario.
    
    GET /api/users/login-history/
    GET /api/users/login-history/?user_id=123  (solo admin)
    """
    user_id = request.GET.get('user_id')
    
    # Si se proporciona user_id, verificar que sea admin
    if user_id:
        if not request.user.is_staff and request.user.role != 'admin':
            return Response(
                {'error': 'No tienes permisos para ver el historial de otros usuarios'},
                status=status.HTTP_403_FORBIDDEN
            )
        try:
            user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            return Response(
                {'error': 'Usuario no encontrado'},
                status=status.HTTP_404_NOT_FOUND
            )
    else:
        user = request.user
    
    # Obtener historial con paginación
    page = int(request.GET.get('page', 1))
    page_size = min(int(request.GET.get('page_size', 20)), 100)
    offset = (page - 1) * page_size
    
    history_queryset = LoginHistory.objects.filter(user=user).order_by('-login_time')
    total_count = history_queryset.count()
    history_page = history_queryset[offset:offset + page_size]
    
    history_data = []
    for entry in history_page:
        history_data.append({
            'id': entry.id,
            'ip_address': entry.ip_address,
            'user_agent': entry.user_agent,
            'login_time': entry.login_time.strftime('%Y-%m-%d %H:%M:%S'),
            'logout_time': entry.logout_time.strftime('%Y-%m-%d %H:%M:%S') if entry.logout_time else None,
            'session_duration': str(entry.session_duration) if entry.session_duration else None,
            'login_successful': entry.login_successful,
            'failure_reason': entry.failure_reason,
            'device_type': entry.device_type,
            'location': entry.location,
        })
    
    return Response({
        'user': {
            'id': user.id,
            'username': user.username,
            'email': user.email,
        },
        'history': history_data,
        'pagination': {
            'total': total_count,
            'page': page,
            'pageSize': page_size,
            'totalPages': (total_count + page_size - 1) // page_size,
            'hasNext': offset + page_size < total_count,
            'hasPrev': page > 1,
        }
    }, status=status.HTTP_200_OK)
