from django.urls import path
from .views import (
    RegisterView, UserMeView, UserListView, UserDetailView, 
    LoginView, VerifyEmailView, PublicNannyListView,
    PasswordResetRequestView, PasswordResetConfirmView
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

    # Administración de usuarios (solo para administradores)
    path("admin/users/", UserListView.as_view(), name="admin-user-list"),
    path("admin/users/<int:pk>/", UserDetailView.as_view(), name="admin-user-detail"),
]
