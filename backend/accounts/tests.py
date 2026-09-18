from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.authtoken.models import Token
from rest_framework.test import APITestCase

User = get_user_model()


class AuthAPITests(APITestCase):
    def test_register_returns_token_and_profile(self):
        response = self.client.post(
            '/api/auth/register/',
            {
                'username': 'bruna',
                'email': 'bruna@example.com',
                'password': 'SenhaForte123!',
                'password_confirm': 'SenhaForte123!',
            },
            format='json',
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn('token', response.data)
        self.assertEqual(response.data['user']['username'], 'bruna')
        self.assertEqual(
            response.data['user']['profile']['display_name'],
            'bruna',
        )
        self.assertTrue(
            Token.objects.filter(user__username='bruna').exists()
        )

    def test_login_success(self):
        User.objects.create_user(
            username='bruna',
            email='bruna@example.com',
            password='SenhaForte123!',
        )
        response = self.client.post(
            '/api/auth/login/',
            {'username': 'bruna', 'password': 'SenhaForte123!'},
            format='json',
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('token', response.data)

    def test_profile_partial_update(self):
        user = User.objects.create_user(
            username='bruna',
            email='bruna@example.com',
            password='SenhaForte123!',
        )
        token = Token.objects.create(user=user)
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {token.key}')

        response = self.client.patch(
            '/api/auth/profile/',
            {'display_name': 'Bruna S.'},
            format='json',
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(
            response.data['user']['profile']['display_name'],
            'Bruna S.',
        )
