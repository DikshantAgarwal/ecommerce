from django.shortcuts import get_object_or_404

from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.cart.models import Cart, CartItem
from apps.cart.serializers import (
    CartItemSerializer,
    CartItemUpdateSerializer,
    CartItemWriteSerializer,
    CartSerializer,
)
from apps.products.models import ProductVariant


def get_cart(request):
    if request.user.is_authenticated:
        cart, _ = Cart.objects.get_or_create(user=request.user)
        return cart
    session_id = request.headers.get('X-Session-Id')
    if not session_id:
        return None
    cart, _ = Cart.objects.get_or_create(session_id=session_id)
    return cart


class CartAPIView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        cart = get_cart(request)
        if cart is None:
            return Response(
                {'error': {'code': 'no_cart', 'detail': 'No cart found. Provide X-Session-Id header or authenticate.'}},
                status=status.HTTP_404_NOT_FOUND,
            )
        serializer = CartSerializer(cart)
        return Response(serializer.data, status=status.HTTP_200_OK)


class CartItemCreateAPIView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        cart = get_cart(request)
        if cart is None:
            return Response(
                {'error': {'code': 'no_cart', 'detail': 'No cart found. Provide X-Session-Id header or authenticate.'}},
                status=status.HTTP_404_NOT_FOUND,
            )

        serializer = CartItemWriteSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        variant = get_object_or_404(ProductVariant, pk=serializer.validated_data['variant_id'])
        quantity = serializer.validated_data['quantity']

        if variant.stock_quantity < quantity:
            return Response(
                {
                    'error': {
                        'code': 'stock_error',
                        'detail': f'Only {variant.stock_quantity} units of "{variant.product.name} ({variant.color}, {variant.size})" available.',
                    }
                },
                status=status.HTTP_409_CONFLICT,
            )

        cart_item, created = CartItem.objects.get_or_create(
            cart=cart,
            variant=variant,
            defaults={'quantity': quantity},
        )
        if not created:
            new_qty = cart_item.quantity + quantity
            if variant.stock_quantity < new_qty:
                return Response(
                    {
                        'error': {
                            'code': 'stock_error',
                            'detail': f'Only {variant.stock_quantity} units of "{variant.product.name} ({variant.color}, {variant.size})" available (you already have {cart_item.quantity} in cart).',
                        }
                    },
                    status=status.HTTP_409_CONFLICT,
                )
            cart_item.quantity = new_qty
            cart_item.save()

        item_serializer = CartItemSerializer(cart_item)
        return Response(item_serializer.data, status=status.HTTP_201_CREATED)


class CartItemDetailAPIView(APIView):
    permission_classes = [AllowAny]

    def _get_cart_item(self, request, item_id):
        cart = get_cart(request)
        if cart is None:
            return None, Response(
                {'error': {'code': 'no_cart', 'detail': 'No cart found.'}},
                status=status.HTTP_404_NOT_FOUND,
            )
        try:
            item = cart.items.select_related('variant__product').get(pk=item_id)
        except CartItem.DoesNotExist:
            return None, Response(
                {'error': {'code': 'not_found', 'detail': 'Cart item not found.'}},
                status=status.HTTP_404_NOT_FOUND,
            )
        return item, None

    def patch(self, request, item_id):
        item, error_response = self._get_cart_item(request, item_id)
        if error_response:
            return error_response

        serializer = CartItemUpdateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        new_quantity = serializer.validated_data['quantity']
        if item.variant.stock_quantity < new_quantity:
            return Response(
                {
                    'error': {
                        'code': 'stock_error',
                        'detail': f'Only {item.variant.stock_quantity} units of "{item.variant.product.name} ({item.variant.color}, {item.variant.size})" available.',
                    }
                },
                status=status.HTTP_409_CONFLICT,
            )

        item.quantity = new_quantity
        item.save()

        item_serializer = CartItemSerializer(item)
        return Response(item_serializer.data, status=status.HTTP_200_OK)

    def delete(self, request, item_id):
        item, error_response = self._get_cart_item(request, item_id)
        if error_response:
            return error_response

        item.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class CartMergeAPIView(APIView):
    def post(self, request):
        if not request.user.is_authenticated:
            return Response(
                {'error': {'code': 'authentication_error', 'detail': 'Authentication required to merge cart.'}},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        session_id = request.headers.get('X-Session-Id')
        if not session_id:
            return Response(
                {'error': {'code': 'no_session', 'detail': 'X-Session-Id header is required.'}},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            guest_cart = Cart.objects.get(session_id=session_id, user__isnull=True)
        except Cart.DoesNotExist:
            return Response(
                {'error': {'code': 'not_found', 'detail': 'No guest cart found for this session.'}},
                status=status.HTTP_404_NOT_FOUND,
            )

        user_cart, _ = Cart.objects.get_or_create(user=request.user)

        for guest_item in guest_cart.items.select_related('variant__product').all():
            existing = user_cart.items.filter(variant=guest_item.variant).first()
            if existing:
                existing.quantity += guest_item.quantity
                existing.save()
            else:
                guest_item.cart = user_cart
                guest_item.save()

        guest_cart.delete()

        serializer = CartSerializer(user_cart)
        return Response(serializer.data, status=status.HTTP_200_OK)
