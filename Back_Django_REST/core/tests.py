from django.test import TestCase
from django.contrib.auth import get_user_model
from django.utils import timezone
from datetime import date, timedelta
from .models import (
    UniversityProgram,
    StudentVerification,
    DocumentVerification,
    OCRExtraction,
    AcademicIntegration
)
from .validators import (
    validate_ocr,
    validate_certificate_validity,
    validate_academic_consistency
)

User = get_user_model()


class UniversityProgramModelTest(TestCase):
    def setUp(self):
        self.program = UniversityProgram.objects.create(
            code='EDUC101',
            name='Educación Básica',
            is_education_program=True,
            specialization='Pedagogía'
        )

    def test_program_creation(self):
        self.assertEqual(self.program.name, 'Educación Básica')
        self.assertTrue(self.program.is_education_program)

    def test_program_str(self):
        self.assertEqual(str(self.program), f"{self.program.code} - {self.program.name}")


class StudentVerificationModelTest(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username='student1',
            email='student@example.com',
            role='parent',
            password='testpass123'
        )
        self.program = UniversityProgram.objects.create(
            code='EDUC101',
            name='Educación Básica',
            is_education_program=True
        )
        self.verification = StudentVerification.objects.create(
            user=self.user,
            program=self.program,
            status='pending'
        )

    def test_student_verification_creation(self):
        self.assertEqual(self.verification.user, self.user)
        self.assertEqual(self.verification.program, self.program)
        self.assertEqual(self.verification.status, 'pending')


class DocumentVerificationModelTest(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username='student2',
            email='student2@example.com',
            role='parent',
            password='testpass123'
        )
        self.doc_verification = DocumentVerification.objects.create(
            user=self.user,
            document_type='rut',
            rut_number='12345678-9',
            status='pending'
        )

    def test_document_verification_creation(self):
        self.assertEqual(self.doc_verification.user, self.user)
        self.assertEqual(self.doc_verification.document_type, 'rut')
        self.assertEqual(self.doc_verification.status, 'pending')


# ========== PHASE 2 TESTS: OCR Y VALIDACIÓN ACADÉMICA ==========


class OCRExtractionModelTest(TestCase):
    """Tests para modelo OCRExtraction - Phase 2"""
    
    def setUp(self):
        """Configurar datos de prueba"""
        self.user = User.objects.create_user(
            username='ocr_test_user',
            email='ocr@example.com',
            role='nanny',
            password='testpass123'
        )
        self.doc = DocumentVerification.objects.create(
            user=self.user,
            document_type='rut',
            status='pending',
            ocr_status='extracted'
        )
        self.ocr = OCRExtraction.objects.create(
            document=self.doc,
            extracted_rut='12.345.678-9',
            extracted_name='John Doe',
            confidence_score=0.92,
            confidence_level='high',
            status='extracted'
        )
    
    def test_ocr_extraction_creation(self):
        """Test creación de OCRExtraction"""
        self.assertEqual(self.ocr.document, self.doc)
        self.assertEqual(self.ocr.extracted_rut, '12.345.678-9')
        self.assertEqual(self.ocr.confidence_score, 0.92)
        self.assertEqual(self.ocr.confidence_level, 'high')
    
    def test_get_confidence_level(self):
        """Test método get_confidence_level()"""
        # Test high confidence
        self.ocr.confidence_score = 0.95
        self.assertEqual(self.ocr.get_confidence_level(), 'high')
        
        # Test medium confidence
        self.ocr.confidence_score = 0.75
        self.assertEqual(self.ocr.get_confidence_level(), 'medium')
        
        # Test low confidence
        self.ocr.confidence_score = 0.60
        self.assertEqual(self.ocr.get_confidence_level(), 'low')
    
    def test_is_high_confidence(self):
        """Test método is_high_confidence()"""
        # Confianza suficiente
        self.ocr.confidence_score = 0.85
        self.assertTrue(self.ocr.is_high_confidence())
        
        # Confianza insuficiente
        self.ocr.confidence_score = 0.84
        self.assertFalse(self.ocr.is_high_confidence())


class AcademicIntegrationModelTest(TestCase):
    """Tests para modelo AcademicIntegration - Phase 2"""
    
    def setUp(self):
        """Configurar datos de prueba"""
        self.user = User.objects.create_user(
            username='academic_test_user',
            email='academic@example.com',
            role='nanny',
            password='testpass123'
        )
        self.program = UniversityProgram.objects.create(
            code='EDUC101',
            name='Educación Básica',
            is_education_program=True
        )
        self.student_verif = StudentVerification.objects.create(
            user=self.user,
            program=self.program,
            status='approved'
        )
        self.academic = AcademicIntegration.objects.create(
            student_verification=self.student_verif,
            academic_student_id='EST-123-45678',
            enrollment_status='active',
            enrollment_date=date.today() - timedelta(days=365),
            is_regular_student=True,
            has_academic_debt=False,
            verification_status='verified'
        )
    
    def test_academic_integration_creation(self):
        """Test creación de AcademicIntegration"""
        self.assertEqual(self.academic.student_verification, self.student_verif)
        self.assertEqual(self.academic.academic_student_id, 'EST-123-45678')
        self.assertEqual(self.academic.enrollment_status, 'active')
    
    def test_is_valid(self):
        """Test método is_valid() - Valida si cumple requisitos"""
        # Debe ser válido (activo, sin deuda, regular, verificado)
        self.assertTrue(self.academic.is_valid())
        
        # No válido: matrícula inactiva
        self.academic.enrollment_status = 'inactive'
        self.assertFalse(self.academic.is_valid())
        
        # No válido: tiene deuda
        self.academic.enrollment_status = 'active'
        self.academic.has_academic_debt = True
        self.assertFalse(self.academic.is_valid())
        
        # No válido: no es estudiante regular
        self.academic.has_academic_debt = False
        self.academic.is_regular_student = False
        self.assertFalse(self.academic.is_valid())
        
        # No válido: no verificado
        self.academic.is_regular_student = True
        self.academic.verification_status = 'pending'
        self.assertFalse(self.academic.is_valid())


class OCRValidatorTest(TestCase):
    """Tests para validador OCRValidator - Phase 2"""
    
    def test_valid_ocr_data(self):
        """Test validación de datos OCR válidos"""
        ocr_data = {
            'confidence_score': 0.92,
            'extracted_rut': '12.345.678-9',
            'extracted_name': 'John Doe',
            'extracted_program': 'Educación',
            'valid_from': date.today() - timedelta(days=100),
            'valid_until': date.today() + timedelta(days=200)
        }
        # No debe lanzar excepción
        validate_ocr(ocr_data)
    
    def test_insufficient_confidence(self):
        """Test rechazo por baja confianza"""
        from django.core.exceptions import ValidationError
        
        ocr_data = {
            'confidence_score': 0.60,  # Menos del mínimo 0.70
            'extracted_rut': '12.345.678-9',
            'extracted_name': 'John Doe',
            'extracted_program': 'Educación'
        }
        
        with self.assertRaises(ValidationError) as context:
            validate_ocr(ocr_data)
        self.assertIn('Confianza insuficiente', str(context.exception))
    
    def test_missing_required_fields(self):
        """Test rechazo por campos faltantes"""
        from django.core.exceptions import ValidationError
        
        ocr_data = {
            'confidence_score': 0.92,
            'extracted_rut': '',  # Falta RUT
            'extracted_name': 'John Doe',
            'extracted_program': 'Educación'
        }
        
        with self.assertRaises(ValidationError):
            validate_ocr(ocr_data)
    
    def test_expired_certificate(self):
        """Test rechazo por certificado vencido"""
        from django.core.exceptions import ValidationError
        
        ocr_data = {
            'confidence_score': 0.92,
            'extracted_rut': '12.345.678-9',
            'extracted_name': 'John Doe',
            'extracted_program': 'Educación',
            'valid_from': date.today() - timedelta(days=200),
            'valid_until': date.today() - timedelta(days=10)  # Vencido
        }
        
        with self.assertRaises(ValidationError):
            validate_ocr(ocr_data)


class CertificateValidityValidatorTest(TestCase):
    """Tests para validador CertificateValidityValidator - Phase 2"""
    
    def test_valid_certificate(self):
        """Test validación de certificado válido"""
        cert_data = {
            'valid_until': date.today() + timedelta(days=365),
            'extracted_program': 'Educación',
            'is_active': True,
            'enrollment_year': date.today().year - 2
        }
        # No debe lanzar excepción
        validate_certificate_validity(cert_data)
    
    def test_expired_certificate(self):
        """Test rechazo por certificado vencido"""
        from django.core.exceptions import ValidationError
        
        cert_data = {
            'valid_until': date.today() - timedelta(days=1),  # Vencido
            'is_active': True,
            'enrollment_year': date.today().year
        }
        
        with self.assertRaises(ValidationError):
            validate_certificate_validity(cert_data)
    
    def test_inactive_enrollment(self):
        """Test rechazo por matrícula inactiva"""
        from django.core.exceptions import ValidationError
        
        cert_data = {
            'valid_until': date.today() + timedelta(days=365),
            'is_active': False,  # Inactivo
            'enrollment_year': date.today().year
        }
        
        with self.assertRaises(ValidationError):
            validate_certificate_validity(cert_data)


class AcademicConsistencyValidatorTest(TestCase):
    """Tests para validador AcademicConsistencyValidator - Phase 2"""
    
    def test_consistent_data(self):
        """Test validación de datos consistentes"""
        ocr_data = {
            'extracted_rut': '12.345.678-9',
            'extracted_name': 'John Doe',
            'extracted_program': 'Educación'
        }
        academic_data = {
            'rut': '12.345.678-9',
            'name': 'John Doe',
            'program': 'Educación',
            'is_active': True
        }
        # No debe lanzar excepción
        validate_academic_consistency(ocr_data, academic_data)
    
    def test_rut_mismatch(self):
        """Test rechazo por RUT no coincide"""
        from django.core.exceptions import ValidationError
        
        ocr_data = {
            'extracted_rut': '12.345.678-9',
            'extracted_name': 'John Doe',
            'extracted_program': 'Educación'
        }
        academic_data = {
            'rut': '98.765.432-1',  # RUT diferente
            'name': 'John Doe',
            'program': 'Educación',
            'is_active': True
        }
        
        with self.assertRaises(ValidationError) as context:
            validate_academic_consistency(ocr_data, academic_data)
        self.assertIn('RUT no coincide', str(context.exception))
    
    def test_name_fuzzy_matching(self):
        """Test fuzzy matching de nombres"""
        ocr_data = {
            'extracted_rut': '12.345.678-9',
            'extracted_name': 'John Michael Doe Smith',
            'extracted_program': 'Educación'
        }
        academic_data = {
            'rut': '12.345.678-9',
            'name': 'John Michael Doe',  # Mismo nombre pero sin Smith
            'program': 'Educación',
            'is_active': True
        }
        # Debe pasar porque hay 80% de palabras en común
        validate_academic_consistency(ocr_data, academic_data)
    
    def test_inactive_academic(self):
        """Test rechazo por matrícula inactiva"""
        from django.core.exceptions import ValidationError
        
        ocr_data = {
            'extracted_rut': '12.345.678-9',
            'extracted_name': 'John Doe',
            'extracted_program': 'Educación'
        }
        academic_data = {
            'rut': '12.345.678-9',
            'name': 'John Doe',
            'program': 'Educación',
            'is_active': False  # Inactivo
        }
        
        with self.assertRaises(ValidationError):
            validate_academic_consistency(ocr_data, academic_data)
