from django.test import TestCase
from rest_framework import status
from rest_framework.test import APIClient

from apps.accounts.models import User
from apps.cart.models import Cart, CartItem
from apps.products.models import Category, Product, ProductVariant


class CartAPITestBase(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            email='cartuser@example.com',
            full_name='Cart User',
        )
        self.category = Category.objects.create(name='Test Cat', slug='test-cat')
        self.product = Product.objects.create(
            name='Test Product',
            slug='test-product',
            price=100.00,
            stock_quantity=10,
            category=self.category,
        )
        self.variant = ProductVariant.objects.create(
            product=self.product,
            size='M',
            color='Black',
            color_code='#000000',
            sku='test-product-black-m',
            stock_quantity=10,
        )


class CartAPIViewTests(CartAPITestBase):
    def setUp(self):
        super().setUp()
        self.url = '/api/cart/'

    def test_get_cart_authenticated_creates_cart(self):
        self.client.force_authenticate(user=self.user)
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('items', response.data)
        self.assertIn('total', response.data)
        self.assertEqual(Cart.objects.filter(user=self.user).count(), 1)

    def test_get_cart_authenticated_returns_existing(self):
        cart = Cart.objects.create(user=self.user)
        CartItem.objects.create(cart=cart, variant=self.variant, quantity=2)
        self.client.force_authenticate(user=self.user)
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['items']), 1)
        self.assertEqual(response.data['items'][0]['quantity'], 2)

    def test_get_cart_guest_with_session(self):
        response = self.client.get(self.url, HTTP_X_SESSION_ID='test-session')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(Cart.objects.filter(session_id='test-session').exists())

    def test_get_cart_guest_without_session(self):
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_get_cart_total(self):
        cart = Cart.objects.create(user=self.user)
        CartItem.objects.create(cart=cart, variant=self.variant, quantity=3)
        self.client.force_authenticate(user=self.user)
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['total'], 300.0)


class CartItemCreateAPIViewTests(CartAPITestBase):
    def setUp(self):
        super().setUp()
        self.url = '/api/cart/items/'

    def test_add_item_authenticated(self):
        self.client.force_authenticate(user=self.user)
        response = self.client.post(self.url, {'variant_id': self.variant.id, 'quantity': 2}, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['quantity'], 2)

    def test_add_item_defaults_quantity_to_one(self):
        self.client.force_authenticate(user=self.user)
        response = self.client.post(self.url, {'variant_id': self.variant.id}, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['quantity'], 1)

    def test_add_item_increments_existing(self):
        self.client.force_authenticate(user=self.user)
        self.client.post(self.url, {'variant_id': self.variant.id, 'quantity': 2}, format='json')
        response = self.client.post(self.url, {'variant_id': self.variant.id, 'quantity': 3}, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['quantity'], 5)

    def test_add_item_insufficient_stock(self):
        self.client.force_authenticate(user=self.user)
        response = self.client.post(self.url, {'variant_id': self.variant.id, 'quantity': 20}, format='json')
        self.assertEqual(response.status_code, status.HTTP_409_CONFLICT)
        self.assertIn('stock_error', response.data['error']['code'])

    def test_add_item_increments_beyond_stock(self):
        self.client.force_authenticate(user=self.user)
        self.client.post(self.url, {'variant_id': self.variant.id, 'quantity': 8}, format='json')
        response = self.client.post(self.url, {'variant_id': self.variant.id, 'quantity': 5}, format='json')
        self.assertEqual(response.status_code, status.HTTP_409_CONFLICT)
        self.assertIn('stock_error', response.data['error']['code'])

    def test_add_item_invalid_variant(self):
        self.client.force_authenticate(user=self.user)
        response = self.client.post(self.url, {'variant_id': 99999, 'quantity': 1}, format='json')
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_add_item_guest_with_session(self):
        response = self.client.post(self.url, {'variant_id': self.variant.id, 'quantity': 1}, format='json', HTTP_X_SESSION_ID='guest-session')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(Cart.objects.filter(session_id='guest-session', items__variant=self.variant).exists())

    def test_add_item_guest_without_session(self):
        response = self.client.post(self.url, {'variant_id': self.variant.id, 'quantity': 1}, format='json')
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_add_item_quantity_zero(self):
        self.client.force_authenticate(user=self.user)
        response = self.client.post(self.url, {'variant_id': self.variant.id, 'quantity': 0}, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_add_item_missing_variant_id(self):
        self.client.force_authenticate(user=self.user)
        response = self.client.post(self.url, {'quantity': 1}, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)


class CartItemDetailAPIViewTests(CartAPITestBase):
    def setUp(self):
        super().setUp()
        self.cart = Cart.objects.create(user=self.user)
        self.item = CartItem.objects.create(cart=self.cart, variant=self.variant, quantity=3)
        self.detail_url = f'/api/cart/items/{self.item.id}/'
        self.client.force_authenticate(user=self.user)

    def test_update_quantity(self):
        response = self.client.patch(self.detail_url, {'quantity': 5}, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['quantity'], 5)

    def test_update_quantity_exceeds_stock(self):
        response = self.client.patch(self.detail_url, {'quantity': 20}, format='json')
        self.assertEqual(response.status_code, status.HTTP_409_CONFLICT)
        self.assertIn('stock_error', response.data['error']['code'])

    def test_update_quantity_zero(self):
        response = self.client.patch(self.detail_url, {'quantity': 0}, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_update_invalid_item(self):
        url = '/api/cart/items/00000000-0000-0000-0000-000000000000/'
        response = self.client.patch(url, {'quantity': 2}, format='json')
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_delete_item(self):
        response = self.client.delete(self.detail_url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(CartItem.objects.count(), 0)

    def test_delete_invalid_item(self):
        url = '/api/cart/items/00000000-0000-0000-0000-000000000000/'
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_update_item_from_different_cart(self):
        other_user = User.objects.create_user(email='other@example.com', full_name='Other')
        other_cart = Cart.objects.create(user=other_user)
        other_item = CartItem.objects.create(cart=other_cart, variant=self.variant, quantity=1)
        url = f'/api/cart/items/{other_item.id}/'
        response = self.client.patch(url, {'quantity': 2}, format='json')
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)


class CartMergeAPIViewTests(CartAPITestBase):
    def setUp(self):
        super().setUp()
        self.url = '/api/cart/merge/'

    def test_merge_guest_into_user_cart(self):
        guest_cart = Cart.objects.create(session_id='guest-session')
        CartItem.objects.create(cart=guest_cart, variant=self.variant, quantity=2)

        self.client.force_authenticate(user=self.user)
        response = self.client.post(self.url, {}, format='json', HTTP_X_SESSION_ID='guest-session')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['items']), 1)
        self.assertEqual(response.data['items'][0]['quantity'], 2)
        self.assertFalse(Cart.objects.filter(session_id='guest-session').exists())

    def test_merge_requires_auth(self):
        response = self.client.post(self.url, {}, format='json', HTTP_X_SESSION_ID='guest-session')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_merge_requires_session_id(self):
        self.client.force_authenticate(user=self.user)
        response = self.client.post(self.url, {}, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_merge_no_guest_cart(self):
        self.client.force_authenticate(user=self.user)
        response = self.client.post(self.url, {}, format='json', HTTP_X_SESSION_ID='nonexistent')
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_merge_combines_with_existing_user_cart_items(self):
        guest_cart = Cart.objects.create(session_id='guest-session')
        CartItem.objects.create(cart=guest_cart, variant=self.variant, quantity=2)

        user_cart = Cart.objects.create(user=self.user)
        CartItem.objects.create(cart=user_cart, variant=self.variant, quantity=1)

        self.client.force_authenticate(user=self.user)
        response = self.client.post(self.url, {}, format='json', HTTP_X_SESSION_ID='guest-session')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['items']), 1)
        self.assertEqual(response.data['items'][0]['quantity'], 3)
