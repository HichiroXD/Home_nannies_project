"""
Academic API URLs - Phase 3
Enrutamiento de endpoints académicos
"""

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    AcademicProviderViewSet,
    AcademicProgramViewSet,
    AcademicStudentViewSet,
    AcademicVerificationViewSet,
    VerifyStudentView,
)

app_name = 'academic'

# Router para viewsets
router = DefaultRouter()
router.register(r'providers', AcademicProviderViewSet, basename='provider')
router.register(r'programs', AcademicProgramViewSet, basename='program')
router.register(r'students', AcademicStudentViewSet, basename='student')
router.register(r'verifications', AcademicVerificationViewSet, basename='verification')
router.register(r'verify-student', VerifyStudentView, basename='verify-student')

urlpatterns = [
    path('', include(router.urls)),
]
