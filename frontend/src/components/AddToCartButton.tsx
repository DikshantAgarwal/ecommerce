import { useAddToCart } from '../hooks/useCart';

interface AddToCartButtonProps {
  variantId: number;
  disabled?: boolean;
  className?: string;
}

export default function AddToCartButton({ variantId, disabled, className = '' }: AddToCartButtonProps) {
  const { mutate, isPending } = useAddToCart();

  return (
    <button
      onClick={() => mutate({ variant_id: variantId, quantity: 1 })}
      disabled={disabled || isPending}
      className={`rounded-md bg-primary-700 px-6 py-3 text-sm font-medium text-white transition hover:bg-primary-900 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
    >
      {isPending ? 'Adding...' : 'Add to Cart'}
    </button>
  );
}
