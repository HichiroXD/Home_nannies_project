from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
import logging
from .models import ParentProfile
from .serializer import ParentProfileSerializer

logger = logging.getLogger(__name__)


class ParentProfileDetailView(generics.RetrieveUpdateAPIView):
    """Vista para ver y actualizar el perfil de padre del usuario autenticado"""
    serializer_class = ParentProfileSerializer
    permission_classes = [IsAuthenticated]
    
    def get_object(self):
        return self.request.user.parent_profile


@api_view(['GET', 'PUT', 'PATCH'])
@permission_classes([IsAuthenticated])
def parent_profile(request):
    """
    Endpoint para obtener y actualizar el perfil de padre.
    GET: Obtiene el perfil completo
    PUT/PATCH: Actualiza el perfil
    """
    try:
        parent = ParentProfile.objects.get(user=request.user)
    except ParentProfile.DoesNotExist:
        return Response(
            {'error': 'No tienes un perfil de padre'},
            status=status.HTTP_404_NOT_FOUND
        )
    
    if request.method == 'GET':
        serializer = ParentProfileSerializer(parent)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    elif request.method in ['PUT', 'PATCH']:
        partial = request.method == 'PATCH'
        serializer = ParentProfileSerializer(parent, data=request.data, partial=partial)
        
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
