"""
Verificar bookings y sus datos de niñera
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'django_crud_api.settings')
django.setup()

from bookings.models import Booking
from nannies.models import NannyProfile
import json

print("=" * 60)
print("VERIFICACIÓN DE BOOKINGS Y DATOS DE NIÑERA")
print("=" * 60)

bookings = Booking.objects.all()[:10]
print(f"\nTotal de bookings (mostrando primeras 10): {Booking.objects.count()}")

for booking in bookings:
    print(f"\nBooking ID: {booking.id}")
    print(f"  Parent: {booking.parent.username}")
    print(f"  Nanny User: {booking.nanny.username} (ID: {booking.nanny.id})")
    print(f"  Status: {booking.status}")
    
    try:
        nanny_profile = NannyProfile.objects.get(user=booking.nanny)
        print(f"  ✓ Nanny Profile ID: {nanny_profile.id}")
    except NannyProfile.DoesNotExist:
        print(f"  ✗ NO TIENE PERFIL DE NIÑERA")
    except Exception as e:
        print(f"  ✗ ERROR: {e}")

print("\n" + "=" * 60)

# Probar serialización
print("\nPROBANDO SERIALIZACIÓN DE UN BOOKING:")
print("=" * 60)

from bookings.serializer import BookingSerializer

if bookings:
    booking = bookings[0]
    serializer = BookingSerializer(booking)
    data = serializer.data
    
    print(f"\nBooking ID: {data['id']}")
    print(f"Nanny data:")
    print(json.dumps(data['nanny'], indent=2))
    
    nanny_profile_id = data['nanny'].get('nanny_profile_id')
    if nanny_profile_id:
        print(f"\n✓ nanny_profile_id presente: {nanny_profile_id}")
    else:
        print(f"\n✗ nanny_profile_id es NULL o no existe")

print("\n" + "=" * 60)
print("VERIFICACIÓN COMPLETADA")
print("=" * 60)
