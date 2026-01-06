import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'django_crud_api.settings')
os.environ['DEBUG'] = 'True'
django.setup()

from reports.views import BookingsReportView
from django.test import RequestFactory
from django.contrib.auth import get_user_model

print("=== Test detallado de BookingsReportView.get() ===\n")

factory = RequestFactory()
User = get_user_model()

# Crear request simulada
request = factory.get('/api/reports/bookings-report/', {'format': 'csv'})
request.user = User.objects.filter(is_staff=True).first() or User.objects.first()

print(f"Request creada:")
print(f"  Path: {request.path}")
print(f"  Method: {request.method}")
print(f"  GET params: {request.GET}")
print(f"  User: {request.user}")

# Instanciar la vista directamente (sin as_view)
view_instance = BookingsReportView()
view_instance.request = request
view_instance.format_kwarg = None

# Inicializar el request para que tenga query_params
from rest_framework.request import Request
drf_request = Request(request)

print(f"\nDRF Request:")
print(f"  query_params: {drf_request.query_params}")
print(f"  user: {drf_request.user}")

# Llamar al método get directamente
try:
    response = view_instance.get(drf_request)
    print(f"\n✓ Respuesta obtenida:")
    print(f"  Status: {response.status_code}")
    print(f"  Content-Type: {response.get('Content-Type', 'N/A')}")
    if response.status_code != 200:
        print(f"  Data: {getattr(response, 'data', 'N/A')}")
except Exception as e:
    print(f"\n✗ Error: {e}")
    import traceback
    traceback.print_exc()
