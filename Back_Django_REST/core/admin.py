from django.contrib import admin
from .models import (
    UniversityProgram,
    StudentVerification,
    DocumentVerification,
    OCRExtraction,
    AcademicIntegration
)


@admin.register(UniversityProgram)
class UniversityProgramAdmin(admin.ModelAdmin):
    list_display = ('code', 'name', 'is_education_program', 'specialization')
    list_filter = ('is_education_program', 'created_at')
    search_fields = ('name', 'code')
    ordering = ('code',)


@admin.register(StudentVerification)
class StudentVerificationAdmin(admin.ModelAdmin):
    list_display = ('user', 'program', 'status', 'verified_date')
    list_filter = ('status', 'verified_date')
    search_fields = ('user__username', 'user__email')
    readonly_fields = ('verified_date',)


@admin.register(DocumentVerification)
class DocumentVerificationAdmin(admin.ModelAdmin):
    list_display = ('user', 'document_type', 'status', 'ocr_status', 'confidence_score', 'verified_date')
    list_filter = ('document_type', 'status', 'ocr_status', 'verified_date')
    search_fields = ('user__username', 'rut_number', 'extracted_rut')
    readonly_fields = ('verified_date', 'extracted_rut', 'extracted_name', 'confidence_score')
    fieldsets = (
        ('Información del Usuario', {
            'fields': ('user', 'document_type')
        }),
        ('Documento', {
            'fields': ('file', 'rut_number')
        }),
        ('Estado de Verificación', {
            'fields': ('status', 'verified_date', 'notes')
        }),
        ('Phase 2: OCR', {
            'fields': (
                'ocr_status',
                'confidence_score',
                'extracted_rut',
                'extracted_name',
                'valid_from',
                'valid_until'
            ),
            'classes': ('collapse',)
        }),
        ('Auditoría', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(OCRExtraction)
class OCRExtractionAdmin(admin.ModelAdmin):
    list_display = (
        'document',
        'status',
        'confidence_level',
        'extracted_rut',
        'extracted_name',
        'extracted_at'
    )
    list_filter = ('status', 'confidence_level', 'extracted_at')
    search_fields = ('extracted_rut', 'extracted_name', 'document__user__username')
    readonly_fields = ('extracted_at', 'validated_at')
    fieldsets = (
        ('Documento', {
            'fields': ('document',)
        }),
        ('Datos Extraídos', {
            'fields': (
                'extracted_rut',
                'extracted_name',
                'extracted_program',
                'extracted_enrollment_year'
            )
        }),
        ('Validez del Certificado', {
            'fields': ('valid_from', 'valid_until')
        }),
        ('Confianza', {
            'fields': ('confidence_score', 'confidence_level')
        }),
        ('Datos Crudos', {
            'fields': ('raw_text', 'extraction_metadata'),
            'classes': ('collapse',)
        }),
        ('Estado', {
            'fields': ('status',)
        }),
        ('Auditoría', {
            'fields': ('extracted_at', 'validated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(AcademicIntegration)
class AcademicIntegrationAdmin(admin.ModelAdmin):
    list_display = (
        'academic_student_id',
        'student_verification',
        'enrollment_status',
        'is_regular_student',
        'verification_status',
        'verified_at'
    )
    list_filter = ('enrollment_status', 'verification_status', 'is_regular_student', 'has_academic_debt')
    search_fields = ('academic_student_id', 'student_verification__user__username')
    readonly_fields = ('verified_at', 'last_sync', 'created_at')
    fieldsets = (
        ('Verificación de Estudiante', {
            'fields': ('student_verification', 'academic_student_id')
        }),
        ('Estado Académico', {
            'fields': (
                'enrollment_status',
                'academic_year',
                'enrollment_date',
                'graduation_year'
            )
        }),
        ('Validaciones', {
            'fields': ('is_regular_student', 'has_academic_debt')
        }),
        ('Verificación', {
            'fields': ('verification_status', 'verified_at')
        }),
        ('Sincronización', {
            'fields': ('last_sync',),
            'classes': ('collapse',)
        }),
        ('Auditoría', {
            'fields': ('created_at',),
            'classes': ('collapse',)
        }),
    )
