"""
Initial migration for academic app - Phase 3
Migración inicial para la app académica
"""

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('users', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='AcademicProvider',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=255, verbose_name='Provider Name')),
                ('provider_type', models.CharField(choices=[('mock', 'Mock Data'), ('api', 'External API'), ('database', 'Database'), ('sap', 'SAP System'), ('banner', 'Banner System')], max_length=50, verbose_name='Provider Type')),
                ('api_endpoint', models.URLField(blank=True, null=True, verbose_name='API Endpoint')),
                ('api_key', models.CharField(blank=True, max_length=500, null=True, verbose_name='API Key')),
                ('timeout', models.PositiveIntegerField(default=30, verbose_name='Timeout (seconds)')),
                ('is_active', models.BooleanField(default=True, verbose_name='Is Active')),
                ('is_primary', models.BooleanField(default=False, verbose_name='Is Primary')),
                ('sync_status', models.CharField(choices=[('pending', 'Pending'), ('success', 'Success'), ('error', 'Error'), ('in_progress', 'In Progress')], default='pending', max_length=20, verbose_name='Sync Status')),
                ('last_sync', models.DateTimeField(blank=True, null=True, verbose_name='Last Sync')),
                ('last_error', models.TextField(blank=True, null=True, verbose_name='Last Error')),
                ('created_at', models.DateTimeField(auto_now_add=True, verbose_name='Created At')),
                ('updated_at', models.DateTimeField(auto_now=True, verbose_name='Updated At')),
            ],
            options={
                'verbose_name': 'Academic Provider',
                'verbose_name_plural': 'Academic Providers',
                'ordering': ['-is_primary', '-is_active', 'name'],
                'indexes': [
                    models.Index(fields=['is_primary', 'is_active'], name='academic_prov_is_prim_idx'),
                    models.Index(fields=['provider_type'], name='academic_prov_type_idx'),
                ],
            },
        ),
        migrations.CreateModel(
            name='AcademicStudent',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('student_id', models.CharField(max_length=100, verbose_name='Student ID')),
                ('rut', models.CharField(max_length=20, verbose_name='RUT')),
                ('first_name', models.CharField(max_length=100, verbose_name='First Name')),
                ('last_name', models.CharField(max_length=100, verbose_name='Last Name')),
                ('email', models.EmailField(max_length=254, verbose_name='Email')),
                ('program_name', models.CharField(max_length=255, verbose_name='Program Name')),
                ('program_code', models.CharField(blank=True, max_length=50, null=True, verbose_name='Program Code')),
                ('enrollment_status', models.CharField(choices=[('active', 'Active'), ('inactive', 'Inactive'), ('graduated', 'Graduated'), ('suspended', 'Suspended')], max_length=50, verbose_name='Enrollment Status')),
                ('enrollment_date', models.DateField(blank=True, null=True, verbose_name='Enrollment Date')),
                ('graduation_year', models.IntegerField(blank=True, null=True, verbose_name='Graduation Year')),
                ('current_year', models.IntegerField(blank=True, null=True, verbose_name='Current Year')),
                ('current_semester', models.CharField(blank=True, max_length=10, null=True, verbose_name='Current Semester')),
                ('is_verified', models.BooleanField(default=False, verbose_name='Is Verified')),
                ('verification_date', models.DateTimeField(blank=True, null=True, verbose_name='Verification Date')),
                ('verification_method', models.CharField(blank=True, choices=[('mock', 'Mock'), ('api', 'API'), ('database', 'Database')], max_length=50, null=True, verbose_name='Verification Method')),
                ('raw_data', models.JSONField(blank=True, default=dict, null=True, verbose_name='Raw API Data')),
                ('created_at', models.DateTimeField(auto_now_add=True, verbose_name='Created At')),
                ('updated_at', models.DateTimeField(auto_now=True, verbose_name='Updated At')),
                ('provider', models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, to='academic.academicprovider', verbose_name='Provider')),
                ('user', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, to='users.user', verbose_name='User')),
            ],
            options={
                'verbose_name': 'Academic Student',
                'verbose_name_plural': 'Academic Students',
                'ordering': ['-verification_date', '-created_at'],
                'indexes': [
                    models.Index(fields=['user', 'provider'], name='academic_stud_user_prov_idx'),
                    models.Index(fields=['rut'], name='academic_stud_rut_idx'),
                    models.Index(fields=['is_verified'], name='academic_stud_verified_idx'),
                ],
            },
        ),
        migrations.CreateModel(
            name='AcademicProgram',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('program_code', models.CharField(max_length=50, verbose_name='Program Code')),
                ('program_name', models.CharField(max_length=255, verbose_name='Program Name')),
                ('career_name', models.CharField(max_length=255, verbose_name='Career Name')),
                ('faculty', models.CharField(blank=True, max_length=255, null=True, verbose_name='Faculty')),
                ('program_type', models.CharField(choices=[('undergraduate', 'Undergraduate'), ('postgraduate', 'Postgraduate'), ('diploma', 'Diploma'), ('certificate', 'Certificate')], max_length=50, verbose_name='Program Type')),
                ('is_active', models.BooleanField(default=True, verbose_name='Is Active')),
                ('created_at', models.DateTimeField(auto_now_add=True, verbose_name='Created At')),
                ('updated_at', models.DateTimeField(auto_now=True, verbose_name='Updated At')),
                ('provider', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='academic.academicprovider', verbose_name='Provider')),
            ],
            options={
                'verbose_name': 'Academic Program',
                'verbose_name_plural': 'Academic Programs',
                'unique_together': {('provider', 'program_code')},
                'ordering': ['program_name'],
                'indexes': [
                    models.Index(fields=['provider', 'is_active'], name='academic_prog_prov_active_idx'),
                    models.Index(fields=['program_type'], name='academic_prog_type_idx'),
                ],
            },
        ),
        migrations.CreateModel(
            name='AcademicVerification',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('rut', models.CharField(max_length=20, verbose_name='RUT')),
                ('first_name', models.CharField(max_length=100, verbose_name='First Name')),
                ('last_name', models.CharField(max_length=100, verbose_name='Last Name')),
                ('program_name', models.CharField(blank=True, max_length=255, null=True, verbose_name='Program Name')),
                ('status', models.CharField(choices=[('pending', 'Pending'), ('verifying', 'Verifying'), ('verified', 'Verified'), ('failed', 'Failed'), ('mismatch', 'Mismatch')], default='pending', max_length=50, verbose_name='Status')),
                ('verified_data', models.JSONField(blank=True, default=dict, null=True, verbose_name='Verified Data')),
                ('mismatch_details', models.JSONField(blank=True, default=dict, null=True, verbose_name='Mismatch Details')),
                ('error_message', models.TextField(blank=True, null=True, verbose_name='Error Message')),
                ('attempted_at', models.DateTimeField(blank=True, null=True, verbose_name='Attempted At')),
                ('verified_at', models.DateTimeField(blank=True, null=True, verbose_name='Verified At')),
                ('verification_method', models.CharField(blank=True, choices=[('mock', 'Mock'), ('api', 'API'), ('database', 'Database')], max_length=50, null=True, verbose_name='Verification Method')),
                ('created_at', models.DateTimeField(auto_now_add=True, verbose_name='Created At')),
                ('academic_student', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, to='academic.academicstudent', verbose_name='Academic Student')),
                ('provider', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, to='academic.academicprovider', verbose_name='Provider')),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='users.user', verbose_name='User')),
            ],
            options={
                'verbose_name': 'Academic Verification',
                'verbose_name_plural': 'Academic Verifications',
                'ordering': ['-created_at'],
                'indexes': [
                    models.Index(fields=['user', 'status'], name='academic_verif_user_status_idx'),
                    models.Index(fields=['rut'], name='academic_verif_rut_idx'),
                    models.Index(fields=['status'], name='academic_verif_status_idx'),
                ],
            },
        ),
    ]
