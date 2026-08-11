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


class OrderStatusUpdateAPIViewTests(OrderAPITestBase):
    def setUp(self):
        super().setUp()
        self.add_cart_item(quantity=1)
        self.client.force_authenticate(user=self.user)
        create_response = self.client.post('/api/orders/', format='json')
        self.order_id = create_response.data['id']
        self.url = f'/api/orders/{self.order_id}/'

    def test_non_staff_cannot_update_status(self):
        self.client.force_authenticate(user=self.user)
        response = self.client.patch(
            self.url,
            {'status': 'shipped'},
            format='json',
        )
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_anonymous_cannot_update_status(self):
        self.client.force_authenticate(user=None)
        response = self.client.patch(
            self.url,
            {'status': 'shipped'},
            format='json',
        )
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_staff_updates_status(self):
        self.client.force_authenticate(user=self.staff)
        response = self.client.patch(
            self.url,
            {'status': 'shipped'},
            format='json',
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['status'], 'shipped')
        order = Order.objects.get(pk=self.order_id)
        self.assertEqual(order.status, 'shipped')

    def test_staff_update_rejects_invalid_status(self):
        self.client.force_authenticate(user=self.staff)
        response = self.client.patch(
            self.url,
            {'status': 'not-a-status'},
            format='json',
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_staff_update_requires_status(self):
        self.client.force_authenticate(user=self.staff)
        response = self.client.patch(self.url, {}, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)


class MyOrdersAPIViewTests(OrderAPITestBase):
    def setUp(self):
        super().setUp()
        self.url = '/api/orders/mine/'

    def test_requires_authentication(self):
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_returns_only_own_orders(self):
        self.add_cart_item(quantity=1)
        self.client.force_authenticate(user=self.user)
        create_response = self.client.post(
            '/api/orders/',
            {'shipping_address_id': self.address.id},
            format='json',
        )
        self.assertEqual(create_response.status_code, status.HTTP_201_CREATED)
        created_id = create_response.data['id']

        other = User.objects.create_user(
            email='other@example.com',
            full_name='Other User',
            password='testpass123',
        )
        self.client.force_authenticate(user=other)
        other_order = Order.objects.create(user=other, total=50.00)

        response = self.client.get(self.url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        ids = [order['id'] for order in response.data]
        self.assertEqual(len(ids), 1)
        self.assertNotIn(created_id, ids)
        self.assertIn(str(other_order.id), ids)

    def test_empty_when_no_orders(self):
        self.client.force_authenticate(user=self.user)
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data, [])

from unittest import mock

from django.test import TestCase, override_settings

from apps.orders.email_service import send_order_confirmation_email


class OrderEmailServiceTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            email='emailuser@example.com',
            full_name='Email User',
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
        from apps.orders.models import OrderItem
        self.order = Order.objects.create(user=self.user, total=100.00)
        OrderItem.objects.create(
            order=self.order,
            variant=self.variant,
            quantity=2,
            unit_price=50.00,
            total_price=100.00,
        )

    @override_settings(RESEND_API_KEY='test-key')
    @mock.patch('apps.orders.email_service.requests.post')
    def test_sends_rendered_email_via_resend_api(self, mock_post):
        mock_post.return_value.status_code = 200
        mock_post.return_value.text = ''

        ok = send_order_confirmation_email(self.order)

        self.assertTrue(ok)
        mock_post.assert_called_once()
        args, kwargs = mock_post.call_args
        self.assertEqual(args[0], 'https://api.resend.com/emails')
        self.assertEqual(kwargs['headers']['Authorization'], 'Bearer test-key')
        payload = kwargs['json']
        self.assertEqual(payload['to'], ['emailuser@example.com'])
        self.assertIn('confirmed', payload['subject'])
        self.assertIn('Test Product', payload['text'])
        self.assertIn('Total: ₹100.00', payload['text'])

    @override_settings(RESEND_API_KEY='')
    @mock.patch('apps.orders.email_service.requests.post')
    def test_returns_false_without_api_key(self, mock_post):
        ok = send_order_confirmation_email(self.order)
        self.assertFalse(ok)
        mock_post.assert_not_called()

    @override_settings(RESEND_API_KEY='test-key')
    @mock.patch('apps.orders.email_service.requests.post')
    def test_returns_false_on_api_error(self, mock_post):
        mock_post.return_value.status_code = 401
        mock_post.return_value.text = 'unauthorized'
        ok = send_order_confirmation_email(self.order)
        self.assertFalse(ok)

    @override_settings(RESEND_API_KEY='test-key')
    @mock.patch('apps.orders.email_service.requests.post')
    def test_html_includes_shipping_snapshot(self, mock_post):
        self.order.shipping_name = 'Email User'
        self.order.shipping_phone = '9876543210'
        self.order.shipping_address_line1 = '123 Test Street'
        self.order.shipping_city = 'Bengaluru'
        self.order.shipping_state = 'Karnataka'
        self.order.shipping_postal_code = '560001'
        self.order.shipping_country = 'India'
        self.order.save()
        mock_post.return_value.status_code = 200
        mock_post.return_value.text = ''

        ok = send_order_confirmation_email(self.order)

        self.assertTrue(ok)
        _, kwargs = mock_post.call_args
        self.assertIn('Bengaluru, Karnataka 560001', kwargs['json']['html'])
