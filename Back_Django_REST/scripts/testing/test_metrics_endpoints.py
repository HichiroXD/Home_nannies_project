"""
Test script para verificar endpoints de métricas
"""
import django
import os
import sys

# Setup Django
sys.path.insert(0, os.path.dirname(__file__))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'django_crud_api.settings')
django.setup()

from reports.metrics_service import MetricsService

print("=" * 60)
print("TESTING METRICS SERVICE")
print("=" * 60)

# Test 1: Overview metrics
print("\n1. Testing get_overview_metrics()...")
try:
    overview = MetricsService.get_overview_metrics()
    print(f"✓ Overview metrics: {overview}")
except Exception as e:
    print(f"✗ Error: {e}")

# Test 2: Bookings by status
print("\n2. Testing get_bookings_by_status()...")
try:
    bookings = MetricsService.get_bookings_by_status()
    print(f"✓ Bookings by status: {bookings}")
except Exception as e:
    print(f"✗ Error: {e}")

# Test 3: Revenue metrics
print("\n3. Testing get_revenue_metrics()...")
try:
    revenue = MetricsService.get_revenue_metrics(30)
    print(f"✓ Revenue metrics: {revenue}")
except Exception as e:
    print(f"✗ Error: {e}")

# Test 4: Top nannies
print("\n4. Testing get_top_nannies()...")
try:
    top_nannies = MetricsService.get_top_nannies(5)
    print(f"✓ Top nannies: {top_nannies}")
except Exception as e:
    print(f"✗ Error: {e}")

print("\n" + "=" * 60)
print("TESTING COMPLETE")
print("=" * 60)
