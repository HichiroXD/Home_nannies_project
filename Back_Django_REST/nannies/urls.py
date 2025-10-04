from django.urls import path
from .views import NannyListView, NannyDetailView

urlpatterns = [
    path('nannies/', NannyListView.as_view(), name='nanny-list'),
    path('nannies/<int:pk>/', NannyDetailView.as_view(), name='nanny-detail'),
]
