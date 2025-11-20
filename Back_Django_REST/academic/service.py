"""
Academic API Service - Phase 3
Servicio centralizado para validación académica con soporte Mock y APIs reales
"""

import logging
import json
import importlib
from django.utils import timezone
from django.contrib.auth import get_user_model
from .models import AcademicProvider, AcademicStudent, AcademicProgram, AcademicVerification

logger = logging.getLogger(__name__)
User = get_user_model()


class AcademicAPIException(Exception):
    """Excepción base para errores de Academic API"""
    pass


class AcademicService:
    """Servicio centralizado de validación académica"""

    # Datos Mock para desarrollo/testing
    MOCK_DATA = {
        '12345678-9': {
            'student_id': 'STU20240001',
            'first_name': 'Juan',
            'last_name': 'Pérez García',
            'rut': '12345678-9',
            'email': 'juan.perez@university.edu',
            'program_name': 'Ingeniería Comercial',
            'program_code': 'ICO',
            'career_name': 'Carrera de Ingeniería',
            'enrollment_status': 'active',
            'enrollment_date': '2020-03-15',
            'graduation_year': None,
            'current_semester': '8',
            'current_year': 2024,
        },
        '98765432-1': {
            'student_id': 'STU20240002',
            'first_name': 'María',
            'last_name': 'González López',
            'rut': '98765432-1',
            'email': 'maria.gonzalez@university.edu',
            'program_name': 'Enfermería',
            'program_code': 'ENF',
            'career_name': 'Carrera de Enfermería',
            'enrollment_status': 'active',
            'enrollment_date': '2022-03-01',
            'graduation_year': None,
            'current_semester': '4',
            'current_year': 2024,
        },
        '11111111-1': {
            'student_id': 'STU20240003',
            'first_name': 'Carlos',
            'last_name': 'Rodríguez Martín',
            'rut': '11111111-1',
            'email': 'carlos.rodriguez@university.edu',
            'program_name': 'Derecho',
            'program_code': 'DER',
            'career_name': 'Carrera de Derecho',
            'enrollment_status': 'graduated',
            'enrollment_date': '2020-03-15',
            'graduation_year': 2024,
            'current_semester': None,
            'current_year': None,
        },
    }

    @staticmethod
    def get_primary_provider():
        """Obtiene el proveedor primario activo"""
        try:
            provider = AcademicProvider.objects.filter(
                is_primary=True,
                is_active=True
            ).first()

            if not provider:
                # Si no hay proveedor primario, usar el primero disponible
                provider = AcademicProvider.objects.filter(
                    is_active=True
                ).first()

            return provider
        except Exception as e:
            logger.error(f'Error getting primary provider: {e}')
            return None

    @staticmethod
    def verify_student(rut, first_name='', last_name='', program_name='', provider=None):
        """
        Verifica datos de estudiante contra el proveedor académico
        
        Args:
            rut: RUT del estudiante
            first_name: Nombre del estudiante
            last_name: Apellido del estudiante
            program_name: Nombre del programa (opcional)
            provider: Proveedor específico (usa primario si no se especifica)
        
        Returns:
            dict con datos verificados o None si falla
        """
        if not provider:
            provider = AcademicService.get_primary_provider()

        if not provider:
            logger.warning('No academic provider configured')
            return None

        try:
            if provider.provider_type == 'mock':
                return AcademicService._verify_mock(rut, first_name, last_name)
            elif provider.provider_type == 'api':
                return AcademicService._verify_api(rut, first_name, last_name, provider)
            elif provider.provider_type == 'database':
                return AcademicService._verify_database(rut, first_name, last_name)
            else:
                logger.error(f'Unknown provider type: {provider.provider_type}')
                return None

        except AcademicAPIException as e:
            logger.error(f'Academic API error: {e}')
            return None
        except Exception as e:
            logger.error(f'Unexpected error during verification: {e}', exc_info=True)
            return None

    @staticmethod
    def _verify_mock(rut, first_name='', last_name=''):
        """Verifica usando datos mock"""
        logger.info(f'Verifying student {rut} using mock data')

        # Buscar en datos mock
        if rut not in AcademicService.MOCK_DATA:
            logger.warning(f'Student {rut} not found in mock data')
            return None

        mock_student = AcademicService.MOCK_DATA[rut]

        # Validar datos si se proporcionan
        if first_name and first_name.lower() != mock_student['first_name'].lower():
            logger.warning(f'First name mismatch for {rut}')
            return None

        if last_name and last_name.lower() != mock_student['last_name'].lower():
            logger.warning(f'Last name mismatch for {rut}')
            return None

        logger.info(f'Student {rut} verified successfully with mock data')
        return mock_student

    @staticmethod
    def _verify_api(rut, first_name, last_name, provider):
        """Verifica usando API externa"""
        logger.info(f'Verifying student {rut} using API: {provider.api_endpoint}')

        if not provider.api_endpoint:
            raise AcademicAPIException('API endpoint not configured')

        try:
            # Dynamic import to avoid dependency issues
            import importlib
            requests_module = importlib.import_module('requests')

            headers = {
                'Authorization': f'Bearer {provider.api_key}',
                'Content-Type': 'application/json',
            }

            params = {
                'rut': rut,
                'first_name': first_name,
                'last_name': last_name,
            }

            response = requests_module.get(
                f'{provider.api_endpoint}/verify',
                headers=headers,
                params=params,
                timeout=provider.timeout
            )

            if response.status_code != 200:
                raise AcademicAPIException(f'API returned status {response.status_code}')

            data = response.json()

            if not data.get('verified'):
                logger.warning(f'API could not verify student {rut}')
                return None

            logger.info(f'Student {rut} verified via API')
            return data.get('student_data')

        except ModuleNotFoundError:
            raise AcademicAPIException('requests library not installed')
        except Exception as e:
            if 'Timeout' in str(type(e).__name__):
                raise AcademicAPIException(f'API timeout after {provider.timeout}s')
            raise AcademicAPIException(f'API request failed: {str(e)}')

    @staticmethod
    def _verify_database(rut, first_name, last_name):
        """Verifica contra base de datos local"""
        logger.info(f'Verifying student {rut} using database')

        try:
            # Buscar en AcademicStudent
            student = AcademicStudent.objects.filter(rut=rut).first()

            if not student:
                logger.warning(f'Student {rut} not found in database')
                return None

            # Validar nombre
            if first_name and first_name.lower() != student.first_name.lower():
                logger.warning(f'First name mismatch for {rut}')
                return None

            if last_name and last_name.lower() != student.last_name.lower():
                logger.warning(f'Last name mismatch for {rut}')
                return None

            logger.info(f'Student {rut} verified from database')
            return {
                'student_id': student.student_id,
                'first_name': student.first_name,
                'last_name': student.last_name,
                'rut': student.rut,
                'email': student.email,
                'program_name': student.program_name,
                'program_code': student.program_code,
                'enrollment_status': student.enrollment_status,
                'enrollment_date': student.enrollment_date.isoformat() if student.enrollment_date else None,
                'current_year': student.current_year,
            }

        except Exception as e:
            logger.error(f'Database verification error: {e}')
            return None

    @staticmethod
    def create_verification_record(user, rut, first_name, last_name, program_name=''):
        """
        Crea registro de verificación académica
        
        Args:
            user: User instance
            rut: RUT a verificar
            first_name: Nombre
            last_name: Apellido
            program_name: Programa (opcional)
        
        Returns:
            AcademicVerification instance
        """
        verification = AcademicVerification.objects.create(
            user=user,
            rut=rut,
            first_name=first_name,
            last_name=last_name,
            program_name=program_name,
            status='pending'
        )

        logger.info(f'Created verification record {verification.id} for user {user.email}')
        return verification

    @staticmethod
    def process_verification(verification):
        """
        Procesa una verificación académica
        
        Args:
            verification: AcademicVerification instance
        
        Returns:
            True si fue verificado, False si no
        """
        try:
            verification.status = 'verifying'
            verification.save(update_fields=['status'])

            # Obtener proveedor
            provider = AcademicService.get_primary_provider()

            if not provider:
                verification.mark_failed('No academic provider configured')
                return False

            # Realizar verificación
            result = AcademicService.verify_student(
                rut=verification.rut,
                first_name=verification.first_name,
                last_name=verification.last_name,
                program_name=verification.program_name,
                provider=provider
            )

            if not result:
                verification.mark_failed('Student not found or data mismatch')
                return False

            # Buscar o crear AcademicStudent
            academic_student, created = AcademicStudent.objects.get_or_create(
                user=verification.user,
                provider=provider,
                defaults={
                    'student_id': result.get('student_id', ''),
                    'rut': result.get('rut', verification.rut),
                    'first_name': result.get('first_name', verification.first_name),
                    'last_name': result.get('last_name', verification.last_name),
                    'email': result.get('email', verification.user.email),
                    'program_name': result.get('program_name', verification.program_name),
                    'program_code': result.get('program_code', ''),
                    'enrollment_status': result.get('enrollment_status', 'active'),
                    'is_verified': True,
                    'verification_date': timezone.now(),
                    'verification_method': provider.provider_type,
                    'raw_data': result,
                }
            )

            if not created:
                # Actualizar datos existentes
                academic_student.first_name = result.get('first_name', academic_student.first_name)
                academic_student.last_name = result.get('last_name', academic_student.last_name)
                academic_student.program_name = result.get('program_name', academic_student.program_name)
                academic_student.enrollment_status = result.get('enrollment_status', academic_student.enrollment_status)
                academic_student.is_verified = True
                academic_student.verification_date = timezone.now()
                academic_student.raw_data = result
                academic_student.save()

            # Marcar verificación como exitosa
            verification.mark_verified(result, provider.provider_type)
            verification.academic_student = academic_student
            verification.provider = provider
            verification.save(update_fields=['academic_student', 'provider'])

            logger.info(f'Verification {verification.id} completed successfully')
            return True

        except Exception as e:
            logger.error(f'Error processing verification {verification.id}: {e}', exc_info=True)
            verification.mark_failed(str(e))
            return False

    @staticmethod
    def get_student_by_rut(rut):
        """Obtiene datos de estudiante por RUT"""
        try:
            return AcademicStudent.objects.filter(rut=rut).first()
        except Exception as e:
            logger.error(f'Error getting student by RUT: {e}')
            return None

    @staticmethod
    def get_programs(provider=None):
        """Obtiene programas disponibles"""
        if not provider:
            provider = AcademicService.get_primary_provider()

        if not provider:
            return []

        try:
            return AcademicProgram.objects.filter(
                provider=provider,
                is_active=True
            ).order_by('program_name')
        except Exception as e:
            logger.error(f'Error getting programs: {e}')
            return []
