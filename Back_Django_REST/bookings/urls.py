from django.urls import path
from .views import (
    BookingListCreateView,
    BookingDetailView,
    accept_booking,
    reject_booking,
    cancel_booking,
    complete_booking,
    AvailabilityListCreateView,
    AvailabilityDetailView,
    NotificationListView,
    NotificationDetailView,
    
)

urlpatterns = [
    path('', BookingListCreateView.as_view(), name='booking-list'),
    path('<int:pk>/', BookingDetailView.as_view(), name='booking-detail'),
    path('<int:pk>/accept/', accept_booking, name='booking-accept'),
    path('<int:pk>/reject/', reject_booking, name='booking-reject'),
    path('<int:pk>/cancel/', cancel_booking, name='booking-cancel'),
    path('<int:pk>/complete/', complete_booking, name='booking-complete'),
    path('availabilities/', AvailabilityListCreateView.as_view(), name='availability-list'),
    path('availabilities/<int:pk>/', AvailabilityDetailView.as_view(), name='availability-detail'),
    path('notifications/', NotificationListView.as_view(), name='notification-list'),
    path('notifications/<int:pk>/', NotificationDetailView.as_view(), name='notification-detail'),
]
