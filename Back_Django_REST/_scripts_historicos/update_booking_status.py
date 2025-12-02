"""
Script para actualizar estados de reservas para testing
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'django_crud_api.settings')
django.setup()

from bookings.models import Booking
from django.contrib.auth import get_user_model

User = get_user_model()

def show_bookings():
    """Mostrar todas las reservas"""
    bookings = Booking.objects.all().select_related('parent', 'nanny')
    
    if not bookings.exists():
        print("❌ No hay reservas en la base de datos")
        return
    
    print("\n📋 RESERVAS EXISTENTES:")
    print("-" * 80)
    for b in bookings:
        print(f"ID: {b.id} | Padre: {b.parent.username} | Niñera: {b.nanny.username}")
        print(f"Estado: {b.status} | Fecha: {b.start_time.strftime('%Y-%m-%d %H:%M')}")
        print("-" * 80)

def update_booking_status():
    """Actualizar estado de una reserva"""
    show_bookings()
    
    try:
        booking_id = input("\n🔢 Ingresa el ID de la reserva a actualizar (o 'q' para salir): ").strip()
        
        if booking_id.lower() == 'q':
            return
        
        booking = Booking.objects.get(id=int(booking_id))
        
        print(f"\n📌 Reserva #{booking.id}")
        print(f"Estado actual: {booking.status}")
        print("\n🎯 Estados disponibles:")
        print("1. pending (Pendiente)")
        print("2. confirmed (Confirmada)")
        print("3. completed (Completada)")
        print("4. cancelled (Cancelada)")
        print("5. rejected (Rechazada)")
        
        choice = input("\nSelecciona el nuevo estado (1-5): ").strip()
        
        status_map = {
            '1': 'pending',
            '2': 'confirmed',
            '3': 'completed',
            '4': 'cancelled',
            '5': 'rejected'
        }
        
        if choice not in status_map:
            print("❌ Opción inválida")
            return
        
        new_status = status_map[choice]
        booking.status = new_status
        booking.save()
        
        print(f"\n✅ Reserva #{booking.id} actualizada a: {new_status}")
        
    except Booking.DoesNotExist:
        print("❌ Reserva no encontrada")
    except ValueError:
        print("❌ ID inválido")
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    print("=" * 80)
    print("🔧 HERRAMIENTA DE ACTUALIZACIÓN DE ESTADOS DE RESERVAS")
    print("=" * 80)
    
    while True:
        print("\n1. Ver todas las reservas")
        print("2. Actualizar estado de una reserva")
        print("3. Salir")
        
        option = input("\nSelecciona una opción: ").strip()
        
        if option == '1':
            show_bookings()
        elif option == '2':
            update_booking_status()
        elif option == '3':
            print("\n👋 ¡Hasta luego!")
            break
        else:
            print("❌ Opción inválida")
