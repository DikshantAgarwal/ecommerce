import { Link } from 'react-router';
import { useCart, useUpdateCartItem, useRemoveCartItem } from '../hooks/useCart';

function formatPrice(price: string): string {
  return `$${parseFloat(price).toFixed(2)}`;
}

export default function Cart() {
  const { data: cart, isLoading, error } = useCart();
  const { mutate: updateQuantity } = useUpdateCartItem();
  const { mutate: removeItem } = useRemoveCartItem();

  if (isLoading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8" role="status">
        <div className="mb-6 h-8 w-32 animate-pulse rounded bg-neutral-200" />
        {[1, 2, 3].map((i) => (
          <div key={i} className="mb-4 flex animate-pulse gap-4 rounded-lg bg-white p-4">
            <div className="size-20 rounded bg-neutral-200" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-3/4 rounded bg-neutral-200" />
              <div className="h-3 w-1/4 rounded bg-neutral-200" />
            </div>
          </div>
        ))}
        <span className="sr-only">Loading cart...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center sm:px-6 lg:px-8" role="alert">
        <h1 className="text-2xl font-bold text-neutral-900">Could not load cart</h1>
        <p className="mt-2 text-neutral-600">Please try again later.</p>
        <Link to="/" className="mt-6 inline-block text-sm font-semibold text-primary-700 hover:text-primary-900">
          &larr; Continue shopping
        </Link>
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center sm:px-6 lg:px-8">
        <svg className="mx-auto size-16 text-neutral-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
        </svg>
        <h1 className="mt-4 text-xl font-bold text-neutral-900">Your cart is empty</h1>
        <p className="mt-2 text-neutral-600">Looks like you have not added anything yet.</p>
        <Link to="/" className="mt-6 inline-block rounded-md bg-primary-700 px-6 py-3 text-sm font-medium text-white hover:bg-primary-900">
          Start shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="mb-6 font-heading text-2xl font-bold text-neutral-900">Shopping Cart</h1>

      <div className="space-y-4">
        {cart.items.map((item) => {
          const v = item.variant_detail;
          const itemPrice = v.display_price;

          return (
            <div key={item.id} className="flex items-center gap-4 rounded-lg bg-white p-4 shadow-sm">
              <div className="flex size-20 shrink-0 items-center justify-center rounded bg-neutral-100 text-neutral-400">
                {v.product_image ? (
                  <img src={v.product_image} alt={v.product_name} className="size-full object-cover" />
                ) : (
                  <svg className="size-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                )}
              </div>

              <div className="min-w-0 flex-1">
                <Link to={`/products/${v.product_slug}`} className="text-sm font-medium text-neutral-900 hover:text-primary-700">
                  {v.product_name}
                </Link>
                <p className="mt-0.5 text-xs text-neutral-500">
                  {v.color} / {v.size}
                </p>
                <p className="mt-1 text-sm text-neutral-500">{formatPrice(String(itemPrice))}</p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => updateQuantity({ itemId: item.id, payload: { quantity: Math.max(1, item.quantity - 1) } })}
                  disabled={item.quantity <= 1}
                  className="flex size-8 items-center justify-center rounded border text-neutral-600 hover:bg-neutral-100 disabled:opacity-30"
                  aria-label="Decrease quantity"
                >
                  -
                </button>
                <span className="w-8 text-center text-sm font-medium" aria-label={`Quantity: ${item.quantity}`}>
                  {item.quantity}
                </span>
                <button
                  onClick={() => updateQuantity({ itemId: item.id, payload: { quantity: item.quantity + 1 } })}
                  disabled={item.quantity >= v.stock_quantity}
                  className="flex size-8 items-center justify-center rounded border text-neutral-600 hover:bg-neutral-100 disabled:opacity-30"
                  aria-label="Increase quantity"
                >
                  +
                </button>
              </div>

              <p className="w-20 text-right text-sm font-medium text-neutral-900">
                {formatPrice(String(itemPrice * item.quantity))}
              </p>

              <button
                onClick={() => removeItem(item.id)}
                className="text-neutral-400 hover:text-red-600"
                aria-label={`Remove ${v.product_name} from cart`}
              >
                <svg className="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          );
        })}
      </div>

      <div className="mt-8 border-t pt-6">
        <div className="flex items-center justify-between">
          <span className="text-lg font-semibold text-neutral-900">Total</span>
          <span className="text-2xl font-bold text-primary-700">{formatPrice(cart.total)}</span>
        </div>
        <button
          disabled
          className="mt-4 w-full rounded-md bg-primary-700 px-6 py-3 text-sm font-medium text-white hover:bg-primary-900 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Proceed to Checkout
        </button>
        <p className="mt-2 text-center text-xs text-neutral-400">Checkout coming soon</p>
      </div>
    </div>
  );
}
