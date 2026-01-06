"""
Script para listar todas las URLs registradas en Django
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'django_crud_api.settings')
django.setup()

from django.urls import get_resolver

def list_urls(urlpatterns, prefix=''):
    """Lista recursivamente todas las URLs"""
    urls = []
    for pattern in urlpatterns:
        if hasattr(pattern, 'url_patterns'):
            # Es un include, recursivo
            urls.extend(list_urls(pattern.url_patterns, prefix + str(pattern.pattern)))
        else:
            # Es una URL final
            urls.append(prefix + str(pattern.pattern))
    return urls

resolver = get_resolver()
all_urls = list_urls(resolver.url_patterns)

# Filtrar solo las de reports
report_urls = [url for url in all_urls if 'reports/' in url]

print("\n📋 URLs de REPORTS registradas:")
print("="*60)
for url in sorted(report_urls):
    print(f"  {url}")

print(f"\n✅ Total de URLs de reports: {len(report_urls)}")

# Buscar específicamente bookings-report
bookings_urls = [url for url in all_urls if 'bookings-report' in url]
if bookings_urls:
    print(f"\n🎯 URLs con 'bookings-report': {len(bookings_urls)}")
    for url in bookings_urls:
        print(f"  ✓ {url}")
else:
    print("\n❌ NO se encontró ninguna URL con 'bookings-report'")
