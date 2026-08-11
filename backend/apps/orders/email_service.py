import logging

from django.conf import settings
from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string

from apps.orders.models import Order

logger = logging.getLogger(__name__)


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

    email = EmailMultiAlternatives(
        subject=subject,
        body=text_body,
        from_email=settings.DEFAULT_FROM_EMAIL,
        to=[order.user.email],
    )
    email.attach_alternative(html_body, 'text/html')

    try:
        email.send(fail_silently=False)
    except Exception as exc:  # noqa: BLE001 - never let email break the webhook
        logger.error('Failed to send order confirmation email for %s: %s', order.id, exc)
        return False

    logger.info('Order confirmation email sent for %s to %s', order.id, order.user.email)
    return True