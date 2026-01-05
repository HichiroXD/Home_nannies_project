#!/usr/bin/env python
"""
Profiler detallado de startup de Django
"""
import time
import os
import sys

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'django_crud_api.settings')

print("=" * 70)
print("PROFILER DETALLADO DE STARTUP - Backend Optimization")
print("=" * 70)

# 1. Importar os
t1 = time.time()
import os as os_module
print(f"✓ Import os:                  {(time.time()-t1)*1000:.1f}ms")

# 2. Importar sys
t1 = time.time()
import sys as sys_module
print(f"✓ Import sys:                 {(time.time()-t1)*1000:.1f}ms")

# 3. Importar django
t1 = time.time()
import django
print(f"✓ Import django:              {(time.time()-t1)*1000:.1f}ms")

# 4. Importar django.apps
t1 = time.time()
from django.apps import apps
print(f"✓ Import django.apps:         {(time.time()-t1)*1000:.1f}ms")

# 5. Setup Django
t1 = time.time()
django.setup()
print(f"✓ Django.setup():             {(time.time()-t1)*1000:.1f}ms")

# 6. Cargar configuración
t1 = time.time()
from django.conf import settings
print(f"✓ Load settings:              {(time.time()-t1)*1000:.1f}ms")

# 7. Obtener aplicaciones
t1 = time.time()
installed_apps = apps.get_app_configs()
print(f"✓ Get app configs ({len(list(installed_apps))} apps):  {(time.time()-t1)*1000:.1f}ms")

# 8. Cargar todos los modelos
t1 = time.time()
all_models = apps.get_models()
print(f"✓ Get models ({len(all_models)} models):     {(time.time()-t1)*1000:.1f}ms")

# 9. Listar apps lenta
print(f"\nAplicaciones ({len(settings.INSTALLED_APPS)} apps):")
t_app_start = time.time()
for app in settings.INSTALLED_APPS:
    t1 = time.time()
    try:
        app_config = apps.get_app_config(app.split('.')[-1])
        elapsed = (time.time()-t1)*1000
        if elapsed > 10:
            print(f"  ⚠️  {app:40} {elapsed:6.1f}ms (LENTO)")
    except:
        pass

print(f"\nConfiguraciones cargadas:")
print(f"  - DEBUG:                {settings.DEBUG}")
print(f"  - INSTALLED_APPS:       {len(settings.INSTALLED_APPS)}")
print(f"  - PASSWORD_HASHERS:     {len(settings.PASSWORD_HASHERS)}")
print(f"  - AUTH_VALIDATORS:      {len(settings.AUTH_PASSWORD_VALIDATORS)}")
print(f"  - MIDDLEWARE:           {len(settings.MIDDLEWARE)}")

print("\n✓ Profiler completado")
