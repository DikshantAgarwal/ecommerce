import { useState } from 'react';
import { Link } from 'react-router';
import { useCart } from '../hooks/useCart';
import { useCreateOrder } from '../hooks/useOrder';
import { useInitiatePayment } from '../hooks/usePayment';
import { openCashfreeCheckout } from '../lib/cashfree';
import { CheckoutSteps, ShippingAddressForm } from '../components';
import type { Address } from '../types/address';
import { ChevronLeft, ShoppingCart } from 'lucide-react';
import { formatPrice } from '../utils/format';

export default function Checkout() {
  const { data: cart, isLoading, error } = useCart();
  const { mutate: placeOrder, isPending: isPlacing } = useCreateOrder();
  const { mutate: initiate, isPending: isInitiating } = useInitiatePayment();
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);

  function handlePay() {
    if (!selectedAddress) return;
    placeOrder({ shipping_address_id: selectedAddress.id }, {
      onSuccess: (order) => {
        const returnUrl = `${window.location.origin}/orders/${order.id}/confirmation`;
        initiate(
          { orderId: order.id, returnUrl },
          {
            onSuccess: async (payment) => {
              await openCashfreeCheckout(payment.payment_session_id);
            },
          },
        );
      },
    });
  }

  const isPending = isPlacing || isInitiating;

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

  if (cart.items.length === 0 && !isPending) {
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
    <div className="mx-auto max-w-6xl px-4 pb-28 pt-6 sm:px-6 lg:px-8 lg:pb-12">
      <div className="mb-5 flex items-center gap-2">
        <Link
          to="/cart"
          className="-ml-2 rounded-lg p-2 text-neutral-600 transition-colors hover:bg-neutral-100 hover:text-primary-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-700"
          aria-label="Back to cart"
        >
          <ChevronLeft className="size-5" />
        </Link>
        <h1 className="text-xl font-semibold text-neutral-900 sm:text-2xl">Checkout</h1>
      </div>

      <CheckoutSteps current="address" />

      <div className="mt-6 lg:grid lg:grid-cols-[1fr_360px] lg:items-start lg:gap-8">
        <div className="min-w-0">
          <ShippingAddressForm onAddressChange={setSelectedAddress} />

          <div className="mt-8 space-y-4">
            <h2 className="text-lg font-semibold text-neutral-900">Order Summary</h2>
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
        </div>

        <aside className="mt-8 hidden rounded-xl border border-neutral-100 bg-neutral-0 p-5 sm:p-6 lg:mt-0 lg:block">
          <h2 className="text-sm font-semibold text-neutral-900">Total</h2>
          <p className="mt-3 text-3xl font-bold text-neutral-900">{formatPrice(cart.total)}</p>
          <button
            onClick={handlePay}
            disabled={isPending || !selectedAddress}
            className="mt-6 h-12 w-full rounded-lg bg-primary-900 px-8 text-sm font-semibold text-white transition-colors duration-200 hover:bg-primary-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-700 disabled:cursor-not-allowed disabled:bg-neutral-200 disabled:text-neutral-400 disabled:hover:bg-neutral-200"
          >
            {isPending ? 'Redirecting to payment...' : 'Proceed to Pay'}
          </button>
          <Link
            to="/cart"
            className="mt-3 block text-center text-sm text-neutral-600 transition-colors hover:text-primary-900"
          >
            &larr; Back to cart
          </Link>
        </aside>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-neutral-200 bg-neutral-0 py-3 lg:hidden">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4">
          <div>
            <p className="text-xs text-neutral-500">Total</p>
            <p className="text-lg font-semibold text-neutral-900">{formatPrice(cart.total)}</p>
          </div>
          <button
            onClick={handlePay}
            disabled={isPending || !selectedAddress}
            className="flex h-12 flex-1 items-center justify-center rounded-lg bg-primary-900 px-6 text-sm font-semibold text-white transition-colors duration-200 hover:bg-primary-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-700 disabled:cursor-not-allowed disabled:bg-neutral-200 disabled:text-neutral-400 disabled:hover:bg-neutral-200"
          >
            {isPending
              ? 'Redirecting...'
              : selectedAddress
                ? 'Proceed to Pay'
                : 'Select address to continue'}
          </button>
        </div>
      </div>
    </div>
  );
}