#!/usr/bin/env python
"""
Script para generar un SECRET_KEY seguro para Django.
Uso: python generate_secret_key.py
"""

from django.core.management.utils import get_random_secret_key

if __name__ == "__main__":
    secret_key = get_random_secret_key()
    print("\n" + "="*70)
    print("🔐 NUEVO SECRET_KEY GENERADO")
    print("="*70)
    print(f"\n{secret_key}\n")
    print("="*70)
    print("📋 Copia este valor en Railway:")
    print("   Railway → Tu Servicio → Variables → SECRET_KEY")
    print("="*70)
    print("\n⚠️  IMPORTANTE:")
    print("   - NO commitear este valor en Git")
    print("   - NO compartir públicamente")
    print("   - Usar SOLO en producción")
    print("="*70 + "\n")
