"""
URLs para endpoints de dashboards
"""
from django.urls import path
from nannies.views import nanny_dashboard
from users.views import parent_dashboard, admin_dashboard

urlpatterns = [
    path('nanny/', nanny_dashboard, name='dashboard-nanny'),
    path('parent/', parent_dashboard, name='dashboard-parent'),
    path('admin/', admin_dashboard, name='dashboard-admin'),
]
