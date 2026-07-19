import { Link } from 'react-router';
import type { Product } from '../types';
import { useAddToCart } from '../hooks/useCart';

interface ProductCardProps {
  product: Product;
}

function formatPrice(price: string): string {
  return `$${parseFloat(price).toFixed(2)}`;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { mutate: addToCart, isPending } = useAddToCart();
  const firstVariantId = product.variants[0]?.id;

  return (
    <div className="flex flex-col rounded-lg border border-neutral-200 bg-white shadow-sm transition-shadow hover:shadow-md">
      <Link to={`/products/${product.slug}`} className="group flex flex-col">
        <div className="aspect-[4/5] w-full overflow-hidden rounded-t-lg bg-neutral-100">
          {product.image ? (
            <img
              src={product.image}
              alt={product.name}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-neutral-400">
              <svg
                className="h-12 w-12"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
          )}
        </div>
        <div className="flex flex-1 flex-col gap-1.5 p-4">
          <h3 className="line-clamp-2 text-sm font-semibold text-neutral-900">
            {product.name}
          </h3>
          <p className="text-base font-bold text-primary-700">
            {formatPrice(product.price)}
          </p>
        </div>
      </Link>
      <div className="px-4 pb-4">
        <button
          onClick={() => firstVariantId && addToCart({ variant_id: firstVariantId, quantity: 1 })}
          disabled={isPending || !firstVariantId}
          className="w-full rounded-md bg-primary-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-primary-900 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isPending ? 'Adding...' : 'Add to Cart'}
        </button>
      </div>
    </div>
  );
}
