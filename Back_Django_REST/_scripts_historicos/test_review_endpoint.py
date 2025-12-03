"""
Test real del endpoint de reviews usando APIClient
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'django_crud_api.settings')
django.setup()

from rest_framework.test import APIClient
from users.models import User
from nannies.models import NannyProfile
from reviews.models import Review

# Crear cliente
client = APIClient()

# Obtener usuario padre
parent = User.objects.filter(role='parent').first()
nanny_profile = NannyProfile.objects.first()

if not parent or not nanny_profile:
    print("❌ No hay datos suficientes en la BD")
    exit(1)

print(f"Testing con:")
print(f"  Parent: {parent.username} (ID: {parent.id})")
print(f"  Nanny Profile ID: {nanny_profile.id}")
print()

# Autenticar cliente
client.force_authenticate(user=parent)

# Data a enviar
data = {
    'nanny': nanny_profile.id,
    'rating': 5,
    'comment': 'Test desde APIClient'
}

print(f"Data a enviar: {data}")
print()

# Hacer POST request
response = client.post('/api/reviews/', data, format='json')

print(f"Status Code: {response.status_code}")
print(f"Response Data: {response.data}")
print()

if response.status_code == 201:
    print("✅ Reseña creada exitosamente!")
    # Limpiar
    Review.objects.filter(parent=parent, nanny=nanny_profile).delete()
    print("✅ Reseña de prueba eliminada")
else:
    print(f"❌ Error al crear reseña")
    if hasattr(response, 'data'):
        print(f"Detalles del error: {response.data}")
