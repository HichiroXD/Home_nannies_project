"""
Script para probar la creación de reseñas directamente
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'django_crud_api.settings')
django.setup()

from reviews.models import Review
from nannies.models import NannyProfile
from users.models import User

# Listar usuarios y perfiles
print("=" * 50)
print("USUARIOS:")
for user in User.objects.all()[:5]:
    print(f"- ID: {user.id}, Username: {user.username}, Role: {user.role}")

print("\n" + "=" * 50)
print("PERFILES DE NIÑERA:")
for profile in NannyProfile.objects.all()[:5]:
    print(f"- ID: {profile.id}, User: {profile.user.username}, Name: {profile.user.first_name} {profile.user.last_name}")

print("\n" + "=" * 50)
print("RESEÑAS EXISTENTES:")
for review in Review.objects.all()[:5]:
    print(f"- ID: {review.id}, Parent: {review.parent.username}, Nanny: {review.nanny.id}, Rating: {review.rating}")

# Intentar crear una reseña de prueba
print("\n" + "=" * 50)
print("INTENTANDO CREAR RESEÑA DE PRUEBA:")

try:
    # Buscar un padre y una niñera
    parent = User.objects.filter(role='parent').first()
    nanny_profile = NannyProfile.objects.first()
    
    if not parent:
        print("❌ No hay padres en la base de datos")
    elif not nanny_profile:
        print("❌ No hay perfiles de niñera en la base de datos")
    else:
        print(f"✓ Parent encontrado: {parent.username} (ID: {parent.id})")
        print(f"✓ Nanny Profile encontrado: {nanny_profile.id} - {nanny_profile.user.first_name}")
        
        # Verificar si ya existe una reseña
        existing = Review.objects.filter(parent=parent, nanny=nanny_profile).first()
        if existing:
            print(f"⚠️ Ya existe una reseña: ID {existing.id}")
        else:
            # Crear reseña
            review = Review.objects.create(
                parent=parent,
                nanny=nanny_profile,
                rating=5,
                comment="Test review from script"
            )
            print(f"✅ Reseña creada exitosamente: ID {review.id}")
            
            # Eliminarla inmediatamente para no contaminar la BD
            review.delete()
            print(f"✅ Reseña eliminada (solo era prueba)")
            
except Exception as e:
    print(f"❌ Error: {e}")
    import traceback
    traceback.print_exc()
