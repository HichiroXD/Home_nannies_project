from django.urls import path
from .views import RegisterView, UserMeView, UserListView, UserDetailView

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('me/', UserMeView.as_view(), name='user-detail'),

    # Administración de usuarios (solo para administradores)
    path("admin/users/", UserListView.as_view(), name="admin-user-list"),
    path("admin/users/<int:pk>/", UserDetailView.as_view(), name="admin-user-detail"),
]
