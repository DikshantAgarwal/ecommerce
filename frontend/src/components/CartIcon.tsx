import { Link } from 'react-router';
import { ShoppingCart } from 'lucide-react';
import { useCart } from '../hooks/useCart';

export default function CartIcon() {
  const { data: cart, isLoading } = useCart();
  const itemCount = cart?.items.reduce((sum, item) => sum + item.quantity, 0) ?? 0;

  return (
    <Link to="/cart" className="relative flex items-center text-neutral-600 transition-colors duration-200 hover:text-primary-900">
      <ShoppingCart className="size-6" aria-hidden="true" />
      {!isLoading && itemCount > 0 && (
        <span className="absolute -right-2 -top-2 flex size-5 items-center justify-center rounded-full bg-primary-900 text-xs font-bold text-white">
          {itemCount > 99 ? '99+' : itemCount}
        </span>
      )}
      <span className="sr-only">Cart ({itemCount} items)</span>
    </Link>
  );
}
