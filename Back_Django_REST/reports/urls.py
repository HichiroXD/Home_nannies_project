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

# Vista de prueba sin permisos
class TestView(APIView):
    permission_classes = []
    
    def get(self, request):
        return Response({"message": "Test endpoint funcionando"}, status=status.HTTP_200_OK)

# 🔍 Vista de prueba para download - INLINE para diagnosticar
class TestDownloadView(APIView):
    permission_classes = []
    
    def get(self, request):
        import logging
        logger = logging.getLogger(__name__)
        logger.info("🎯 TestDownloadView EJECUTÁNDOSE!")
        
        # Generar un CSV simple de prueba
        from django.http import HttpResponse
        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = 'attachment; filename="test_report.csv"'
        response.write("ID,Nombre,Estado\n")
        response.write("1,Test,OK\n")
        response.write("2,Prueba,Funcionando\n")
        return response

# 🆕 VISTAS INLINE DE DESCARGA (para evitar problemas de importación)
class InlineBookingsDownloadView(APIView):
    """Vista de descarga de bookings INLINE"""
    permission_classes = []
    
    def get(self, request):
        print("🎯 InlineBookingsDownloadView EJECUTÁNDOSE")
        from django.http import HttpResponse
        from bookings.models import Booking
        from datetime import datetime
        
        format_type = request.GET.get('format', 'csv').lower()
        
        # Obtener datos
        bookings = Booking.objects.all().select_related('parent', 'nanny')[:50]
        
        if format_type == 'csv':
            response = HttpResponse(content_type='text/csv; charset=utf-8')
            response['Content-Disposition'] = f'attachment; filename="reservas_{datetime.now().strftime("%Y%m%d")}.csv"'
            response.write('\ufeff')  # BOM for Excel
            response.write("ID,Padre,Niñera,Estado,Fecha Inicio,Fecha Fin\n")
            for b in bookings:
                parent_name = b.parent.username if b.parent else 'N/A'
                nanny_name = b.nanny.username if b.nanny else 'N/A'
                response.write(f"{b.id},{parent_name},{nanny_name},{b.status},{b.start_time},{b.end_time}\n")
            return response
        
        return Response({"error": "Solo CSV disponible en modo test"}, status=400)

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
    # �️ ELIMINADAS: Las rutas download/* ahora están en django_crud_api/urls.py
    # como /api/downloads/bookings/, /api/downloads/users/, /api/downloads/payments/
    
    # Vista de prueba - SIN PERMISOS para verificar routing
    path('test/', TestView.as_view(), name='test'),
    path('test-bookings/', TestBookingsView.as_view(), name='test-bookings'),
    path('test-download/', TestDownloadView.as_view(), name='test-download'),
    
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