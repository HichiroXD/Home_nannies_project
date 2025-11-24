"""
Management command to initialize academic providers and programs
Comando de gestión para inicializar proveedores y programas académicos
"""

from django.core.management.base import BaseCommand
from academic.models import AcademicProvider, AcademicProgram


class Command(BaseCommand):
    help = 'Initialize academic providers and programs'

    def handle(self, *args, **options):
        """Ejecuta el comando"""
        self.stdout.write('Inicializando proveedores académicos...')

        # Crear proveedor Mock (principal)
        mock_provider, created = AcademicProvider.objects.get_or_create(
            name='Mock Data Provider',
            defaults={
                'provider_type': 'mock',
                'is_active': True,
                'is_primary': True,
                'sync_status': 'success'
            }
        )

        if created:
            self.stdout.write(
                self.style.SUCCESS(f'✓ Proveedor Mock creado: {mock_provider.name}')
            )
        else:
            self.stdout.write(f'✓ Proveedor Mock ya existe: {mock_provider.name}')

        # Crear proveedor Database (para datos locales)
        db_provider, created = AcademicProvider.objects.get_or_create(
            name='Database Provider',
            defaults={
                'provider_type': 'database',
                'is_active': True,
                'is_primary': False,
                'sync_status': 'success'
            }
        )

        if created:
            self.stdout.write(
                self.style.SUCCESS(f'✓ Proveedor Database creado: {db_provider.name}')
            )
        else:
            self.stdout.write(f'✓ Proveedor Database ya existe: {db_provider.name}')

        # Programas académicos para Mock Provider
        programs_data = [
            {
                'program_code': 'ICO',
                'program_name': 'Ingeniería Comercial',
                'career_name': 'Carrera de Ingeniería',
                'faculty': 'Facultad de Economía y Negocios',
                'program_type': 'undergraduate'
            },
            {
                'program_code': 'ENF',
                'program_name': 'Enfermería',
                'career_name': 'Carrera de Enfermería',
                'faculty': 'Facultad de Ciencias de la Salud',
                'program_type': 'undergraduate'
            },
            {
                'program_code': 'DER',
                'program_name': 'Derecho',
                'career_name': 'Carrera de Derecho',
                'faculty': 'Facultad de Derecho',
                'program_type': 'undergraduate'
            },
            {
                'program_code': 'MBA',
                'program_name': 'MBA - Master of Business Administration',
                'career_name': 'Programa de Posgrado',
                'faculty': 'Escuela de Negocios',
                'program_type': 'postgraduate'
            },
            {
                'program_code': 'MAUD',
                'program_name': 'Magíster en Auditoria',
                'career_name': 'Programa de Posgrado',
                'faculty': 'Facultad de Economía y Negocios',
                'program_type': 'postgraduate'
            },
        ]

        self.stdout.write('\nCreando programas académicos...')

        for program_info in programs_data:
            program, created = AcademicProgram.objects.get_or_create(
                provider=mock_provider,
                program_code=program_info['program_code'],
                defaults={
                    'program_name': program_info['program_name'],
                    'career_name': program_info['career_name'],
                    'faculty': program_info['faculty'],
                    'program_type': program_info['program_type'],
                    'is_active': True
                }
            )

            if created:
                self.stdout.write(
                    self.style.SUCCESS(
                        f'  ✓ Programa creado: {program.program_name}'
                    )
                )
            else:
                self.stdout.write(
                    f'  ✓ Programa ya existe: {program.program_name}'
                )

        self.stdout.write(
            self.style.SUCCESS('\n✅ Inicialización académica completada correctamente')
        )
