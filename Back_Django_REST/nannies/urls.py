from django.urls import path
from .views import NannyListView, NannyDetailView, nanny_dashboard, nanny_profile

urlpatterns = [
    # Exposed as /api/nannies/ from project urls
    path('', NannyListView.as_view(), name='nanny-list'),
    path('<int:pk>/', NannyDetailView.as_view(), name='nanny-detail'),
    path('dashboard/', nanny_dashboard, name='nanny-dashboard'),
    path('profile/', nanny_profile, name='nanny-profile'),
]
