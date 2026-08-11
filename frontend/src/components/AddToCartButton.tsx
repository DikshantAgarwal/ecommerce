import { useState } from 'react';
import { Link } from 'react-router';
import { useAddToCart } from '../hooks/useCart';

interface AddToCartButtonProps {
  variantId: number;
  disabled?: boolean;
  className?: string;
}

export default function AddToCartButton({ variantId, disabled, className = '' }: AddToCartButtonProps) {
  const { mutate, isPending } = useAddToCart();
  const [added, setAdded] = useState(false);

  function handleAdd() {
    mutate(
      { variant_id: variantId, quantity: 1 },
      {
        onSuccess: () => setAdded(true),
      },
    );
  }

  const sharedClass = `flex h-12 w-full items-center justify-center rounded-lg px-8 text-sm font-semibold transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-700 disabled:cursor-not-allowed disabled:bg-neutral-200 disabled:text-neutral-400 disabled:hover:bg-neutral-200 ${className}`;

  if (added) {
    return (
      <Link to="/cart" className={`${sharedClass} bg-primary-700 text-white hover:bg-primary-500`}>
        Go to Cart
      </Link>
    );
  }

  return (
    <button
      onClick={handleAdd}
      disabled={disabled || isPending}
      className={`${sharedClass} bg-primary-900 text-white hover:bg-primary-700`}
    >
      {isPending ? 'Adding...' : 'Add to Cart'}
    </button>
  );
}