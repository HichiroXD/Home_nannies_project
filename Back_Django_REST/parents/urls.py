from django.urls import path
from .views import parent_profile, parent_dashboard, children_list_create, child_detail

urlpatterns = [
    path('profile/', parent_profile, name='parent-profile'),
    path('dashboard/', parent_dashboard, name='parent-dashboard'),
    
    # CRUD de Children (hijos)
    path('children/', children_list_create, name='children-list-create'),
    path('children/<int:child_id>/', child_detail, name='child-detail'),
]
