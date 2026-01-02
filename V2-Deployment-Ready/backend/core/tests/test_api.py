from django.urls import reverse
from rest_framework.test import APITestCase
from core.models import User

class UserAPITest(APITestCase):
    def setUp(self):
        self.admin = User.objects.create_user(username='admin', password='adminpass', role='admin')

    def test_user_list_requires_auth(self):
        url = reverse('user-list')
        response = self.client.get(url)
        self.assertEqual(response.status_code, 401)

    def test_user_list_with_admin(self):
        self.client.login(username='admin', password='adminpass')
        url = reverse('user-list')
        response = self.client.get(url)
        self.assertEqual(response.status_code, 200)
