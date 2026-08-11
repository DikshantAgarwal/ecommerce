import uuid

from django.conf import settings
from django.db import models


class Order(models.Model):
    class Status(models.TextChoices):
        PENDING = 'pending', 'Pending'
        CONFIRMED = 'confirmed', 'Confirmed'
        SHIPPED = 'shipped', 'Shipped'
        DELIVERED = 'delivered', 'Delivered'
        CANCELLED = 'cancelled', 'Cancelled'

    class PaymentStatus(models.TextChoices):
        UNPAID = 'unpaid', 'Unpaid'
        PENDING = 'pending', 'Pending'
        PAID = 'paid', 'Paid'
        FAILED = 'failed', 'Failed'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='orders',
    )
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.PENDING,
    )
    payment_status = models.CharField(
        max_length=10,
        choices=PaymentStatus.choices,
        default=PaymentStatus.UNPAID,
    )
    cashfree_order_id = models.CharField(max_length=100, blank=True, default='')
    total = models.DecimalField(max_digits=10, decimal_places=2)
    shipping_name = models.CharField(max_length=255, blank=True, default='')
    shipping_phone = models.CharField(max_length=15, blank=True, default='')
    shipping_address_line1 = models.CharField(max_length=255, blank=True, default='')
    shipping_address_line2 = models.CharField(max_length=255, blank=True, default='')
    shipping_city = models.CharField(max_length=100, blank=True, default='')
    shipping_state = models.CharField(max_length=100, blank=True, default='')
    shipping_postal_code = models.CharField(max_length=10, blank=True, default='')
    shipping_country = models.CharField(max_length=100, blank=True, default='')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Order {self.id} ({self.get_status_display()})"

    def get_shipping_address(self):
        if (
            not self.shipping_name
            and not self.shipping_address_line1
            and not self.shipping_city
        ):
            return None
        return {
            'name': self.shipping_name,
            'phone': self.shipping_phone,
            'address_line1': self.shipping_address_line1,
            'address_line2': self.shipping_address_line2,
            'city': self.shipping_city,
            'state': self.shipping_state,
            'postal_code': self.shipping_postal_code,
            'country': self.shipping_country,
        }


class OrderItem(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='items')
    variant = models.ForeignKey('products.ProductVariant', on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField()
    unit_price = models.DecimalField(max_digits=10, decimal_places=2)
    total_price = models.DecimalField(max_digits=10, decimal_places=2)

    def __str__(self):
        return f"{self.quantity}x {self.variant.product.name} ({self.variant.color}, {self.variant.size})"
