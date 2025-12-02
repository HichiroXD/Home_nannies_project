from django.urls import path
from .views import (
    RegisterView, UserMeView, UserListView, UserDetailView, 
    LoginView, VerifyEmailView, PublicNannyListView,
    PasswordResetRequestView, PasswordResetConfirmView
)
from .role_views import (
    get_user_roles, add_role, remove_role,
    switch_active_role, get_active_role
)

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('verify/<uidb64>/<token>/', VerifyEmailView.as_view(), name='verify-email'),
    path('me/', UserMeView.as_view(), name='user-detail'),
    path("login/", LoginView.as_view(), name="login"),
    path("nannies/", PublicNannyListView.as_view(), name="public-nanny-list"),
    
    # Recuperación de contraseña
    path('password-reset/', PasswordResetRequestView.as_view(), name='password-reset-request'),
    path('password-reset/<uidb64>/<token>/', PasswordResetConfirmView.as_view(), name='password-reset-confirm'),

    # Gestión de roles múltiples (PHASE 4)
    path('roles/', get_user_roles, name='user-roles'),
    path('roles/add/', add_role, name='add-role'),
    path('roles/remove/<str:role>/', remove_role, name='remove-role'),
    path('roles/switch/', switch_active_role, name='switch-role'),
    path('roles/active/', get_active_role, name='active-role'),

    # Administración de usuarios (solo para administradores)
    path("admin/users/", UserListView.as_view(), name="admin-user-list"),
    path("admin/users/<int:pk>/", UserDetailView.as_view(), name="admin-user-detail"),
]
