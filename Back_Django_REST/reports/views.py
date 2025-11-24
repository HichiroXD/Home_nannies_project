"""
Reports Views - Phase 3
Endpoints REST para reportes y análisis
"""

import logging
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from django.utils import timezone
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
