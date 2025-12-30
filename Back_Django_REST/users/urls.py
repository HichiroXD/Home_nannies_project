from django.urls import path
from .views import (
    RegisterView, UserMeView, UserListView, UserDetailView, 
    LoginView, VerifyEmailView, DevVerifyUserView, PublicNannyListView,
    PasswordResetRequestView, PasswordResetConfirmView,
    suspend_user, reactivate_user, approve_user, reject_user,
    SwitchRoleView, GetAvailableRolesView, AddRoleView
)
from .role_views import (
    get_user_roles, add_role, remove_role,
    switch_active_role, get_active_role
)
from .login_history_views import login_history

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('verify/<uidb64>/<token>/', VerifyEmailView.as_view(), name='verify-email'),
    path('dev-verify/', DevVerifyUserView.as_view(), name='dev-verify-user'),  # Solo para desarrollo
    path('me/', UserMeView.as_view(), name='user-detail'),
    path("login/", LoginView.as_view(), name="login"),
    path("nannies/", PublicNannyListView.as_view(), name="public-nanny-list"),
    
    # Recuperación de contraseña
    path('password-reset/', PasswordResetRequestView.as_view(), name='password-reset-request'),
    path('password-reset/<uidb64>/<token>/', PasswordResetConfirmView.as_view(), name='password-reset-confirm'),

    # Sistema de rol activo (SPRINT 3 PHASE 2 - Simplificado)
    path('switch-role/', SwitchRoleView.as_view(), name='switch-role-v2'),
    path('available-roles/', GetAvailableRolesView.as_view(), name='available-roles'),
    path('add-role/', AddRoleView.as_view(), name='add-role-v2'),
    
    # Gestión de roles múltiples (PHASE 4 - Sistema antiguo)
    path('roles/', get_user_roles, name='user-roles'),
    path('roles/add/', add_role, name='add-role'),
    path('roles/remove/<str:role>/', remove_role, name='remove-role'),
    path('roles/switch/', switch_active_role, name='switch-role'),
    path('roles/active/', get_active_role, name='active-role'),

    # Administración de usuarios (solo para administradores)
    path("admin/users/", UserListView.as_view(), name="admin-user-list"),
    path("admin/users/<int:pk>/", UserDetailView.as_view(), name="admin-user-detail"),
    
    # Gestión de usuarios - SPRINT 3
    path("<int:user_id>/suspend/", suspend_user, name="suspend-user"),
    path("<int:user_id>/reactivate/", reactivate_user, name="reactivate-user"),
    path("<int:user_id>/approve/", approve_user, name="approve-user"),
    path("<int:user_id>/reject/", reject_user, name="reject-user"),
    
    # Historial de acceso
    path("login-history/", login_history, name="login-history"),
]
