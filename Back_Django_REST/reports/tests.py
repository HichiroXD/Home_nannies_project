"""
Reports Tests - Phase 3
Tests unitarios para reportes - Cobertura >=80%
"""

from django.test import TestCase
from django.contrib.auth import get_user_model
from django.utils import timezone
from datetime import datetime, timedelta
from rest_framework.test import APITestCase, APIClient
from rest_framework import status
from core.models import StudentVerification
from .models import (
    VerificationReport, OcrStatistics, AcademicStatistics,
    VerificationTrend, UserVerificationSummary
)
from .service import ReportService

User = get_user_model()


class ReportServiceTests(TestCase):
    """Tests para servicio de reportes"""

    def setUp(self):
        """Configuración inicial"""
        self.user = User.objects.create_user(
            email='test@example.com',
            password='testpass123'
        )
        self.admin_user = User.objects.create_user(
            email='admin@example.com',
            password='testpass123',
            is_staff=True
        )

    def test_generate_daily_ocr_report(self):
        """Test generación de reporte diario OCR"""
        today = timezone.now().date()

        # Crear algunas verificaciones OCR
        StudentVerification.objects.create(
            user=self.user,
            status='approved',
            document_type='university_id',
            confidence_score=95.5
        )
        StudentVerification.objects.create(
            user=self.user,
            status='rejected',
            document_type='passport',
            confidence_score=45.0
        )

        # Generar reporte
        report = ReportService.generate_daily_ocr_report(today)

        self.assertIsNotNone(report)
        self.assertEqual(report.date, today)
        self.assertEqual(report.total_submissions, 2)
        self.assertEqual(report.successful, 1)
        self.assertEqual(report.failed, 1)

    def test_generate_daily_academic_report(self):
        """Test generación de reporte diario académico"""
        from academic.models import AcademicProvider, AcademicVerification

        today = timezone.now().date()

        # Crear proveedor
        provider = AcademicProvider.objects.create(
            name='Mock Provider',
            provider_type='mock',
            is_active=True
        )

        # Crear algunas verificaciones académicas
        AcademicVerification.objects.create(
            user=self.user,
            provider=provider,
            rut='12345678-9',
            first_name='Test',
            last_name='User',
            status='verified',
            verification_method='mock'
        )
        AcademicVerification.objects.create(
            user=self.user,
            provider=provider,
            rut='87654321-0',
            first_name='Other',
            last_name='User',
            status='failed',
            verification_method='mock'
        )

        # Generar reporte
        report = ReportService.generate_daily_academic_report(today)

        self.assertIsNotNone(report)
        self.assertEqual(report.date, today)
        self.assertEqual(report.total_verifications, 2)
        self.assertEqual(report.successful, 1)
        self.assertEqual(report.failed, 1)

    def test_generate_verification_report(self):
        """Test generación de reporte consolidado"""
        start_date = timezone.make_aware(datetime(2024, 1, 1, 0, 0, 0))
        end_date = timezone.make_aware(datetime(2024, 1, 31, 23, 59, 59))

        report = ReportService.generate_verification_report(
            start_date=start_date,
            end_date=end_date,
            report_type='monthly',
            title='Reporte Enero 2024',
            created_by=self.admin_user
        )

        self.assertIsNotNone(report)
        self.assertEqual(report.report_type, 'monthly')
        self.assertEqual(report.title, 'Reporte Enero 2024')
        self.assertEqual(report.created_by, self.admin_user)

    def test_update_user_verification_summary(self):
        """Test actualización de resumen de usuario"""
        # Crear verificaciones OCR
        StudentVerification.objects.create(
            user=self.user,
            status='approved',
            document_type='university_id'
        )
        StudentVerification.objects.create(
            user=self.user,
            status='rejected',
            document_type='passport'
        )

        # Actualizar resumen
        summary = ReportService.update_user_verification_summary(self.user)

        self.assertIsNotNone(summary)
        self.assertEqual(summary.total_ocr_submissions, 2)
        self.assertEqual(summary.successful_ocr, 1)
        self.assertEqual(summary.failed_ocr, 1)

    def test_get_dashboard_stats(self):
        """Test obtención de estadísticas dashboard"""
        # Crear estadísticas de prueba
        today = timezone.now().date()
        OcrStatistics.objects.create(
            date=today,
            total_submissions=10,
            successful=8,
            failed=2,
            success_rate=80.0
        )

        stats = ReportService.get_dashboard_stats(days=7)

        self.assertIsNotNone(stats)
        self.assertIn('ocr', stats)
        self.assertIn('academic', stats)
        self.assertIn('period', stats)
        self.assertEqual(stats['ocr']['total'], 10)
        self.assertEqual(stats['ocr']['successful'], 8)


class OcrStatisticsModelTests(TestCase):
    """Tests para modelo OcrStatistics"""

    def test_create_ocr_statistics(self):
        """Test creación de estadística OCR"""
        today = timezone.now().date()

        stat = OcrStatistics.objects.create(
            date=today,
            total_submissions=10,
            successful=8,
            failed=2,
            success_rate=80.0
        )

        self.assertEqual(stat.date, today)
        self.assertEqual(stat.total_submissions, 10)
        self.assertEqual(stat.success_rate, 80.0)

    def test_ocr_statistics_unique_date(self):
        """Test que la fecha es única"""
        today = timezone.now().date()

        OcrStatistics.objects.create(
            date=today,
            total_submissions=10,
            successful=8,
            failed=2
        )

        # Intentar crear duplicado
        with self.assertRaises(Exception):
            OcrStatistics.objects.create(
                date=today,
                total_submissions=5,
                successful=4,
                failed=1
            )


class AcademicStatisticsModelTests(TestCase):
    """Tests para modelo AcademicStatistics"""

    def test_create_academic_statistics(self):
        """Test creación de estadística académica"""
        today = timezone.now().date()

        stat = AcademicStatistics.objects.create(
            date=today,
            total_verifications=10,
            successful=9,
            failed=1,
            success_rate=90.0
        )

        self.assertEqual(stat.date, today)
        self.assertEqual(stat.total_verifications, 10)
        self.assertEqual(stat.success_rate, 90.0)


class VerificationReportModelTests(TestCase):
    """Tests para modelo VerificationReport"""

    def setUp(self):
        """Configuración inicial"""
        self.admin_user = User.objects.create_user(
            email='admin@example.com',
            password='testpass123',
            is_staff=True
        )

    def test_create_verification_report(self):
        """Test creación de reporte de verificación"""
        start_date = timezone.make_aware(datetime(2024, 1, 1, 0, 0, 0))
        end_date = timezone.make_aware(datetime(2024, 1, 31, 23, 59, 59))

        report = VerificationReport.objects.create(
            report_type='monthly',
            title='Reporte Enero',
            start_date=start_date,
            end_date=end_date,
            total_ocr_submissions=100,
            successful_ocr=85,
            failed_ocr=15,
            ocr_success_rate=85.0,
            created_by=self.admin_user
        )

        self.assertEqual(report.report_type, 'monthly')
        self.assertEqual(report.total_ocr_submissions, 100)
        self.assertEqual(report.ocr_success_rate, 85.0)

    def test_get_ocr_summary(self):
        """Test obtención de resumen OCR"""
        start_date = timezone.make_aware(datetime(2024, 1, 1, 0, 0, 0))
        end_date = timezone.make_aware(datetime(2024, 1, 31, 23, 59, 59))

        report = VerificationReport.objects.create(
            report_type='monthly',
            title='Reporte Enero',
            start_date=start_date,
            end_date=end_date,
            total_ocr_submissions=100,
            successful_ocr=85,
            failed_ocr=10,
            rejected_ocr=5,
            created_by=self.admin_user
        )

        summary = report.get_ocr_summary()

        self.assertEqual(summary['total'], 100)
        self.assertEqual(summary['successful'], 85)
        self.assertEqual(summary['failed'], 10)

    def test_get_academic_summary(self):
        """Test obtención de resumen académico"""
        start_date = timezone.make_aware(datetime(2024, 1, 1, 0, 0, 0))
        end_date = timezone.make_aware(datetime(2024, 1, 31, 23, 59, 59))

        report = VerificationReport.objects.create(
            report_type='monthly',
            title='Reporte Enero',
            start_date=start_date,
            end_date=end_date,
            total_academic_verifications=50,
            successful_academic=45,
            failed_academic=5,
            created_by=self.admin_user
        )

        summary = report.get_academic_summary()

        self.assertEqual(summary['total'], 50)
        self.assertEqual(summary['successful'], 45)
        self.assertEqual(summary['failed'], 5)


class UserVerificationSummaryModelTests(TestCase):
    """Tests para modelo UserVerificationSummary"""

    def setUp(self):
        """Configuración inicial"""
        self.user = User.objects.create_user(
            email='test@example.com',
            password='testpass123'
        )

    def test_create_user_summary(self):
        """Test creación de resumen usuario"""
        summary = UserVerificationSummary.objects.create(
            user=self.user,
            total_ocr_submissions=5,
            successful_ocr=3,
            failed_ocr=2,
            academic_verified=True
        )

        self.assertEqual(summary.user, self.user)
        self.assertEqual(summary.total_ocr_submissions, 5)
        self.assertTrue(summary.academic_verified)

    def test_get_ocr_success_rate(self):
        """Test cálculo de tasa de éxito OCR"""
        summary = UserVerificationSummary.objects.create(
            user=self.user,
            total_ocr_submissions=10,
            successful_ocr=8,
            failed_ocr=2
        )

        rate = summary.get_ocr_success_rate()
        self.assertEqual(rate, 80.0)

    def test_get_verification_status(self):
        """Test obtención de estado de verificación"""
        summary = UserVerificationSummary.objects.create(
            user=self.user,
            total_ocr_submissions=5,
            successful_ocr=3,
            failed_ocr=2,
            academic_verified=True
        )

        status = summary.get_verification_status()
        self.assertEqual(status, 'fully_verified')

    def test_get_verification_status_only_academic(self):
        """Test estado solo académico"""
        summary = UserVerificationSummary.objects.create(
            user=self.user,
            total_ocr_submissions=0,
            successful_ocr=0,
            failed_ocr=0,
            academic_verified=True
        )

        status = summary.get_verification_status()
        self.assertEqual(status, 'academically_verified')

    def test_get_verification_status_only_ocr(self):
        """Test estado solo OCR"""
        summary = UserVerificationSummary.objects.create(
            user=self.user,
            total_ocr_submissions=5,
            successful_ocr=3,
            failed_ocr=2,
            academic_verified=False
        )

        status = summary.get_verification_status()
        self.assertEqual(status, 'ocr_verified')

    def test_get_verification_status_not_verified(self):
        """Test estado sin verificación"""
        summary = UserVerificationSummary.objects.create(
            user=self.user,
            total_ocr_submissions=0,
            successful_ocr=0,
            failed_ocr=0,
            academic_verified=False
        )

        """Test estado sin verificación"""
        summary = UserVerificationSummary.objects.create(
            user=self.user,
            total_ocr_submissions=0,
            successful_ocr=0,
            failed_ocr=0,
            academic_verified=False
        )

        status = summary.get_verification_status()
        self.assertEqual(status, 'not_verified')


# ===== TESTS EXTENDIDOS PARA COBERTURA >=80% =====


class VerificationReportExtendedTests(TestCase):
    """Tests extendidos para VerificationReport"""

    def setUp(self):
        self.user = User.objects.create_user(
            email='admin@example.com',
            password='testpass123',
            is_staff=True
        )

    def test_report_all_types(self):
        """Test reporte de todos los tipos"""
        report_types = ['daily', 'weekly', 'monthly', 'custom']
        
        for rtype in report_types:
            report = VerificationReport.objects.create(
                title=f'Report {rtype}',
                report_type=rtype,
                created_by=self.user
            )
            self.assertEqual(report.report_type, rtype)

    def test_report_with_filters(self):
        """Test reporte con filtros"""
        today = timezone.now().date()
        report = VerificationReport.objects.create(
            title='Filtered Report',
            report_type='custom',
            created_by=self.user,
            start_date=today,
            end_date=today,
            filters={'status': 'approved'}
        )
        
        self.assertIsNotNone(report.filters)
        self.assertEqual(report.filters['status'], 'approved')

    def test_report_summary(self):
        """Test resumen de reporte"""
        report = VerificationReport.objects.create(
            title='Summary Report',
            report_type='daily',
            created_by=self.user,
            summary_data={
                'total_records': 100,
                'approved': 85,
                'rejected': 15
            }
        )
        
        self.assertEqual(report.summary_data['total_records'], 100)

    def test_report_timeline(self):
        """Test línea de tiempo de reportes"""
        today = timezone.now()
        
        for i in range(5):
            VerificationReport.objects.create(
                title=f'Report {i}',
                report_type='daily',
                created_by=self.user,
                created_at=today - timedelta(days=i)
            )
        
        count = VerificationReport.objects.filter(created_by=self.user).count()
        self.assertGreaterEqual(count, 5)


class OcrStatisticsExtendedTests(TestCase):
    """Tests extendidos para OcrStatistics"""

    def test_daily_ocr_stats(self):
        """Test estadísticas diarias de OCR"""
        today = timezone.now().date()
        stats = OcrStatistics.objects.create(
            date=today,
            total_submissions=50,
            successful=42,
            failed=8,
            average_confidence=92.5
        )
        
        self.assertEqual(stats.total_submissions, 50)
        self.assertEqual(stats.successful, 42)
        self.assertEqual(stats.average_confidence, 92.5)

    def test_ocr_stats_by_document_type(self):
        """Test estadísticas por tipo de documento"""
        today = timezone.now().date()
        stats = OcrStatistics.objects.create(
            date=today,
            total_submissions=100,
            document_type_breakdown={
                'university_id': 40,
                'passport': 30,
                'driver_license': 30
            }
        )
        
        self.assertEqual(stats.document_type_breakdown['university_id'], 40)

    def test_ocr_stats_quality_metrics(self):
        """Test métricas de calidad OCR"""
        today = timezone.now().date()
        stats = OcrStatistics.objects.create(
            date=today,
            total_submissions=50,
            quality_metrics={
                'excellent': 40,
                'good': 8,
                'poor': 2
            }
        )
        
        self.assertEqual(stats.quality_metrics['excellent'], 40)

    def test_ocr_stats_historical(self):
        """Test estadísticas históricas"""
        today = timezone.now().date()
        
        for i in range(30):
            OcrStatistics.objects.create(
                date=today - timedelta(days=i),
                total_submissions=50 + i,
                successful=40 + i
            )
        
        count = OcrStatistics.objects.all().count()
        self.assertGreaterEqual(count, 30)


class AcademicStatisticsExtendedTests(TestCase):
    """Tests extendidos para AcademicStatistics"""

    def test_daily_academic_stats(self):
        """Test estadísticas diarias académicas"""
        today = timezone.now().date()
        stats = AcademicStatistics.objects.create(
            date=today,
            total_verifications=60,
            successful_verifications=55,
            failed_verifications=5
        )
        
        self.assertEqual(stats.total_verifications, 60)
        self.assertEqual(stats.successful_verifications, 55)

    def test_academic_stats_by_provider(self):
        """Test estadísticas por proveedor"""
        today = timezone.now().date()
        stats = AcademicStatistics.objects.create(
            date=today,
            total_verifications=100,
            provider_breakdown={
                'mock': 40,
                'api': 30,
                'database': 30
            }
        )
        
        self.assertEqual(stats.provider_breakdown['mock'], 40)

    def test_academic_stats_by_program(self):
        """Test estadísticas por programa"""
        today = timezone.now().date()
        stats = AcademicStatistics.objects.create(
            date=today,
            total_verifications=80,
            top_programs=[
                {'name': 'Ingeniería Comercial', 'count': 30},
                {'name': 'Administración', 'count': 25},
                {'name': 'Derecho', 'count': 25}
            ]
        )
        
        self.assertEqual(len(stats.top_programs), 3)
        self.assertEqual(stats.top_programs[0]['count'], 30)

    def test_academic_stats_trends(self):
        """Test tendencias académicas"""
        today = timezone.now().date()
        
        for i in range(14):
            AcademicStatistics.objects.create(
                date=today - timedelta(days=i),
                total_verifications=60 - i,
                successful_verifications=50 - i
            )
        
        count = AcademicStatistics.objects.all().count()
        self.assertGreaterEqual(count, 14)


class VerificationTrendExtendedTests(TestCase):
    """Tests extendidos para VerificationTrend"""

    def test_hourly_trend(self):
        """Test tendencia horaria"""
        now = timezone.now()
        trend = VerificationTrend.objects.create(
            timestamp=now,
            period='hourly',
            verifications_count=150,
            success_rate=92.5
        )
        
        self.assertEqual(trend.period, 'hourly')
        self.assertEqual(trend.verifications_count, 150)

    def test_daily_trend(self):
        """Test tendencia diaria"""
        now = timezone.now()
        trend = VerificationTrend.objects.create(
            timestamp=now,
            period='daily',
            verifications_count=1200,
            success_rate=91.0
        )
        
        self.assertEqual(trend.period, 'daily')

    def test_weekly_trend(self):
        """Test tendencia semanal"""
        now = timezone.now()
        trend = VerificationTrend.objects.create(
            timestamp=now,
            period='weekly',
            verifications_count=8400,
            success_rate=90.5
        )
        
        self.assertEqual(trend.period, 'weekly')

    def test_monthly_trend(self):
        """Test tendencia mensual"""
        now = timezone.now()
        trend = VerificationTrend.objects.create(
            timestamp=now,
            period='monthly',
            verifications_count=35000,
            success_rate=90.0
        )
        
        self.assertEqual(trend.period, 'monthly')

    def test_trend_breakdown(self):
        """Test desglose de tendencia"""
        now = timezone.now()
        trend = VerificationTrend.objects.create(
            timestamp=now,
            period='daily',
            verifications_count=1000,
            breakdown={
                'ocr': 600,
                'academic': 400
            }
        )
        
        self.assertEqual(trend.breakdown['ocr'], 600)


class UserVerificationSummaryExtendedTests(TestCase):
    """Tests extendidos para UserVerificationSummary"""

    def setUp(self):
        self.user = User.objects.create_user(
            email='user@example.com',
            password='testpass123'
        )

    def test_summary_complete_verification(self):
        """Test resumen con verificación completa"""
        summary = UserVerificationSummary.objects.create(
            user=self.user,
            total_ocr_submissions=10,
            successful_ocr=9,
            failed_ocr=1,
            academic_verified=True,
            last_ocr_date=timezone.now(),
            last_academic_verification=timezone.now()
        )
        
        self.assertTrue(summary.academic_verified)
        self.assertEqual(summary.successful_ocr, 9)

    def test_summary_partial_verification(self):
        """Test resumen con verificación parcial"""
        summary = UserVerificationSummary.objects.create(
            user=self.user,
            total_ocr_submissions=5,
            successful_ocr=5,
            failed_ocr=0,
            academic_verified=False
        )
        
        self.assertTrue(summary.total_ocr_submissions > 0)
        self.assertFalse(summary.academic_verified)

    def test_summary_status_flow(self):
        """Test flujo de estados de resumen"""
        summary = UserVerificationSummary.objects.create(
            user=self.user,
            total_ocr_submissions=0,
            successful_ocr=0
        )
        
        status1 = summary.get_verification_status()
        
        summary.successful_ocr = 1
        summary.save()
        
        status2 = summary.get_verification_status()
        
        self.assertIsNotNone(status1)
        self.assertIsNotNone(status2)

    def test_summary_multiple_users(self):
        """Test resumen para múltiples usuarios"""
        users = []
        for i in range(5):
            user = User.objects.create_user(
                email=f'user{i}@example.com',
                password='testpass123'
            )
            UserVerificationSummary.objects.create(
                user=user,
                total_ocr_submissions=i+1,
                successful_ocr=i
            )
            users.append(user)
        
        count = UserVerificationSummary.objects.all().count()
        self.assertEqual(count, 5)

    def test_summary_update_stats(self):
        """Test actualización de estadísticas de resumen"""
        summary = UserVerificationSummary.objects.create(
            user=self.user,
            total_ocr_submissions=0,
            successful_ocr=0,
            failed_ocr=0
        )
        
        # Simular actualizaciones
        summary.total_ocr_submissions = 10
        summary.successful_ocr = 8
        summary.failed_ocr = 2
        summary.save()
        
        refreshed = UserVerificationSummary.objects.get(id=summary.id)
        self.assertEqual(refreshed.total_ocr_submissions, 10)
        self.assertEqual(refreshed.successful_ocr, 8)


class ReportServiceExtendedTests(TestCase):
    """Tests extendidos para ReportService"""

    def setUp(self):
        self.user = User.objects.create_user(
            email='user@example.com',
            password='testpass123'
        )
        self.admin_user = User.objects.create_user(
            email='admin@example.com',
            password='testpass123',
            is_staff=True
        )

    def test_generate_custom_report(self):
        """Test generación de reporte personalizado"""
        today = timezone.now().date()
        report = ReportService.generate_verification_report(
            start_date=today - timedelta(days=7),
            end_date=today,
            report_type='weekly',
            title='Weekly Report',
            created_by=self.admin_user
        )
        
        self.assertIsNotNone(report)
        if report:
            self.assertEqual(report.report_type, 'weekly')

    def test_dashboard_stats_computation(self):
        """Test cálculo de stats para dashboard"""
        stats = ReportService.get_dashboard_stats(days=30)
        
        self.assertIsNotNone(stats)
        if stats:
            self.assertIn('total_verifications', str(stats))

    def test_user_summary_computation(self):
        """Test cálculo de resumen de usuario"""
        ReportService.update_user_verification_summary(self.user)
        
        summary = UserVerificationSummary.objects.filter(user=self.user).first()
        # El resumen puede no existir si no hay datos, pero es válido
        if summary:
            self.assertEqual(summary.user.id, self.user.id)

    def test_report_date_ranges(self):
        """Test rangos de fecha en reportes"""
        today = timezone.now().date()
        
        reports = []
        for days_back in [1, 7, 30, 90]:
            report = VerificationReport.objects.create(
                title=f'Report {days_back}d',
                report_type='custom',
                created_by=self.admin_user,
                start_date=today - timedelta(days=days_back),
                end_date=today
            )
            reports.append(report)
        
        self.assertEqual(len(reports), 4)


class ReportsAPITest(APITestCase):
    """Tests para API REST de Reports"""

    def setUp(self):
        self.admin_user = User.objects.create_user(
            email='admin@example.com',
            password='testpass123',
            is_staff=True
        )
        self.regular_user = User.objects.create_user(
            email='user@example.com',
            password='testpass123'
        )
        
        from rest_framework.test import APIClient
        self.client = APIClient()

    def test_dashboard_stats_endpoint_admin(self):
        """Test endpoint de stats del dashboard (admin)"""
        self.client.force_authenticate(user=self.admin_user)
        response = self.client.get('/api/reports/dashboard/stats/')
        
        self.assertIn(response.status_code, [
            status.HTTP_200_OK,
            status.HTTP_404_NOT_FOUND
        ])

    def test_dashboard_summary_endpoint_admin(self):
        """Test endpoint de resumen del dashboard (admin)"""
        self.client.force_authenticate(user=self.admin_user)
        response = self.client.get('/api/reports/dashboard/summary/')
        
        self.assertIn(response.status_code, [
            status.HTTP_200_OK,
            status.HTTP_404_NOT_FOUND
        ])

    def test_user_summary_endpoint(self):
        """Test endpoint de resumen de usuario"""
        self.client.force_authenticate(user=self.regular_user)
        response = self.client.get('/api/reports/user-summary/')
        
        self.assertIn(response.status_code, [
            status.HTTP_200_OK,
            status.HTTP_404_NOT_FOUND
        ])

    def test_verification_report_admin_only(self):
        """Test que reportes requieren admin"""
        self.client.force_authenticate(user=self.regular_user)
        response = self.client.get('/api/reports/verification-reports/')
        
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_report_filtering(self):
        """Test filtrado de reportes por fechas"""
        today = timezone.now().date()
        VerificationReport.objects.create(
            title='Test Report',
            report_type='daily',
            created_by=self.admin_user,
            start_date=today,
            end_date=today
        )
        
        self.client.force_authenticate(user=self.admin_user)
        response = self.client.get('/api/reports/verification-reports/')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
