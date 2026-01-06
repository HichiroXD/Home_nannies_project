import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'django_crud_api.settings')
os.environ['DEBUG'] = 'True'
django.setup()

from django.urls import get_resolver
import reports.urls as rep_urls

print("=== URLs en reports.urls ===")
for i, pattern in enumerate(rep_urls.urlpatterns[:15]):
    print(f"{i+1}. {pattern.pattern}")

print("\n=== Probando resolve ===")
from django.urls import resolve
try:
    match = resolve('/api/reports/bookings-report/')
    print(f"✓ URL resuelta: {match.view_name}")
    print(f"  Vista: {match.func}")
except Exception as e:
    print(f"✗ Error: {e}")
