"""
Script para crear NannyProfiles faltantes para usuarios con rol 'nanny'
Ejecutar con: python manage.py shell < fix_nanny_profiles.py
O: python fix_nanny_profiles.py (si se configura DJANGO_SETTINGS_MODULE)
"""
import os
import sys
import django

# Configurar Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'django_crud_api.settings')
django.setup()

from django.contrib.auth import get_user_model
from nannies.models import NannyProfile

User = get_user_model()

def fix_nanny_profiles():
    """
    Encuentra todos los usuarios con rol 'nanny' que no tienen NannyProfile
    y crea los perfiles faltantes
    """
    # Buscar usuarios con rol nanny
    nanny_users = User.objects.filter(role__icontains='nanny')
    
    print(f"📊 Total de usuarios con rol 'nanny': {nanny_users.count()}")
    
    created_count = 0
    already_exists = 0
    
    for user in nanny_users:
        try:
            # Verificar si ya tiene perfil
            if hasattr(user, 'nanny_profile'):
                print(f"✅ {user.username} ya tiene NannyProfile (ID: {user.nanny_profile.id})")
                already_exists += 1
            else:
                # Crear el perfil
                profile = NannyProfile.objects.create(
                    user=user,
                    experience_years=0,
                    hourly_rate=15.00,  # Tarifa por defecto
                    description="Perfil de niñera pendiente de completar",
                    verified=False
                )
                print(f"✨ NannyProfile creado para {user.username} (ID: {profile.id})")
                created_count += 1
        except Exception as e:
            print(f"❌ Error al procesar {user.username}: {e}")
    
    print("\n" + "="*50)
    print(f"🎉 Proceso completado:")
    print(f"   - Perfiles creados: {created_count}")
    print(f"   - Perfiles existentes: {already_exists}")
    print(f"   - Total procesados: {nanny_users.count()}")
    print("="*50)

if __name__ == "__main__":
    print("🔧 Iniciando corrección de NannyProfiles...")
    print("="*50)
    fix_nanny_profiles()
