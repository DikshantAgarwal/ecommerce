from rest_framework import serializers

from apps.orders.models import Order, OrderItem


class OrderItemSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='variant.product.name', read_only=True)
    product_slug = serializers.CharField(source='variant.product.slug', read_only=True)
    product_image = serializers.ImageField(source='variant.product.image', read_only=True)
    color = serializers.CharField(source='variant.color', read_only=True)
    size = serializers.CharField(source='variant.size', read_only=True)

    class Meta:
        model = OrderItem
        fields = [
            'id', 'variant', 'quantity', 'unit_price', 'total_price',
            'product_name', 'product_slug', 'product_image', 'color', 'size',
        ]


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)

    class Meta:
        model = Order
        fields = [
            'id', 'user', 'status', 'payment_status', 'total', 'items', 'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'user', 'status', 'payment_status', 'total', 'items', 'created_at', 'updated_at'
        ]
