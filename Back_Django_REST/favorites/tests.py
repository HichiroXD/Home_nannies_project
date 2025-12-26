from django.test import TestCase
from django.contrib.auth import get_user_model
from django.db import IntegrityError
from rest_framework.test import APITestCase
from rest_framework import status
from .models import Favorite
from nannies.models import NannyProfile
from parents.models import ParentProfile

User = get_user_model()


class FavoriteModelTests(TestCase):
    """Tests para el modelo Favorite"""

    def setUp(self):
        """Configuración inicial para cada test"""
        # Crear padre
        self.parent_user = User.objects.create_user(
            username='parent_test',
            email='parent@test.com',
            password='TestPass123!',
            role='parent'
        )
        self.parent_profile = ParentProfile.objects.get(user=self.parent_user)
        
        # Crear niñera
        self.nanny_user = User.objects.create_user(
            username='nanny_test',
            email='nanny@test.com',
            password='TestPass123!',
            role='nanny'
        )
        self.nanny_profile = NannyProfile.objects.get(user=self.nanny_user)

    def test_create_favorite(self):
        """Test: Crear favorito correctamente"""
        favorite = Favorite.objects.create(
            parent=self.parent_user,
            nanny=self.nanny_profile
        )
        
        self.assertEqual(favorite.parent, self.parent_user)
        self.assertEqual(favorite.nanny, self.nanny_profile)
        self.assertIsNotNone(favorite.created_at)

    def test_favorite_str_representation(self):
        """Test: Representación string del favorito"""
        favorite = Favorite.objects.create(
            parent=self.parent_user,
            nanny=self.nanny_profile
        )
        expected = f"parent_test ❤️ nanny_test"
        self.assertEqual(str(favorite), expected)

    def test_prevent_duplicate_favorites(self):
        """Test: No permitir favoritos duplicados (unique_together)"""
        Favorite.objects.create(
            parent=self.parent_user,
            nanny=self.nanny_profile
        )
        
        with self.assertRaises(IntegrityError):
            Favorite.objects.create(
                parent=self.parent_user,
                nanny=self.nanny_profile
            )

    def test_multiple_favorites_for_parent(self):
        """Test: Un padre puede tener múltiples favoritos"""
        nanny_user2 = User.objects.create_user(
            username='nanny_test2',
            email='nanny2@test.com',
            password='TestPass123!',
            role='nanny'
        )
        nanny_profile2 = NannyProfile.objects.get(user=nanny_user2)
        
        Favorite.objects.create(parent=self.parent_user, nanny=self.nanny_profile)
        Favorite.objects.create(parent=self.parent_user, nanny=nanny_profile2)
        
        favorites_count = Favorite.objects.filter(parent=self.parent_user).count()
        self.assertEqual(favorites_count, 2)

    def test_delete_parent_deletes_favorites(self):
        """Test: Eliminar padre elimina sus favoritos (CASCADE)"""
        favorite = Favorite.objects.create(
            parent=self.parent_user,
            nanny=self.nanny_profile
        )
        favorite_id = favorite.id
        
        self.parent_user.delete()
        
        with self.assertRaises(Favorite.DoesNotExist):
            Favorite.objects.get(id=favorite_id)

    def test_delete_nanny_deletes_favorites(self):
        """Test: Eliminar niñera elimina favoritos que la referencian (CASCADE)"""
        favorite = Favorite.objects.create(
            parent=self.parent_user,
            nanny=self.nanny_profile
        )
        favorite_id = favorite.id
        
        self.nanny_profile.delete()
        
        with self.assertRaises(Favorite.DoesNotExist):
            Favorite.objects.get(id=favorite_id)

    def test_related_name_favorites(self):
        """Test: Related name 'favorites' funciona desde User"""
        Favorite.objects.create(parent=self.parent_user, nanny=self.nanny_profile)
        
        favorites = self.parent_user.favorites.all()
        self.assertEqual(favorites.count(), 1)
        self.assertEqual(favorites.first().nanny, self.nanny_profile)

    def test_related_name_favorited_by(self):
        """Test: Related name 'favorited_by' funciona desde NannyProfile"""
        Favorite.objects.create(parent=self.parent_user, nanny=self.nanny_profile)
        
        favorited_by = self.nanny_profile.favorited_by.all()
        self.assertEqual(favorited_by.count(), 1)
        self.assertEqual(favorited_by.first().parent, self.parent_user)
