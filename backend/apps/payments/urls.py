from django.urls import path

from apps.payments.views import (
    PaymentInitiateAPIView,
    PaymentStatusAPIView,
    PaymentWebhookAPIView,
)

urlpatterns = [
    path('payments/initiate/', PaymentInitiateAPIView.as_view(), name='payment-initiate'),
    path('payments/webhook/', PaymentWebhookAPIView.as_view(), name='payment-webhook'),
    path('payments/orders/<uuid:pk>/status/', PaymentStatusAPIView.as_view(), name='payment-status'),
]