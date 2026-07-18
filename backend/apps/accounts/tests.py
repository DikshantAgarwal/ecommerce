from unittest.mock import ANY, patch

from django.test import TestCase, override_settings
from rest_framework import status
from rest_framework.test import APIClient
from rest_framework_simplejwt.tokens import RefreshToken

from .models import User


class GoogleLoginAPIViewTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.url = '/api/auth/google/'

    @patch('apps.accounts.views.id_token.verify_oauth2_token')
    def test_google_login_creates_new_user(self, mock_verify):
        mock_verify.return_value = {
            'iss': 'accounts.google.com',
            'email': 'test@example.com',
            'name': 'Test User',
            'picture': 'https://example.com/avatar.jpg',
            'sub': '12345',
        }

        response = self.client.post(self.url, {'id_token': 'valid_token'}, format='json')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)
        self.assertIn('refresh', response.data)
        self.assertIn('user', response.data)
        self.assertEqual(response.data['user']['email'], 'test@example.com')
        self.assertEqual(response.data['user']['full_name'], 'Test User')
        self.assertEqual(response.data['user']['avatar'], 'https://example.com/avatar.jpg')
        self.assertTrue(User.objects.filter(email='test@example.com').exists())

    @patch('apps.accounts.views.id_token.verify_oauth2_token')
    def test_google_login_existing_user(self, mock_verify):
        User.objects.create_user(
            email='existing@example.com',
            full_name='Existing User',
        )

        mock_verify.return_value = {
            'iss': 'accounts.google.com',
            'email': 'existing@example.com',
            'name': 'Existing User Updated',
            'picture': 'https://example.com/new-avatar.jpg',
        }

        response = self.client.post(self.url, {'id_token': 'valid_token'}, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        user = User.objects.get(email='existing@example.com')
        self.assertEqual(user.full_name, 'Existing User Updated')
        self.assertEqual(user.avatar, 'https://example.com/new-avatar.jpg')

    @patch('apps.accounts.views.id_token.verify_oauth2_token')
    def test_google_login_existing_user_no_update_needed(self, mock_verify):
        User.objects.create_user(
            email='same@example.com',
            full_name='Same Name',
        )

        mock_verify.return_value = {
            'iss': 'accounts.google.com',
            'email': 'same@example.com',
            'name': 'Same Name',
            'picture': '',
        }

        response = self.client.post(self.url, {'id_token': 'valid_token'}, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_google_login_missing_token(self):
        response = self.client.post(self.url, {}, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('id_token', response.data)

    def test_google_login_empty_token(self):
        response = self.client.post(self.url, {'id_token': ''}, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    @patch('apps.accounts.views.id_token.verify_oauth2_token')
    def test_google_login_invalid_token(self, mock_verify):
        mock_verify.side_effect = ValueError('Invalid token')

        response = self.client.post(self.url, {'id_token': 'bad_token'}, format='json')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    @patch('apps.accounts.views.id_token.verify_oauth2_token')
    def test_google_login_wrong_issuer(self, mock_verify):
        mock_verify.return_value = {
            'iss': 'https://malicious.com',
            'email': 'test@example.com',
            'name': 'Test',
        }

        response = self.client.post(self.url, {'id_token': 'token'}, format='json')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    @patch('apps.accounts.views.id_token.verify_oauth2_token')
    def test_google_login_no_email(self, mock_verify):
        mock_verify.return_value = {
            'iss': 'accounts.google.com',
            'name': 'No Email',
        }

        response = self.client.post(self.url, {'id_token': 'token'}, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)


class TokenRefreshViewTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.url = '/api/auth/token/refresh/'

    def test_token_refresh_success(self):
        user = User.objects.create_user(
            email='test@example.com',
            full_name='Test User',
        )
        refresh = RefreshToken.for_user(user)

        response = self.client.post(self.url, {'refresh': str(refresh)}, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)

    def test_token_refresh_invalid(self):
        response = self.client.post(self.url, {'refresh': 'invalid_token'}, format='json')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_token_refresh_missing(self):
        response = self.client.post(self.url, {}, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)


class UserProfileAPIViewTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.url = '/api/auth/me/'
        self.user = User.objects.create_user(
            email='profile@example.com',
            full_name='Profile User',
        )

    def test_get_profile_authenticated(self):
        self.client.force_authenticate(user=self.user)
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['email'], 'profile@example.com')
        self.assertEqual(response.data['full_name'], 'Profile User')

    def test_get_profile_unauthenticated(self):
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_get_profile_with_jwt(self):
        refresh = RefreshToken.for_user(self.user)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {refresh.access_token}')
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['email'], 'profile@example.com')

    def test_get_profile_expired_jwt(self):
        self.client.credentials(HTTP_AUTHORIZATION='Bearer invalid_token')
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
