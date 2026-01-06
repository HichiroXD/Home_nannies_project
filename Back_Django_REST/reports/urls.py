"""
Reports URLs - Phase 3 & Sprint 4
Enrutamiento de endpoints de reportes
"""

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
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
# Import new simple download views
from .download_views import (
    SimpleBookingsDownloadView,
    SimpleUsersDownloadView,
    SimplePaymentsDownloadView,
)

# Vista de prueba sin permisos
class TestView(APIView):
    permission_classes = []
    
    def get(self, request):
        return Response({"message": "Test endpoint funcionando"}, status=status.HTTP_200_OK)

# Vista de prueba de bookings sin permisos
class TestBookingsView(APIView):
    permission_classes = []
    
    def get(self, request):
        from bookings.models import Booking
        count = Booking.objects.count()
        return Response({
            "message": "BookingsReportView funcionando",
            "total_bookings": count,
            "user": str(request.user),
            "is_authenticated": request.user.is_authenticated,
            "is_staff": request.user.is_staff if request.user.is_authenticated else False
        }, status=status.HTTP_200_OK)

app_name = 'reports'

# Router para viewsets
router = DefaultRouter()
router.register(r'verification-reports', VerificationReportViewSet, basename='verification-report')
router.register(r'ocr-statistics', OcrStatisticsViewSet, basename='ocr-statistics')
router.register(r'academic-statistics', AcademicStatisticsViewSet, basename='academic-statistics')
router.register(r'verification-trends', VerificationTrendViewSet, basename='verification-trend')
router.register(r'user-summaries', UserVerificationSummaryViewSet, basename='user-summary')
router.register(r'dashboard', DashboardViewSet, basename='dashboard')

# Rutas específicas PRIMERO (más específicas tienen prioridad)
urlpatterns = [
    # 🆕 REFACTORED: Download URLs (nuevas vistas simples)
    path('download/bookings/', SimpleBookingsDownloadView.as_view(), name='download-bookings'),
    path('download/users/', SimpleUsersDownloadView.as_view(), name='download-users'),
    path('download/payments/', SimplePaymentsDownloadView.as_view(), name='download-payments'),
    
    # Vista de prueba - SIN PERMISOS para verificar routing
    path('test/', TestView.as_view(), name='test'),
    path('test-bookings/', TestBookingsView.as_view(), name='test-bookings'),
    
    # Sprint 4: Admin Reports - Primeras en la lista (LEGACY - mantener por compatibilidad)
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

# Router viewsets al final
urlpatterns += router.urls