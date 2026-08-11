from django.test import TestCase
from rest_framework import status
from rest_framework.test import APIClient

from apps.accounts.models import Address, User
from apps.cart.models import Cart, CartItem
from apps.orders.models import Order
from apps.products.models import Category, Product, ProductVariant


class OrderAPITestBase(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            email='orderuser@example.com',
            full_name='Order User',
            password='testpass123',
        )
        self.staff = User.objects.create_user(
            email='staff@example.com',
            full_name='Staff User',
            password='testpass123',
            is_staff=True,
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
        self.address = Address.objects.create(
            user=self.user,
            name='Test User',
            phone='9876543210',
            address_line1='123 Test Street',
            address_line2='Apt 4B',
            city='Bengaluru',
            state='Karnataka',
            postal_code='560001',
            country='India',
        )

    def add_cart_item(self, quantity=1):
        cart = Cart.objects.create(user=self.user)
        CartItem.objects.create(cart=cart, variant=self.variant, quantity=quantity)
        return cart


class OrderCreateAPIViewTests(OrderAPITestBase):
    def setUp(self):
        super().setUp()
        self.url = '/api/orders/'

    def test_create_order_requires_authentication(self):
        response = self.client.post(self.url, {'shipping_address_id': self.address.id})
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_create_order_with_empty_cart(self):
        self.client.force_authenticate(user=self.user)
        response = self.client.post(self.url)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data['error']['code'], 'empty_cart')

    def test_create_order_snapshots_shipping_address(self):
        self.add_cart_item(quantity=2)
        self.client.force_authenticate(user=self.user)

        response = self.client.post(
            self.url,
            {'shipping_address_id': self.address.id},
            format='json',
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        order = Order.objects.get(pk=response.data['id'])
        self.assertEqual(order.shipping_name, 'Test User')
        self.assertEqual(order.shipping_phone, '9876543210')
        self.assertEqual(order.shipping_address_line1, '123 Test Street')
        self.assertEqual(order.shipping_city, 'Bengaluru')
        self.assertEqual(order.shipping_postal_code, '560001')
        self.assertEqual(order.shipping_country, 'India')

        shipping = response.data['shipping_address']
        self.assertEqual(shipping['name'], 'Test User')
        self.assertEqual(shipping['city'], 'Bengaluru')

    def test_create_order_without_address_returns_null_shipping(self):
        self.add_cart_item(quantity=1)
        self.client.force_authenticate(user=self.user)

        response = self.client.post(self.url, format='json')

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIsNone(response.data['shipping_address'])
        order = Order.objects.get(pk=response.data['id'])
        self.assertEqual(order.shipping_name, '')
        self.assertEqual(order.shipping_city, '')

    def test_create_order_rejects_other_users_address(self):
        other = User.objects.create_user(
            email='other@example.com',
            full_name='Other User',
            password='testpass123',
        )
        other_address = Address.objects.create(
            user=other,
            name='Other User',
            phone='9876543210',
            address_line1='999 Other Street',
            city='Mumbai',
            state='Maharashtra',
            postal_code='400001',
            country='India',
        )
        self.add_cart_item(quantity=1)
        self.client.force_authenticate(user=self.user)

        response = self.client.post(
            self.url,
            {'shipping_address_id': other_address.id},
            format='json',
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('shipping_address_id', response.data)

    def test_create_order_clears_cart(self):
        self.add_cart_item(quantity=1)
        self.client.force_authenticate(user=self.user)

        response = self.client.post(
            self.url,
            {'shipping_address_id': self.address.id},
            format='json',
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(
            CartItem.objects.filter(cart__user=self.user).count(),
            0,
        )


class OrderListAPIViewTests(OrderAPITestBase):
    def setUp(self):
        super().setUp()
        self.url = '/api/orders/'

    def test_list_orders_requires_staff(self):
        self.client.force_authenticate(user=self.user)
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_list_orders_for_staff(self):
        self.add_cart_item(quantity=1)
        self.client.force_authenticate(user=self.user)
        create_response = self.client.post(
            self.url,
            {'shipping_address_id': self.address.id},
            format='json',
        )
        self.assertEqual(create_response.status_code, status.HTTP_201_CREATED)

        self.client.force_authenticate(user=self.staff)
        response = self.client.get(self.url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['id'], create_response.data['id'])
        self.assertEqual(response.data[0]['user'], self.user.id)
        self.assertEqual(len(response.data[0]['items']), 1)

    def test_list_orders_exposes_shipping_address(self):
        self.add_cart_item(quantity=1)
        self.client.force_authenticate(user=self.user)
        create_response = self.client.post(
            self.url,
            {'shipping_address_id': self.address.id},
            format='json',
        )
        self.assertEqual(create_response.status_code, status.HTTP_201_CREATED)

        self.client.force_authenticate(user=self.staff)
        response = self.client.get(self.url)

        shipping = response.data[0]['shipping_address']
        self.assertEqual(shipping['postal_code'], '560001')
        self.assertEqual(shipping['country'], 'India')


class OrderDetailAPIViewTests(OrderAPITestBase):
    def setUp(self):
        super().setUp()
        self.client.force_authenticate(user=self.user)

    def test_get_order_detail(self):
        self.add_cart_item(quantity=2)
        create_response = self.client.post(
            '/api/orders/',
            {'shipping_address_id': self.address.id},
            format='json',
        )
        order_id = create_response.data['id']

        response = self.client.get(f'/api/orders/{order_id}/')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['id'], order_id)
        self.assertEqual(response.data['shipping_address']['city'], 'Bengaluru')