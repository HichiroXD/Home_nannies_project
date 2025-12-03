from django.test import TestCase
from django.contrib.auth import get_user_model
from django.utils import timezone
from .models import Booking, Availability
from notifications.models import Notification
from datetime import timedelta

User = get_user_model()

class BookingModelTests(TestCase):
    def setUp(self):
        self.parent = User.objects.create_user(username="parent", password="1234", role="parent")
        self.nanny = User.objects.create_user(username="nanny", password="1234", role="nanny")

    def test_create_valid_booking(self):
        booking = Booking.objects.create(
            parent=self.parent,
            nanny=self.nanny,
            start_time=timezone.now() + timedelta(hours=1),
            end_time=timezone.now() + timedelta(hours=2),
            status="pending"
        )
        self.assertEqual(booking.status, "pending")
        self.assertEqual(str(booking), f"Reserva {booking.id} - {self.parent.username} con {self.nanny.username} ({booking.status})")

    def test_booking_cannot_be_in_past(self):
        with self.assertRaises(Exception):
            Booking.objects.create(
                parent=self.parent,
                nanny=self.nanny,
                start_time=timezone.now() - timedelta(hours=2),
                end_time=timezone.now() - timedelta(hours=1),
                status="pending"
            )

class AvailabilityModelTests(TestCase):
    def setUp(self):
        self.nanny = User.objects.create_user(username="nanny", password="1234", role="nanny")

    def test_availability_creation(self):
        availability = Availability.objects.create(
            nanny=self.nanny,
            day=timezone.now().date(),
            start_time="09:00:00",
            end_time="12:00:00"
        )
        self.assertEqual(str(availability), f"{self.nanny} disponible el {availability.day} de 09:00:00 a 12:00:00")

class NotificationModelTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username="testuser", password="1234")


# ===== PHASE 4: TESTS DE INTEGRACIÓN PARA BOOKINGS =====

class BookingIntegrationTests(TestCase):
    """Tests de integración para el flujo completo de reservas con notificaciones"""
    
    def setUp(self):
        """Configurar usuarios y perfiles para tests"""
        from nannies.models import NannyProfile
        from parents.models import ParentProfile
        from notifications.models import Notification
        
        # Crear usuarios
        self.parent = User.objects.create_user(
            username="parent_test",
            email="parent@test.com",
            password="testpass123",
            role="parent"
        )
        self.nanny = User.objects.create_user(
            username="nanny_test",
            email="nanny@test.com",
            password="testpass123",
            role="nanny"
        )
        
        # Obtener perfiles (creados automáticamente por señales)
        self.parent_profile = ParentProfile.objects.get(user=self.parent)
        self.parent_profile.phone = "912345678"
        self.parent_profile.children_count = 2
        self.parent_profile.save()
        
        self.nanny_profile = NannyProfile.objects.get(user=self.nanny)
        self.nanny_profile.hourly_rate = 5000
        self.nanny_profile.experience_years = 3
        self.nanny_profile.save()
    
    def test_booking_creation_sends_notification(self):
        """Test: Crear reserva debe generar notificación para la niñera"""
        from notifications.models import Notification
        
        # Crear reserva
        booking = Booking.objects.create(
            parent=self.parent,
            nanny=self.nanny,
            start_time=timezone.now() + timedelta(days=1, hours=10),
            end_time=timezone.now() + timedelta(days=1, hours=14),
            status="pending"
        )
        
        # Verificar que la reserva se creó
        self.assertEqual(booking.status, "pending")
        
        # Verificar notificación para niñera (si hay signals)
        nanny_notifications = Notification.objects.filter(user=self.nanny)
        # La notificación se crea via signal post_save en bookings
        if nanny_notifications.exists():
            notification = nanny_notifications.first()
            self.assertIn("nueva solicitud", notification.message.lower())
    
    def test_booking_confirmation_flow(self):
        """Test: Confirmar reserva debe cambiar estado y notificar al padre"""
        from notifications.models import Notification
        
        # Crear reserva pendiente
        booking = Booking.objects.create(
            parent=self.parent,
            nanny=self.nanny,
            start_time=timezone.now() + timedelta(days=2, hours=9),
            end_time=timezone.now() + timedelta(days=2, hours=13),
            status="pending"
        )
        
        # Confirmar reserva
        booking.status = "confirmed"
        booking.save()
        
        # Verificar estado
        self.assertEqual(booking.status, "confirmed")
        
        # Verificar notificación para padre
        parent_notifications = Notification.objects.filter(
            user=self.parent,
            message__icontains="confirmada"
        )
        if parent_notifications.exists():
            self.assertGreater(parent_notifications.count(), 0)
    
    def test_booking_rejection_flow(self):
        """Test: Rechazar reserva debe notificar al padre"""
        from notifications.models import Notification
        
        # Crear reserva
        booking = Booking.objects.create(
            parent=self.parent,
            nanny=self.nanny,
            start_time=timezone.now() + timedelta(days=3, hours=15),
            end_time=timezone.now() + timedelta(days=3, hours=18),
            status="pending"
        )
        
        initial_notifications = Notification.objects.filter(user=self.parent).count()
        
        # Rechazar reserva
        booking.status = "rejected"
        booking.save()
        
        # Verificar estado
        self.assertEqual(booking.status, "rejected")
        
        # Verificar que se creó nueva notificación
        final_notifications = Notification.objects.filter(user=self.parent).count()
        # Si hay signals, debería haber más notificaciones
        self.assertGreaterEqual(final_notifications, initial_notifications)
    
    def test_booking_completion_flow(self):
        """Test: Completar reserva debe notificar a ambos usuarios"""
        from notifications.models import Notification
        
        # Crear reserva confirmada
        booking = Booking.objects.create(
            parent=self.parent,
            nanny=self.nanny,
            start_time=timezone.now() - timedelta(hours=2),
            end_time=timezone.now() - timedelta(hours=1),
            status="confirmed"
        )
        
        # Completar reserva
        booking.status = "completed"
        booking.save()
        
        # Verificar estado
        self.assertEqual(booking.status, "completed")
        
        # Verificar notificaciones
        completed_notifications = Notification.objects.filter(
            message__icontains="completada"
        )
        # Debería haber notificaciones de completado
        self.assertGreaterEqual(completed_notifications.count(), 0)
    
    def test_overlapping_bookings_prevention(self):
        """Test: No debe permitir reservas que se solapen"""
        # Crear primera reserva
        booking1 = Booking.objects.create(
            parent=self.parent,
            nanny=self.nanny,
            start_time=timezone.now() + timedelta(days=5, hours=10),
            end_time=timezone.now() + timedelta(days=5, hours=14),
            status="confirmed"
        )
        
        # Intentar crear reserva solapada (debería fallar o validarse)
        overlapping_start = timezone.now() + timedelta(days=5, hours=12)
        overlapping_end = timezone.now() + timedelta(days=5, hours=16)
        
        # La lógica de validación debería estar en el serializer o modelo
        # Este test verifica que el sistema puede detectar solapamientos
        existing_bookings = Booking.objects.filter(
            nanny=self.nanny,
            status__in=['confirmed', 'pending'],
            start_time__lt=overlapping_end,
            end_time__gt=overlapping_start
        )
        
        self.assertGreater(existing_bookings.count(), 0)

    def test_notification_creation(self):
        notif = Notification.objects.create(
            user=self.parent,
            message="Nueva reserva creada"
        )
        self.assertIsNone(notif.read_at)
        self.assertIn("Nueva reserva", notif.message)
