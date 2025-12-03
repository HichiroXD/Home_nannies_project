"""
Tests para las funcionalidades críticas de Sprint 3
- Suspensión de usuarios
- Privacidad de datos de niños
- Validadores de contraseñas seguras
"""

from django.test import TestCase
from django.contrib.auth import get_user_model
from django.urls import reverse
from django.core.exceptions import ValidationError
from rest_framework.test import APITestCase, APIClient
from rest_framework import status
from parents.models import ParentProfile, Child
from bookings.models import Booking
from nannies.models import NannyProfile
from core.validators import SymbolPasswordValidator
from datetime import datetime, timedelta

User = get_user_model()


class UserSuspensionTests(APITestCase):
    """Tests para la funcionalidad de suspensión de usuarios"""
    
    def setUp(self):
        # Crear admin
        self.admin = User.objects.create_user(
            username='admin',
            email='admin@test.com',
            password='AdminPass123!',
            role='admin',
            is_staff=True,
            is_verified=True
        )
        
        # Crear usuario normal
        self.user = User.objects.create_user(
            username='testuser',
            email='user@test.com',
            password='UserPass123!',
            role='parent',
            is_verified=True
        )
        
        self.client = APIClient()
    
    def test_admin_can_suspend_user(self):
        """Admin puede suspender usuarios"""
        self.client.force_authenticate(self.admin)
        
        url = reverse('suspend-user', kwargs={'user_id': self.user.id})
        data = {'reason': 'Violación de términos de servicio'}
        
        response = self.client.post(url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Verificar que el usuario fue suspendido
        self.user.refresh_from_db()
        self.assertTrue(self.user.is_suspended)
        self.assertFalse(self.user.is_active)
        self.assertEqual(self.user.suspension_reason, 'Violación de términos de servicio')
        self.assertEqual(self.user.suspended_by, self.admin)
    
    def test_cannot_suspend_admin(self):
        """No se puede suspender a otro admin"""
        admin2 = User.objects.create_user(
            username='admin2',
            email='admin2@test.com',
            password='AdminPass123!',
            role='admin',
            is_staff=True
        )
        
        self.client.force_authenticate(self.admin)
        url = reverse('suspend-user', kwargs={'user_id': admin2.id})
        
        response = self.client.post(url, {'reason': 'Test'}, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
    
    def test_non_admin_cannot_suspend(self):
        """Usuario no-admin no puede suspender"""
        self.client.force_authenticate(self.user)
        
        url = reverse('suspend-user', kwargs={'user_id': self.user.id})
        response = self.client.post(url, {'reason': 'Test'}, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
    
    def test_reactivate_suspended_user(self):
        """Admin puede reactivar usuario suspendido"""
        # Suspender usuario primero
        self.user.is_suspended = True
        self.user.is_active = False
        self.user.suspended_at = datetime.now()
        self.user.suspension_reason = 'Test'
        self.user.save()
        
        self.client.force_authenticate(self.admin)
        url = reverse('reactivate-user', kwargs={'user_id': self.user.id})
        
        response = self.client.post(url, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Verificar reactivación
        self.user.refresh_from_db()
        self.assertFalse(self.user.is_suspended)
        self.assertTrue(self.user.is_active)
        self.assertIsNone(self.user.suspended_at)
    
    def test_approve_pending_user(self):
        """Admin puede aprobar usuarios pendientes"""
        pending_user = User.objects.create_user(
            username='pending',
            email='pending@test.com',
            password='PendingPass123!',
            role='nanny',
            verification_status='pending',
            is_verified=False
        )
        
        self.client.force_authenticate(self.admin)
        url = reverse('approve-user', kwargs={'user_id': pending_user.id})
        
        response = self.client.post(url, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        pending_user.refresh_from_db()
        self.assertEqual(pending_user.verification_status, 'approved')
        self.assertTrue(pending_user.is_verified)


class ChildPrivacyTests(APITestCase):
    """Tests para privacidad de información de niños"""
    
    def setUp(self):
        # Crear padre
        self.parent = User.objects.create_user(
            username='parent',
            email='parent@test.com',
            password='ParentPass123!',
            role='parent',
            is_verified=True
        )
        self.parent_profile = ParentProfile.objects.create(
            user=self.parent,
            phone='+56912345678'
        )
        
        # Crear niñera
        self.nanny = User.objects.create_user(
            username='nanny',
            email='nanny@test.com',
            password='NannyPass123!',
            role='nanny',
            is_verified=True
        )
        self.nanny_profile = NannyProfile.objects.create(
            user=self.nanny,
            phone='+56987654321',
            hourly_rate=15000
        )
        
        # Crear hijo
        self.child = Child.objects.create(
            parent=self.parent_profile,
            name='Juan Pérez',
            age=5,
            allergies='Nueces, maní',
            medical_conditions='Asma leve',
            special_needs='Requiere inhalador',
        )
        
        # Crear booking pendiente
        self.booking = Booking.objects.create(
            parent=self.parent,
            nanny=self.nanny,
            start_time=datetime.now() + timedelta(days=1),
            end_time=datetime.now() + timedelta(days=1, hours=3),
            status='pending'
        )
        
        self.client = APIClient()
    
    def test_nanny_cannot_see_child_info_when_pending(self):
        """Niñera no ve info del niño cuando booking está pending"""
        self.client.force_authenticate(self.nanny)
        
        url = reverse('booking-detail', kwargs={'pk': self.booking.id})
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Verificar que no hay info del niño
        self.assertFalse(response.data.get('child_info_available', True))
        self.assertIn('privacy_message', response.data.get('child_privacy_message', '').lower())
    
    def test_nanny_can_see_child_info_when_confirmed(self):
        """Niñera ve info del niño cuando booking está confirmado"""
        # Confirmar booking
        self.booking.status = 'confirmed'
        self.booking.save()
        
        self.client.force_authenticate(self.nanny)
        
        url = reverse('booking-detail', kwargs={'pk': self.booking.id})
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Verificar que SÍ hay info del niño
        self.assertTrue(response.data.get('child_info_available', False))
        if 'children' in response.data:
            self.assertTrue(len(response.data['children']) > 0)
            child_data = response.data['children'][0]
            self.assertEqual(child_data['name'], 'Juan Pérez')
            self.assertEqual(child_data['age'], 5)
    
    def test_parent_always_sees_child_info(self):
        """Padre siempre ve info de sus hijos"""
        self.client.force_authenticate(self.parent)
        
        url = reverse('booking-detail', kwargs={'pk': self.booking.id})
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Padre ve la info incluso con booking pending
        self.assertTrue(response.data.get('child_info_available', False))


class PasswordValidatorTests(TestCase):
    """Tests para validadores de contraseñas seguras"""
    
    def test_password_requires_minimum_10_characters(self):
        """Contraseña debe tener mínimo 10 caracteres"""
        from django.contrib.auth.password_validation import validate_password
        
        # Contraseña de 9 caracteres debe fallar
        with self.assertRaises(ValidationError):
            validate_password('Short123!')
        
        # Contraseña de 10 caracteres debe pasar
        try:
            validate_password('LongPass123!')
        except ValidationError:
            self.fail("Contraseña de 10 caracteres no debería fallar")
    
    def test_password_requires_symbol(self):
        """Contraseña debe contener al menos un símbolo"""
        validator = SymbolPasswordValidator()
        
        # Sin símbolos debe fallar
        with self.assertRaises(ValidationError):
            validator.validate('Password123')
        
        # Con símbolo debe pasar
        try:
            validator.validate('Password123!')
        except ValidationError:
            self.fail("Contraseña con símbolo no debería fallar")
    
    def test_password_requires_uppercase_and_lowercase(self):
        """Contraseña debe tener mayúsculas y minúsculas"""
        from django.contrib.auth.password_validation import validate_password
        
        # Solo minúsculas debe fallar
        with self.assertRaises(ValidationError):
            validate_password('password123!')
        
        # Solo mayúsculas debe fallar
        with self.assertRaises(ValidationError):
            validate_password('PASSWORD123!')
        
        # Ambas debe pasar
        try:
            validate_password('Password123!')
        except ValidationError:
            self.fail("Contraseña con mayúsculas y minúsculas no debería fallar")
    
    def test_password_cannot_be_common(self):
        """Contraseña no puede ser común"""
        from django.contrib.auth.password_validation import validate_password
        
        common_passwords = [
            'Password123!',
            '12345678910!',
        ]
        
        for pwd in common_passwords:
            with self.assertRaises(ValidationError):
                validate_password(pwd)
    
    def test_user_creation_with_weak_password_fails(self):
        """Crear usuario con contraseña débil debe fallar"""
        from django.contrib.auth.password_validation import validate_password
        
        weak_passwords = [
            'short',  # Muy corta
            'nouppercaseornumber123!',  # Sin mayúsculas
            'NOLOWERCASE123!',  # Sin minúsculas
            'NoNumbers!!!',  # Sin números
            'NoSymbols123',  # Sin símbolos
        ]
        
        for pwd in weak_passwords:
            with self.assertRaises(ValidationError):
                validate_password(pwd)


class ChildModelTests(TestCase):
    """Tests para el modelo Child"""
    
    def setUp(self):
        self.parent_user = User.objects.create_user(
            username='parent',
            email='parent@test.com',
            password='ParentPass123!',
            role='parent'
        )
        self.parent_profile = ParentProfile.objects.create(
            user=self.parent_user
        )
    
    def test_create_child(self):
        """Se puede crear un hijo correctamente"""
        child = Child.objects.create(
            parent=self.parent_profile,
            name='María González',
            age=3,
            allergies='Lactosa',
            medical_conditions='Ninguna',
            special_needs='Dieta sin lácteos'
        )
        
        self.assertEqual(child.name, 'María González')
        self.assertEqual(child.age, 3)
        self.assertEqual(child.parent, self.parent_profile)
    
    def test_child_string_representation(self):
        """El __str__ del modelo Child funciona correctamente"""
        child = Child.objects.create(
            parent=self.parent_profile,
            name='Pedro López',
            age=7
        )
        
        expected_str = f"Pedro López (7 años) - Hijo de {self.parent_user.username}"
        self.assertEqual(str(child), expected_str)
    
    def test_parent_can_have_multiple_children(self):
        """Un padre puede tener múltiples hijos"""
        Child.objects.create(parent=self.parent_profile, name='Hijo 1', age=5)
        Child.objects.create(parent=self.parent_profile, name='Hijo 2', age=7)
        Child.objects.create(parent=self.parent_profile, name='Hijo 3', age=3)
        
        children = self.parent_profile.children.all()
        self.assertEqual(children.count(), 3)
