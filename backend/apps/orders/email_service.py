import logging

import requests

from django.conf import settings
from django.template.loader import render_to_string

from apps.orders.models import Order

logger = logging.getLogger(__name__)

RESEND_API_URL = 'https://api.resend.com/emails'


def _send_via_resend(from_email: str, to: list[str], subject: str, text: str, html: str) -> bool:
    api_key = settings.RESEND_API_KEY
    if not api_key:
        logger.error('RESEND_API_KEY is not configured; skipping email.')
        return False

    payload = {
        'from': from_email,
        'to': to,
        'subject': subject,
        'text': text,
        'html': html,
    }
    try:
        response = requests.post(
            RESEND_API_URL,
            json=payload,
            headers={'Authorization': f'Bearer {api_key}'},
            timeout=15,
        )
    except requests.RequestException as exc:  # noqa: BLE001
        logger.error('Resend request failed: %s', exc)
        return False

    if response.status_code >= 400:
        logger.error('Resend API error %s: %s', response.status_code, response.text[:500])
        return False

    return True


def send_order_confirmation_email(order: Order) -> bool:
    order_id_short = str(order.id).upper()[:8]
    context = {
        'order': order,
        'order_id_short': order_id_short,
        'items': order.items.select_related('variant__product').all(),
        'shipping_address': order.get_shipping_address(),
        'site_url': settings.FRONTEND_URL or '',
    }

    subject = f'Order {order_id_short} confirmed — {order.get_payment_status_display()}'
    text_body = render_to_string('orders/order_confirmation_email.txt', context)
    html_body = render_to_string('orders/order_confirmation_email.html', context)

    ok = _send_via_resend(
        from_email=settings.DEFAULT_FROM_EMAIL,
        to=[order.user.email],
        subject=subject,
        text=text_body,
        html=html_body,
    )

    if ok:
        logger.info('Order confirmation email sent for %s to %s', order.id, order.user.email)
    else:
        logger.error('Failed to send order confirmation email for %s', order.id)
    return ok
