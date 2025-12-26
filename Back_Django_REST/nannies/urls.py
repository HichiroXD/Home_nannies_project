from django.urls import path
from .views import NannyListView, NannyDetailView, nanny_dashboard, nanny_profile, verify_nanny, unverify_nanny

urlpatterns = [
    # Exposed as /api/nannies/ from project urls
    path('', NannyListView.as_view(), name='nanny-list'),
    path('<int:pk>/', NannyDetailView.as_view(), name='nanny-detail'),
    path('dashboard/', nanny_dashboard, name='nanny-dashboard'),
    path('profile/', nanny_profile, name='nanny-profile'),
    path('<int:nanny_id>/verify/', verify_nanny, name='nanny-verify'),
    path('<int:nanny_id>/unverify/', unverify_nanny, name='nanny-unverify'),
]
