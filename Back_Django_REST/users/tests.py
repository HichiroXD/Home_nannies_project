from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from users.models import CustomUser

class UserTests(TestCase):
    def setUp(self):
        self.client = APIClient()

    def test_create_user_model(self):
        user = CustomUser.objects.create_user(
            email="test@localhost.cl",
            password="secure123"
        )
        self.assertEqual(user.email, "test@localhost.cl")
        self.assertTrue(user.check_password("secure123"))

    def test_register_user(self):
        response = self.client.post(reverse('user-register'), {
            "email": "new@localhost.cl",
            "password": "Password123!",
            "confirm_password": "Password123!"
        }, format="json")
        self.assertEqual(response.status_code, 201)

    def test_login_user(self):
        self.client.post(reverse('user-register'), {
            "email": "login@localhost.cl",
            "password": "LoginPass123!",
            "confirm_password": "LoginPass123!"
        }, format="json")
        response = self.client.post("/api/token/", {
            "email": "login@localhost.cl",
            "password": "LoginPass123!"
        }, format="json")
        self.assertEqual(response.status_code, 200)
        self.assertIn("access", response.data)

    def test_protected_endpoint_requires_authentication(self):
        response = self.client.get("/api/users/me/")
        self.assertEqual(response.status_code, 401)
