import base64
import hashlib
import hmac
import json

import requests
from django.conf import settings

from apps.orders.models import Order


class CashfreeError(Exception):
    pass


def _headers():
    return {
        'x-client-id': settings.CASHFREE_CLIENT_ID,
        'x-client-secret': settings.CASHFREE_CLIENT_SECRET,
        'x-api-version': settings.CASHFREE_API_VERSION,
        'Content-Type': 'application/json',
    }


def create_order(order: Order, return_url: str) -> str:
    """Create an order at Cashfree and return its payment_session_id."""
    phone = order.user.phone or '9999999999'
    payload = {
        'order_id': str(order.id),
        'order_amount': str(order.total),
        'order_currency': 'INR',
        'customer_details': {
            'customer_id': str(order.user.id),
            'customer_email': order.user.email,
            'customer_phone': phone,
            'customer_name': order.user.full_name,
        },
        'order_meta': {
            'return_url': return_url,
            'notify_url': settings.CASHFREE_NOTIFY_URL,
        },
    }

    url = f"{settings.CASHFREE_BASE_URL}/orders"
    try:
        response = requests.post(url, headers=_headers(), json=payload, timeout=20)
        response.raise_for_status()
    except requests.RequestException as exc:
        raise CashfreeError(f'Cashfree create-order failed: {exc}') from exc

    data = response.json()
    payment_session_id = data.get('payment_session_id')
    if not payment_session_id:
        raise CashfreeError(f'Cashfree create-order missing payment_session_id: {data}')

    return payment_session_id


def fetch_order_status(order_id: str) -> str:
    """Fetch the status of a Cashfree order. Returns Cashfree order_status (e.g. PAID/ACTIVE)."""
    url = f"{settings.CASHFREE_BASE_URL}/orders/{order_id}"
    try:
        response = requests.get(url, headers=_headers(), timeout=20)
        response.raise_for_status()
    except requests.RequestException as exc:
        raise CashfreeError(f'Cashfree fetch-order failed: {exc}') from exc

    return response.json().get('order_status', '')


def verify_webhook_signature(timestamp: str, raw_body: str, signature: str) -> bool:
    """Verify a Cashfree webhook signature.

    expected = base64(hmac_sha256(client_secret, timestamp + raw_body))
    """
    if not signature or not timestamp:
        return False
    key = settings.CASHFREE_CLIENT_SECRET.encode('utf-8')
    message = (timestamp + raw_body).encode('utf-8')
    digest = hmac.new(key, message, hashlib.sha256).digest()
    expected = base64.b64encode(digest).decode('utf-8')
    return hmac.compare_digest(expected, signature)