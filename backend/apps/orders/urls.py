from django.urls import path

from apps.orders.views import OrderDetailAPIView, OrderListCreateAPIView

urlpatterns = [
    path('orders/', OrderListCreateAPIView.as_view(), name='order-list-create'),
    path('orders/<uuid:pk>/', OrderDetailAPIView.as_view(), name='order-detail'),
]
