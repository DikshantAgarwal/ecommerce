from django.urls import path

from apps.orders.views import OrderCreateAPIView, OrderDetailAPIView

urlpatterns = [
    path('orders/', OrderCreateAPIView.as_view(), name='order-create'),
    path('orders/<uuid:pk>/', OrderDetailAPIView.as_view(), name='order-detail'),
]
