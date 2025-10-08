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
    FavoriteListCreateView,
    FavoriteDeleteView,
)

urlpatterns = [
    # Bookings
    path('bookings/', BookingListCreateView.as_view(), name='booking-list'),
    path('bookings/<int:pk>/', BookingDetailView.as_view(), name='booking-detail'),
    path('bookings/<int:pk>/accept/', accept_booking, name='booking-accept'),
    path('bookings/<int:pk>/reject/', reject_booking, name='booking-reject'),
    path('bookings/<int:pk>/cancel/', cancel_booking, name='booking-cancel'),
    path('bookings/<int:pk>/complete/', complete_booking, name='booking-complete'),

    # Availability
    path('availabilities/', AvailabilityListCreateView.as_view(), name='availability-list'),
    path('availabilities/<int:pk>/', AvailabilityDetailView.as_view(), name='availability-detail'),

    # Notifications
    path('notifications/', NotificationListView.as_view(), name='notification-list'),
    path('notifications/<int:pk>/', NotificationDetailView.as_view(), name='notification-detail'),

    # Favorites
    path("favorites/", FavoriteListCreateView.as_view(), name="favorite-list"),
    path("favorites/<int:pk>/", FavoriteDeleteView.as_view(), name="favorite-delete"),
]
