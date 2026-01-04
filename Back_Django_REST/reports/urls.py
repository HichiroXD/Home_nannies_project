"""
Reports URLs - Phase 3 & Sprint 4
Enrutamiento de endpoints de reportes
"""

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    VerificationReportViewSet,
    OcrStatisticsViewSet,
    AcademicStatisticsViewSet,
    VerificationTrendViewSet,
    UserVerificationSummaryViewSet,
    DashboardViewSet,
    BookingsReportView,
    UsersReportView,
    PaymentsReportView,
    SystemMetricsView,
    BookingMetricsView,
    RevenueMetricsView,
    TopNanniesView,
    UserActivityMetricsView,
    VerificationMetricsView,
    NotificationMetricsView,
)

app_name = 'reports'

# Router para viewsets
router = DefaultRouter()
router.register(r'verification-reports', VerificationReportViewSet, basename='verification-report')
router.register(r'ocr-statistics', OcrStatisticsViewSet, basename='ocr-statistics')
router.register(r'academic-statistics', AcademicStatisticsViewSet, basename='academic-statistics')
router.register(r'verification-trends', VerificationTrendViewSet, basename='verification-trend')
router.register(r'user-summaries', UserVerificationSummaryViewSet, basename='user-summary')
router.register(r'dashboard', DashboardViewSet, basename='dashboard')

urlpatterns = [
    path('', include(router.urls)),
    
    # Sprint 4: Admin Reports
    path('bookings-report/', BookingsReportView.as_view(), name='bookings-report'),
    path('users-report/', UsersReportView.as_view(), name='users-report'),
    path('payments-report/', PaymentsReportView.as_view(), name='payments-report'),
    
    # Sprint 4: System Metrics
    path('metrics/overview/', SystemMetricsView.as_view(), name='metrics-overview'),
    path('metrics/bookings/', BookingMetricsView.as_view(), name='metrics-bookings'),
    path('metrics/revenue/', RevenueMetricsView.as_view(), name='metrics-revenue'),
    path('metrics/top-nannies/', TopNanniesView.as_view(), name='metrics-top-nannies'),
    path('metrics/user-activity/', UserActivityMetricsView.as_view(), name='metrics-user-activity'),
    path('metrics/verification/', VerificationMetricsView.as_view(), name='metrics-verification'),
    path('metrics/notifications/', NotificationMetricsView.as_view(), name='metrics-notifications'),
]
