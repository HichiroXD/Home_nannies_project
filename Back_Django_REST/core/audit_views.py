"""
Views para Auditoría - Endpoints para consultar logs de auditoría
"""
from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.db.models import Q
from datetime import timedelta
from django.utils import timezone
from .audit_models import AuditLog, UserPermission
from .audit_serializers import AuditLogSerializer, UserPermissionSerializer


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def audit_logs_view(request):
    """
    Obtiene logs de auditoría con filtros.
    Solo administradores pueden ver todos los logs.
    Usuarios normales solo ven sus propios logs.
    
    Query params:
    - user_id: Filtrar por usuario
    - action: Filtrar por tipo de acción
    - start_date: Fecha inicial (YYYY-MM-DD)
    - end_date: Fecha final (YYYY-MM-DD)
    - limit: Límite de resultados (default: 100)
    """
    
    # Verificar permisos
    if request.user.get_active_role() != 'admin':
        # Usuarios no-admin solo ven sus propios logs
        logs = AuditLog.objects.filter(user=request.user)
    else:
        logs = AuditLog.objects.all()
    
    # Aplicar filtros
    user_id = request.GET.get('user_id')
    if user_id:
        logs = logs.filter(user_id=user_id)
    
    action = request.GET.get('action')
    if action:
        logs = logs.filter(action=action)
    
    start_date = request.GET.get('start_date')
    if start_date:
        try:
            start = datetime.strptime(start_date, '%Y-%m-%d')
            logs = logs.filter(timestamp__gte=start)
        except ValueError:
            pass
    
    end_date = request.GET.get('end_date')
    if end_date:
        try:
            end = datetime.strptime(end_date, '%Y-%m-%d')
            # Incluir todo el día
            end = end + timedelta(days=1)
            logs = logs.filter(timestamp__lt=end)
        except ValueError:
            pass
    
    # Buscar por descripción
    search = request.GET.get('search')
    if search:
        logs = logs.filter(description__icontains=search)
    
    # Límite de resultados
    limit = int(request.GET.get('limit', 100))
    logs = logs[:limit]
    
    # Serializar y retornar
    serializer = AuditLogSerializer(logs, many=True)
    
    return Response({
        'count': logs.count(),
        'results': serializer.data
    }, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def audit_stats_view(request):
    """
    Obtiene estadísticas de auditoría.
    Solo para administradores.
    """
    if request.user.get_active_role() != 'admin':
        return Response(
            {'error': 'No tienes permisos para ver estadísticas'},
            status=status.HTTP_403_FORBIDDEN
        )
    
    # Estadísticas de los últimos 30 días
    thirty_days_ago = timezone.now() - timedelta(days=30)
    recent_logs = AuditLog.objects.filter(timestamp__gte=thirty_days_ago)
    
    # Contar por tipo de acción
    action_counts = {}
    for choice in AuditLog.ACTION_CHOICES:
        action_code = choice[0]
        action_label = choice[1]
        count = recent_logs.filter(action=action_code).count()
        if count > 0:
            action_counts[action_label] = count
    
    # Usuarios más activos
    from django.db.models import Count
    active_users = recent_logs.values('user__username').annotate(
        action_count=Count('id')
    ).order_by('-action_count')[:10]
    
    # Total de logs
    total_logs = AuditLog.objects.count()
    
    stats = {
        'total_logs': total_logs,
        'recent_logs_30_days': recent_logs.count(),
        'actions_breakdown': action_counts,
        'most_active_users': list(active_users),
        'generated_at': timezone.now().isoformat()
    }
    
    return Response(stats, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_permissions_view(request):
    """
    Obtiene permisos del usuario actual.
    """
    user = request.user
    
    # Permisos base según rol
    base_permissions = get_role_permissions(user.role)
    
    # Permisos personalizados adicionales
    custom_permissions = UserPermission.objects.filter(user=user)
    custom_perms_list = [p.permission for p in custom_permissions]
    
    # Combinar permisos
    all_permissions = list(set(base_permissions + custom_perms_list))
    
    return Response({
        'role': user.role,
        'base_permissions': base_permissions,
        'custom_permissions': custom_perms_list,
        'all_permissions': all_permissions
    }, status=status.HTTP_200_OK)


def get_role_permissions(role):
    """
    Retorna lista de permisos base según el rol del usuario.
    """
    permissions = {
        'admin': [
            'view_users',
            'create_users',
            'edit_users',
            'delete_users',
            'view_nannies',
            'verify_nannies',
            'edit_nanny_profiles',
            'view_parents',
            'edit_parent_profiles',
            'view_all_bookings',
            'manage_bookings',
            'cancel_any_booking',
            'view_all_reviews',
            'delete_reviews',
            'moderate_reviews',
            'view_documents',
            'verify_documents',
            'verify_academic',
            'view_reports',
            'export_data',
            'view_audit_logs',
            'manage_settings',
            'access_admin_panel',
        ],
        'nanny': [
            'view_nannies',  # Ver otras niñeras
            'edit_nanny_profiles',  # Solo su propio perfil
        ],
        'parent': [
            'view_nannies',  # Ver catálogo de niñeras
        ]
    }
    
    return permissions.get(role, [])


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def grant_permission_view(request):
    """
    Otorga un permiso personalizado a un usuario.
    Solo administradores pueden otorgar permisos.
    """
    if request.user.get_active_role() != 'admin':
        return Response(
            {'error': 'Solo administradores pueden otorgar permisos'},
            status=status.HTTP_403_FORBIDDEN
        )
    
    user_id = request.data.get('user_id')
    permission = request.data.get('permission')
    reason = request.data.get('reason', '')
    
    if not user_id or not permission:
        return Response(
            {'error': 'user_id y permission son requeridos'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    try:
        from django.contrib.auth import get_user_model
        User = get_user_model()
        user = User.objects.get(id=user_id)
        
        # Verificar que el permiso existe en las opciones
        valid_permissions = [p[0] for p in UserPermission.PERMISSION_CHOICES]
        if permission not in valid_permissions:
            return Response(
                {'error': f'Permiso inválido: {permission}'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Crear o actualizar permiso
        perm, created = UserPermission.objects.get_or_create(
            user=user,
            permission=permission,
            defaults={
                'granted_by': request.user,
                'reason': reason
            }
        )
        
        # Registrar en auditoría
        AuditLog.log_action(
            user=request.user,
            action='permission_change',
            description=f'Permiso "{permission}" otorgado a {user.username}',
            content_object=user,
            metadata={'permission': permission, 'reason': reason}
        )
        
        return Response({
            'message': 'Permiso otorgado exitosamente',
            'created': created
        }, status=status.HTTP_201_CREATED if created else status.HTTP_200_OK)
        
    except User.DoesNotExist:
        return Response(
            {'error': 'Usuario no encontrado'},
            status=status.HTTP_404_NOT_FOUND
        )
