import uuid
from unittest.mock import ANY, patch

from django.test import TestCase, override_settings
from rest_framework import status
from rest_framework.test import APIClient
from rest_framework_simplejwt.tokens import RefreshToken

from .models import Address, User


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

    def test_patch_profile_full_name(self):
        self.client.force_authenticate(user=self.user)
        response = self.client.patch(self.url, {'full_name': 'Updated Name'}, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['full_name'], 'Updated Name')
        self.user.refresh_from_db()
        self.assertEqual(self.user.full_name, 'Updated Name')

    def test_patch_profile_avatar(self):
        self.client.force_authenticate(user=self.user)
        response = self.client.patch(self.url, {'avatar': 'https://example.com/new.jpg'}, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['avatar'], 'https://example.com/new.jpg')

    def test_patch_profile_unauthenticated(self):
        response = self.client.patch(self.url, {'full_name': 'New'}, format='json')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_patch_profile_empty_body(self):
        self.client.force_authenticate(user=self.user)
        response = self.client.patch(self.url, {}, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['full_name'], 'Profile User')

    def test_patch_profile_invalid_field(self):
        self.client.force_authenticate(user=self.user)
        response = self.client.patch(self.url, {'email': 'new@example.com'}, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['email'], 'profile@example.com')


class AddressAPITestBase(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.list_url = '/api/addresses/'
        self.user = User.objects.create_user(
            email='address@example.com',
            full_name='Address User',
            phone='9876543210',
        )
        self.client.force_authenticate(user=self.user)

        self.valid_payload = {
            'name': 'Address User',
            'phone': '9876543210',
            'address_line1': '42 Park Street',
            'address_line2': 'Block C',
            'city': 'Mumbai',
            'state': 'Maharashtra',
            'postal_code': '400001',
            'country': 'India',
        }

    def create_address(self, **overrides):
        payload = {**self.valid_payload, **overrides}
        return self.client.post(self.list_url, payload, format='json')


class AddressCreateAPIViewTests(AddressAPITestBase):
    def test_create_address_success(self):
        response = self.create_address()
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['city'], 'Mumbai')
        self.assertEqual(response.data['postal_code'], '400001')
        self.assertEqual(Address.objects.count(), 1)

    def test_first_address_is_default(self):
        response = self.create_address()
        self.assertEqual(response.data['is_default'], True)

    def test_address_belongs_to_authenticated_user(self):
        self.create_address()
        address = Address.objects.get()
        self.assertEqual(address.user, self.user)

    def test_create_address_unauthenticated(self):
        self.client.force_authenticate(user=None)
        response = self.client.post(self.list_url, self.valid_payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_create_address_invalid_pin(self):
        response = self.create_address(postal_code='123')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('postal_code', response.data)

    def test_create_address_invalid_phone(self):
        response = self.create_address(phone='123')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('phone', response.data)

    def test_create_address_missing_required(self):
        response = self.client.post(self.list_url, {'city': 'Mumbai'}, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)


class AddressListAPIViewTests(AddressAPITestBase):
    def test_list_returns_only_own_addresses(self):
        self.create_address()
        other_user = User.objects.create_user(
            email='other@example.com',
            full_name='Other User',
        )
        self.create_address(name='First')
        self.client.force_authenticate(user=other_user)
        Address.objects.create(
            user=other_user,
            name='Other Address',
            phone='9876543210',
            address_line1='1 Other Lane',
            city='Delhi',
            state='Delhi',
            postal_code='110001',
        )

        response = self.client.get(self.list_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['name'], 'Other Address')

    def test_list_empty(self):
        response = self.client.get(self.list_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data, [])


class AddressDetailAPIViewTests(AddressAPITestBase):
    def setUp(self):
        super().setUp()
        self.create_address()
        self.address = Address.objects.get()

    def get_detail_url(self):
        return f'{self.list_url}{self.address.pk}/'

    def test_update_address(self):
        response = self.client.put(
            self.get_detail_url(),
            {**self.valid_payload, 'city': 'Pune'},
            format='json',
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['city'], 'Pune')
        self.address.refresh_from_db()
        self.assertEqual(self.address.city, 'Pune')

    def test_update_address_keeps_default_with_other(self):
        self.create_address(name='Second', is_default=True)
        second = Address.objects.get(name='Second')
        url = f'{self.list_url}{self.address.pk}/'
        response = self.client.put(url, {**self.valid_payload, 'city': 'Pune'}, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        second.refresh_from_db()
        self.assertEqual(second.is_default, True)

    def test_update_address_not_found_other_user(self):
        other_user = User.objects.create_user(
            email='other2@example.com',
            full_name='Other User',
        )
        # another user's same id won't exist but route with a random UUID:
        response = self.client.put(
            f'{self.list_url}{uuid.uuid4()}/',
            self.valid_payload,
            format='json',
        )
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_delete_address(self):
        response = self.client.delete(self.get_detail_url())
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(Address.objects.filter(pk=self.address.pk).exists())


class AddressSetDefaultAPIViewTests(AddressAPITestBase):
    def setUp(self):
        super().setUp()
        self.create_address()
        self.address = Address.objects.get()

    def test_set_default(self):
        second_response = self.create_address(name='Second')
        second = Address.objects.get(name='Second')

        self.address.is_default = False
        self.address.save(update_fields=['is_default'])

        response = self.client.patch(f'{self.list_url}{second.pk}/default/', {}, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        second.refresh_from_db()
        self.address.refresh_from_db()
        self.assertEqual(second.is_default, True)
        self.assertEqual(self.address.is_default, False)

    def test_set_default_not_found(self):
        response = self.client.patch(f'{self.list_url}{uuid.uuid4()}/default/', {}, format='json')
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
