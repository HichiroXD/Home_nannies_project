"""
Script para sincronizar la verificación entre User.is_verified y NannyProfile.verified
Esto corrige casos donde el usuario está verificado pero el perfil no.
"""
import os
import sys
import django

# Configurar Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'django_crud_api.settings')
django.setup()

from nannies.models import NannyProfile
from users.models import User


def sync_nanny_verification():
    """
    Sincronizar verificación: Si User.is_verified=True, entonces NannyProfile.verified=True
    """
    # Obtener todas las niñeras cuyo usuario está verificado pero el perfil no
    nannies_to_verify = NannyProfile.objects.filter(
        user__is_verified=True,
        verified=False
    )
    
    count = nannies_to_verify.count()
    
    if count == 0:
        print("✓ No hay perfiles de niñeras que necesiten sincronización")
        return
    
    print(f"\n=== Sincronizando {count} perfil(es) de niñera ===\n")
    
    for nanny in nannies_to_verify:
        nanny.verified = True
        nanny.save()
        print(f"✓ Verificado: {nanny.user.first_name} {nanny.user.last_name} (@{nanny.user.username})")
    
    print(f"\n✓ Sincronización completa: {count} perfil(es) actualizado(s)")


def list_verification_status():
    """
    Listar el estado de verificación de todas las niñeras
    """
    nannies = NannyProfile.objects.all().select_related('user')
    
    print("\n=== Estado de verificación de niñeras ===\n")
    print(f"{'ID':<5} {'Nombre':<30} {'User Verified':<15} {'Profile Verified':<15}")
    print("-" * 70)
    
    for nanny in nannies:
        name = f"{nanny.user.first_name} {nanny.user.last_name}".strip() or nanny.user.username
        user_verified = "✓ Sí" if nanny.user.is_verified else "✗ No"
        profile_verified = "✓ Sí" if nanny.verified else "✗ No"
        
        print(f"{nanny.id:<5} {name:<30} {user_verified:<15} {profile_verified:<15}")


if __name__ == '__main__':
    if len(sys.argv) > 1 and sys.argv[1] == '--list':
        list_verification_status()
    else:
        sync_nanny_verification()
        print("\nPara ver el estado actual, ejecuta:")
        print("  python sync_nanny_verification.py --list")
