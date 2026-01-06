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


def generate_verification_codes():
    """Generar códigos de verificación para todas las niñeras que no tengan"""
    nannies = NannyProfile.objects.filter(verification_code__isnull=True)
    count = 0
    for nanny in nannies:
        code = nanny.generate_verification_code()
        print(f"✓ Código generado para {nanny.user.username}: {code}")
        count += 1
    print(f"\n✓ Total: {count} código(s) generado(s)")


def verify_with_code(code):
    """Verificar niñera usando código de verificación"""
    try:
        nanny = NannyProfile.objects.get(verification_code=code.upper())
        if nanny.verify_with_code(code):
            print(f"✓ Niñera verificada exitosamente:")
            print(f"  ID: {nanny.id}")
            print(f"  Nombre: {nanny.user.first_name} {nanny.user.last_name}")
            print(f"  Username: {nanny.user.username}")
            print(f"  Email: {nanny.user.email}")
            print(f"  Código: {nanny.verification_code}")
            return True
        else:
            print(f"✗ Error: Código incorrecto")
            return False
    except NannyProfile.DoesNotExist:
        print(f"✗ Error: No se encontró una niñera con el código '{code}'")
        return False
    except Exception as e:
        print(f"✗ Error al verificar con código: {str(e)}")
        return False


def show_nanny_code(nanny_id):
    """Mostrar código de verificación de una niñera"""
    try:
        nanny = NannyProfile.objects.get(id=nanny_id)
        if nanny.verification_code:
            print(f"Código de verificación para {nanny.user.username}:")
            print(f"  {nanny.verification_code}")
        else:
            print(f"La niñera {nanny.user.username} no tiene código de verificación")
            generate = input("¿Deseas generar uno ahora? (s/n): ")
            if generate.lower() == 's':
                code = nanny.generate_verification_code()
                print(f"✓ Código generado: {code}")
        return True
    except NannyProfile.DoesNotExist:
        print(f"✗ Error: No se encontró una niñera con ID {nanny_id}")
        return False
    except Exception as e:
        print(f"✗ Error: {str(e)}")
        return False


if __name__ == '__main__':
    if len(sys.argv) < 2:
        print("Uso:")
        print("  python verify_nanny.py <nanny_id>          - Verificar por ID")
        print("  python verify_nanny.py --username <name>   - Verificar por username")
        print("  python verify_nanny.py --list              - Listar niñeras sin verificar")
        print("  python verify_nanny.py --all               - Verificar todas las niñeras")
        print("  python verify_nanny.py --generate-codes    - Generar códigos para todas las niñeras")
        print("  python verify_nanny.py --code <CODE>       - Verificar con código")
        print("  python verify_nanny.py --show-code <id>    - Mostrar código de una niñera")
        print("\nEjemplos:")
        print("  python verify_nanny.py 8")
        print("  python verify_nanny.py --username margaret_gallardo")
        print("  python verify_nanny.py --list")
        print("  python verify_nanny.py --all")
        print("  python verify_nanny.py --generate-codes")
        print("  python verify_nanny.py --code ABC12XYZ")
        print("  python verify_nanny.py --show-code 8")
        sys.exit(1)
    
    arg = sys.argv[1]
    
    if arg == '--list':
        list_unverified_nannies()
    elif arg == '--all':
        verify_all_nannies()
    elif arg == '--generate-codes':
        generate_verification_codes()
    elif arg == '--code':
        if len(sys.argv) < 3:
            print("✗ Error: Debes proporcionar un código")
            sys.exit(1)
        verify_with_code(sys.argv[2])
    elif arg == '--show-code':
        if len(sys.argv) < 3:
            print("✗ Error: Debes proporcionar un ID de niñera")
            sys.exit(1)
        try:
            nanny_id = int(sys.argv[2])
            show_nanny_code(nanny_id)
        except ValueError:
            print(f"✗ Error: '{sys.argv[2]}' no es un ID válido")
            sys.exit(1)
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
