from django.test import TestCase
from django.contrib.auth import get_user_model
from django.urls import reverse

class UserModelTests(TestCase):
	def setUp(self):
		self.User = get_user_model()
		self.user = self.User.objects.create_user(
			username='testuser',
			email='testuser@example.com',
			password='testpass123',
			role='nanny'
		)

	def test_user_creation(self):
		self.assertEqual(self.user.username, 'testuser')
		self.assertEqual(self.user.email, 'testuser@example.com')
		self.assertTrue(self.user.check_password('testpass123'))
		self.assertEqual(self.user.role, 'nanny')

	def test_authentication(self):
		login = self.client.login(username='testuser', password='testpass123')
		self.assertTrue(login)

	def test_role_based_access(self):
		# Example: check if user has correct role
		self.assertEqual(self.user.role, 'nanny')
