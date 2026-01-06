import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'django_crud_api.settings')
django.setup()

from core.models import UniversityProgram

# Limpiar programas existentes
UniversityProgram.objects.all().delete()

# Crear programas universitarios
programs_data = [
    {
        'code': 'EDUC001',
        'name': 'Pedagogía en Educación Básica',
        'is_education_program': True,
        'specialization': 'Educación Primaria'
    },
    {
        'code': 'EDUC002',
        'name': 'Pedagogía en Educación Parvularia',
        'is_education_program': True,
        'specialization': 'Educación Preescolar'
    },
    {
        'code': 'EDUC003',
        'name': 'Pedagogía en Educación Especial',
        'is_education_program': True,
        'specialization': 'Educación Inclusiva'
    },
    {
        'code': 'EDUC004',
        'name': 'Pedagogía en Educación Física',
        'is_education_program': True,
        'specialization': 'Educación Física y Deportes'
    },
    {
        'code': 'EDUC005',
        'name': 'Pedagogía en Inglés',
        'is_education_program': True,
        'specialization': 'Idioma Inglés'
    },
    {
        'code': 'EDUC006',
        'name': 'Pedagogía en Matemáticas',
        'is_education_program': True,
        'specialization': 'Matemáticas'
    },
    {
        'code': 'ENGR001',
        'name': 'Ingeniería en Sistemas',
        'is_education_program': False,
        'specialization': 'Computación'
    },
    {
        'code': 'ENGR002',
        'name': 'Ingeniería Civil',
        'is_education_program': False,
        'specialization': 'Estructuras'
    },
    {
        'code': 'ADMIN001',
        'name': 'Administración de Empresas',
        'is_education_program': False,
        'specialization': 'Gestión Empresarial'
    },
    {
        'code': 'HEALTH001',
        'name': 'Enfermería',
        'is_education_program': False,
        'specialization': 'Salud'
    },
]

# Crear programas
created_count = 0
for program_data in programs_data:
    program, created = UniversityProgram.objects.get_or_create(
        code=program_data['code'],
        defaults=program_data
    )
    if created:
        created_count += 1
        print(f"✓ Creado: {program.code} - {program.name}")
    else:
        print(f"→ Existía: {program.code} - {program.name}")

print(f"\nTotal creados: {created_count}")
print(f"Total programas: {UniversityProgram.objects.count()}")

# Listar programas de Educación
print("\n=== Programas de EDUCACIÓN (pueden ser niñeras) ===")
education_programs = UniversityProgram.objects.filter(is_education_program=True)
for program in education_programs:
    print(f"  • {program.code} - {program.name}")

print("\n=== Programas OTROS (no pueden ser niñeras) ===")
other_programs = UniversityProgram.objects.filter(is_education_program=False)
for program in other_programs:
    print(f"  • {program.code} - {program.name}")
