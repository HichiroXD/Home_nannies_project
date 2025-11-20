"""
Reports Tests - Phase 3
Tests unitarios para reportes
"""

from django.test import TestCase
from django.contrib.auth import get_user_model
from django.utils import timezone
from datetime import datetime, timedelta
from core.models import StudentVerification
from .models import (
    VerificationReport, OcrStatistics, AcademicStatistics,
    UserVerificationSummary
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

        status = summary.get_verification_status()
        self.assertEqual(status, 'not_verified')
