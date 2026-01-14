"""
Script para diagnosticar y solucionar problemas de login de usuarios.

Este script ayuda a:
1. Verificar si un usuario existe
2. Verificar el estado de verificación del usuario
3. Verificar manualmente una cuenta
4. Resetear la contraseña si es necesario
5. Ver el historial de intentos de login
"""

import os
import django
import sys
from django.utils import timezone
from datetime import timedelta

# Cargar variables de entorno
try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    print("⚠️  dotenv no disponible, usando configuración por defecto")

# Configurar DEBUG si no está en env
if 'DEBUG' not in os.environ:
    os.environ['DEBUG'] = 'True'

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'django_crud_api.settings')
django.setup()

from users.models import User, LoginHistory
from parents.models import ParentProfile


def print_separator():
    print("\n" + "="*80)


def get_user_info(username):
    """Obtiene y muestra información del usuario"""
    try:
        user = User.objects.get(username=username)
        
        print_separator()
        print(f"📋 INFORMACIÓN DEL USUARIO: {username}")
        print_separator()
        print(f"  ✓ ID: {user.id}")
        print(f"  ✓ Email: {user.email}")
        print(f"  ✓ Nombre: {user.get_full_name() or 'No definido'}")
        print(f"  ✓ Rol: {user.role}")
        print(f"  ✓ Roles disponibles: {user.roles if user.roles else ['No configurado']}")
        print(f"  ✓ Activo: {'Sí' if user.is_active else 'NO'}")
        print(f"  ✓ Verificado: {'Sí' if user.is_verified else 'NO ❌'}")
        print(f"  ✓ Staff: {'Sí' if user.is_staff else 'No'}")
        print(f"  ✓ Superusuario: {'Sí' if user.is_superuser else 'No'}")
        print(f"  ✓ Fecha de registro: {user.date_joined}")
        print(f"  ✓ Último login: {user.last_login or 'Nunca'}")
        print(f"  ✓ Última IP: {user.last_login_ip or 'N/A'}")
        
        # Verificar si tiene perfil de padre
        if user.role == 'parent':
            try:
                parent = ParentProfile.objects.get(user=user)
                print(f"\n  ✓ Tiene perfil de padre: Sí (ID: {parent.id})")
                print(f"    - Teléfono: {parent.phone or 'No definido'}")
                print(f"    - Dirección: {parent.address or 'No definida'}")
            except ParentProfile.DoesNotExist:
                print(f"\n  ❌ No tiene perfil de padre asociado")
        
        # Verificar historial de login reciente
        recent_logins = LoginHistory.objects.filter(user=user).order_by('-login_time')[:5]
        if recent_logins:
            print_separator()
            print("📊 HISTORIAL DE LOGIN RECIENTE:")
            print_separator()
            for i, login in enumerate(recent_logins, 1):
                status = "✅ Exitoso" if login.login_successful else "❌ Fallido"
                reason = f" ({login.failure_reason})" if not login.login_successful else ""
                print(f"  {i}. {login.login_time.strftime('%Y-%m-%d %H:%M:%S')} - {status}{reason}")
                print(f"     IP: {login.ip_address}")
        
        return user
        
    except User.DoesNotExist:
        print(f"\n❌ ERROR: No se encontró el usuario '{username}'")
        return None


def verify_user(user):
    """Verifica manualmente un usuario"""
    if user.is_verified:
        print(f"\n✓ El usuario '{user.username}' ya está verificado.")
        return
    
    user.is_verified = True
    user.pending_verification = False
    user.save()
    print(f"\n✅ Usuario '{user.username}' verificado exitosamente.")


def reset_password(user, new_password):
    """Resetea la contraseña de un usuario"""
    user.set_password(new_password)
    user.save()
    print(f"\n✅ Contraseña actualizada para '{user.username}'.")


def clear_login_attempts(user):
    """Limpia el historial de intentos de login fallidos recientes"""
    recent_time = timezone.now() - timedelta(minutes=10)
    failed_logins = LoginHistory.objects.filter(
        user=user,
        login_successful=False,
        login_time__gte=recent_time
    )
    count = failed_logins.count()
    if count > 0:
        print(f"\n🗑️  Encontrados {count} intentos fallidos en los últimos 10 minutos.")
        print("   Nota: El rate limiting de Django se resetea automáticamente.")
    else:
        print(f"\n✓ No hay intentos fallidos recientes.")


def list_all_users():
    """Lista todos los usuarios del sistema"""
    print_separator()
    print("👥 TODOS LOS USUARIOS:")
    print_separator()
    
    users = User.objects.all().order_by('-date_joined')
    for user in users:
        verified = "✓" if user.is_verified else "❌"
        active = "✓" if user.is_active else "❌"
        print(f"  {user.username:20} | {user.email:30} | Rol: {user.role:10} | Verificado: {verified} | Activo: {active}")
    
    print(f"\nTotal: {users.count()} usuarios")


def interactive_menu():
    """Menú interactivo para diagnosticar y solucionar problemas"""
    while True:
        print_separator()
        print("🔧 HERRAMIENTA DE DIAGNÓSTICO DE LOGIN")
        print_separator()
        print("\n¿Qué deseas hacer?")
        print("  1. Ver información de un usuario")
        print("  2. Verificar manualmente un usuario")
        print("  3. Resetear contraseña de un usuario")
        print("  4. Listar todos los usuarios")
        print("  5. Verificar y resetear contraseña de un usuario")
        print("  0. Salir")
        print()
        
        choice = input("Selecciona una opción: ").strip()
        
        if choice == '0':
            print("\n👋 ¡Hasta luego!")
            break
            
        elif choice == '1':
            username = input("\nIngresa el nombre de usuario: ").strip()
            get_user_info(username)
            
        elif choice == '2':
            username = input("\nIngresa el nombre de usuario a verificar: ").strip()
            user = get_user_info(username)
            if user:
                confirm = input(f"\n¿Verificar a '{username}'? (s/n): ").strip().lower()
                if confirm == 's':
                    verify_user(user)
                    
        elif choice == '3':
            username = input("\nIngresa el nombre de usuario: ").strip()
            user = get_user_info(username)
            if user:
                new_password = input("Ingresa la nueva contraseña: ").strip()
                if len(new_password) < 6:
                    print("❌ La contraseña debe tener al menos 6 caracteres.")
                else:
                    confirm = input(f"\n¿Resetear contraseña de '{username}'? (s/n): ").strip().lower()
                    if confirm == 's':
                        reset_password(user, new_password)
                        
        elif choice == '4':
            list_all_users()
            
        elif choice == '5':
            username = input("\nIngresa el nombre de usuario: ").strip()
            user = get_user_info(username)
            if user:
                print("\n🔄 Verificando usuario y reseteando contraseña...")
                verify_user(user)
                new_password = input("Ingresa la nueva contraseña: ").strip()
                if len(new_password) >= 6:
                    reset_password(user, new_password)
                    clear_login_attempts(user)
                    print("\n✅ ¡Listo! Ahora puedes intentar hacer login con:")
                    print(f"   Username: {username}")
                    print(f"   Password: {new_password}")
                else:
                    print("❌ La contraseña debe tener al menos 6 caracteres.")
        
        else:
            print("\n❌ Opción inválida. Intenta de nuevo.")


if __name__ == "__main__":
    if len(sys.argv) > 1:
        # Modo comando con argumentos
        username = sys.argv[1]
        get_user_info(username)
    else:
        # Modo interactivo
        interactive_menu()
