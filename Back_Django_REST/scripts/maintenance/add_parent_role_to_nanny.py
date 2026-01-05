"""
Script para agregar el rol de 'parent' a usuarios que son niñeras
Esto les permite usar la aplicación tanto como niñera como para contratar niñeras

Uso:
    python add_parent_role_to_nanny.py <username>
"""
import os
import sys
import django

# Setup Django
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'django_crud_api.settings')
django.setup()

from users.models import User
from parents.models import ParentProfile

def add_parent_role(username):
    """Agrega rol de padre a una niñera"""
    try:
        user = User.objects.get(username=username)
        
        if user.role != 'nanny':
            print(f"❌ Error: {username} no es una niñera (rol actual: {user.role})")
            return False
        
        # Inicializar roles si no existen
        if not user.roles or not isinstance(user.roles, list):
            user.roles = [user.role]
        
        # Agregar 'parent' a los roles disponibles
        if 'parent' not in user.roles:
            user.roles.append('parent')
            user.save()
            print(f"✅ Rol 'parent' agregado a {username}")
            print(f"   Roles disponibles: {user.roles}")
        else:
            print(f"ℹ️  {username} ya tiene el rol 'parent'")
        
        # Crear ParentProfile si no existe
        if not hasattr(user, 'parent_profile'):
            ParentProfile.objects.create(user=user)
            print(f"✅ ParentProfile creado para {username}")
        else:
            print(f"ℹ️  ParentProfile ya existe para {username}")
        
        return True
        
    except User.DoesNotExist:
        print(f"❌ Error: Usuario '{username}' no encontrado")
        return False
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def list_nannies():
    """Lista todas las niñeras del sistema"""
    nannies = User.objects.filter(role='nanny')
    print(f"\n📋 Niñeras en el sistema ({nannies.count()}):")
    print("-" * 80)
    for nanny in nannies:
        has_parent = 'parent' in (nanny.roles or [])
        marker = "✓" if has_parent else " "
        print(f"  [{marker}] {nanny.username:<20} | Roles: {nanny.roles or [nanny.role]}")
    print("-" * 80)
    print("  ✓ = Ya tiene rol de padre\n")

if __name__ == '__main__':
    if len(sys.argv) < 2:
        print("Sistema de Roles Múltiples - Agregar rol 'parent' a niñeras")
        print("=" * 80)
        list_nannies()
        print("\nUso:")
        print("  python add_parent_role_to_nanny.py <username>")
        print("\nEjemplo:")
        print("  python add_parent_role_to_nanny.py maria_nanny")
        sys.exit(1)
    
    username = sys.argv[1]
    add_parent_role(username)
