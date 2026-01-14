"""
Script de migración para corregir ParentProfiles existentes
que puedan tener address=NULL y causar problemas.
"""

import os
import django

if 'DEBUG' not in os.environ:
    os.environ['DEBUG'] = 'True'

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'django_crud_api.settings')
django.setup()

from parents.models import ParentProfile
from django.db.models import Q


def fix_parent_profiles():
    """Corrige ParentProfiles con address NULL"""
    
    print("\n" + "="*80)
    print("🔧 CORRECCIÓN DE PERFILES DE PADRE")
    print("="*80)
    
    # Buscar perfiles con address NULL o vacío
    profiles_to_fix = ParentProfile.objects.filter(Q(address__isnull=True) | Q(address=''))
    total = profiles_to_fix.count()
    
    if total == 0:
        print("\n✅ Todos los perfiles están correctos. No se requiere corrección.")
        return
    
    print(f"\n📊 Encontrados {total} perfiles que necesitan corrección:")
    
    for profile in profiles_to_fix:
        status = "NULL" if profile.address is None else "vacío"
        print(f"  - {profile.user.username:20} (ID: {profile.id:3}) - address: {status}")
    
    print("\n" + "="*80)
    respuesta = input(f"\n¿Corregir estos {total} perfiles? (s/n): ").strip().lower()
    
    if respuesta != 's':
        print("\n❌ Operación cancelada.")
        return
    
    print("\n🔄 Corrigiendo perfiles...")
    fixed_count = 0
    
    for profile in profiles_to_fix:
        try:
            if profile.address is None:
                profile.address = ''
                profile.save(update_fields=['address'])
                fixed_count += 1
                print(f"  ✅ Corregido {profile.user.username} (ID: {profile.id})")
            else:
                print(f"  ⏭️  {profile.user.username} (ID: {profile.id}) - ya tiene address vacío")
        except Exception as e:
            print(f"  ❌ Error al corregir {profile.user.username}: {str(e)}")
    
    print(f"\n✅ Proceso completado. Corregidos {fixed_count} de {total} perfiles.")


if __name__ == "__main__":
    fix_parent_profiles()
