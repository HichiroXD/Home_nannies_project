import os
import sys

# Configurar Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'django_crud_api.settings')
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

import django
django.setup()

from django.urls import get_resolver, resolve
from django.urls.resolvers import URLResolver, URLPattern

def list_all_urls(resolver=None, prefix=''):
    """Lista todas las URLs registradas recursivamente"""
    if resolver is None:
        resolver = get_resolver()
    
    urls = []
    for pattern in resolver.url_patterns:
        if isinstance(pattern, URLResolver):
            # Es un include() - recursivo
            new_prefix = prefix + str(pattern.pattern)
            urls.extend(list_all_urls(pattern, new_prefix))
        elif isinstance(pattern, URLPattern):
            url = prefix + str(pattern.pattern)
            urls.append({
                'url': url,
                'name': pattern.name,
                'callback': pattern.callback
            })
    return urls

print("=" * 60)
print("TODAS LAS URLs REGISTRADAS")
print("=" * 60)

all_urls = list_all_urls()
for u in sorted(all_urls, key=lambda x: x['url']):
    if 'download' in u['url'].lower():
        print(f"✅ {u['url']} -> {u['name']}")

print("\n" + "=" * 60)
print("Probando resolve('/api/downloads/bookings/'):")
print("=" * 60)
try:
    result = resolve('/api/downloads/bookings/')
    print(f"  URL Name: {result.url_name}")
    print(f"  Func: {result.func}")
    print(f"  View Name: {result.view_name}")
except Exception as e:
    print(f"  ERROR: {e}")
