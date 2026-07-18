from django.urls import path

from apps.cart.views import (
    CartAPIView,
    CartItemCreateAPIView,
    CartItemDetailAPIView,
    CartMergeAPIView,
)

urlpatterns = [
    path('cart/', CartAPIView.as_view(), name='cart-detail'),
    path('cart/items/', CartItemCreateAPIView.as_view(), name='cart-item-create'),
    path('cart/items/<uuid:item_id>/', CartItemDetailAPIView.as_view(), name='cart-item-detail'),
    path('cart/merge/', CartMergeAPIView.as_view(), name='cart-merge'),
]
