"""
Admin views for soft-deleted items management.
Provides endpoints for viewing and restoring deleted records.
"""
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework import status
from django.apps import apps
from django.core.exceptions import ObjectDoesNotExist
import logging

logger = logging.getLogger(__name__)


class DeletedItemsView(APIView):
    """
    Vista para listar elementos eliminados de un modelo específico.
    
    GET /api/admin/deleted-items/?model=booking
    
    Query params:
    - model: nombre del modelo (booking, user, etc.)
    - limit: número de resultados (default: 50, max: 200)
    """
    permission_classes = [IsAuthenticated, IsAdminUser]
    
    # Modelos permitidos para consultar
    ALLOWED_MODELS = {
        'booking': 'bookings.Booking',
        'review': 'reviews.Review',
        'notification': 'notifications.Notification',
    }
    
    def get(self, request):
        model_name = request.query_params.get('model', '').lower()
        limit = min(int(request.query_params.get('limit', 50)), 200)
        
        if model_name not in self.ALLOWED_MODELS:
            return Response(
                {
                    'error': f'Modelo no permitido. Opciones: {", ".join(self.ALLOWED_MODELS.keys())}'
                },
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            # Get model class
            app_label, model_class_name = self.ALLOWED_MODELS[model_name].split('.')
            Model = apps.get_model(app_label, model_class_name)
            
            # Check if model has soft delete support
            if not hasattr(Model, 'deleted_at'):
                return Response(
                    {'error': f'El modelo {model_name} no soporta eliminación lógica'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Get deleted items
            if hasattr(Model, 'all_objects'):
                deleted_items = Model.all_objects.filter(
                    deleted_at__isnull=False
                ).order_by('-deleted_at')[:limit]
            else:
                deleted_items = Model.objects.filter(
                    deleted_at__isnull=False
                ).order_by('-deleted_at')[:limit]
            
            # Serialize items
            items_data = []
            for item in deleted_items:
                item_dict = {
                    'id': item.id,
                    'deleted_at': item.deleted_at.isoformat() if item.deleted_at else None,
                }
                
                # Add model-specific fields
                if model_name == 'booking':
                    item_dict.update({
                        'parent': item.parent.username,
                        'nanny': item.nanny.username,
                        'start_time': item.start_time.isoformat(),
                        'status': item.status,
                    })
                elif model_name == 'review':
                    item_dict.update({
                        'rating': item.rating,
                        'parent': item.parent.username,
                        'nanny': item.nanny.username,
                    })
                elif model_name == 'notification':
                    item_dict.update({
                        'user': item.user.username,
                        'subject': item.subject,
                        'channel': item.channel,
                    })
                
                items_data.append(item_dict)
            
            return Response({
                'model': model_name,
                'count': len(items_data),
                'items': items_data
            }, status=status.HTTP_200_OK)
            
        except LookupError:
            return Response(
                {'error': f'Modelo {model_name} no encontrado'},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            logger.error(f'Error obteniendo items eliminados: {str(e)}', exc_info=True)
            return Response(
                {'error': 'Error al obtener items eliminados'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class RestoreItemView(APIView):
    """
    Vista para restaurar un elemento eliminado.
    
    POST /api/admin/restore-item/
    Body: {
        "model": "booking",
        "id": 123
    }
    """
    permission_classes = [IsAuthenticated, IsAdminUser]
    
    ALLOWED_MODELS = {
        'booking': 'bookings.Booking',
        'review': 'reviews.Review',
        'notification': 'notifications.Notification',
    }
    
    def post(self, request):
        model_name = request.data.get('model', '').lower()
        item_id = request.data.get('id')
        
        if not model_name or not item_id:
            return Response(
                {'error': 'Los campos model e id son requeridos'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if model_name not in self.ALLOWED_MODELS:
            return Response(
                {
                    'error': f'Modelo no permitido. Opciones: {", ".join(self.ALLOWED_MODELS.keys())}'
                },
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            # Get model class
            app_label, model_class_name = self.ALLOWED_MODELS[model_name].split('.')
            Model = apps.get_model(app_label, model_class_name)
            
            # Check if model has soft delete support
            if not hasattr(Model, 'deleted_at'):
                return Response(
                    {'error': f'El modelo {model_name} no soporta eliminación lógica'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Get item
            if hasattr(Model, 'all_objects'):
                item = Model.all_objects.get(id=item_id)
            else:
                item = Model.objects.get(id=item_id)
            
            # Check if deleted
            if not item.deleted_at:
                return Response(
                    {'error': 'El elemento no está eliminado'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Restore
            if hasattr(item, 'restore'):
                item.restore()
            else:
                item.deleted_at = None
                item.save()
            
            logger.info(
                f'Admin {request.user.username} restauró {model_name} #{item_id}'
            )
            
            return Response({
                'message': f'{model_name.capitalize()} #{item_id} restaurado exitosamente',
                'id': item_id,
                'model': model_name
            }, status=status.HTTP_200_OK)
            
        except ObjectDoesNotExist:
            return Response(
                {'error': f'{model_name.capitalize()} con ID {item_id} no encontrado'},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            logger.error(f'Error restaurando item: {str(e)}', exc_info=True)
            return Response(
                {'error': 'Error al restaurar el elemento'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class HardDeleteItemView(APIView):
    """
    Vista para eliminar permanentemente un elemento.
    ADVERTENCIA: Esta acción es irreversible.
    
    DELETE /api/admin/hard-delete-item/
    Body: {
        "model": "booking",
        "id": 123,
        "confirm": true
    }
    """
    permission_classes = [IsAuthenticated, IsAdminUser]
    
    ALLOWED_MODELS = {
        'booking': 'bookings.Booking',
        'review': 'reviews.Review',
        'notification': 'notifications.Notification',
    }
    
    def delete(self, request):
        model_name = request.data.get('model', '').lower()
        item_id = request.data.get('id')
        confirm = request.data.get('confirm', False)
        
        if not model_name or not item_id:
            return Response(
                {'error': 'Los campos model e id son requeridos'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if not confirm:
            return Response(
                {'error': 'Debe confirmar la eliminación permanente con confirm: true'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if model_name not in self.ALLOWED_MODELS:
            return Response(
                {
                    'error': f'Modelo no permitido. Opciones: {", ".join(self.ALLOWED_MODELS.keys())}'
                },
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            # Get model class
            app_label, model_class_name = self.ALLOWED_MODELS[model_name].split('.')
            Model = apps.get_model(app_label, model_class_name)
            
            # Get item
            if hasattr(Model, 'all_objects'):
                item = Model.all_objects.get(id=item_id)
            else:
                item = Model.objects.get(id=item_id)
            
            # Hard delete
            if hasattr(item, 'hard_delete'):
                item.hard_delete()
            else:
                item.delete()  # Standard Django delete
            
            logger.warning(
                f'Admin {request.user.username} eliminó permanentemente {model_name} #{item_id}'
            )
            
            return Response({
                'message': f'{model_name.capitalize()} #{item_id} eliminado permanentemente',
                'id': item_id,
                'model': model_name
            }, status=status.HTTP_200_OK)
            
        except ObjectDoesNotExist:
            return Response(
                {'error': f'{model_name.capitalize()} con ID {item_id} no encontrado'},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            logger.error(f'Error eliminando permanentemente item: {str(e)}', exc_info=True)
            return Response(
                {'error': 'Error al eliminar permanentemente el elemento'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
