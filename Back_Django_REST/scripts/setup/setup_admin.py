#!/usr/bin/env python
"""
Script para configurar contraseña del superuser
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'django_crud_api.settings')
django.setup()

from django.contrib.auth import get_user_model

User = get_user_model()

# Crear o actualizar superuser
user, created = User.objects.get_or_create(
    username='admin',
    defaults={
        'email': 'admin@test.com',
        'is_staff': True,
        'is_superuser': True,
    }
)

# Establecer contraseña
user.set_password('Admin123')
user.save()

if created:
    print(f"✓ Superuser CREADO: {user.username}")
else:
    print(f"✓ Superuser ACTUALIZADO: {user.username}")

print(f"✓ Email: {user.email}")
print(f"✓ Contraseña: Admin123")
print(f"✓ Es superuser: {user.is_superuser}")
print(f"\nAccede a: http://127.0.0.1:8000/admin")
print(f"Usuario: admin")
print(f"Contraseña: Admin123")
