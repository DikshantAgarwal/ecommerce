import { Link, useParams } from 'react-router';
import { useOrder } from '../hooks/useOrder';
import { CheckCircle } from 'lucide-react';

function formatPrice(price: string | number): string {
  return `$${Number(price).toFixed(2)}`;
}

export default function OrderConfirmation() {
  const { id } = useParams<{ id: string }>();
  const { data: order, isLoading, error } = useOrder(id);

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

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="text-center">
        <CheckCircle className="mx-auto size-16 text-primary-900" aria-hidden="true" />
        <h1 className="mt-4 text-2xl font-bold text-neutral-900">Order Confirmed!</h1>
        <p className="mt-2 text-neutral-600">
          Thank you for your purchase. Your order has been placed successfully.
        </p>
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
        <p className="mt-1 text-right text-sm text-neutral-500">Status: {order.status.charAt(0).toUpperCase() + order.status.slice(1)}</p>
      </div>

      <div className="mt-8 text-center">
        <Link to="/" className="inline-flex h-12 items-center rounded-lg bg-primary-900 px-8 text-sm font-semibold text-white transition-colors duration-200 hover:bg-primary-700">
          Continue Shopping
        </Link>
      </div>
    </div>
  );
}
