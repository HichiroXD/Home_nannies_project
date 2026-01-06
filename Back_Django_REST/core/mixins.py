"""
Mixins reutilizables para vistas de Django REST Framework.

Estos mixins proporcionan funcionalidad común que puede ser compartida
entre múltiples vistas para evitar duplicación de código.
"""

from rest_framework.exceptions import PermissionDenied
from typing import Optional


class RoleBasedQuerysetMixin:
    """
    Mixin para filtrar querysets basado en el rol del usuario (parent/nanny).
    
    Attributes:
        parent_filter_field (str): Nombre del campo para filtrar por parent
        nanny_filter_field (str): Nombre del campo para filtrar por nanny
        select_related_fields (tuple): Campos para select_related()
        prefetch_related_fields (tuple): Campos para prefetch_related()
    
    Ejemplo:
        class BookingListView(RoleBasedQuerysetMixin, generics.ListAPIView):
            parent_filter_field = 'parent'
            nanny_filter_field = 'nanny'
            select_related_fields = ('parent', 'nanny')
    """
    
    # Campos de filtro (sobrescribir en la clase hija)
    parent_filter_field: Optional[str] = None
    nanny_filter_field: Optional[str] = None
    
    # Optimizaciones de query (opcionales)
    select_related_fields: tuple = ()
    prefetch_related_fields: tuple = ()
    
    def get_queryset(self):
        """
        Filtra el queryset basado en el rol del usuario.
        
        - Parent: ve registros donde es el parent
        - Nanny: ve registros donde es la nanny
        - Otros roles: sin acceso
        
        Returns:
            QuerySet filtrado y optimizado
            
        Raises:
            PermissionDenied: Si los campos de filtro no están configurados
        """
        if not hasattr(self, 'queryset') and not hasattr(self, 'model'):
            raise PermissionDenied("Debe definir 'queryset' o 'model' en la vista")
        
        # Obtener queryset base
        if hasattr(self, 'queryset') and self.queryset is not None:
            queryset = self.queryset.all()
        else:
            queryset = self.model.objects.all()
        
        user = self.request.user
        
        # Aplicar filtros según rol activo
        active_role = user.get_active_role()
        
        if active_role == "parent":
            if not self.parent_filter_field:
                raise PermissionDenied(
                    f"{self.__class__.__name__} debe definir 'parent_filter_field'"
                )
            filter_kwargs = {self.parent_filter_field: user}
            queryset = queryset.filter(**filter_kwargs)
            
        elif active_role == "nanny":
            if not self.nanny_filter_field:
                raise PermissionDenied(
                    f"{self.__class__.__name__} debe definir 'nanny_filter_field'"
                )
            filter_kwargs = {self.nanny_filter_field: user}
            queryset = queryset.filter(**filter_kwargs)
            
        else:
            # Roles no permitidos no ven nada
            return queryset.none()
        
        # Optimizaciones
        if self.select_related_fields:
            queryset = queryset.select_related(*self.select_related_fields)
            
        if self.prefetch_related_fields:
            queryset = queryset.prefetch_related(*self.prefetch_related_fields)
        
        return queryset


class RoleBasedQuerysetWithNestedMixin(RoleBasedQuerysetMixin):
    """
    Mixin extendido para filtrar querysets con relaciones anidadas.
    
    Útil cuando el modelo tiene una FK a otro modelo que contiene el usuario.
    Ejemplo: Review tiene FK a NannyProfile, que tiene FK a User.
    
    Attributes:
        nanny_nested_field (str): Path al campo user para nanny (ej: 'nanny__user')
        parent_nested_field (str): Path al campo user para parent (ej: 'parent')
    
    Ejemplo:
        class ReviewListView(RoleBasedQuerysetWithNestedMixin, ...):
            parent_filter_field = 'parent'
            nanny_nested_field = 'nanny__user'  # Review -> NannyProfile -> User
    """
    
    nanny_nested_field: Optional[str] = None
    
    def get_queryset(self):
        """
        Filtra el queryset considerando relaciones anidadas.
        
        Si nanny_nested_field está definido, lo usa en lugar de nanny_filter_field.
        """
        if not hasattr(self, 'queryset') and not hasattr(self, 'model'):
            raise PermissionDenied("Debe definir 'queryset' o 'model' en la vista")
        
        # Obtener queryset base
        if hasattr(self, 'queryset') and self.queryset is not None:
            queryset = self.queryset.all()
        else:
            queryset = self.model.objects.all()
        
        user = self.request.user
        
        # Aplicar filtros según rol activo
        active_role = user.get_active_role()
        
        if active_role == "parent":
            if not self.parent_filter_field:
                raise PermissionDenied(
                    f"{self.__class__.__name__} debe definir 'parent_filter_field'"
                )
            filter_kwargs = {self.parent_filter_field: user}
            queryset = queryset.filter(**filter_kwargs)
            
        elif active_role == "nanny":
            # Usar campo nested si está definido
            field = self.nanny_nested_field or self.nanny_filter_field
            if not field:
                raise PermissionDenied(
                    f"{self.__class__.__name__} debe definir 'nanny_filter_field' "
                    "o 'nanny_nested_field'"
                )
            filter_kwargs = {field: user}
            queryset = queryset.filter(**filter_kwargs)
            
        else:
            return queryset.none()
        
        # Optimizaciones
        if self.select_related_fields:
            queryset = queryset.select_related(*self.select_related_fields)
            
        if self.prefetch_related_fields:
            queryset = queryset.prefetch_related(*self.prefetch_related_fields)
        
        return queryset
