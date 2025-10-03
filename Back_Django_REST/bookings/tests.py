from django.test import TestCase
from django.contrib.auth import get_user_model
from django.utils import timezone
from .models import Booking, Availability, Notification
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

    def test_notification_creation(self):
        notif = Notification.objects.create(
            user=self.user,
            message="Nueva reserva creada"
        )
        self.assertFalse(notif.is_read)
        self.assertIn("Nueva reserva", notif.message)
