from django.db import transaction
from django.shortcuts import get_object_or_404

from rest_framework import status
from rest_framework.permissions import IsAdminUser, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.cart.views import get_cart
from apps.orders.models import Order, OrderItem
from apps.orders.serializers import OrderSerializer


class OrderListCreateAPIView(APIView):
    def get_permissions(self):
        if self.request.method == 'GET':
            return [IsAdminUser()]
        return [IsAuthenticated()]

    @transaction.atomic
    def post(self, request):
        cart = get_cart(request)
        if not cart or not cart.items.exists():
            return Response(
                {'error': {'code': 'empty_cart', 'detail': 'Your cart is empty.'}},
                status=status.HTTP_400_BAD_REQUEST,
            )

        cart_items = cart.items.select_related('variant__product').all()
        total = 0
        order_items_data = []

        for cart_item in cart_items:
            variant = cart_item.variant
            if variant.stock_quantity < cart_item.quantity:
                return Response(
                    {
                        'error': {
                            'code': 'stock_error',
                            'detail': f'Only {variant.stock_quantity} units of "{variant.product.name} ({variant.color}, {variant.size})" available.',
                        }
                    },
                    status=status.HTTP_409_CONFLICT,
                )

            unit_price = variant.price or variant.product.price
            total_price = unit_price * cart_item.quantity
            total += total_price
            order_items_data.append({
                'variant': variant,
                'quantity': cart_item.quantity,
                'unit_price': unit_price,
                'total_price': total_price,
            })

        order = Order.objects.create(user=request.user, total=total)

        serialized = OrderSerializer(
            data={'shipping_address_id': request.data.get('shipping_address_id')},
            context={'request': request},
        )
        serialized.is_valid(raise_exception=True)
        address = serialized.validated_data.get('shipping_address_id')
        if address is not None:
            order.shipping_name = address.name
            order.shipping_phone = address.phone
            order.shipping_address_line1 = address.address_line1
            order.shipping_address_line2 = address.address_line2
            order.shipping_city = address.city
            order.shipping_state = address.state
            order.shipping_postal_code = address.postal_code
            order.shipping_country = address.country
            order.save(update_fields=[
                'shipping_name', 'shipping_phone', 'shipping_address_line1',
                'shipping_address_line2', 'shipping_city', 'shipping_state',
                'shipping_postal_code', 'shipping_country',
            ])

        for item_data in order_items_data:
            OrderItem.objects.create(order=order, **item_data)
            variant = item_data['variant']
            variant.stock_quantity -= item_data['quantity']
            variant.save()

        cart.items.all().delete()

        serializer = OrderSerializer(order)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    def get(self, request):
        orders = Order.objects.select_related('user').prefetch_related('items').all()
        serializer = OrderSerializer(orders, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class OrderDetailAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        order = get_object_or_404(Order, pk=pk, user=request.user)
        serializer = OrderSerializer(order)
        return Response(serializer.data, status=status.HTTP_200_OK)
