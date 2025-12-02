"""
Script para crear ParentProfile para usuarios existentes con rol 'parent'
Ejecutar con: python manage.py shell < fix_parent_profiles.py
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'django_crud_api.settings')
django.setup()

from users.models import User
from parents.models import ParentProfile

def fix_parent_profiles():
    """Crea ParentProfile para usuarios 'parent' que no lo tienen."""
    parents_without_profile = User.objects.filter(
        role='parent',
        parent_profile__isnull=True
    )
    
    created_count = 0
    for user in parents_without_profile:
        ParentProfile.objects.create(
            user=user,
            children_count=1
        )
        created_count += 1
        print(f"✓ Created ParentProfile for: {user.username}")
    
    total_profiles = ParentProfile.objects.count()
    print(f"\n{'='*50}")
    print(f"Created: {created_count} new ParentProfile(s)")
    print(f"Total ParentProfiles: {total_profiles}")
    print(f"{'='*50}")

if __name__ == "__main__":
    fix_parent_profiles()
