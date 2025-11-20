"""
Reports Serializers - Phase 3
Serializers para modelos de reportes
"""

from rest_framework import serializers
from .models import (
    VerificationReport, OcrStatistics, AcademicStatistics,
    VerificationTrend, UserVerificationSummary
)


class OcrStatisticsSerializer(serializers.ModelSerializer):
    """Serializer para estadísticas OCR diarias"""

    class Meta:
        model = OcrStatistics
        fields = [
            'id', 'date', 'total_submissions', 'successful',
            'failed', 'rejected', 'pending', 'average_confidence',
            'average_processing_time', 'unique_users', 'success_rate'
        ]
        read_only_fields = ['id']


class AcademicStatisticsSerializer(serializers.ModelSerializer):
    """Serializer para estadísticas académicas diarias"""

    class Meta:
        model = AcademicStatistics
        fields = [
            'id', 'date', 'total_verifications', 'successful',
            'failed', 'pending', 'mock_verifications', 'api_verifications',
            'database_verifications', 'unique_users', 'top_programs', 'success_rate'
        ]
        read_only_fields = ['id']


class VerificationTrendSerializer(serializers.ModelSerializer):
    """Serializer para tendencias de verificación"""

    class Meta:
        model = VerificationTrend
        fields = [
            'id', 'trend_type', 'timestamp', 'ocr_submissions',
            'ocr_successful', 'academic_verifications', 'academic_successful',
            'active_users', 'data'
        ]
        read_only_fields = ['id']


class UserVerificationSummarySerializer(serializers.ModelSerializer):
    """Serializer para resumen de verificación de usuario"""

    user_email = serializers.CharField(source='user.email', read_only=True)
    ocr_success_rate = serializers.SerializerMethodField()
    verification_status = serializers.SerializerMethodField()

    class Meta:
        model = UserVerificationSummary
        fields = [
            'id', 'user', 'user_email', 'total_ocr_submissions',
            'successful_ocr', 'failed_ocr', 'ocr_success_rate',
            'academic_verified', 'last_academic_verification',
            'academic_verification_method', 'first_submission',
            'last_submission', 'verification_status'
        ]
        read_only_fields = [
            'id', 'user_email', 'ocr_success_rate',
            'verification_status'
        ]

    def get_ocr_success_rate(self, obj):
        """Calcula tasa de éxito OCR"""
        return obj.get_ocr_success_rate()

    def get_verification_status(self, obj):
        """Obtiene estado de verificación"""
        return obj.get_verification_status()


class VerificationReportSerializer(serializers.ModelSerializer):
    """Serializer para reportes de verificación consolidados"""

    created_by_email = serializers.CharField(source='created_by.email', read_only=True)
    ocr_summary = serializers.SerializerMethodField()
    academic_summary = serializers.SerializerMethodField()

    class Meta:
        model = VerificationReport
        fields = [
            'id', 'report_type', 'title', 'description',
            'start_date', 'end_date',
            'total_ocr_submissions', 'successful_ocr', 'failed_ocr', 'rejected_ocr',
            'total_academic_verifications', 'successful_academic', 'failed_academic',
            'ocr_success_rate', 'academic_success_rate',
            'unique_students', 'average_verification_time',
            'ocr_summary', 'academic_summary',
            'created_by', 'created_by_email', 'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'created_by_email', 'ocr_summary', 'academic_summary',
            'created_at', 'updated_at'
        ]

    def get_ocr_summary(self, obj):
        """Obtiene resumen OCR"""
        return obj.get_ocr_summary()

    def get_academic_summary(self, obj):
        """Obtiene resumen académico"""
        return obj.get_academic_summary()


class DailyStatSerializer(serializers.Serializer):
    """Estadísticas diarias"""
    date = serializers.DateField()
    total = serializers.IntegerField()
    successful = serializers.IntegerField()
    failed = serializers.IntegerField()
    success_rate = serializers.FloatField()


class VerificationTypeSerializer(serializers.Serializer):
    """Estadísticas por tipo de verificación"""
    total = serializers.IntegerField()
    successful = serializers.IntegerField()
    success_rate = serializers.FloatField()
    daily_stats = DailyStatSerializer(many=True)


class PeriodSerializer(serializers.Serializer):
    """Información del período"""
    start = serializers.CharField()
    end = serializers.CharField()
    days = serializers.IntegerField()


class DashboardStatsSerializer(serializers.Serializer):
    """Serializer para estadísticas del dashboard"""
    ocr = VerificationTypeSerializer()
    academic = VerificationTypeSerializer()
    period = PeriodSerializer()
