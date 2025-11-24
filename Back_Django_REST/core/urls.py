from django.urls import path
from rest_framework.routers import SimpleRouter
from . import views

app_name = 'core'

# Crear router para ViewSets
router = SimpleRouter()

urlpatterns = [
    # Registro
    path('register/parent/', views.RegisterParentView.as_view(), name='register_parent'),
    path('register/nanny/', views.RegisterNannyView.as_view(), name='register_nanny'),
    
    # Verificación
    path('verify/email/<str:token>/', views.VerifyEmailView.as_view(), name='verify_email'),
    path('verify/status/', views.VerificationStatusView.as_view(), name='verify_status'),
    
    # Resend token
    path('resend/token/', views.ResendVerificationTokenView.as_view(), name='resend_token'),
    
    # Programas universitarios (para el frontend)
    path('programs/', views.UniversityProgramListView.as_view(), name='programs_list'),
    
    # Phase 2: OCR y Extracción de Documentos
    path('ocr/upload-document/', views.OCRDocumentUploadView.as_view(), name='ocr_upload_document'),
    path('ocr/document-status/<int:pk>/', views.OCRDocumentStatusView.as_view(), name='ocr_document_status'),
    path('ocr/extract-rut/', views.OCRExtractRUTView.as_view(), name='ocr_extract_rut'),
    
    # Phase 2: Integración Académica
    path('academic/verify/', views.AcademicVerifyView.as_view(), name='academic_verify'),
    path('academic/status/<int:pk>/', views.AcademicStatusView.as_view(), name='academic_status'),
]

