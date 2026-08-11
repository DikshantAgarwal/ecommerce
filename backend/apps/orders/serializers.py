from rest_framework import serializers

from apps.accounts.models import Address
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
    shipping_address = serializers.SerializerMethodField()
    shipping_address_id = serializers.PrimaryKeyRelatedField(
        queryset=Address.objects.all(),
        write_only=True,
        required=False,
        allow_null=True,
    )

    class Meta:
        model = Order
        fields = [
            'id', 'user', 'status', 'payment_status', 'total', 'items',
            'shipping_address', 'shipping_address_id', 'created_at', 'updated_at',
        ]
        read_only_fields = [
            'id', 'user', 'status', 'payment_status', 'total', 'items',
            'created_at', 'updated_at',
        ]

    def get_shipping_address(self, obj):
        return obj.get_shipping_address()

    def validate_shipping_address_id(self, value):
        if value is None:
            return value
        request = self.context.get('request')
        if request and request.user.is_authenticated and value.user != request.user:
            raise serializers.ValidationError("This address does not belong to you.")
        return value
