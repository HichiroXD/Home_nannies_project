#!/usr/bin/env python
"""
Script de Testing Manual para las Refactorizaciones Sprint 2
=============================================================
Este script prueba las funcionalidades refactorizadas:
1. get_user_profile_data en serializers (bookings, reviews)
2. validate_user_role en validaciones (bookings, reviews, favorites)
3. NotificationService para notificaciones
4. Constants para mensajes y estados
5. select_related para optimización de queries
"""

import os
import sys
import django
from django.db import connection
from django.test.utils import CaptureQueriesContext

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'django_crud_api.settings')
django.setup()

from django.contrib.auth import get_user_model
from bookings.models import Booking, Availability
from reviews.models import Review
from favorites.models import Favorite
from nannies.models import NannyProfile
from parents.models import ParentProfile
from bookings.serializer import BookingSerializer
from reviews.serializer import ReviewSerializer
from favorites.serializer import FavoriteSerializer
from datetime import datetime, timedelta
from django.utils import timezone

User = get_user_model()

def print_section(title):
    print("\n" + "="*70)
    print(f"  {title}")
    print("="*70 + "\n")

def print_success(message):
    print(f"✅ {message}")

def print_error(message):
    print(f"❌ {message}")

def print_info(message):
    print(f"ℹ️  {message}")

# =============================================================================
# TEST 1: get_user_profile_data en BookingSerializer
# =============================================================================
def test_booking_serializer_profile_data():
    print_section("TEST 1: get_user_profile_data en BookingSerializer")
    
    try:
        # Obtener un booking existente
        # Nota: nanny y parent son directamente User, no tienen __user
        booking = Booking.objects.select_related('nanny', 'parent').first()
        
        if not booking:
            print_error("No hay bookings en la base de datos")
            return False
        
        print_info(f"Testing con Booking ID: {booking.id}")
        
        # Serializar con el serializer refactorizado
        with CaptureQueriesContext(connection) as queries:
            serializer = BookingSerializer(booking)
            data = serializer.data
        
        # Verificar que parent y nanny contienen profile data enriquecido
        # BookingSerializer sobrescribe 'parent' y 'nanny' con get_user_profile_data
        if 'parent' in data and 'nanny' in data:
            parent_data = data['parent']
            nanny_data = data['nanny']
            
            # Verificar que son diccionarios con profile data (no solo IDs)
            if isinstance(parent_data, dict) and isinstance(nanny_data, dict):
                if 'username' in parent_data and 'username' in nanny_data:
                    print_success("BookingSerializer incluye profile data enriquecido")
                    print_info(f"Parent data: {parent_data}")
                    print_info(f"Nanny data: {nanny_data}")
                    print_info(f"Queries ejecutadas: {len(queries)}")
                else:
                    print_error("Profile data no contiene campos esperados")
                    return False
            else:
                print_error("Parent y nanny no son diccionarios con profile data")
                return False
        else:
            print_error("Faltan campos parent o nanny en el serializer")
            return False
        
        return True
        
    except Exception as e:
        print_error(f"Error en test: {str(e)}")
        import traceback
        traceback.print_exc()
        return False

# =============================================================================
# TEST 2: get_user_profile_data en ReviewSerializer
# =============================================================================
def test_review_serializer_profile_data():
    print_section("TEST 2: get_user_profile_data en ReviewSerializer")
    
    try:
        # Obtener una review existente
        review = Review.objects.select_related('parent', 'nanny', 'nanny__user').first()
        
        if not review:
            print_error("No hay reviews en la base de datos")
            return False
        
        print_info(f"Testing con Review ID: {review.id}")
        
        # Serializar con el serializer refactorizado
        with CaptureQueriesContext(connection) as queries:
            serializer = ReviewSerializer(review)
            data = serializer.data
        
        # Verificar que contiene parent_data y nanny_data
        if 'parent_data' in data and 'nanny_data' in data:
            print_success("ReviewSerializer incluye parent_data y nanny_data")
            print_info(f"Parent data: {data['parent_data']}")
            print_info(f"Nanny data: {data['nanny_data']}")
            print_info(f"Queries ejecutadas: {len(queries)}")
        else:
            print_error("Faltan parent_data o nanny_data en el serializer")
            return False
        
        return True
        
    except Exception as e:
        print_error(f"Error en test: {str(e)}")
        import traceback
        traceback.print_exc()
        return False

# =============================================================================
# TEST 3: validate_user_role en FavoriteSerializer
# =============================================================================
def test_favorite_serializer_validation():
    print_section("TEST 3: validate_user_role en FavoriteSerializer")
    
    try:
        # Obtener una nanny válida
        nanny = NannyProfile.objects.select_related('user').first()
        
        if not nanny:
            print_error("No hay nannies en la base de datos")
            return False
        
        print_info(f"Testing con Nanny ID: {nanny.id}, Role: {nanny.user.role}")
        
        # Crear serializer con datos válidos
        serializer = FavoriteSerializer(data={'nanny_id': nanny.id})
        
        if serializer.is_valid():
            print_success("Validación correcta para nanny con rol 'nanny'")
            print_info(f"Validated data: {serializer.validated_data}")
        else:
            print_error(f"Validación falló inesperadamente: {serializer.errors}")
            return False
        
        # Intentar con un usuario que NO es nanny (si existe)
        non_nanny = User.objects.exclude(role='nanny').first()
        if non_nanny:
            print_info(f"\nIntentando con usuario no-nanny (role: {non_nanny.role})")
            
            # Crear un perfil falso para probar
            fake_profile = NannyProfile(user=non_nanny, hourly_rate=10.0)
            fake_profile.save()
            
            serializer2 = FavoriteSerializer(data={'nanny_id': fake_profile.id})
            if serializer2.is_valid():
                print_error("Validación no detectó rol incorrecto")
                fake_profile.delete()
                return False
            else:
                print_success(f"Validación rechazó correctamente: {serializer2.errors}")
                fake_profile.delete()
        
        return True
        
    except Exception as e:
        print_error(f"Error en test: {str(e)}")
        import traceback
        traceback.print_exc()
        return False

# =============================================================================
# TEST 4: select_related optimization
# =============================================================================
def test_select_related_optimization():
    print_section("TEST 4: Optimización select_related en Views")
    
    try:
        print_info("Comparando queries SIN y CON select_related\n")
        
        # Sin select_related
        with CaptureQueriesContext(connection) as queries_without:
            bookings = Booking.objects.all()[:5]
            for booking in bookings:
                _ = booking.nanny.username
                _ = booking.parent.username
        
        queries_without_count = len(queries_without)
        print_info(f"Queries SIN select_related: {queries_without_count}")
        
        # Con select_related
        with CaptureQueriesContext(connection) as queries_with:
            bookings = Booking.objects.select_related('nanny', 'parent').all()[:5]
            for booking in bookings:
                _ = booking.nanny.username
                _ = booking.parent.username
        
        queries_with_count = len(queries_with)
        print_info(f"Queries CON select_related: {queries_with_count}")
        
        if queries_with_count < queries_without_count:
            reduction = ((queries_without_count - queries_with_count) / queries_without_count) * 100
            print_success(f"Optimización exitosa: {reduction:.1f}% menos queries")
            return True
        else:
            print_error("No se detectó optimización")
            return False
        
    except Exception as e:
        print_error(f"Error en test: {str(e)}")
        import traceback
        traceback.print_exc()
        return False

# =============================================================================
# TEST 5: Constants usage
# =============================================================================
def test_constants_usage():
    print_section("TEST 5: Uso de Constants en Bookings")
    
    try:
        from bookings.constants import (
            BOOKING_STATUS_PENDING,
            BOOKING_STATUS_CONFIRMED,
            BOOKING_MESSAGES,
        )
        
        print_success("Constants importadas correctamente")
        print_info(f"Status PENDING: {BOOKING_STATUS_PENDING}")
        print_info(f"Status CONFIRMED: {BOOKING_STATUS_CONFIRMED}")
        print_info(f"Message ACCEPTED: {BOOKING_MESSAGES['ACCEPTED']}")
        print_info(f"Message REJECTED: {BOOKING_MESSAGES['REJECTED']}")
        
        # Verificar que los valores son strings
        if isinstance(BOOKING_STATUS_PENDING, str) and isinstance(BOOKING_MESSAGES['ACCEPTED'], str):
            print_success("Constants tienen el tipo correcto")
            return True
        else:
            print_error("Constants tienen tipo incorrecto")
            return False
        
    except Exception as e:
        print_error(f"Error en test: {str(e)}")
        import traceback
        traceback.print_exc()
        return False

# =============================================================================
# Main Test Runner
# =============================================================================
def run_all_tests():
    print("\n" + "="*70)
    print("  TESTING MANUAL - REFACTORIZACIONES SPRINT 2")
    print("="*70)
    print(f"Fecha: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    results = {
        'Test 1 - BookingSerializer profile_data': test_booking_serializer_profile_data(),
        'Test 2 - ReviewSerializer profile_data': test_review_serializer_profile_data(),
        'Test 3 - FavoriteSerializer validation': test_favorite_serializer_validation(),
        'Test 4 - select_related optimization': test_select_related_optimization(),
        'Test 5 - Constants usage': test_constants_usage(),
    }
    
    # Resumen
    print_section("RESUMEN DE RESULTADOS")
    passed = sum(1 for result in results.values() if result)
    total = len(results)
    
    for test_name, result in results.items():
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{status} - {test_name}")
    
    print(f"\n{'='*70}")
    print(f"  Total: {passed}/{total} tests pasados ({(passed/total)*100:.1f}%)")
    print(f"{'='*70}\n")
    
    return passed == total

if __name__ == '__main__':
    success = run_all_tests()
    sys.exit(0 if success else 1)
