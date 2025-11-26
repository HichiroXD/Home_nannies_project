"""
Script para simular una petición POST del frontend
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'django_crud_api.settings')
django.setup()

from django.test import RequestFactory
from reviews.views import ReviewListCreateView
from users.models import User
from nannies.models import NannyProfile
import json

# Crear factory para requests
factory = RequestFactory()

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

# Simular POST request del frontend
data = {
    'nanny': nanny_profile.id,
    'rating': 5,
    'comment': 'Test desde script simulando frontend'
}

print(f"Data a enviar: {data}")
print()

# Crear request
request = factory.post(
    '/api/reviews/',
    data=json.dumps(data),
    content_type='application/json'
)
request.user = parent
# Forzar autenticación
from rest_framework.test import force_authenticate
force_authenticate(request, user=parent)

# Crear vista y procesarla
view = ReviewListCreateView.as_view()

try:
    response = view(request)
    print(f"✅ Status Code: {response.status_code}")
    print(f"✅ Response: {response.data if hasattr(response, 'data') else 'No data'}")
    
    # Limpiar: eliminar la reseña creada
    from reviews.models import Review
    Review.objects.filter(parent=parent, nanny=nanny_profile).delete()
    print(f"\n✅ Reseña de prueba eliminada")
    
except Exception as e:
    print(f"❌ Error: {e}")
    import traceback
    traceback.print_exc()
