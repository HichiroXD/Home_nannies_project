"""
Initial migration for reports app - Phase 3
"""

from django.db import migrations, models
import django.db.models.deletion
from django.conf import settings


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='VerificationReport',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('report_type', models.CharField(choices=[('daily', 'Diario'), ('weekly', 'Semanal'), ('monthly', 'Mensual'), ('custom', 'Personalizado')], max_length=50, verbose_name='Tipo de Reporte')),
                ('title', models.CharField(max_length=255, verbose_name='Título')),
                ('description', models.TextField(blank=True, null=True, verbose_name='Descripción')),
                ('start_date', models.DateTimeField(verbose_name='Fecha Inicio')),
                ('end_date', models.DateTimeField(verbose_name='Fecha Fin')),
                ('total_ocr_submissions', models.PositiveIntegerField(default=0, verbose_name='Total Envíos OCR')),
                ('successful_ocr', models.PositiveIntegerField(default=0, verbose_name='OCR Exitosos')),
                ('failed_ocr', models.PositiveIntegerField(default=0, verbose_name='OCR Fallidos')),
                ('rejected_ocr', models.PositiveIntegerField(default=0, verbose_name='OCR Rechazados')),
                ('total_academic_verifications', models.PositiveIntegerField(default=0, verbose_name='Total Verificaciones Académicas')),
                ('successful_academic', models.PositiveIntegerField(default=0, verbose_name='Verificaciones Exitosas')),
                ('failed_academic', models.PositiveIntegerField(default=0, verbose_name='Verificaciones Fallidas')),
                ('ocr_success_rate', models.DecimalField(decimal_places=2, default=0, max_digits=5, verbose_name='Tasa Éxito OCR (%)')),
                ('academic_success_rate', models.DecimalField(decimal_places=2, default=0, max_digits=5, verbose_name='Tasa Éxito Académica (%)')),
                ('unique_students', models.PositiveIntegerField(default=0, verbose_name='Estudiantes Únicos')),
                ('average_verification_time', models.FloatField(default=0, verbose_name='Tiempo Promedio Verificación (segundos)')),
                ('data', models.JSONField(blank=True, default=dict, null=True, verbose_name='Datos Raw')),
                ('created_at', models.DateTimeField(auto_now_add=True, verbose_name='Creado')),
                ('updated_at', models.DateTimeField(auto_now=True, verbose_name='Actualizado')),
                ('created_by', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, to=settings.AUTH_USER_MODEL, verbose_name='Creado Por')),
            ],
            options={
                'verbose_name': 'Reporte de Verificación',
                'verbose_name_plural': 'Reportes de Verificación',
                'ordering': ['-created_at'],
            },
        ),
        migrations.CreateModel(
            name='VerificationTrend',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('trend_type', models.CharField(choices=[('hourly', 'Horario'), ('daily', 'Diario'), ('weekly', 'Semanal'), ('monthly', 'Mensual')], max_length=50, verbose_name='Tipo de Tendencia')),
                ('timestamp', models.DateTimeField(verbose_name='Marca de Tiempo')),
                ('ocr_submissions', models.PositiveIntegerField(default=0, verbose_name='Envíos OCR')),
                ('ocr_successful', models.PositiveIntegerField(default=0, verbose_name='OCR Exitosos')),
                ('academic_verifications', models.PositiveIntegerField(default=0, verbose_name='Verificaciones Académicas')),
                ('academic_successful', models.PositiveIntegerField(default=0, verbose_name='Académicas Exitosas')),
                ('active_users', models.PositiveIntegerField(default=0, verbose_name='Usuarios Activos')),
                ('data', models.JSONField(blank=True, default=dict, null=True, verbose_name='Datos Adicionales')),
            ],
            options={
                'verbose_name': 'Tendencia de Verificación',
                'verbose_name_plural': 'Tendencias de Verificación',
                'ordering': ['-timestamp'],
            },
        ),
        migrations.CreateModel(
            name='UserVerificationSummary',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('total_ocr_submissions', models.PositiveIntegerField(default=0, verbose_name='Total Envíos OCR')),
                ('successful_ocr', models.PositiveIntegerField(default=0, verbose_name='OCR Exitosos')),
                ('failed_ocr', models.PositiveIntegerField(default=0, verbose_name='OCR Fallidos')),
                ('academic_verified', models.BooleanField(default=False, verbose_name='Verificación Académica Completada')),
                ('last_academic_verification', models.DateTimeField(blank=True, null=True, verbose_name='Última Verificación Académica')),
                ('academic_verification_method', models.CharField(blank=True, max_length=50, null=True, verbose_name='Método Verificación')),
                ('first_submission', models.DateTimeField(blank=True, null=True, verbose_name='Primer Envío')),
                ('last_submission', models.DateTimeField(blank=True, null=True, verbose_name='Último Envío')),
                ('updated_at', models.DateTimeField(auto_now=True, verbose_name='Actualizado')),
                ('user', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, related_name='verification_summary', to=settings.AUTH_USER_MODEL, verbose_name='Usuario')),
            ],
            options={
                'verbose_name': 'Resumen Verificación Usuario',
                'verbose_name_plural': 'Resúmenes Verificación Usuario',
                'ordering': ['-updated_at'],
            },
        ),
        migrations.CreateModel(
            name='OcrStatistics',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('date', models.DateField(verbose_name='Fecha')),
                ('total_submissions', models.PositiveIntegerField(default=0, verbose_name='Total Envíos')),
                ('successful', models.PositiveIntegerField(default=0, verbose_name='Exitosos')),
                ('failed', models.PositiveIntegerField(default=0, verbose_name='Fallidos')),
                ('rejected', models.PositiveIntegerField(default=0, verbose_name='Rechazados')),
                ('pending', models.PositiveIntegerField(default=0, verbose_name='Pendientes')),
                ('average_confidence', models.DecimalField(decimal_places=2, default=0, max_digits=5, verbose_name='Confianza Promedio (%)')),
                ('average_processing_time', models.FloatField(default=0, verbose_name='Tiempo Procesamiento Promedio (s)')),
                ('unique_users', models.PositiveIntegerField(default=0, verbose_name='Usuarios Únicos')),
                ('success_rate', models.DecimalField(decimal_places=2, default=0, max_digits=5, verbose_name='Tasa de Éxito (%)')),
            ],
            options={
                'verbose_name': 'Estadística OCR Diaria',
                'verbose_name_plural': 'Estadísticas OCR Diarias',
                'ordering': ['-date'],
                'unique_together': {('date',)},
            },
        ),
        migrations.CreateModel(
            name='AcademicStatistics',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('date', models.DateField(verbose_name='Fecha')),
                ('total_verifications', models.PositiveIntegerField(default=0, verbose_name='Total Verificaciones')),
                ('successful', models.PositiveIntegerField(default=0, verbose_name='Exitosas')),
                ('failed', models.PositiveIntegerField(default=0, verbose_name='Fallidas')),
                ('pending', models.PositiveIntegerField(default=0, verbose_name='Pendientes')),
                ('mock_verifications', models.PositiveIntegerField(default=0, verbose_name='Verificaciones Mock')),
                ('api_verifications', models.PositiveIntegerField(default=0, verbose_name='Verificaciones API')),
                ('database_verifications', models.PositiveIntegerField(default=0, verbose_name='Verificaciones BD')),
                ('unique_users', models.PositiveIntegerField(default=0, verbose_name='Usuarios Únicos')),
                ('top_programs', models.JSONField(blank=True, default=list, null=True, verbose_name='Programas Populares')),
                ('success_rate', models.DecimalField(decimal_places=2, default=0, max_digits=5, verbose_name='Tasa de Éxito (%)')),
            ],
            options={
                'verbose_name': 'Estadística Académica Diaria',
                'verbose_name_plural': 'Estadísticas Académicas Diarias',
                'ordering': ['-date'],
                'unique_together': {('date',)},
            },
        ),
        migrations.AddIndex(
            model_name='verificationreport',
            index=models.Index(fields=['report_type', 'created_at'], name='report_type_date_idx'),
        ),
        migrations.AddIndex(
            model_name='verificationreport',
            index=models.Index(fields=['start_date', 'end_date'], name='report_dates_idx'),
        ),
        migrations.AddIndex(
            model_name='verificationtrend',
            index=models.Index(fields=['trend_type', 'timestamp'], name='trend_type_ts_idx'),
        ),
        migrations.AddIndex(
            model_name='userverificationsummary',
            index=models.Index(fields=['user', 'academic_verified'], name='usr_summary_verified_idx'),
        ),
        migrations.AddIndex(
            model_name='ocrstatistics',
            index=models.Index(fields=['date'], name='ocr_stat_date_idx'),
        ),
        migrations.AddIndex(
            model_name='academicstatistics',
            index=models.Index(fields=['date'], name='acad_stat_date_idx'),
        ),
    ]
