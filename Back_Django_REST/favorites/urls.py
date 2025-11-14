from django.urls import path
from .views import FavoriteListCreateView, FavoriteDeleteView

urlpatterns = [
    # Exposed as /api/favorites/ from project urls
    path('', FavoriteListCreateView.as_view(), name='favorite-list-create'),
    path('<int:pk>/', FavoriteDeleteView.as_view(), name='favorite-delete'),
]
