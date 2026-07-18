import { Link } from 'react-router';
import { useCart } from '../hooks/useCart';

export default function CartIcon() {
  const { data: cart, isLoading } = useCart();
  const itemCount = cart?.items.reduce((sum, item) => sum + item.quantity, 0) ?? 0;

  return (
    <Link to="/cart" className="relative flex items-center text-neutral-600 hover:text-neutral-900">
      <svg
        className="size-6"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z"
        />
      </svg>
      {!isLoading && itemCount > 0 && (
        <span className="absolute -right-2 -top-2 flex size-5 items-center justify-center rounded-full bg-primary-700 text-xs font-bold text-white">
          {itemCount > 99 ? '99+' : itemCount}
        </span>
      )}
      <span className="sr-only">Cart ({itemCount} items)</span>
    </Link>
  );
}
