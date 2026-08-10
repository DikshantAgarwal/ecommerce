import { Link } from 'react-router';
import { useCart } from '../hooks/useCart';
import { useCreateOrder } from '../hooks/useOrder';
import { ShoppingCart } from 'lucide-react';
import { formatPrice } from '../utils/format';

export default function Checkout() {
  const { data: cart, isLoading, error } = useCart();
  const { mutate: placeOrder, isPending } = useCreateOrder();

  if (isLoading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8" role="status">
        <div className="mb-6 h-8 w-48 animate-pulse rounded bg-neutral-200" />
        {[1, 2, 3].map((i) => (
          <div key={i} className="mb-4 flex animate-pulse gap-4 rounded-lg bg-neutral-0 p-4">
            <div className="size-20 rounded bg-neutral-200" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-3/4 rounded bg-neutral-200" />
              <div className="h-3 w-1/4 rounded bg-neutral-200" />
            </div>
          </div>
        ))}
        <span className="sr-only">Loading checkout...</span>
      </div>
    );
  }

  if (error || !cart) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center sm:px-6 lg:px-8" role="alert">
        <h1 className="text-2xl font-bold text-neutral-900">Could not load cart</h1>
        <p className="mt-2 text-neutral-600">Please try again later.</p>
        <Link to="/cart" className="mt-6 inline-block text-sm font-semibold text-neutral-600 hover:text-primary-900">
          &larr; Back to cart
        </Link>
      </div>
    );
  }

  if (cart.items.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center sm:px-6 lg:px-8">
        <ShoppingCart className="mx-auto size-16 text-neutral-300" aria-hidden="true" />
        <h1 className="mt-4 text-xl font-bold text-neutral-900">Your cart is empty</h1>
        <p className="mt-2 text-neutral-600">Add some items before checking out.</p>
        <Link to="/products" className="mt-6 inline-block h-12 rounded-lg bg-primary-900 px-8 py-3 text-sm font-semibold text-white transition-colors duration-200 hover:bg-primary-700">
          Browse products
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="mb-8 text-2xl font-bold text-neutral-900">Checkout</h1>

      <div className="space-y-4">
        {cart.items.map((item) => {
          const v = item.variant_detail;
          const itemPrice = v.display_price;
          return (
            <div key={item.id} className="flex items-center gap-4 rounded-lg bg-neutral-0 p-4">
              <div className="flex size-20 shrink-0 items-center justify-center rounded bg-neutral-100 text-neutral-400">
                {v.product_image ? (
                  <img src={v.product_image} alt={v.product_name} className="size-full object-cover" />
                ) : (
                  <ShoppingCart className="size-8" aria-hidden="true" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-neutral-900">{v.product_name}</p>
                <p className="mt-0.5 text-xs text-neutral-600">{v.color} / {v.size}</p>
                <p className="mt-1 text-sm text-neutral-600">Qty: {item.quantity}</p>
              </div>
              <p className="text-sm font-medium text-neutral-900">
                {formatPrice(String(itemPrice * item.quantity))}
              </p>
            </div>
          );
        })}
      </div>

      <div className="mt-8 border-t pt-6">
        <div className="flex items-center justify-between">
          <span className="text-lg font-semibold text-neutral-900">Total</span>
          <span className="text-2xl font-bold text-neutral-900">{formatPrice(cart.total)}</span>
        </div>
        <button
          onClick={() => placeOrder()}
          disabled={isPending}
          className="mt-4 h-12 w-full rounded-lg bg-primary-900 px-8 text-sm font-semibold text-white transition-colors duration-200 hover:bg-primary-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-700 disabled:cursor-not-allowed disabled:bg-neutral-200 disabled:text-neutral-400 disabled:hover:bg-neutral-200"
        >
          {isPending ? 'Placing Order...' : 'Place Order'}
        </button>
        <Link
          to="/cart"
          className="mt-3 block text-center text-sm text-neutral-600 transition-colors hover:text-primary-900"
        >
          &larr; Back to cart
        </Link>
      </div>
    </div>
  );
}
