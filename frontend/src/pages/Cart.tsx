import { Link, useNavigate } from 'react-router';
import { ChevronLeft, Minus, Plus, ShoppingCart } from 'lucide-react';
import { useCart, useUpdateCartItem, useRemoveCartItem } from '../hooks/useCart';
import { CheckoutSteps } from '../components';
import { formatPrice } from '../utils/format';
import type { CartItem } from '../types/cart';

const DELIVERY_CHARGE = 0;

export default function Cart() {
  const { data: cart, isLoading, error } = useCart();
  const { mutate: updateQuantity } = useUpdateCartItem();
  const { mutate: removeItem } = useRemoveCartItem();
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="mx-auto px-4 py-8 sm:px-6 lg:px-8" role="status">
        <div className="mb-6 h-8 w-32 animate-pulse rounded bg-neutral-200" />
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex animate-pulse gap-4 rounded-xl border border-neutral-100 bg-white p-4">
            <div className="size-24 rounded-lg bg-neutral-200" />
            <div className="flex-1 space-y-3 py-1">
              <div className="h-4 w-3/4 rounded bg-neutral-200" />
              <div className="h-3 w-1/3 rounded bg-neutral-200" />
              <div className="h-10 w-28 rounded bg-neutral-200" />
            </div>
          </div>
        ))}
        <span className="sr-only">Loading cart...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto px-4 py-16 text-center sm:px-6 lg:px-8" role="alert">
        <h1 className="text-2xl font-bold text-neutral-900">Could not load cart</h1>
        <p className="mt-2 text-neutral-600">Please try again later.</p>
        <Link to="/" className="mt-6 inline-block text-sm font-semibold text-neutral-600 hover:text-primary-900">
          &larr; Continue shopping
        </Link>
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="mx-auto px-4 py-16 text-center sm:px-6 lg:px-8">
        <div className="mx-auto flex size-20 items-center justify-center rounded-full bg-neutral-100">
          <ShoppingCart className="size-9 text-neutral-400" aria-hidden="true" />
        </div>
        <h1 className="mt-6 text-xl font-semibold text-neutral-900">Your cart is empty</h1>
        <p className="mt-2 text-sm text-neutral-600">Looks like you have not added anything yet.</p>
        <Link
          to="/products"
          className="mt-8 inline-flex h-12 items-center justify-center rounded-lg bg-primary-900 px-8 text-sm font-semibold text-white transition-colors duration-200 hover:bg-primary-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-700"
        >
          Continue Shopping
        </Link>
      </div>
    );
  }

  const subtotal = cart.items.reduce(
    (sum, item) => sum + item.variant_detail.display_price * item.quantity,
    0,
  );
  const total = (Number(cart.total) || subtotal) + DELIVERY_CHARGE;

  return (
    <div className="mx-auto max-w-6xl px-4 pb-28 pt-6 sm:px-6 lg:px-8 lg:pb-12">
      <div className="mb-5 flex items-center gap-2">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="-ml-2 rounded-lg p-2 text-neutral-600 transition-colors hover:bg-neutral-100 hover:text-primary-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-700"
          aria-label="Back"
        >
          <ChevronLeft className="size-5" />
        </button>
        <h1 className="text-xl font-semibold text-neutral-900 sm:text-2xl">Cart</h1>
      </div>

      <CheckoutSteps current="cart" />

      <div className="mt-6 lg:grid lg:grid-cols-[1fr_360px] lg:items-start lg:gap-8">
        <section aria-label="Cart items" className="min-w-0">
          <p className="mb-3 text-sm text-neutral-500">
            {cart.items.length} {cart.items.length === 1 ? 'Item' : 'Items'}
          </p>

          <div className="space-y-3">
            {cart.items.map((item) => (
              <CartItemRow
                key={item.id}
                item={item}
                onUpdate={(quantity) => updateQuantity({ itemId: item.id, payload: { quantity } })}
                onRemove={() => removeItem(item.id)}
              />
            ))}
          </div>
        </section>

        <OrderSummary subtotal={subtotal} total={total} className="mt-8 lg:mt-0" />
      </div>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-neutral-200 bg-neutral-0 py-3 lg:hidden">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4">
          <div>
            <p className="text-xs text-neutral-500">Total</p>
            <p className="text-lg font-semibold text-neutral-900">{formatPrice(total)}</p>
          </div>
          <Link
            to="/checkout"
            className="flex h-12 flex-1 items-center justify-center rounded-lg bg-primary-900 px-6 text-sm font-semibold text-white transition-colors duration-200 hover:bg-primary-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-700"
          >
            Continue to Address
          </Link>
        </div>
      </div>
    </div>
  );
}

interface CartItemRowProps {
  item: CartItem;
  onUpdate: (quantity: number) => void;
  onRemove: () => void;
}

function CartItemRow({ item, onUpdate, onRemove }: CartItemRowProps) {
  const v = item.variant_detail;
  const itemPrice = v.display_price;

  return (
    <div className="flex gap-4 rounded-xl border border-neutral-100 bg-white p-4">
      <Link
        to={`/products/${v.product_slug}`}
        className="flex size-24 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-neutral-100 text-neutral-400"
      >
        {v.product_image ? (
          <img src={v.product_image} alt={v.product_name} className="size-full object-cover" loading="lazy" />
        ) : (
          <ShoppingCart className="size-8" aria-hidden="true" />
        )}
      </Link>

      <div className="min-w-0 flex-1">
        <Link to={`/products/${v.product_slug}`} className="line-clamp-2 text-sm font-medium text-neutral-900 transition-colors hover:text-primary-900">
          {v.product_name}
        </Link>

        <p className="mt-1 text-xs text-neutral-500">
          {v.color} · {v.size}
        </p>

        <p className="mt-1 text-sm font-medium text-neutral-900">
          {formatPrice(String(itemPrice))}
        </p>

        <div className="mt-3 flex items-center justify-between gap-2">
          <div className="flex h-10 items-center rounded-lg border border-neutral-200">
            <button
              type="button"
              onClick={() => onUpdate(Math.max(1, item.quantity - 1))}
              disabled={item.quantity <= 1}
              className="flex size-10 items-center justify-center rounded-l-lg text-neutral-600 transition-colors hover:bg-neutral-100 hover:text-primary-900 disabled:cursor-not-allowed disabled:opacity-30 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-700"
              aria-label="Decrease quantity"
            >
              <Minus className="size-4" aria-hidden="true" />
            </button>
            <span
              className="w-9 text-center text-sm font-medium text-neutral-900"
              aria-label={`Quantity: ${item.quantity}`}
            >
              {item.quantity}
            </span>
            <button
              type="button"
              onClick={() => onUpdate(item.quantity + 1)}
              disabled={item.quantity >= v.stock_quantity}
              className="flex size-10 items-center justify-center rounded-r-lg text-neutral-600 transition-colors hover:bg-neutral-100 hover:text-primary-900 disabled:cursor-not-allowed disabled:opacity-30 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-700"
              aria-label="Increase quantity"
            >
              <Plus className="size-4" aria-hidden="true" />
            </button>
          </div>

          <button
            type="button"
            onClick={onRemove}
            className="rounded-md px-2 py-1 text-xs font-medium text-neutral-500 transition-colors hover:bg-red-50 hover:text-red-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600"
          >
            Remove
          </button>
        </div>
      </div>
    </div>
  );
}

interface OrderSummaryProps {
  subtotal: number;
  total: number;
  className?: string;
}

function OrderSummary({ subtotal, total, className = '' }: OrderSummaryProps) {
  return (
    <aside className={className}>
      <div className="rounded-xl border border-neutral-100 bg-white p-5 sm:p-6">
        <h2 className="text-sm font-semibold text-neutral-900">Order Summary</h2>

        <dl className="mt-4 space-y-3 text-sm">
          <div className="flex items-center justify-between">
            <dt className="text-neutral-600">Subtotal</dt>
            <dd className="font-medium text-neutral-900">{formatPrice(subtotal)}</dd>
          </div>
          <div className="flex items-center justify-between">
            <dt className="text-neutral-600">Delivery</dt>
            <dd className="font-medium text-primary-900">
              {DELIVERY_CHARGE === 0 ? 'Free' : formatPrice(DELIVERY_CHARGE)}
            </dd>
          </div>
          <div className="border-t border-neutral-200 pt-3" />
          <div className="flex items-center justify-between">
            <dt className="text-base font-semibold text-neutral-900">Total</dt>
            <dd className="text-base font-semibold text-neutral-900">{formatPrice(total)}</dd>
          </div>
        </dl>

        <Link
          to="/checkout"
          className="mt-5 hidden h-12 w-full items-center justify-center rounded-lg bg-primary-900 px-8 text-sm font-semibold text-white transition-colors duration-200 hover:bg-primary-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-700 lg:flex"
        >
          Continue to Address
        </Link>
      </div>
    </aside>
  );
}