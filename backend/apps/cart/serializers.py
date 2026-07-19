from rest_framework import serializers

from apps.cart.models import Cart, CartItem
from apps.products.serializers import ProductVariantSerializer


class CartItemSerializer(serializers.ModelSerializer):
    variant = serializers.PrimaryKeyRelatedField(read_only=True)
    variant_detail = ProductVariantSerializer(source='variant', read_only=True)

    class Meta:
        model = CartItem
        fields = ['id', 'variant', 'variant_detail', 'quantity', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']


class CartItemWriteSerializer(serializers.Serializer):
    variant_id = serializers.IntegerField()
    quantity = serializers.IntegerField(min_value=1, default=1)


class CartItemUpdateSerializer(serializers.Serializer):
    quantity = serializers.IntegerField(min_value=1)


class CartSerializer(serializers.ModelSerializer):
    items = CartItemSerializer(many=True, read_only=True)
    total = serializers.SerializerMethodField()

    class Meta:
        model = Cart
        fields = ['id', 'items', 'total', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']

    def get_total(self, obj):
        total = 0
        for item in obj.items.select_related('variant__product').all():
            price = item.variant.price if item.variant.price else item.variant.product.price
            total += price * item.quantity
        return total
