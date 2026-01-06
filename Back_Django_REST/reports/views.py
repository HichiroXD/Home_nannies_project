"""
Reports Views - Phase 3 & Sprint 4
Endpoints REST para reportes y análisis
"""

import logging
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework.views import APIView
from django.utils import timezone
from django.contrib.auth import get_user_model
from datetime import datetime, timedelta
from .models import (
    VerificationReport, OcrStatistics, AcademicStatistics,
    VerificationTrend, UserVerificationSummary
)
from .serializer import (
    VerificationReportSerializer,
    OcrStatisticsSerializer,
    AcademicStatisticsSerializer,
    VerificationTrendSerializer,
    UserVerificationSummarySerializer,
    DashboardStatsSerializer
)
from .service import ReportService
from .exporters import CSVExporter, PDFExporter, ExcelExporter
from .admin_reports import BookingReportGenerator, UserReportGenerator, PaymentReportGenerator
from .metrics_service import MetricsService
from bookings.models import Booking

User = get_user_model()
logger = logging.getLogger(__name__)


class VerificationReportViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet para reportes de verificación (Admin only)"""

    queryset = VerificationReport.objects.all()
    serializer_class = VerificationReportSerializer
    permission_classes = [IsAuthenticated, IsAdminUser]
    filterset_fields = ['report_type', 'created_by', 'created_at']
    search_fields = ['title', 'description']
    ordering_fields = ['created_at', 'start_date', 'end_date']
    ordering = ['-created_at']

    def get_queryset(self):
        """Filtra por usuario admin"""
        if self.request.user.is_staff:
            return VerificationReport.objects.all()
        return VerificationReport.objects.none()

    @action(detail=False, methods=['post'], permission_classes=[IsAdminUser])
    def generate_report(self, request):
        """Genera un nuevo reporte"""
        try:
            # Parámetros
            start_date = request.data.get('start_date')
            end_date = request.data.get('end_date')
            report_type = request.data.get('report_type', 'custom')
            title = request.data.get('title')

            # Validar fechas
            if not start_date or not end_date:
                return Response(
                    {'error': 'start_date y end_date son requeridos'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            try:
                start_dt = datetime.fromisoformat(start_date)
                end_dt = datetime.fromisoformat(end_date)
                start_dt = timezone.make_aware(start_dt) if timezone.is_naive(start_dt) else start_dt
                end_dt = timezone.make_aware(end_dt) if timezone.is_naive(end_dt) else end_dt
            except ValueError:
                return Response(
                    {'error': 'Formato de fecha inválido. Use ISO format (YYYY-MM-DD HH:MM:SS)'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Generar reporte
            report = ReportService.generate_verification_report(
                start_date=start_dt,
                end_date=end_dt,
                report_type=report_type,
                title=title,
                created_by=request.user
            )

            if not report:
                return Response(
                    {'error': 'Error generando reporte'},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )

            serializer = self.get_serializer(report)
            return Response(serializer.data, status=status.HTTP_201_CREATED)

        except Exception as e:
            logger.error(f'Error generating report: {e}', exc_info=True)
            return Response(
                {'error': f'Error: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=False, methods=['get'], permission_classes=[IsAdminUser])
    def generate_daily_reports(self, request):
        """Genera reportes diarios automáticos"""
        try:
            reports = ReportService.generate_daily_reports()

            return Response({
                'status': 'success',
                'message': 'Reportes diarios generados correctamente',
                'ocr_report_id': reports['ocr'].id if reports['ocr'] else None,
                'academic_report_id': reports['academic'].id if reports['academic'] else None,
            })

        except Exception as e:
            logger.error(f'Error generating daily reports: {e}', exc_info=True)
            return Response(
                {'error': f'Error: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=True, methods=['get'], permission_classes=[IsAdminUser])
    def detail_with_charts(self, request, pk=None):
        """Retorna reporte con datos formateados para gráficos"""
        report = self.get_object()
        serializer = self.get_serializer(report)

        # Preparar datos para gráficos
        chart_data = {
            'ocr': {
                'labels': ['Exitosos', 'Fallidos', 'Rechazados'],
                'data': [report.successful_ocr, report.failed_ocr, report.rejected_ocr],
                'colors': ['#00cc00', '#cc0000', '#ff9900']
            },
            'academic': {
                'labels': ['Exitosos', 'Fallidos'],
                'data': [report.successful_academic, report.failed_academic],
                'colors': ['#00cc00', '#cc0000']
            }
        }

        response_data = serializer.data
        response_data['chart_data'] = chart_data

        return Response(response_data)


class OcrStatisticsViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet para estadísticas OCR diarias (Admin only)"""

    queryset = OcrStatistics.objects.all()
    serializer_class = OcrStatisticsSerializer
    permission_classes = [IsAuthenticated, IsAdminUser]
    filterset_fields = ['date']
    ordering_fields = ['date', 'success_rate']
    ordering = ['-date']

    def get_queryset(self):
        """Filtra por usuario admin"""
        if self.request.user.is_staff:
            return OcrStatistics.objects.all()
        return OcrStatistics.objects.none()

    @action(detail=False, methods=['get'], permission_classes=[IsAdminUser])
    def get_range(self, request):
        """Obtiene estadísticas en un rango de fechas"""
        start_date = request.query_params.get('start_date')
        end_date = request.query_params.get('end_date')

        if not start_date or not end_date:
            return Response(
                {'error': 'start_date y end_date son requeridos'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            start = datetime.fromisoformat(start_date).date()
            end = datetime.fromisoformat(end_date).date()
        except ValueError:
            return Response(
                {'error': 'Formato de fecha inválido'},
                status=status.HTTP_400_BAD_REQUEST
            )

        stats = OcrStatistics.objects.filter(date__range=[start, end]).order_by('date')
        serializer = self.get_serializer(stats, many=True)

        return Response(serializer.data)


class AcademicStatisticsViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet para estadísticas académicas diarias (Admin only)"""

    queryset = AcademicStatistics.objects.all()
    serializer_class = AcademicStatisticsSerializer
    permission_classes = [IsAuthenticated, IsAdminUser]
    filterset_fields = ['date']
    ordering_fields = ['date', 'success_rate']
    ordering = ['-date']

    def get_queryset(self):
        """Filtra por usuario admin"""
        if self.request.user.is_staff:
            return AcademicStatistics.objects.all()
        return AcademicStatistics.objects.none()

    @action(detail=False, methods=['get'], permission_classes=[IsAdminUser])
    def get_range(self, request):
        """Obtiene estadísticas en un rango de fechas"""
        start_date = request.query_params.get('start_date')
        end_date = request.query_params.get('end_date')

        if not start_date or not end_date:
            return Response(
                {'error': 'start_date y end_date son requeridos'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            start = datetime.fromisoformat(start_date).date()
            end = datetime.fromisoformat(end_date).date()
        except ValueError:
            return Response(
                {'error': 'Formato de fecha inválido'},
                status=status.HTTP_400_BAD_REQUEST
            )

        stats = AcademicStatistics.objects.filter(date__range=[start, end]).order_by('date')
        serializer = self.get_serializer(stats, many=True)

        return Response(serializer.data)


class VerificationTrendViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet para tendencias de verificación (Admin only)"""

    queryset = VerificationTrend.objects.all()
    serializer_class = VerificationTrendSerializer
    permission_classes = [IsAuthenticated, IsAdminUser]
    filterset_fields = ['trend_type']
    ordering_fields = ['timestamp']
    ordering = ['-timestamp']

    def get_queryset(self):
        """Filtra por usuario admin"""
        if self.request.user.is_staff:
            return VerificationTrend.objects.all()
        return VerificationTrend.objects.none()


class UserVerificationSummaryViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet para resumen de verificación de usuarios (Admin only)"""

    queryset = UserVerificationSummary.objects.all()
    serializer_class = UserVerificationSummarySerializer
    permission_classes = [IsAuthenticated, IsAdminUser]
    search_fields = ['user__email', 'user__first_name', 'user__last_name']
    filterset_fields = ['academic_verified']
    ordering_fields = ['updated_at', 'total_ocr_submissions']
    ordering = ['-updated_at']

    def get_queryset(self):
        """Filtra por usuario admin o datos del usuario autenticado"""
        if self.request.user.is_staff:
            return UserVerificationSummary.objects.all()
        return UserVerificationSummary.objects.filter(user=self.request.user)

    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def my_summary(self, request):
        """Obtiene resumen de verificación del usuario autenticado"""
        summary = UserVerificationSummary.objects.filter(user=request.user).first()

        if not summary:
            return Response({
                'status': 'not_initialized',
                'message': 'No verification data yet'
            })

        serializer = self.get_serializer(summary)
        return Response(serializer.data)


class DashboardViewSet(viewsets.ViewSet):
    """ViewSet para dashboard de análisis"""

    permission_classes = [IsAuthenticated, IsAdminUser]

    @action(detail=False, methods=['get'], permission_classes=[IsAdminUser])
    def stats(self, request):
        """Obtiene estadísticas generales del dashboard"""
        days = int(request.query_params.get('days', 7))

        try:
            stats = ReportService.get_dashboard_stats(days=days)
            return Response(stats)
        except Exception as e:
            logger.error(f'Error getting dashboard stats: {e}', exc_info=True)
            return Response(
                {'error': f'Error: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=False, methods=['get'], permission_classes=[IsAdminUser])
    def summary(self, request):
        """Obtiene resumen ejecutivo"""
        try:
            today = timezone.now().date()
            yesterday = today - timedelta(days=1)

            # OCR de hoy
            today_ocr = OcrStatistics.objects.filter(date=today).first()
            yesterday_ocr = OcrStatistics.objects.filter(date=yesterday).first()

            # Académico de hoy
            today_academic = AcademicStatistics.objects.filter(date=today).first()
            yesterday_academic = AcademicStatistics.objects.filter(date=yesterday).first()

            return Response({
                'date': today.isoformat(),
                'ocr_today': {
                    'total': today_ocr.total_submissions if today_ocr else 0,
                    'successful': today_ocr.successful if today_ocr else 0,
                    'success_rate': float(today_ocr.success_rate) if today_ocr else 0,
                    'change_vs_yesterday': (
                        (today_ocr.total_submissions - yesterday_ocr.total_submissions)
                        if today_ocr and yesterday_ocr else 0
                    )
                },
                'academic_today': {
                    'total': today_academic.total_verifications if today_academic else 0,
                    'successful': today_academic.successful if today_academic else 0,
                    'success_rate': float(today_academic.success_rate) if today_academic else 0,
                    'change_vs_yesterday': (
                        (today_academic.total_verifications - yesterday_academic.total_verifications)
                        if today_academic and yesterday_academic else 0
                    )
                }
            })

        except Exception as e:
            logger.error(f'Error getting summary: {e}', exc_info=True)
            return Response(
                {'error': f'Error: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

# --- ADMIN REPORTS (Sprint 4) ---

class BookingsReportView(APIView):
    """
    Vista para generar reportes de reservas para administradores.
    
    GET /api/reports/bookings-report/?format=csv&status=completed
    """
    # 🔍 TEMPORARY: Disable permissions for debugging
    permission_classes = []
    
    def get(self, request):
        # 🔍 DEBUG: Log incoming request
        logger.info(f"📥 BookingsReportView GET request")
        logger.info(f"   User: {request.user} (is_staff={request.user.is_staff}, is_authenticated={request.user.is_authenticated})")
        logger.info(f"   Query params: {dict(request.query_params)}")
        logger.info(f"   Headers: Authorization={request.headers.get('Authorization', 'NO TOKEN')[:30]}...")
        
        # Obtener parámetros
        format_type = request.query_params.get('format', 'csv').lower()
        start_date = request.query_params.get('start_date')
        end_date = request.query_params.get('end_date')
        status_filter = request.query_params.get('status')
        nanny_id = request.query_params.get('nanny_id')
        parent_id = request.query_params.get('parent_id')
        
        # Validar formato
        if format_type not in ['csv', 'pdf', 'excel']:
            return Response(
                {"error": "Formato inválido. Use: csv, pdf o excel"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Filtrar bookings
        bookings = Booking.objects.all().select_related('parent', 'nanny', 'nanny__nanny_profile')
        
        # Aplicar filtros
        if start_date:
            try:
                start_dt = datetime.strptime(start_date, '%Y-%m-%d')
                bookings = bookings.filter(start_time__gte=start_dt)
            except ValueError:
                return Response(
                    {"error": "Formato de fecha inválido para start_date"},
                    status=status.HTTP_400_BAD_REQUEST
                )
        
        if end_date:
            try:
                end_dt = datetime.strptime(end_date, '%Y-%m-%d')
                end_dt = end_dt.replace(hour=23, minute=59, second=59)
                bookings = bookings.filter(start_time__lte=end_dt)
            except ValueError:
                return Response(
                    {"error": "Formato de fecha inválido para end_date"},
                    status=status.HTTP_400_BAD_REQUEST
                )
        
        if status_filter:
            bookings = bookings.filter(status=status_filter)
        
        if nanny_id:
            bookings = bookings.filter(nanny_id=nanny_id)
        
        if parent_id:
            bookings = bookings.filter(parent_id=parent_id)
        
        bookings = bookings.order_by('-start_time')
        
        # Preparar datos (aunque esté vacío, generamos el reporte)
        data = BookingReportGenerator.prepare_booking_data(bookings)
        headers = BookingReportGenerator.get_headers()
        
        # Si no hay datos, generar reporte vacío
        if not data:
            data = []  # Array vacío para el reporte
        
        # Generar título
        title = "Reporte de Reservas - Administración"
        if start_date and end_date:
            title += f"\nPeriodo: {start_date} - {end_date}"
        
        # Nombre de archivo
        date_str = datetime.now().strftime('%Y%m%d')
        filename_base = f"reporte_reservas_{date_str}"
        
        # Generar reporte
        try:
            if format_type == 'csv':
                return CSVExporter.export(data, headers, f"{filename_base}.csv")
            elif format_type == 'pdf':
                return PDFExporter.export(data, headers, title, f"{filename_base}.pdf")
            elif format_type == 'excel':
                return ExcelExporter.export(data, headers, title, f"{filename_base}.xlsx", "Reservas")
        except Exception as e:
            logger.error(f"Error generando reporte de reservas: {str(e)}", exc_info=True)
            return Response(
                {"error": "Error al generar el reporte"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class UsersReportView(APIView):
    """
    Vista para generar reportes de usuarios para administradores.
    
    GET /api/reports/users-report/?format=csv&role=nanny
    """
    permission_classes = [IsAuthenticated, IsAdminUser]
    
    def get(self, request):
        # Obtener parámetros
        format_type = request.query_params.get('format', 'csv').lower()
        role_filter = request.query_params.get('role')  # nanny, parent, admin
        verified_filter = request.query_params.get('verified')  # true, false
        active_filter = request.query_params.get('active')  # true, false
        
        # Validar formato
        if format_type not in ['csv', 'pdf', 'excel']:
            return Response(
                {"error": "Formato inválido. Use: csv, pdf o excel"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Filtrar usuarios
        users = User.objects.all().select_related('nanny_profile', 'parent_profile')
        
        # Aplicar filtros
        if role_filter:
            if role_filter == 'nanny':
                users = users.filter(nanny_profile__isnull=False)
            elif role_filter == 'parent':
                users = users.filter(parentprofile__isnull=False)
            elif role_filter == 'admin':
                users = users.filter(is_staff=True)
        
        if verified_filter is not None:
            is_verified = verified_filter.lower() == 'true'
            users = users.filter(nanny_profile__is_verified=is_verified)
        
        if active_filter is not None:
            is_active = active_filter.lower() == 'true'
            users = users.filter(is_active=is_active)
        
        users = users.order_by('-date_joined')
        
        # Preparar datos (aunque esté vacío, generamos el reporte)
        data = UserReportGenerator.prepare_user_data(users)
        headers = UserReportGenerator.get_headers()
        
        # Si no hay datos, generar reporte vacío
        if not data:
            data = []
        
        # Generar título
        title = "Reporte de Usuarios - Administración"
        if role_filter:
            title += f"\nRol: {role_filter.capitalize()}"
        
        # Nombre de archivo
        date_str = datetime.now().strftime('%Y%m%d')
        filename_base = f"reporte_usuarios_{date_str}"
        
        # Generar reporte
        try:
            if format_type == 'csv':
                return CSVExporter.export(data, headers, f"{filename_base}.csv")
            elif format_type == 'pdf':
                return PDFExporter.export(data, headers, title, f"{filename_base}.pdf")
            elif format_type == 'excel':
                return ExcelExporter.export(data, headers, title, f"{filename_base}.xlsx", "Usuarios")
        except Exception as e:
            logger.error(f"Error generando reporte de usuarios: {str(e)}", exc_info=True)
            return Response(
                {"error": "Error al generar el reporte"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

# --- SYSTEM METRICS (Sprint 4) ---

class SystemMetricsView(APIView):
    """
    Vista para obtener métricas generales del sistema.
    
    GET /api/reports/metrics/overview/
    """
    permission_classes = [IsAuthenticated, IsAdminUser]
    
    def get(self, request):
        try:
            metrics = MetricsService.get_overview_metrics()
            return Response(metrics, status=status.HTTP_200_OK)
        except Exception as e:
            logger.error(f"Error obteniendo métricas: {str(e)}", exc_info=True)
            return Response(
                {"error": "Error al obtener métricas"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class BookingMetricsView(APIView):
    """
    Vista para métricas de reservas.
    
    GET /api/reports/metrics/bookings/?days=30
    """
    permission_classes = [IsAuthenticated, IsAdminUser]
    
    def get(self, request):
        try:
            days = int(request.query_params.get('days', 30))
            
            by_status = MetricsService.get_bookings_by_status()
            by_period = MetricsService.get_bookings_by_period(days)
            
            return Response({
                'by_status': by_status,
                'by_period': by_period,
                'period_days': days
            }, status=status.HTTP_200_OK)
        except ValueError:
            return Response(
                {"error": "El parámetro 'days' debe ser un número"},
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            logger.error(f"Error obteniendo métricas de reservas: {str(e)}", exc_info=True)
            return Response(
                {"error": "Error al obtener métricas de reservas"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class RevenueMetricsView(APIView):
    """
    Vista para métricas de ingresos.
    
    GET /api/reports/metrics/revenue/?days=30
    """
    permission_classes = [IsAuthenticated, IsAdminUser]
    
    def get(self, request):
        try:
            days = int(request.query_params.get('days', 30))
            metrics = MetricsService.get_revenue_metrics(days)
            return Response(metrics, status=status.HTTP_200_OK)
        except ValueError:
            return Response(
                {"error": "El parámetro 'days' debe ser un número"},
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            logger.error(f"Error obteniendo métricas de ingresos: {str(e)}", exc_info=True)
            return Response(
                {"error": "Error al obtener métricas de ingresos"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class TopNanniesView(APIView):
    """
    Vista para obtener las mejores niñeras.
    
    GET /api/reports/metrics/top-nannies/?limit=10
    """
    permission_classes = [IsAuthenticated, IsAdminUser]
    
    def get(self, request):
        try:
            limit = int(request.query_params.get('limit', 10))
            if limit > 100:
                limit = 100  # Cap at 100
            
            top_nannies = MetricsService.get_top_nannies(limit)
            return Response({
                'top_nannies': top_nannies,
                'count': len(top_nannies)
            }, status=status.HTTP_200_OK)
        except ValueError:
            return Response(
                {"error": "El parámetro 'limit' debe ser un número"},
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            logger.error(f"Error obteniendo top niñeras: {str(e)}", exc_info=True)
            return Response(
                {"error": "Error al obtener ranking de niñeras"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class UserActivityMetricsView(APIView):
    """
    Vista para métricas de actividad de usuarios.
    
    GET /api/reports/metrics/user-activity/?days=30
    """
    permission_classes = [IsAuthenticated, IsAdminUser]
    
    def get(self, request):
        try:
            days = int(request.query_params.get('days', 30))
            metrics = MetricsService.get_user_activity_metrics(days)
            return Response(metrics, status=status.HTTP_200_OK)
        except ValueError:
            return Response(
                {"error": "El parámetro 'days' debe ser un número"},
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            logger.error(f"Error obteniendo métricas de actividad: {str(e)}", exc_info=True)
            return Response(
                {"error": "Error al obtener métricas de actividad"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class VerificationMetricsView(APIView):
    """
    Vista para métricas de verificación.
    
    GET /api/reports/metrics/verification/
    """
    permission_classes = [IsAuthenticated, IsAdminUser]
    
    def get(self, request):
        try:
            metrics = MetricsService.get_verification_metrics()
            return Response(metrics, status=status.HTTP_200_OK)
        except Exception as e:
            logger.error(f"Error obteniendo métricas de verificación: {str(e)}", exc_info=True)
            return Response(
                {"error": "Error al obtener métricas de verificación"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class NotificationMetricsView(APIView):
    """
    Vista para métricas de notificaciones.
    
    GET /api/reports/metrics/notifications/?days=30
    """
    permission_classes = [IsAuthenticated, IsAdminUser]
    
    def get(self, request):
        try:
            days = int(request.query_params.get('days', 30))
            metrics = MetricsService.get_notification_metrics(days)
            return Response(metrics, status=status.HTTP_200_OK)
        except ValueError:
            return Response(
                {"error": "El parámetro 'days' debe ser un número"},
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            logger.error(f"Error obteniendo métricas de notificaciones: {str(e)}", exc_info=True)
            return Response(
                {"error": "Error al obtener métricas de notificaciones"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class PaymentsReportView(APIView):
    """
    Vista para generar reportes de pagos globales para administradores.
    
    GET /api/reports/payments-report/?format=csv&start_date=2026-01-01
    """
    permission_classes = [IsAuthenticated, IsAdminUser]
    
    def get(self, request):
        # Obtener parámetros
        format_type = request.query_params.get('format', 'csv').lower()
        start_date = request.query_params.get('start_date')
        end_date = request.query_params.get('end_date')
        nanny_id = request.query_params.get('nanny_id')
        parent_id = request.query_params.get('parent_id')
        
        # Validar formato
        if format_type not in ['csv', 'pdf', 'excel']:
            return Response(
                {"error": "Formato inválido. Use: csv, pdf o excel"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Filtrar bookings completados (base para pagos)
        bookings = Booking.objects.filter(
            status='completed'
        ).select_related('parent', 'nanny', 'nanny__nanny_profile')
        
        # Aplicar filtros
        if start_date:
            try:
                start_dt = datetime.strptime(start_date, '%Y-%m-%d')
                bookings = bookings.filter(start_time__gte=start_dt)
            except ValueError:
                return Response(
                    {"error": "Formato de fecha inválido para start_date"},
                    status=status.HTTP_400_BAD_REQUEST
                )
        
        if end_date:
            try:
                end_dt = datetime.strptime(end_date, '%Y-%m-%d')
                end_dt = end_dt.replace(hour=23, minute=59, second=59)
                bookings = bookings.filter(start_time__lte=end_dt)
            except ValueError:
                return Response(
                    {"error": "Formato de fecha inválido para end_date"},
                    status=status.HTTP_400_BAD_REQUEST
                )
        
        if nanny_id:
            bookings = bookings.filter(nanny_id=nanny_id)
        
        if parent_id:
            bookings = bookings.filter(parent_id=parent_id)
        
        bookings = bookings.order_by('-start_time')
        
        # Preparar datos (aunque esté vacío, generamos el reporte)
        data = PaymentReportGenerator.prepare_payment_data(bookings)
        headers = PaymentReportGenerator.get_headers()
        
        # Si no hay datos, generar reporte vacío
        if not data:
            data = []
        
        # Generar título
        title = "Reporte de Pagos - Administración"
        if start_date and end_date:
            title += f"\nPeriodo: {start_date} - {end_date}"
        
        # Nombre de archivo
        date_str = datetime.now().strftime('%Y%m%d')
        filename_base = f"reporte_pagos_{date_str}"
        
        # Generar reporte
        try:
            if format_type == 'csv':
                return CSVExporter.export(data, headers, f"{filename_base}.csv")
            elif format_type == 'pdf':
                return PDFExporter.export(data, headers, title, f"{filename_base}.pdf")
            elif format_type == 'excel':
                return ExcelExporter.export(data, headers, title, f"{filename_base}.xlsx", "Pagos")
        except Exception as e:
            logger.error(f"Error generando reporte de pagos: {str(e)}", exc_info=True)
            return Response(
                {"error": "Error al generar el reporte"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )