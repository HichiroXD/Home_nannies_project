from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.exceptions import ValidationError
from core.mixins import RoleBasedQuerysetWithNestedMixin
from .models import Review
from .serializer import ReviewSerializer, ReviewCreateSerializer
from nannies.models import NannyProfile
import logging

logger = logging.getLogger(__name__)

class ReviewListCreateView(RoleBasedQuerysetWithNestedMixin, generics.ListCreateAPIView):
    """
    Vista para listar y crear reseñas.
    
    GET:
    - Padres ven las reseñas que escribieron
    - Niñeras ven las reseñas que recibieron
    
    POST:
    - Crea una nueva reseña (solo padres pueden dejar reseñas)
    - Actualiza automáticamente la calificación promedio de la niñera
    """
    permission_classes = [permissions.IsAuthenticated]
    queryset = Review.objects.all()
    
    # Configuración del mixin
    parent_filter_field = 'parent'
    nanny_nested_field = 'nanny__user'  # Review -> NannyProfile -> User
    select_related_fields = ('parent', 'nanny', 'nanny__user')
    
    def dispatch(self, request, *args, **kwargs):
        if request.method == 'POST':
            logger.info(f"[DISPATCH] Review POST received - User: {request.user if request.user.is_authenticated else 'Anonymous'}")
            logger.info(f"[DISPATCH] Request body: {request.body}")
            logger.info(f"[DISPATCH] Content-Type: {request.content_type}")
        return super().dispatch(request, *args, **kwargs)
    
    def handle_exception(self, exc):
        logger.error(f"[EXCEPTION] Error en ReviewListCreateView: {exc}")
        logger.error(f"[EXCEPTION] Type: {type(exc)}")
        import traceback
        logger.error(f"[EXCEPTION] Traceback: {traceback.format_exc()}")
        return super().handle_exception(exc)

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return ReviewCreateSerializer
        return ReviewSerializer

    def create(self, request, *args, **kwargs):
        logger.info(f"Review POST request data: {request.data}")
        logger.info(f"User: {request.user} (role: {request.user.role})")
        
        # Validar datos con el serializer
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        validated_data = serializer.validated_data
        nanny_id = validated_data.get('nanny')
        logger.info(f"Nanny ID from validated_data: {nanny_id}")
        
        # Obtener la instancia de NannyProfile
        nanny_profile = NannyProfile.objects.get(pk=nanny_id)
        
        # SPRINT 3: Permitir múltiples reseñas del mismo padre a la misma niñera
        # (Comentado - ya no se valida duplicados)
        # existing_review = Review.objects.filter(
        #     parent=request.user,
        #     nanny=nanny_profile
        # ).first()
        # if existing_review:
        #     raise ValidationError({"detail": "Ya has dejado una reseña para esta niñera."})
        
        # Crear la reseña
        review = Review.objects.create(
            parent=request.user,
            nanny=nanny_profile,
            rating=validated_data.get('rating'),
            comment=validated_data.get('comment', '')
        )
        
        logger.info(f"Review created successfully: {review.id}")
        
        # Crear notificaciones usando el servicio centralizado
        from notifications.services import NotificationService
        
        NotificationService.notify_review_created(
            review=review,
            parent=request.user,
            nanny=nanny_profile.user
        )
        
        logger.info(f"Notifications created for review {review.id}")
        
        # Serializar la respuesta usando ReviewSerializer
        response_serializer = ReviewSerializer(review)
        headers = self.get_success_headers(response_serializer.data)
        
        return Response(response_serializer.data, status=status.HTTP_201_CREATED, headers=headers)


class AdminAllReviewsView(generics.ListAPIView):
    """
    Vista exclusiva para administradores.
    Lista TODAS las reseñas del sistema (de todos los padres y niñeras).
    """
    serializer_class = ReviewSerializer
    permission_classes = [permissions.IsAuthenticated]
    queryset = Review.objects.all().select_related('parent', 'nanny', 'nanny__user').order_by('-created_at')
    
    def get_queryset(self):
        # Verificar que el usuario sea administrador
        if self.request.user.get_active_role() != 'admin':
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("Solo los administradores pueden ver todas las reseñas.")
        return super().get_queryset()


class ReviewDetailView(generics.RetrieveDestroyAPIView):
    """
    Vista para obtener o eliminar una reseña específica.
    
    GET: Obtiene los detalles de una reseña
    DELETE: Elimina una reseña (solo el autor puede eliminarla)
    """
    queryset = Review.objects.all()
    serializer_class = ReviewSerializer
    permission_classes = [permissions.IsAuthenticated]
