"""
Reports URLs - Phase 3
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
]
