"""
Script para verificar perfiles de niñeras manualmente
Uso: python verify_nanny.py <nanny_id>
Ejemplo: python verify_nanny.py 8
"""
import os
import sys
import django

# Configurar Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'django_crud_api.settings')
django.setup()

from nannies.models import NannyProfile
from users.models import User


def verify_nanny_by_id(nanny_id):
    """Verificar una niñera por su ID"""
    try:
        nanny = NannyProfile.objects.get(id=nanny_id)
        nanny.verified = True
        nanny.save()
        print(f"✓ Niñera verificada exitosamente:")
        print(f"  ID: {nanny.id}")
        print(f"  Nombre: {nanny.user.first_name} {nanny.user.last_name}")
        print(f"  Username: {nanny.user.username}")
        print(f"  Email: {nanny.user.email}")
        print(f"  Verified: {nanny.verified}")
        return True
    except NannyProfile.DoesNotExist:
        print(f"✗ Error: No se encontró una niñera con ID {nanny_id}")
        return False
    except Exception as e:
        print(f"✗ Error al verificar niñera: {str(e)}")
        return False


def verify_nanny_by_username(username):
    """Verificar una niñera por su username"""
    try:
        user = User.objects.get(username=username)
        nanny = NannyProfile.objects.get(user=user)
        nanny.verified = True
        nanny.save()
        print(f"✓ Niñera verificada exitosamente:")
        print(f"  ID: {nanny.id}")
        print(f"  Nombre: {nanny.user.first_name} {nanny.user.last_name}")
        print(f"  Username: {nanny.user.username}")
        print(f"  Email: {nanny.user.email}")
        print(f"  Verified: {nanny.verified}")
        return True
    except User.DoesNotExist:
        print(f"✗ Error: No se encontró un usuario con username '{username}'")
        return False
    except NannyProfile.DoesNotExist:
        print(f"✗ Error: El usuario '{username}' no tiene perfil de niñera")
        return False
    except Exception as e:
        print(f"✗ Error al verificar niñera: {str(e)}")
        return False


def list_unverified_nannies():
    """Listar todas las niñeras no verificadas"""
    nannies = NannyProfile.objects.filter(verified=False)
    if not nannies.exists():
        print("No hay niñeras sin verificar.")
        return
    
    print("\n=== Niñeras sin verificar ===")
    for nanny in nannies:
        print(f"\nID: {nanny.id}")
        print(f"Nombre: {nanny.user.first_name} {nanny.user.last_name}")
        print(f"Username: {nanny.user.username}")
        print(f"Email: {nanny.user.email}")
        print(f"Experiencia: {nanny.experience_years} años")
        print(f"Tarifa: ${nanny.hourly_rate}/hr")
        print("-" * 40)


def verify_all_nannies():
    """Verificar todas las niñeras"""
    nannies = NannyProfile.objects.filter(verified=False)
    count = nannies.update(verified=True)
    print(f"✓ {count} niñera(s) verificada(s) exitosamente")


if __name__ == '__main__':
    if len(sys.argv) < 2:
        print("Uso:")
        print("  python verify_nanny.py <nanny_id>          - Verificar por ID")
        print("  python verify_nanny.py --username <name>   - Verificar por username")
        print("  python verify_nanny.py --list              - Listar niñeras sin verificar")
        print("  python verify_nanny.py --all               - Verificar todas las niñeras")
        print("\nEjemplos:")
        print("  python verify_nanny.py 8")
        print("  python verify_nanny.py --username margaret_gallardo")
        print("  python verify_nanny.py --list")
        print("  python verify_nanny.py --all")
        sys.exit(1)
    
    arg = sys.argv[1]
    
    if arg == '--list':
        list_unverified_nannies()
    elif arg == '--all':
        verify_all_nannies()
    elif arg == '--username':
        if len(sys.argv) < 3:
            print("✗ Error: Debes proporcionar un username")
            sys.exit(1)
        verify_nanny_by_username(sys.argv[2])
    else:
        # Asumir que es un ID
        try:
            nanny_id = int(arg)
            verify_nanny_by_id(nanny_id)
        except ValueError:
            print(f"✗ Error: '{arg}' no es un ID válido")
            sys.exit(1)
