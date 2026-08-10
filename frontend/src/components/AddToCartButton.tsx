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
      className={`h-12 rounded-lg bg-primary-900 px-8 text-sm font-semibold text-white transition-colors duration-200 hover:bg-primary-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-700 disabled:cursor-not-allowed disabled:bg-neutral-200 disabled:text-neutral-400 disabled:hover:bg-neutral-200 ${className}`}
    >
      {isPending ? 'Adding...' : 'Add to Cart'}
    </button>
  );
}
