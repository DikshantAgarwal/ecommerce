import json
import logging

from django.http import HttpResponse, JsonResponse
from django.shortcuts import get_object_or_404
from django.utils.decorators import method_decorator
from django.views import View
from django.views.decorators.csrf import csrf_exempt

from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.orders.models import Order
from apps.payments.serializers import PaymentInitiateSerializer
from apps.payments.services import (
    CashfreeError,
    create_order,
    fetch_order_status,
    verify_webhook_signature,
)

logger = logging.getLogger(__name__)

SUCCESS_EVENTS = {'PAYMENT_SUCCESS_WEBHOOK', 'PAYMENT_SUCCESS'}
FAILED_EVENTS = {'PAYMENT_FAILED_WEBHOOK', 'PAYMENT_FAILED', 'PAYMENT_USER_DROPPED_WEBHOOK'}


class PaymentInitiateAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = PaymentInitiateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        order = get_object_or_404(
            Order,
            pk=serializer.validated_data['order_id'],
            user=request.user,
        )

        if order.payment_status == Order.PaymentStatus.PAID:
            return Response(
                {'error': {'code': 'already_paid', 'detail': 'This order has already been paid.'}},
                status=status.HTTP_400_BAD_REQUEST,
            )

        return_url = serializer.validated_data.get('return_url') or ''
        if not return_url:
            return Response(
                {'error': {'code': 'missing_return_url', 'detail': 'A return_url is required.'}},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            payment_session_id = create_order(order, return_url)
        except CashfreeError as exc:
            logger.error('Cashfree create-order failed for order %s: %s', order.id, exc)
            return Response(
                {'error': {'code': 'gateway_error', 'detail': 'Could not initiate payment. Please try again.'}},
                status=status.HTTP_502_BAD_GATEWAY,
            )

        order.cashfree_order_id = str(order.id)
        order.payment_status = Order.PaymentStatus.PENDING
        order.save(update_fields=['cashfree_order_id', 'payment_status', 'updated_at'])

        return Response({
            'payment_session_id': payment_session_id,
            'order_id': str(order.id),
            'payment_status': order.payment_status,
        }, status=status.HTTP_200_OK)


@method_decorator(csrf_exempt, name='dispatch')
class PaymentWebhookAPIView(View):
    def post(self, request):
        raw_body = request.body.decode('utf-8')
        timestamp = request.headers.get('x-webhook-timestamp', '')
        signature = request.headers.get('x-webhook-signature', '')

        if not verify_webhook_signature(timestamp, raw_body, signature):
            return HttpResponse('Invalid signature', status=400)

        try:
            payload = json.loads(raw_body)
        except json.JSONDecodeError:
            return HttpResponse('Bad payload', status=400)

        event_type = payload.get('type', '')
        data = payload.get('data') or {}
        order_data = data.get('order') or {}
        payment_data = data.get('payment') or {}
        cashfree_order_id = order_data.get('order_id', '')

        order = Order.objects.filter(cashfree_order_id=cashfree_order_id).first()
        if not order:
            logger.warning('Cashfree webhook for unknown order: %s', cashfree_order_id)
            return HttpResponse('Ok', status=200)

        payment_status = payment_data.get('payment_status', '')
        if event_type in SUCCESS_EVENTS or payment_status == 'SUCCESS':
            order.payment_status = Order.PaymentStatus.PAID
            order.status = Order.Status.CONFIRMED
        elif event_type in FAILED_EVENTS or payment_status in ('FAILED', 'USER_DROPPED', 'CANCELLED'):
            order.payment_status = Order.PaymentStatus.FAILED
        order.save(update_fields=['payment_status', 'status', 'updated_at'])

        return HttpResponse('Ok', status=200)


class PaymentStatusAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        order = get_object_or_404(Order, pk=pk, user=request.user)

        if order.payment_status == Order.PaymentStatus.PAID:
            return self._respond(order)

        if order.cashfree_order_id:
            try:
                cashfree_status = fetch_order_status(order.cashfree_order_id)
                if cashfree_status == 'PAID':
                    order.payment_status = Order.PaymentStatus.PAID
                    order.status = Order.Status.CONFIRMED
                    order.save(update_fields=['payment_status', 'status', 'updated_at'])
            except CashfreeError as exc:
                logger.warning('Cashfree fetch-order failed for %s: %s', order.id, exc)

        return self._respond(order)

    def _respond(self, order):
        return Response({
            'order_id': str(order.id),
            'payment_status': order.payment_status,
            'order_status': order.status,
        }, status=status.HTTP_200_OK)