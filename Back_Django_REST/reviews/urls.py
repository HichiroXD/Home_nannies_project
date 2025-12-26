from django.urls import path
from .views import ReviewListCreateView, ReviewDetailView, AdminAllReviewsView

urlpatterns = [
    path('', ReviewListCreateView.as_view(), name='review-list-create'),
    path('admin/all/', AdminAllReviewsView.as_view(), name='admin-all-reviews'),
    path('<int:pk>/', ReviewDetailView.as_view(), name='review-detail'),
]
