import { Link } from 'react-router';
import { useMyOrders } from '../hooks/useOrder';
import type { Order } from '../types';
import { Package, PackageCheck, ShoppingBag } from 'lucide-react';
import { formatPrice } from '../utils/format';

const STATUS_LABELS: Record<Order['status'], string> = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  shipped: 'Shipped',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
};

const STATUS_STYLES: Record<Order['status'], string> = {
  pending: 'bg-amber-50 text-amber-700',
  confirmed: 'bg-primary-100 text-primary-900',
  shipped: 'bg-blue-50 text-blue-700',
  delivered: 'bg-green-50 text-green-700',
  cancelled: 'bg-red-50 text-red-600',
};

export default function OrderHistory() {
  const { data: orders, isLoading, error } = useMyOrders();

  if (isLoading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8" role="status">
        <div className="mb-6 h-8 w-48 animate-pulse rounded bg-neutral-200" />
        {[1, 2, 3].map((i) => (
          <div key={i} className="mb-4 flex animate-pulse gap-4 rounded-lg bg-neutral-0 p-4">
            <div className="flex-1 space-y-2">
              <div className="h-4 w-1/3 rounded bg-neutral-200" />
              <div className="h-3 w-1/2 rounded bg-neutral-200" />
            </div>
            <div className="h-4 w-24 rounded bg-neutral-200" />
          </div>
        ))}
        <span className="sr-only">Loading your orders...</span>
      </div>
    );
  }

  if (error || !orders) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center sm:px-6 lg:px-8" role="alert">
        <h1 className="text-2xl font-bold text-neutral-900">Could not load your orders</h1>
        <p className="mt-2 text-neutral-600">Please try again later.</p>
        <Link to="/" className="mt-6 inline-block text-sm font-semibold text-neutral-600 hover:text-primary-900">
          &larr; Back to home
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex items-center gap-2">
        <h1 className="text-2xl font-bold text-neutral-900">Your orders</h1>
        <ShoppingBag className="size-6 text-primary-900" aria-hidden="true" />
      </div>
      <p className="mt-1 text-sm text-neutral-600">Track the status of your past orders.</p>

      {orders.length === 0 ? (
        <div className="mt-8 rounded-xl border border-dashed border-neutral-200 py-16 text-center">
          <Package className="mx-auto size-12 text-neutral-300" aria-hidden="true" />
          <p className="mt-3 text-sm text-neutral-600">You haven't placed any orders yet.</p>
          <Link
            to="/products"
            className="mt-4 inline-block rounded-lg bg-primary-900 px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary-800"
          >
            Start shopping
          </Link>
        </div>
      ) : (
        <ul className="mt-6 space-y-4">
          {orders.map((order) => (
            <li key={order.id} className="rounded-lg border border-neutral-100 bg-neutral-0 p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-neutral-900">
                    Order #{order.id.slice(0, 8).toUpperCase()}
                  </p>
                  <p className="mt-0.5 text-xs text-neutral-600">Placed {new Date(order.created_at).toLocaleString()}</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-neutral-900">{formatPrice(order.total)}</p>
                  <span
                    className={`mt-1 inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_STYLES[order.status]}`}
                  >
                    {STATUS_LABELS[order.status]}
                  </span>
                  <span
                    className={`ml-1 inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      order.payment_status === 'paid'
                        ? 'bg-green-50 text-green-700'
                        : order.payment_status === 'failed'
                          ? 'bg-red-50 text-red-600'
                          : 'bg-neutral-100 text-neutral-600'
                    }`}
                  >
                    Payment: {order.payment_status}
                  </span>
                </div>
              </div>

              <div className="mt-4 border-t border-neutral-100 pt-3">
                <p className="text-xs font-medium uppercase tracking-wide text-neutral-500">Items</p>
                <ul className="mt-2 space-y-1">
                  {order.items.map((item) => (
                    <li key={item.id} className="flex items-center justify-between gap-3 text-sm">
                      <span className="min-w-0 truncate text-neutral-800">
                        {item.product_name}{' '}
                        <span className="text-neutral-500">
                          ({item.color} / {item.size} × {item.quantity})
                        </span>
                      </span>
                      <span className="shrink-0 text-neutral-600">{formatPrice(item.total_price)}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-4 border-t border-neutral-100 pt-3">
                <Link
                  to={`/orders/${order.id}/confirmation`}
                  className="inline-flex items-center gap-2 rounded-lg bg-primary-900 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-700"
                >
                  <PackageCheck className="size-4" aria-hidden="true" />
                  View details
                </Link>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
