import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'django_crud_api.settings')
os.environ['DEBUG'] = 'True'
django.setup()

print("=== Test BookingsReportView ===\n")

# 1. Verificar que la vista existe
try:
    from reports.views import BookingsReportView
    print("✓ BookingsReportView importada correctamente")
    print(f"  Clase: {BookingsReportView}")
    print(f"  Permisos: {BookingsReportView.permission_classes}")
except Exception as e:
    print(f"✗ Error importando BookingsReportView: {e}")
    exit(1)

# 2. Verificar las URLs
try:
    from reports.urls import urlpatterns
    print(f"\n✓ Total de rutas en reports.urls: {len(urlpatterns)}")
    
    # Buscar bookings-report
    found = False
    for i, pattern in enumerate(urlpatterns):
        if 'bookings-report' in str(pattern.pattern):
            print(f"\n✓ Encontrada en posición {i+1}:")
            print(f"  Patrón: {pattern.pattern}")
            print(f"  Callback: {pattern.callback}")
            print(f"  Name: {pattern.name}")
            found = True
            break
    
    if not found:
        print("\n✗ NO SE ENCONTRÓ 'bookings-report' en urlpatterns")
        print("\nPrimeras 10 rutas:")
        for i, p in enumerate(urlpatterns[:10]):
            print(f"  {i+1}. {p.pattern}")
except Exception as e:
    print(f"\n✗ Error con URLs: {e}")
    import traceback
    traceback.print_exc()

# 3. Probar resolve
print("\n=== Test resolve() ===")
try:
    from django.urls import resolve
    match = resolve('/api/reports/bookings-report/')
    print(f"✓ URL resuelta correctamente:")
    print(f"  view_name: {match.view_name}")
    print(f"  func: {match.func}")
except Exception as e:
    print(f"✗ Error resolviendo URL: {e}")
