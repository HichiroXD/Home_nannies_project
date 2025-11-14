from django.urls import path
from .views import NannyListView, NannyDetailView

urlpatterns = [
    # Exposed as /api/nannies/ from project urls
    path('', NannyListView.as_view(), name='nanny-list'),
    path('<int:pk>/', NannyDetailView.as_view(), name='nanny-detail'),
]
