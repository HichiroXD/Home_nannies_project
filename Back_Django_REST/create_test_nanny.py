#!/usr/bin/env python
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'django_crud_api.settings')
django.setup()

from users.models import User
from nannies.models import NannyProfile

# Crear o actualizar usuario como niñera
user = User.objects.filter(username='testnannya').first()
if not user:
    user = User.objects.create_user(
        username='testnannya',
        email='nanny@test.com',
        password='test123456',
        first_name='María',
        last_name='González',
        role='nanny',
        is_verified=True
    )

# Crear perfil de niñera si no existe
nanny = NannyProfile.objects.filter(user=user).first()
if not nanny:
    nanny = NannyProfile.objects.create(
        user=user,
        hourly_rate=25.00,
        experience_years=5,
        verified=True,
        description='Niñera profesional con 5 años de experiencia'
    )

print(f"✅ Niñera creada: {user.username} - {nanny.id}")

