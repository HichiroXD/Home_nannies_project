"""
Verificar usuarios niñera y sus perfiles
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'django_crud_api.settings')
django.setup()

from users.models import User
from nannies.models import NannyProfile

print("=" * 60)
print("VERIFICACIÓN DE USUARIOS NIÑERA Y SUS PERFILES")
print("=" * 60)

nannies = User.objects.filter(role='nanny')
print(f"\nTotal de usuarios con rol 'nanny': {nannies.count()}")

for nanny in nannies:
    try:
        profile = NannyProfile.objects.get(user=nanny)
        print(f"✓ {nanny.username} (ID: {nanny.id}) - Profile ID: {profile.id}")
    except NannyProfile.DoesNotExist:
        print(f"✗ {nanny.username} (ID: {nanny.id}) - SIN PERFIL")
        
        # Crear perfil automáticamente
        profile = NannyProfile.objects.create(
            user=nanny,
            experience_years=0,
            hourly_rate=10000,
            description="Perfil creado automáticamente"
        )
        print(f"  → Perfil creado: ID {profile.id}")

print("\n" + "=" * 60)
print("VERIFICACIÓN COMPLETADA")
print("=" * 60)
