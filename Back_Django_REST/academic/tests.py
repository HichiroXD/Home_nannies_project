"""
Academic API Tests - Phase 3
Tests unitarios para validación académica
"""

from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APITestCase, APIClient
from rest_framework import status
from django.utils import timezone
from .models import AcademicProvider, AcademicStudent, AcademicProgram, AcademicVerification
from .service import AcademicService, AcademicAPIException

User = get_user_model()


class AcademicServiceMockTests(TestCase):
    """Tests para servicio académico con Mock Data"""

    def setUp(self):
        """Configuración inicial"""
        self.mock_provider = AcademicProvider.objects.create(
            name='Mock Provider',
            provider_type='mock',
            is_active=True,
            is_primary=True
        )

    def test_mock_verification_success(self):
        """Test verificación exitosa con Mock Data"""
        result = AcademicService.verify_student(
            rut='12345678-9',
            first_name='Juan',
            last_name='Pérez García',
            provider=self.mock_provider
        )

        self.assertIsNotNone(result)
        self.assertEqual(result['rut'], '12345678-9')
        self.assertEqual(result['first_name'], 'Juan')
        self.assertEqual(result['program_name'], 'Ingeniería Comercial')

    def test_mock_verification_not_found(self):
        """Test verificación fallida - estudiante no encontrado"""
        result = AcademicService.verify_student(
            rut='99999999-9',
            first_name='Fake',
            last_name='Student',
            provider=self.mock_provider
        )

        self.assertIsNone(result)

    def test_mock_verification_name_mismatch(self):
        """Test verificación fallida - desajuste de nombre"""
        result = AcademicService.verify_student(
            rut='12345678-9',
            first_name='Pedro',  # Nombre incorrecto
            last_name='Pérez García',
            provider=self.mock_provider
        )

        self.assertIsNone(result)

    def test_mock_verification_all_students(self):
        """Test que todos los estudiantes mock están disponibles"""
        test_ruts = ['12345678-9', '98765432-1', '11111111-1']

        for rut in test_ruts:
            result = AcademicService.verify_student(
                rut=rut,
                provider=self.mock_provider
            )
            self.assertIsNotNone(result, f'Student {rut} not found in mock data')

    def test_get_primary_provider(self):
        """Test obtención del proveedor primario"""
        provider = AcademicService.get_primary_provider()
        self.assertIsNotNone(provider)
        self.assertEqual(provider.id, self.mock_provider.id)

    def test_get_programs(self):
        """Test obtención de programas"""
        # Crear programas de prueba
        AcademicProgram.objects.create(
            provider=self.mock_provider,
            program_code='ICO',
            program_name='Ingeniería Comercial',
            career_name='Carrera de Ingeniería',
            is_active=True
        )

        programs = AcademicService.get_programs(self.mock_provider)
        self.assertEqual(len(list(programs)), 1)
        self.assertEqual(list(programs)[0].program_code, 'ICO')


class AcademicVerificationTests(TestCase):
    """Tests para proceso de verificación académica"""

    def setUp(self):
        """Configuración inicial"""
        self.user = User.objects.create_user(
            email='student@test.com',
            password='testpass123',
            first_name='Test',
            last_name='Student',
            identification_number='12345678'
        )

        self.mock_provider = AcademicProvider.objects.create(
            name='Mock Provider',
            provider_type='mock',
            is_active=True,
            is_primary=True
        )

    def test_create_verification_record(self):
        """Test creación de registro de verificación"""
        verification = AcademicService.create_verification_record(
            user=self.user,
            rut='12345678-9',
            first_name='Juan',
            last_name='Pérez García',
            program_name='Ingeniería Comercial'
        )

        self.assertIsNotNone(verification.id)
        self.assertEqual(verification.rut, '12345678-9')
        self.assertEqual(verification.status, 'pending')
        self.assertEqual(verification.user, self.user)

    def test_process_verification_success(self):
        """Test procesamiento exitoso de verificación"""
        verification = AcademicService.create_verification_record(
            user=self.user,
            rut='12345678-9',
            first_name='Juan',
            last_name='Pérez García'
        )

        success = AcademicService.process_verification(verification)

        self.assertTrue(success)
        verification.refresh_from_db()
        self.assertEqual(verification.status, 'verified')
        self.assertIsNotNone(verification.verified_data)
        self.assertIsNotNone(verification.academic_student)

    def test_process_verification_failed(self):
        """Test procesamiento fallido de verificación"""
        verification = AcademicService.create_verification_record(
            user=self.user,
            rut='99999999-9',
            first_name='Fake',
            last_name='Student'
        )

        success = AcademicService.process_verification(verification)

        self.assertFalse(success)
        verification.refresh_from_db()
        self.assertEqual(verification.status, 'failed')
        self.assertIsNotNone(verification.error_message)

    def test_academic_student_created_on_verification(self):
        """Test que se crea AcademicStudent al verificar"""
        self.assertEqual(AcademicStudent.objects.count(), 0)

        verification = AcademicService.create_verification_record(
            user=self.user,
            rut='12345678-9',
            first_name='Juan',
            last_name='Pérez García'
        )

        AcademicService.process_verification(verification)

        self.assertEqual(AcademicStudent.objects.count(), 1)
        academic_student = AcademicStudent.objects.first()
        self.assertEqual(academic_student.user, self.user)
        self.assertTrue(academic_student.is_verified)

    def test_get_student_by_rut(self):
        """Test búsqueda de estudiante por RUT"""
        academic_student = AcademicStudent.objects.create(
            user=self.user,
            provider=self.mock_provider,
            student_id='STU20240001',
            rut='12345678-9',
            first_name='Juan',
            last_name='Pérez García',
            email='student@test.com',
            program_name='Ingeniería Comercial',
            is_verified=True
        )

        result = AcademicService.get_student_by_rut('12345678-9')
        self.assertIsNotNone(result)
        self.assertEqual(result.id, academic_student.id)


class AcademicProviderModelTests(TestCase):
    """Tests para modelo AcademicProvider"""

    def test_create_mock_provider(self):
        """Test creación de proveedor Mock"""
        provider = AcademicProvider.objects.create(
            name='Mock Provider',
            provider_type='mock',
            is_active=True,
            is_primary=True
        )

        self.assertEqual(provider.provider_type, 'mock')
        self.assertTrue(provider.is_active)
        self.assertTrue(provider.is_primary)

    def test_create_api_provider(self):
        """Test creación de proveedor API"""
        provider = AcademicProvider.objects.create(
            name='External API',
            provider_type='api',
            api_endpoint='https://api.example.com',
            api_key='secret-key-123',
            timeout=30,
            is_active=True,
            is_primary=False
        )

        self.assertEqual(provider.provider_type, 'api')
        self.assertEqual(provider.api_endpoint, 'https://api.example.com')
        self.assertEqual(provider.timeout, 30)


class AcademicStudentModelTests(TestCase):
    """Tests para modelo AcademicStudent"""

    def setUp(self):
        """Configuración inicial"""
        self.user = User.objects.create_user(
            email='student@test.com',
            password='testpass123',
            first_name='Test',
            last_name='Student'
        )

        self.provider = AcademicProvider.objects.create(
            name='Mock Provider',
            provider_type='mock',
            is_active=True
        )

    def test_create_academic_student(self):
        """Test creación de estudiante académico"""
        student = AcademicStudent.objects.create(
            user=self.user,
            provider=self.provider,
            student_id='STU20240001',
            rut='12345678-9',
            first_name='Juan',
            last_name='Pérez García',
            email='juan@test.com',
            program_name='Ingeniería Comercial',
            enrollment_status='active',
            is_verified=True
        )

        self.assertEqual(student.user, self.user)
        self.assertEqual(student.get_full_name(), 'Juan Pérez García')
        self.assertTrue(student.is_verified)

    def test_mark_verified(self):
        """Test marcar como verificado"""
        student = AcademicStudent.objects.create(
            user=self.user,
            provider=self.provider,
            student_id='STU20240001',
            rut='12345678-9',
            first_name='Juan',
            last_name='Pérez García',
            enrollment_status='active',
            is_verified=False
        )

        student.mark_verified()
        student.refresh_from_db()

        self.assertTrue(student.is_verified)
        self.assertIsNotNone(student.verification_date)

    def test_mark_failed(self):
        """Test marcar como fallido"""
        student = AcademicStudent.objects.create(
            user=self.user,
            provider=self.provider,
            student_id='STU20240001',
            rut='12345678-9',
            first_name='Juan',
            last_name='Pérez García',
            enrollment_status='active',
            is_verified=True
        )

        student.mark_failed('Verification failed')
        student.refresh_from_db()

        self.assertFalse(student.is_verified)


class AcademicVerificationModelTests(TestCase):
    """Tests para modelo AcademicVerification"""

    def setUp(self):
        """Configuración inicial"""
        self.user = User.objects.create_user(
            email='student@test.com',
            password='testpass123'
        )

        self.provider = AcademicProvider.objects.create(
            name='Mock Provider',
            provider_type='mock'
        )

    def test_mark_verified(self):
        """Test marcar verificación como exitosa"""
        verification = AcademicVerification.objects.create(
            user=self.user,
            rut='12345678-9',
            first_name='Juan',
            last_name='Pérez García',
            status='verifying'
        )

        verified_data = {
            'student_id': 'STU20240001',
            'program_name': 'Ingeniería Comercial'
        }

        verification.mark_verified(verified_data, 'mock')
        verification.refresh_from_db()

        self.assertEqual(verification.status, 'verified')
        self.assertEqual(verification.verified_data, verified_data)
        self.assertEqual(verification.verification_method, 'mock')
        self.assertIsNotNone(verification.verified_at)

    def test_mark_failed(self):
        """Test marcar verificación como fallida"""
        verification = AcademicVerification.objects.create(
            user=self.user,
            rut='12345678-9',
            first_name='Juan',
            last_name='Pérez García',
            status='verifying'
        )

        verification.mark_failed('Student not found')
        verification.refresh_from_db()

        self.assertEqual(verification.status, 'failed')
        self.assertEqual(verification.error_message, 'Student not found')
        self.assertIsNotNone(verification.attempted_at)


class AcademicProgramModelTests(TestCase):
    """Tests para modelo AcademicProgram"""

    def setUp(self):
        """Configuración inicial"""
        self.provider = AcademicProvider.objects.create(
            name='Mock Provider',
            provider_type='mock'
        )

    def test_create_academic_program(self):
        """Test creación de programa académico"""
        program = AcademicProgram.objects.create(
            provider=self.provider,
            program_code='ICO',
            program_name='Ingeniería Comercial',
            career_name='Carrera de Ingeniería',
            program_type='undergraduate',
            is_active=True
        )

        self.assertEqual(program.program_code, 'ICO')
        self.assertEqual(program.program_name, 'Ingeniería Comercial')
        self.assertTrue(program.is_active)

    def test_program_uniqueness(self):
        """Test que programa_code + provider es único"""
        AcademicProgram.objects.create(
            provider=self.provider,
            program_code='ICO',
            program_name='Ingeniería Comercial',
            program_type='undergraduate'
        )

        # Intentar crear duplicado
        with self.assertRaises(Exception):
            AcademicProgram.objects.create(
                provider=self.provider,
                program_code='ICO',
                program_name='Ingeniería Comercial',
                program_type='undergraduate'
            )
