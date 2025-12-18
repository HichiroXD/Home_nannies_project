from django.urls import path
from .views import parent_profile, parent_dashboard

urlpatterns = [
    path('profile/', parent_profile, name='parent-profile'),
    path('dashboard/', parent_dashboard, name='parent-dashboard'),
]
