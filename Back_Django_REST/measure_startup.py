#!/usr/bin/env python
"""
Script para medir tiempo de startup de Django
"""
import time
import os
import sys

# Configurar Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'django_crud_api.settings')

print("=" * 60)
print("MEDICIÓN DE STARTUP DE DJANGO - Backend Optimization")
print("=" * 60)

# Medir tiempo de importación de Django
start_time = time.time()
import django
import_time = time.time() - start_time
print(f"✓ Import Django: {import_time:.3f}s")

# Medir tiempo de setup
setup_start = time.time()
django.setup()
setup_time = time.time() - setup_start
print(f"✓ Django setup(): {setup_time:.3f}s")

# Medir tiempo de importación de modelos
models_start = time.time()
from django.apps import apps
apps.get_models()
models_time = time.time() - models_start
print(f"✓ Load models: {models_time:.3f}s")

# Total
total_time = time.time() - start_time
print("\n" + "=" * 60)
print(f"TIEMPO TOTAL DE STARTUP: {total_time:.3f}s")
print("=" * 60)

# Detalles
print(f"\nDesglose:")
print(f"  - Import Django:    {import_time:.3f}s ({import_time/total_time*100:.1f}%)")
print(f"  - Setup:            {setup_time:.3f}s ({setup_time/total_time*100:.1f}%)")
print(f"  - Load models:      {models_time:.3f}s ({models_time/total_time*100:.1f}%)")

# Información de configuración
print(f"\nConfiguración:")
from django.conf import settings
print(f"  - DEBUG:            {settings.DEBUG}")
print(f"  - INSTALLED_APPS:   {len(settings.INSTALLED_APPS)} apps")
print(f"  - PASSWORD_HASHERS: {len(settings.PASSWORD_HASHERS)} hashers")
print(f"  - AUTH_VALIDATORS:  {len(settings.AUTH_PASSWORD_VALIDATORS)} validators")

print("\n✓ Startup completado exitosamente")
