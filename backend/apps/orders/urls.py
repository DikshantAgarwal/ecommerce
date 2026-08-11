from django.urls import path

from apps.orders.views import (
    MyOrdersAPIView,
    OrderDetailAPIView,
    OrderListCreateAPIView,
)

urlpatterns = [
    path('orders/', OrderListCreateAPIView.as_view(), name='order-list-create'),
    path('orders/mine/', MyOrdersAPIView.as_view(), name='order-mine'),
    path('orders/<uuid:pk>/', OrderDetailAPIView.as_view(), name='order-detail'),
]
