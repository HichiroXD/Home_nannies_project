from django.test import TestCase
from users.models import User
from .models import ParentProfile


class ParentProfileTestCase(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username='testparent',
            email='parent@test.com',
            password='testpass123',
            role='parent'
        )
    
    def test_parent_profile_created_automatically(self):
        """Verifica que ParentProfile se crea automáticamente"""
        self.assertTrue(hasattr(self.user, 'parent_profile'))
        self.assertIsNotNone(self.user.parent_profile)
    
    def test_parent_profile_default_values(self):
        """Verifica valores por defecto"""
        profile = self.user.parent_profile
        self.assertEqual(profile.children_count, 1)
        self.assertEqual(profile.phone, '')
    
    def test_parent_profile_str(self):
        """Verifica representación en string"""
        profile = self.user.parent_profile
        self.assertIn(self.user.username, str(profile))
