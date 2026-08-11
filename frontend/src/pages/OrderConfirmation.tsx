import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router';
import { useOrder } from '../hooks/useOrder';
import { useInitiatePayment, usePaymentStatus } from '../hooks/usePayment';
import { openCashfreeCheckout } from '../lib/cashfree';
import { CheckCircle, Loader2, XCircle } from 'lucide-react';
import { formatPrice } from '../utils/format';

const NOT_COMPLETED_TIMEOUT_MS = 20000;

export default function OrderConfirmation() {
  const { id } = useParams<{ id: string }>();
  const { data: order, isLoading, error } = useOrder(id);
  const { mutate: initiate, isPending: isInitiating } = useInitiatePayment();

  const needsPolling = !!order && order.payment_status !== 'paid' && order.payment_status !== 'failed';
  const { data: payment } = usePaymentStatus(id, needsPolling);

  const paymentStatus = payment?.payment_status ?? order?.payment_status ?? 'unpaid';
  const isTerminal = paymentStatus === 'paid' || paymentStatus === 'failed';

  const [showNotCompleted, setShowNotCompleted] = useState(false);

  useEffect(() => {
    if (isTerminal) return;
    const timer = setTimeout(() => setShowNotCompleted(true), NOT_COMPLETED_TIMEOUT_MS);
    return () => clearTimeout(timer);
  }, [isTerminal]);

  function handleRetryPayment() {
    if (!order) return;
    setShowNotCompleted(false);
    const returnUrl = `${window.location.origin}/orders/${order.id}/confirmation`;
    initiate(
      { orderId: order.id, returnUrl },
      {
        onSuccess: async (payment) => {
          await openCashfreeCheckout(payment.payment_session_id);
        },
      },
    );
  }

  if (isLoading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8" role="status">
        <div className="mx-auto mb-6 h-16 w-16 animate-pulse rounded-full bg-neutral-200" />
        <div className="mx-auto mb-4 h-8 w-64 animate-pulse rounded bg-neutral-200" />
        <div className="mx-auto h-4 w-48 animate-pulse rounded bg-neutral-200" />
        <span className="sr-only">Loading order confirmation...</span>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center sm:px-6 lg:px-8" role="alert">
        <h1 className="text-2xl font-bold text-neutral-900">Order not found</h1>
        <p className="mt-2 text-neutral-600">We could not find this order. Please check the link or contact support.</p>
        <Link to="/" className="mt-6 inline-block text-sm font-semibold text-neutral-600 hover:text-primary-900">
          &larr; Back to home
        </Link>
      </div>
    );
  }

  const isPaid = paymentStatus === 'paid';
  const isFailed = paymentStatus === 'failed';
  const isNotCompleted = !isTerminal && showNotCompleted;

  let statusTitle = 'Awaiting Payment...';
  let statusText = 'Your payment is being processed. This page will refresh automatically.';
  let StatusIcon = Loader2;

  if (isPaid) {
    statusTitle = 'Payment Successful!';
    statusText = 'Thank you for your purchase. Your order has been placed successfully.';
    StatusIcon = CheckCircle;
  } else if (isFailed) {
    statusTitle = 'Payment Failed';
    statusText = 'Your payment did not go through. Please try again or contact support.';
    StatusIcon = XCircle;
  } else if (isNotCompleted) {
    statusTitle = 'Payment Not Completed';
    statusText =
      'Your payment was not completed, and no amount was charged. You can retry the payment for this order.';
    StatusIcon = XCircle;
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="text-center">
        <div
          className={`mx-auto flex size-16 items-center justify-center rounded-full ${
            isPaid || isNotCompleted ? 'bg-primary-100' : isFailed ? 'bg-red-100' : 'bg-neutral-100'
          }`}
        >
          <StatusIcon
            className={`size-9 ${
              isPaid || isNotCompleted ? 'text-primary-900' : isFailed ? 'text-red-600' : 'animate-spin text-primary-900'
            }`}
            aria-hidden="true"
          />
        </div>
        <h1 className="mt-4 text-2xl font-bold text-neutral-900">{statusTitle}</h1>
        <p className="mt-2 text-neutral-600">{statusText}</p>
        <p className="mt-1 text-sm text-neutral-500">
          Order #{order.id.slice(0, 8).toUpperCase()}
        </p>
      </div>

      <div className="mt-8 space-y-4">
        {order.items.map((item) => (
          <div key={item.id} className="flex items-center gap-4 rounded-lg bg-neutral-0 p-4">
            <div className="flex size-20 shrink-0 items-center justify-center rounded bg-neutral-100 text-neutral-400">
              {item.product_image ? (
                <img src={item.product_image} alt={item.product_name} className="size-full object-cover" />
              ) : (
                <div className="size-10 rounded bg-neutral-200" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <Link to={`/products/${item.product_slug}`} className="text-sm font-medium text-neutral-900 hover:text-primary-900">
                {item.product_name}
              </Link>
              <p className="mt-0.5 text-xs text-neutral-600">{item.color} / {item.size}</p>
              <p className="mt-1 text-sm text-neutral-600">Qty: {item.quantity}</p>
            </div>
            <p className="text-sm font-medium text-neutral-900">{formatPrice(item.total_price)}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 border-t pt-6">
        <div className="flex items-center justify-between">
          <span className="text-lg font-semibold text-neutral-900">Total</span>
          <span className="text-2xl font-bold text-neutral-900">{formatPrice(order.total)}</span>
        </div>
        <p className="mt-1 text-right text-sm text-neutral-500">
          Payment: {paymentStatus.charAt(0).toUpperCase() + paymentStatus.slice(1)}
        </p>
      </div>

      <div className="mt-8 flex flex-col items-center gap-3">
        {isFailed || isNotCompleted ? (
          <button
            type="button"
            onClick={handleRetryPayment}
            disabled={isInitiating}
            className="inline-flex h-12 w-full max-w-xs items-center justify-center rounded-lg bg-primary-900 px-8 text-sm font-semibold text-white transition-colors duration-200 hover:bg-primary-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-700 disabled:cursor-not-allowed disabled:bg-neutral-200 disabled:text-neutral-400"
          >
            {isInitiating ? 'Redirecting to payment...' : 'Retry Payment'}
          </button>
        ) : (
          <Link
            to="/"
            className="inline-flex h-12 w-full max-w-xs items-center justify-center rounded-lg bg-primary-900 px-8 text-sm font-semibold text-white transition-colors duration-200 hover:bg-primary-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-700"
          >
            Continue Shopping
          </Link>
        )}
        <Link
          to="/"
          className="text-sm text-neutral-600 transition-colors hover:text-primary-900"
        >
          Back to home
        </Link>
      </div>
    </div>
  );
}