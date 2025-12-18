from django.test import TestCase
from django.contrib.auth import get_user_model
from django.db import IntegrityError
from decimal import Decimal
from .models import NannyProfile

User = get_user_model()


class NannyProfileModelTests(TestCase):
    """Tests para el modelo NannyProfile"""

    def setUp(self):
        """Configuración inicial para cada test"""
        self.user = User.objects.create_user(
            username='nanny_test',
            email='nanny@test.com',
            password='TestPass123!',
            role='nanny',
            first_name='María',
            last_name='González'
        )

    def test_create_nanny_profile(self):
        """Test: Crear perfil de niñera correctamente"""
        profile = NannyProfile.objects.create(
            user=self.user,
            experience_years=5,
            hourly_rate=15000,
            description='Niñera con experiencia en niños de 0-5 años',
            age=28
        )
        
        self.assertEqual(profile.user, self.user)
        self.assertEqual(profile.experience_years, 5)
        self.assertEqual(profile.hourly_rate, 15000)
        self.assertEqual(profile.age, 28)
        self.assertFalse(profile.verified)
        self.assertEqual(profile.rating_avg, Decimal('0.0'))

    def test_nanny_profile_str_representation(self):
        """Test: Representación string del perfil"""
        profile = NannyProfile.objects.create(
            user=self.user,
            hourly_rate=12000
        )
        expected = f"María González - $12000/hr"
        self.assertEqual(str(profile), expected)

    def test_nanny_profile_role_property(self):
        """Test: Propiedad role retorna el rol del usuario"""
        profile = NannyProfile.objects.create(user=self.user)
        self.assertEqual(profile.role, 'nanny')

    def test_unique_nanny_profile_per_user(self):
        """Test: No permitir múltiples perfiles para el mismo usuario"""
        NannyProfile.objects.create(user=self.user)
        
        with self.assertRaises(IntegrityError):
            NannyProfile.objects.create(user=self.user)

    def test_default_values(self):
        """Test: Valores por defecto del perfil"""
        profile = NannyProfile.objects.create(user=self.user)
        
        self.assertEqual(profile.experience_years, 0)
        self.assertEqual(profile.hourly_rate, 0)
        self.assertEqual(profile.description, '')
        self.assertFalse(profile.verified)
        self.assertEqual(profile.certifications, '')
        self.assertEqual(profile.rating_avg, Decimal('0.0'))
        self.assertFalse(profile.profile_photo)

    def test_update_nanny_profile(self):
        """Test: Actualizar perfil de niñera"""
        profile = NannyProfile.objects.create(
            user=self.user,
            hourly_rate=10000
        )
        
        profile.hourly_rate = 15000
        profile.experience_years = 3
        profile.verified = True
        profile.save()
        
        updated_profile = NannyProfile.objects.get(user=self.user)
        self.assertEqual(updated_profile.hourly_rate, 15000)
        self.assertEqual(updated_profile.experience_years, 3)
        self.assertTrue(updated_profile.verified)

    def test_delete_user_deletes_profile(self):
        """Test: Eliminar usuario elimina el perfil (CASCADE)"""
        profile = NannyProfile.objects.create(user=self.user)
        profile_id = profile.id
        
        self.user.delete()
        
        with self.assertRaises(NannyProfile.DoesNotExist):
            NannyProfile.objects.get(id=profile_id)
