"""
Script para crear perfiles de padre faltantes.

Este script identifica usuarios con rol 'parent' que no tienen
un ParentProfile asociado y los crea automáticamente.
"""

import os
import django
import sys

# Configurar DEBUG si no está en env
if 'DEBUG' not in os.environ:
    os.environ['DEBUG'] = 'True'

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'django_crud_api.settings')
django.setup()

from users.models import User
from parents.models import ParentProfile


def create_missing_parent_profiles():
    """Crea ParentProfiles para usuarios que no tienen uno"""
    
    # Obtener todos los usuarios con rol 'parent'
    parent_users = User.objects.filter(role='parent')
    total = parent_users.count()
    
    print(f"\n📊 Analizando {total} usuarios con rol 'parent'...")
    print("="*80)
    
    missing_profiles = []
    created_count = 0
    
    for user in parent_users:
        try:
            # Intentar obtener el perfil
            profile = ParentProfile.objects.get(user=user)
            print(f"  ✓ {user.username:20} - Ya tiene perfil (ID: {profile.id})")
        except ParentProfile.DoesNotExist:
            missing_profiles.append(user)
            print(f"  ❌ {user.username:20} - NO tiene perfil")
    
    if not missing_profiles:
        print(f"\n✅ Todos los usuarios tienen perfil de padre.")
        return
    
    print(f"\n⚠️  Encontrados {len(missing_profiles)} usuarios sin perfil de padre:")
    for user in missing_profiles:
        print(f"  - {user.username} ({user.email})")
    
    print("\n" + "="*80)
    respuesta = input(f"\n¿Crear perfiles de padre para estos {len(missing_profiles)} usuarios? (s/n): ").strip().lower()
    
    if respuesta == 's':
        print("\n🔧 Creando perfiles...")
        for user in missing_profiles:
            try:
                profile = ParentProfile.objects.create(
                    user=user,
                    phone=None,
                    address='',  # String vacío en lugar de None
                    children_count=1  # Mínimo 1 hijo según validación
                )
                created_count += 1
                print(f"  ✅ Creado perfil para {user.username} (ID: {profile.id})")
            except Exception as e:
                print(f"  ❌ Error al crear perfil para {user.username}: {str(e)}")
        
        print(f"\n✅ Proceso completado. Creados {created_count} perfiles de padre.")
    else:
        print("\n❌ Operación cancelada.")


def create_profile_for_user(username):
    """Crea un perfil de padre para un usuario específico"""
    try:
        user = User.objects.get(username=username)
        
        if user.role != 'parent':
            print(f"❌ El usuario '{username}' no tiene rol 'parent' (tiene '{user.role}')")
            return
        
        # Verificar si ya tiene perfil
        try:
            profile = ParentProfile.objects.get(user=user)
            print(f"✓ El usuario '{username}' ya tiene un perfil de padre (ID: {profile.id})")
            return
        except ParentProfile.DoesNotExist:
            pass
        
        # Crear el perfil
        profile = ParentProfile.objects.create(
            user=user,
            phone=None,
            address='',  # String vacío en lugar de None
            children_count=1  # Mínimo 1 hijo según validación
        )
        
        print(f"\n✅ Perfil de padre creado exitosamente para '{username}'")
        print(f"   ID del perfil: {profile.id}")
        print(f"   Ahora el usuario puede usar /api/parents/profile/ y /api/parents/children/")
        
    except User.DoesNotExist:
        print(f"❌ No se encontró el usuario '{username}'")
    except Exception as e:
        print(f"❌ Error al crear perfil: {str(e)}")


if __name__ == "__main__":
    print("\n" + "="*80)
    print("🔧 CREADOR DE PERFILES DE PADRE")
    print("="*80)
    
    if len(sys.argv) > 1:
        # Modo comando: crear perfil para usuario específico
        username = sys.argv[1]
        create_profile_for_user(username)
    else:
        # Modo interactivo: revisar todos los usuarios
        create_missing_parent_profiles()
