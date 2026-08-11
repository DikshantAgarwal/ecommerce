import uuid
from unittest import mock

from django.test import TestCase, override_settings
from rest_framework import status
from rest_framework.test import APIClient

from apps.accounts.models import User
from apps.orders.models import Order
from apps.products.models import Category, Product, ProductVariant
from apps.payments.services import CashfreeError


class PaymentAPITestBase(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            email='payuser@example.com',
            full_name='Pay User',
            phone='9876543210',
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
        self.order = Order.objects.create(user=self.user, total=100.00)
        self.client.force_authenticate(user=self.user)


class PaymentInitiateAPIViewTests(PaymentAPITestBase):
    def setUp(self):
        super().setUp()
        self.url = '/api/payments/initiate/'

    @override_settings(CASHFREE_CLIENT_ID='test-id', CASHFREE_CLIENT_SECRET='test-secret')
    @mock.patch('apps.payments.views.create_order', return_value='session_123')
    def test_initiate_returns_payment_session(self, mock_create):
        response = self.client.post(self.url, {
            'order_id': str(self.order.id),
            'return_url': 'http://localhost:5173/orders/{order_id}/confirmation',
        }, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['payment_session_id'], 'session_123')
        self.assertEqual(response.data['payment_status'], 'pending')
        self.order.refresh_from_db()
        self.assertEqual(self.order.cashfree_order_id, str(self.order.id))
        self.assertEqual(self.order.payment_status, Order.PaymentStatus.PENDING)

    @mock.patch('apps.payments.views.create_order', return_value='session_123')
    def test_initiate_requires_auth(self, mock_create):
        self.client.force_authenticate(user=None)
        response = self.client.post(self.url, {
            'order_id': str(self.order.id),
            'return_url': 'http://localhost:5173/confirmation',
        }, format='json')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        mock_create.assert_not_called()

    @mock.patch('apps.payments.views.create_order')
    def test_initiate_other_users_order_404(self, mock_create):
        other = User.objects.create_user(email='other2@example.com', full_name='Other 2')
        other_order = Order.objects.create(user=other, total=50.00)
        response = self.client.post(self.url, {
            'order_id': str(other_order.id),
            'return_url': 'http://localhost:5173/confirmation',
        }, format='json')
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        mock_create.assert_not_called()

    @mock.patch('apps.payments.views.create_order')
    def test_initiate_missing_return_url(self, mock_create):
        response = self.client.post(self.url, {'order_id': str(self.order.id)}, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        mock_create.assert_not_called()

    @mock.patch('apps.payments.views.create_order')
    def test_initiate_already_paid_rejected(self, mock_create):
        self.order.payment_status = Order.PaymentStatus.PAID
        self.order.save()
        response = self.client.post(self.url, {
            'order_id': str(self.order.id),
            'return_url': 'http://localhost:5173/confirmation',
        }, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('already_paid', response.data['error']['code'])
        mock_create.assert_not_called()

    @mock.patch('apps.payments.views.create_order', side_effect=CashfreeError('boom'))
    def test_initiate_gateway_error_returns_502(self, mock_create):
        response = self.client.post(self.url, {
            'order_id': str(self.order.id),
            'return_url': 'http://localhost:5173/confirmation',
        }, format='json')
        self.assertEqual(response.status_code, status.HTTP_502_BAD_GATEWAY)
        self.assertIn('gateway_error', response.data['error']['code'])

    def test_initiate_missing_payload(self):
        response = self.client.post(self.url, {}, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)


class PaymentStatusAPIViewTests(PaymentAPITestBase):
    def setUp(self):
        super().setUp()
        self.url = f'/api/payments/orders/{self.order.id}/status/'

    def test_status_unpaid_by_default(self):
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['payment_status'], 'unpaid')

    def test_status_paid_does_not_poll_gateway(self):
        self.order.payment_status = Order.PaymentStatus.PAID
        self.order.status = Order.Status.CONFIRMED
        self.order.save()
        with mock.patch('apps.payments.views.fetch_order_status') as mock_fetch:
            response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['payment_status'], 'paid')
        mock_fetch.assert_not_called()

    @mock.patch('apps.payments.views.fetch_order_status', return_value='PAID')
    def test_status_polls_gateway_when_unpaid(self, mock_fetch):
        self.order.cashfree_order_id = str(self.order.id)
        self.order.save()
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['payment_status'], 'paid')
        mock_fetch.assert_called_once_with(self.order.cashfree_order_id)
        self.order.refresh_from_db()
        self.assertEqual(self.order.status, Order.Status.CONFIRMED)

    def test_status_requires_auth(self):
        self.client.force_authenticate(user=None)
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_status_other_users_order_404(self):
        other = User.objects.create_user(email='other3@example.com', full_name='Other 3')
        other_order = Order.objects.create(user=other, total=25.00)
        response = self.client.get(f'/api/payments/orders/{other_order.id}/status/')
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)


class PaymentWebhookAPIViewTests(PaymentAPITestBase):
    def setUp(self):
        super().setUp()
        self.order.cashfree_order_id = str(self.order.id)
        self.order.save()
        self.url = '/api/payments/webhook/'

        import base64
        import hashlib
        import hmac

        self.secret = 'test-secret'
        self.payload = {
            'type': 'PAYMENT_SUCCESS_WEBHOOK',
            'data': {
                'order': {'order_id': str(self.order.id), 'order_amount': 100.00, 'order_currency': 'INR'},
                'payment': {'payment_status': 'SUCCESS', 'cf_payment_id': '123456'},
            },
            'event_time': '2026-01-01T00:00:00+05:30',
        }
        self.raw_body = __import__('json').dumps(self.payload)
        self.timestamp = '1617695238078'
        message = (self.timestamp + self.raw_body).encode('utf-8')
        digest = hmac.new(self.secret.encode('utf-8'), message, hashlib.sha256).digest()
        self.signature = base64.b64encode(digest).decode('utf-8')

    def _post_webhook(self, body=None, timestamp=None, signature=None):
        return self.client.post(
            self.url,
            data=body if body is not None else self.raw_body,
            content_type='text/plain',
            HTTP_X_WEBHOOK_TIMESTAMP=timestamp if timestamp is not None else self.timestamp,
            HTTP_X_WEBHOOK_SIGNATURE=signature if signature is not None else self.signature,
        )

    @override_settings(CASHFREE_CLIENT_SECRET='test-secret')
    def test_success_webhook_marks_paid(self):
        response = self._post_webhook()
        self.assertEqual(response.status_code, 200)
        self.order.refresh_from_db()
        self.assertEqual(self.order.payment_status, Order.PaymentStatus.PAID)
        self.assertEqual(self.order.status, Order.Status.CONFIRMED)

    @override_settings(CASHFREE_CLIENT_SECRET='test-secret')
    def test_failed_webhook_marks_failed(self):
        payload = {
            'type': 'PAYMENT_FAILED_WEBHOOK',
            'data': {
                'order': {'order_id': str(self.order.id)},
                'payment': {'payment_status': 'FAILED'},
            },
        }
        import json, base64, hashlib, hmac
        raw = __import__('json').dumps(payload)
        message = (self.timestamp + raw).encode('utf-8')
        digest = hmac.new(self.secret.encode('utf-8'), message, hashlib.sha256).digest()
        signature = base64.b64encode(digest).decode('utf-8')
        response = self.client.post(
            self.url,
            data=raw,
            content_type='text/plain',
            HTTP_X_WEBHOOK_TIMESTAMP=self.timestamp,
            HTTP_X_WEBHOOK_SIGNATURE=signature,
        )
        self.assertEqual(response.status_code, 200)
        self.order.refresh_from_db()
        self.assertEqual(self.order.payment_status, Order.PaymentStatus.FAILED)

    @override_settings(CASHFREE_CLIENT_SECRET='test-secret')
    def test_invalid_signature_rejected(self):
        response = self._post_webhook(signature='bogus')
        self.assertEqual(response.status_code, 400)
        self.order.refresh_from_db()
        self.assertEqual(self.order.payment_status, Order.PaymentStatus.UNPAID)

    @override_settings(CASHFREE_CLIENT_SECRET='test-secret')
    def test_unknown_order_acknowledged(self):
        payload = {
            'type': 'PAYMENT_SUCCESS_WEBHOOK',
            'data': {'order': {'order_id': str(uuid.uuid4())}, 'payment': {'payment_status': 'SUCCESS'}},
        }
        import json, base64, hashlib, hmac
        raw = __import__('json').dumps(payload)
        message = (self.timestamp + raw).encode('utf-8')
        digest = hmac.new(self.secret.encode('utf-8'), message, hashlib.sha256).digest()
        signature = base64.b64encode(digest).decode('utf-8')
        response = self.client.post(
            self.url,
            data=raw,
            content_type='text/plain',
            HTTP_X_WEBHOOK_TIMESTAMP=self.timestamp,
            HTTP_X_WEBHOOK_SIGNATURE=signature,
        )
        self.assertEqual(response.status_code, 200)