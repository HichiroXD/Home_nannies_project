import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'django_crud_api.settings')
os.environ['DEBUG'] = 'True'
django.setup()

print("=== Test completo de BookingsReportView ===\n")

# 1. Importar todo
try:
    from reports.views import BookingsReportView
    from reports.admin_reports import BookingReportGenerator
    from reports.exporters import CSVExporter, PDFExporter, ExcelExporter
    from bookings.models import Booking
    from django.test import RequestFactory
    from django.contrib.auth import get_user_model
    
    print("✓ Todas las importaciones exitosas")
except Exception as e:
    print(f"✗ Error en importaciones: {e}")
    import traceback
    traceback.print_exc()
    exit(1)

# 2. Probar BookingReportGenerator
print("\n=== Test BookingReportGenerator ===")
try:
    bookings = Booking.objects.all()[:5]
    data = BookingReportGenerator.prepare_booking_data(bookings)
    headers = BookingReportGenerator.get_headers()
    print(f"✓ Datos preparados: {len(data)} registros")
    print(f"✓ Headers: {len(headers)} columnas")
except Exception as e:
    print(f"✗ Error preparando datos: {e}")
    import traceback
    traceback.print_exc()

# 3. Verificar que el método get existe
print("\n=== Verificar método get ===")
try:
    print(f"✓ Método get existe: {hasattr(BookingsReportView, 'get')}")
    print(f"✓ Es callable: {callable(getattr(BookingsReportView, 'get', None))}")
    
    # Listar todos los métodos
    methods = [m for m in dir(BookingsReportView) if not m.startswith('_') and callable(getattr(BookingsReportView, m))]
    print(f"✓ Métodos disponibles: {methods}")
except Exception as e:
    print(f"✗ Error: {e}")

# 4. Probar la vista con una request simulada
print("\n=== Test BookingsReportView GET ===")
try:
    factory = RequestFactory()
    User = get_user_model()
    
    # Crear request simulada
    request = factory.get('/api/reports/bookings-report/', {'format': 'csv'})
    request.user = User.objects.filter(is_staff=True).first()
    
    # Instanciar la vista
    view = BookingsReportView.as_view()
    
    # Llamar la vista
    response = view(request)
    
    print(f"✓ Vista procesada")
    print(f"  Status code: {response.status_code}")
    print(f"  Content-Type: {response.get('Content-Type', 'N/A')}")
    
    if response.status_code == 200:
        print("  ✓ RESPUESTA EXITOSA")
    else:
        print(f"  ✗ Error: {response.status_code}")
        if hasattr(response, 'data'):
            print(f"  Data: {response.data}")
            
except Exception as e:
    print(f"✗ Error ejecutando vista: {e}")
    import traceback
    traceback.print_exc()
