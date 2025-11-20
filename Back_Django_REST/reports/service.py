"""
Reports Service - Phase 3
Servicio centralizado para generación de reportes
"""

import logging
from decimal import Decimal
from django.utils import timezone
from django.db.models import Count, Q, Avg, F, Case, When, DecimalField
from datetime import datetime, timedelta
from core.models import StudentVerification
from academic.models import AcademicVerification
from .models import (
    VerificationReport, OcrStatistics, AcademicStatistics,
    VerificationTrend, UserVerificationSummary
)

logger = logging.getLogger(__name__)


class ReportService:
    """Servicio centralizado para reportes"""

    @staticmethod
    def generate_daily_ocr_report(date=None):
        """Genera reporte diario de OCR"""
        if date is None:
            date = timezone.now().date()

        try:
            # Obtener datos del día
            start_time = timezone.make_aware(datetime.combine(date, datetime.min.time()))
            end_time = timezone.make_aware(datetime.combine(date, datetime.max.time()))

            # Contar envíos OCR por estado
            ocr_data = StudentVerification.objects.filter(
                created_at__range=[start_time, end_time]
            )

            total = ocr_data.count()
            successful = ocr_data.filter(status='approved').count()
            failed = ocr_data.filter(status='rejected').count()
            rejected = ocr_data.filter(status='rejected').count()
            pending = ocr_data.filter(status='pending').count()

            # Calcular confianza promedio
            avg_confidence = ocr_data.aggregate(
                avg=Avg('confidence_score')
            )['avg'] or 0

            # Calcular tiempo promedio de procesamiento
            ocr_with_time = ocr_data.filter(
                processed_at__isnull=False
            ).annotate(
                processing_time=F('processed_at') - F('created_at')
            )
            avg_processing = 0
            if ocr_with_time.exists():
                times = [
                    (v.processed_at - v.created_at).total_seconds()
                    for v in ocr_with_time
                ]
                avg_processing = sum(times) / len(times) if times else 0

            # Usuarios únicos
            unique_users = ocr_data.values('user_id').distinct().count()

            # Calcular tasa de éxito
            success_rate = (successful / total * 100) if total > 0 else 0

            # Crear o actualizar estadística
            ocr_stat, created = OcrStatistics.objects.update_or_create(
                date=date,
                defaults={
                    'total_submissions': total,
                    'successful': successful,
                    'failed': failed,
                    'rejected': rejected,
                    'pending': pending,
                    'average_confidence': Decimal(str(avg_confidence)),
                    'average_processing_time': avg_processing,
                    'unique_users': unique_users,
                    'success_rate': Decimal(str(success_rate)),
                }
            )

            logger.info(f'Generated OCR report for {date}')
            return ocr_stat

        except Exception as e:
            logger.error(f'Error generating OCR report: {e}', exc_info=True)
            return None

    @staticmethod
    def generate_daily_academic_report(date=None):
        """Genera reporte diario de verificación académica"""
        if date is None:
            date = timezone.now().date()

        try:
            # Obtener datos del día
            start_time = timezone.make_aware(datetime.combine(date, datetime.min.time()))
            end_time = timezone.make_aware(datetime.combine(date, datetime.max.time()))

            # Contar verificaciones académicas
            academic_data = AcademicVerification.objects.filter(
                created_at__range=[start_time, end_time]
            )

            total = academic_data.count()
            successful = academic_data.filter(status='verified').count()
            failed = academic_data.filter(status='failed').count()
            pending = academic_data.filter(status__in=['pending', 'verifying']).count()

            # Verificaciones por proveedor
            mock_count = academic_data.filter(verification_method='mock').count()
            api_count = academic_data.filter(verification_method='api').count()
            db_count = academic_data.filter(verification_method='database').count()

            # Programas populares
            top_programs = academic_data.values('program_name').annotate(
                count=Count('id')
            ).order_by('-count')[:5]
            top_programs_list = [
                {'program': p['program_name'], 'count': p['count']}
                for p in top_programs
            ]

            # Usuarios únicos
            unique_users = academic_data.values('user_id').distinct().count()

            # Tasa de éxito
            success_rate = (successful / total * 100) if total > 0 else 0

            # Crear o actualizar estadística
            acad_stat, created = AcademicStatistics.objects.update_or_create(
                date=date,
                defaults={
                    'total_verifications': total,
                    'successful': successful,
                    'failed': failed,
                    'pending': pending,
                    'mock_verifications': mock_count,
                    'api_verifications': api_count,
                    'database_verifications': db_count,
                    'unique_users': unique_users,
                    'top_programs': top_programs_list,
                    'success_rate': Decimal(str(success_rate)),
                }
            )

            logger.info(f'Generated Academic report for {date}')
            return acad_stat

        except Exception as e:
            logger.error(f'Error generating Academic report: {e}', exc_info=True)
            return None

    @staticmethod
    def generate_verification_report(start_date, end_date, report_type='custom', title=None, created_by=None):
        """Genera reporte consolidado de verificaciones"""
        try:
            # Obtener datos en el rango
            ocr_data = StudentVerification.objects.filter(
                created_at__range=[start_date, end_date]
            )
            academic_data = AcademicVerification.objects.filter(
                created_at__range=[start_date, end_date]
            )

            # Estadísticas OCR
            total_ocr = ocr_data.count()
            successful_ocr = ocr_data.filter(status='approved').count()
            failed_ocr = ocr_data.filter(status='rejected').count()
            rejected_ocr = ocr_data.filter(status='rejected').count()
            ocr_success_rate = (successful_ocr / total_ocr * 100) if total_ocr > 0 else 0

            # Estadísticas Académicas
            total_academic = academic_data.count()
            successful_academic = academic_data.filter(status='verified').count()
            failed_academic = academic_data.filter(status='failed').count()
            academic_success_rate = (successful_academic / total_academic * 100) if total_academic > 0 else 0

            # Usuarios únicos
            ocr_users = ocr_data.values_list('user_id', flat=True).distinct()
            academic_users = academic_data.values_list('user_id', flat=True).distinct()
            all_users = set(ocr_users) | set(academic_users)
            unique_students = len(all_users)

            # Tiempo promedio de verificación
            ocr_with_time = ocr_data.filter(processed_at__isnull=False)
            avg_time = 0
            if ocr_with_time.exists():
                times = [
                    (v.processed_at - v.created_at).total_seconds()
                    for v in ocr_with_time
                ]
                avg_time = sum(times) / len(times) if times else 0

            # Crear título si no se proporciona
            if not title:
                title = f'Reporte {report_type.capitalize()} - {start_date.date()} a {end_date.date()}'

            # Crear reporte
            report = VerificationReport.objects.create(
                report_type=report_type,
                title=title,
                start_date=start_date,
                end_date=end_date,
                total_ocr_submissions=total_ocr,
                successful_ocr=successful_ocr,
                failed_ocr=failed_ocr,
                rejected_ocr=rejected_ocr,
                total_academic_verifications=total_academic,
                successful_academic=successful_academic,
                failed_academic=failed_academic,
                ocr_success_rate=Decimal(str(ocr_success_rate)),
                academic_success_rate=Decimal(str(academic_success_rate)),
                unique_students=unique_students,
                average_verification_time=avg_time,
                created_by=created_by,
                data={
                    'ocr_summary': report.get_ocr_summary() if hasattr(report, 'get_ocr_summary') else {},
                    'academic_summary': report.get_academic_summary() if hasattr(report, 'get_academic_summary') else {},
                }
            )

            logger.info(f'Generated verification report: {report.id}')
            return report

        except Exception as e:
            logger.error(f'Error generating verification report: {e}', exc_info=True)
            return None

    @staticmethod
    def generate_daily_reports():
        """Genera reportes diarios de OCR y Académico"""
        today = timezone.now().date()

        ocr_report = ReportService.generate_daily_ocr_report(today)
        academic_report = ReportService.generate_daily_academic_report(today)

        return {
            'ocr': ocr_report,
            'academic': academic_report
        }

    @staticmethod
    def update_user_verification_summary(user):
        """Actualiza resumen de verificación del usuario"""
        try:
            # OCR submissions
            ocr_submissions = StudentVerification.objects.filter(user=user)
            total_ocr = ocr_submissions.count()
            successful_ocr = ocr_submissions.filter(status='approved').count()
            failed_ocr = ocr_submissions.filter(status='rejected').count()

            # Academic verification
            academic_verification = AcademicVerification.objects.filter(
                user=user,
                status='verified'
            ).first()

            # Crear o actualizar summary
            summary, created = UserVerificationSummary.objects.update_or_create(
                user=user,
                defaults={
                    'total_ocr_submissions': total_ocr,
                    'successful_ocr': successful_ocr,
                    'failed_ocr': failed_ocr,
                    'academic_verified': academic_verification is not None,
                    'last_academic_verification': academic_verification.verified_at if academic_verification else None,
                    'academic_verification_method': academic_verification.verification_method if academic_verification else None,
                    'first_submission': ocr_submissions.first().created_at if ocr_submissions.exists() else None,
                    'last_submission': ocr_submissions.latest('created_at').created_at if ocr_submissions.exists() else None,
                }
            )

            logger.info(f'Updated verification summary for user {user.email}')
            return summary

        except Exception as e:
            logger.error(f'Error updating user verification summary: {e}', exc_info=True)
            return None

    @staticmethod
    def get_dashboard_stats(days=7):
        """Obtiene estadísticas para dashboard"""
        try:
            today = timezone.now().date()
            start_date = today - timedelta(days=days)

            # Últimos N días de estadísticas OCR
            ocr_stats = OcrStatistics.objects.filter(
                date__gte=start_date
            ).order_by('date')

            # Últimos N días de estadísticas académicas
            academic_stats = AcademicStatistics.objects.filter(
                date__gte=start_date
            ).order_by('date')

            # Totales consolidados
            total_ocr = sum(s.total_submissions for s in ocr_stats)
            total_ocr_success = sum(s.successful for s in ocr_stats)
            total_academic = sum(s.total_verifications for s in academic_stats)
            total_academic_success = sum(s.successful for s in academic_stats)

            # Tasas promedio
            avg_ocr_success_rate = (
                sum(float(s.success_rate) for s in ocr_stats) / len(ocr_stats)
                if ocr_stats else 0
            )
            avg_academic_success_rate = (
                sum(float(s.success_rate) for s in academic_stats) / len(academic_stats)
                if academic_stats else 0
            )

            return {
                'ocr': {
                    'total': total_ocr,
                    'successful': total_ocr_success,
                    'success_rate': avg_ocr_success_rate,
                    'daily_stats': [
                        {
                            'date': s.date.isoformat(),
                            'total': s.total_submissions,
                            'successful': s.successful,
                            'failed': s.failed,
                            'success_rate': float(s.success_rate)
                        }
                        for s in ocr_stats
                    ]
                },
                'academic': {
                    'total': total_academic,
                    'successful': total_academic_success,
                    'success_rate': avg_academic_success_rate,
                    'daily_stats': [
                        {
                            'date': s.date.isoformat(),
                            'total': s.total_verifications,
                            'successful': s.successful,
                            'failed': s.failed,
                            'success_rate': float(s.success_rate)
                        }
                        for s in academic_stats
                    ]
                },
                'period': {
                    'start': start_date.isoformat(),
                    'end': today.isoformat(),
                    'days': days
                }
            }

        except Exception as e:
            logger.error(f'Error getting dashboard stats: {e}', exc_info=True)
            return {}
