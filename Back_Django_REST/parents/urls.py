from django.urls import path
from .views import parent_profile

urlpatterns = [
    path('profile/', parent_profile, name='parent-profile'),
]
