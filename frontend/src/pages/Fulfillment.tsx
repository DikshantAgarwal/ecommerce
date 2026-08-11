import { useMemo, useState } from 'react';
import { Link } from 'react-router';
import { useOrders } from '../hooks/useOrder';
import { useAuthStore } from '../store/auth.store';
import type { Order } from '../types';
import { Package, PackageCheck, PackageX } from 'lucide-react';
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

type StatusFilter = 'all' | Order['status'];

export default function Fulfillment() {
  const { data: orders, isLoading, error } = useOrders();
  const user = useAuthStore((s) => s.user);
  const [filter, setFilter] = useState<StatusFilter>('all');

  const filtered = useMemo(() => {
    if (!orders) return [];
    if (filter === 'all') return orders;
    return orders.filter((o) => o.status === filter);
  }, [orders, filter]);

  if (user && !user.is_staff) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center sm:px-6 lg:px-8" role="alert">
        <PackageX className="mx-auto size-16 text-neutral-300" aria-hidden="true" />
        <h1 className="mt-4 text-2xl font-bold text-neutral-900">Access restricted</h1>
        <p className="mt-2 text-neutral-600">Only staff members can view order fulfillment.</p>
        <Link to="/" className="mt-6 inline-block text-sm font-semibold text-neutral-600 hover:text-primary-900">
          &larr; Back to home
        </Link>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8" role="status">
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
        <span className="sr-only">Loading orders...</span>
      </div>
    );
  }

  if (error || !orders) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center sm:px-6 lg:px-8" role="alert">
        <h1 className="text-2xl font-bold text-neutral-900">Could not load orders</h1>
        <p className="mt-2 text-neutral-600">Please try again later.</p>
        <Link to="/" className="mt-6 inline-block text-sm font-semibold text-neutral-600 hover:text-primary-900">
          &larr; Back to home
        </Link>
      </div>
    );
  }

  const tabs: StatusFilter[] = ['all', 'pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex items-center gap-2">
        <h1 className="text-2xl font-bold text-neutral-900">Fulfillment</h1>
        <Package className="size-6 text-primary-900" aria-hidden="true" />
      </div>
      <p className="mt-1 text-sm text-neutral-600">Manage and track customer orders.</p>

      <div className="mt-6 flex flex-wrap gap-2">
        {tabs.map((tab) => {
          const count = tab === 'all' ? orders.length : orders.filter((o) => o.status === tab).length;
          const isActive = filter === tab;
          return (
            <button
              key={tab}
              type="button"
              onClick={() => setFilter(tab)}
              aria-pressed={isActive}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-700 ${
                isActive
                  ? 'bg-primary-900 text-white'
                  : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200 hover:text-primary-900'
              }`}
            >
              {tab === 'all' ? 'All' : STATUS_LABELS[tab]} ({count})
            </button>
          );
        })}
      </div>

      {filtered.length === 0 ? (
        <div className="mt-8 rounded-xl border border-dashed border-neutral-200 py-16 text-center">
          <PackageCheck className="mx-auto size-12 text-neutral-300" aria-hidden="true" />
          <p className="mt-3 text-sm text-neutral-600">No orders in this status.</p>
        </div>
      ) : (
        <ul className="mt-6 space-y-4">
          {filtered.map((order) => (
            <li key={order.id} className="rounded-lg border border-neutral-100 bg-neutral-0 p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-neutral-900">
                    Order #{order.id.slice(0, 8).toUpperCase()}
                  </p>
                  <p className="mt-0.5 text-xs text-neutral-600">User ID: {order.user}</p>
                  <p className="mt-0.5 text-xs text-neutral-600">
                    Placed {new Date(order.created_at).toLocaleString()}
                  </p>
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
                        {item.product_name} <span className="text-neutral-500">({item.color} / {item.size} × {item.quantity})</span>
                      </span>
                      <span className="shrink-0 text-neutral-600">{formatPrice(item.total_price)}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {order.shipping_address && (
                <div className="mt-4 border-t border-neutral-100 pt-3 text-sm text-neutral-600">
                  <p className="text-xs font-medium uppercase tracking-wide text-neutral-500">Ship to</p>
                  <p className="mt-1">
                    {order.shipping_address.name} · {order.shipping_address.phone}
                    <br />
                    {order.shipping_address.address_line1}
                    {order.shipping_address.address_line2 ? `, ${order.shipping_address.address_line2}` : ''}
                    <br />
                    {order.shipping_address.city}, {order.shipping_address.state} {order.shipping_address.postal_code}
                    <br />
                    {order.shipping_address.country}
                  </p>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
