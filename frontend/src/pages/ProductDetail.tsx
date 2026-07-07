import { useParams, Link } from 'react-router';
import { useProduct } from '../hooks/useProduct';

function formatPrice(price: string): string {
  return `$${parseFloat(price).toFixed(2)}`;
}

export default function ProductDetail() {
  const { slug } = useParams<{ slug: string }>();
  const { data: product, isLoading, error } = useProduct(slug);

  if (!slug) {
    return (
      <div className="px-4 py-16 text-center sm:px-6 lg:px-8">
        <h1 className="text-2xl font-bold text-neutral-900">Invalid product</h1>
        <p className="mt-2 text-neutral-600">
          The product identifier provided is not valid.
        </p>
        <Link
          to="/"
          className="mt-6 inline-block text-sm font-semibold text-primary-700 hover:text-primary-900"
        >
          &larr; Back to products
        </Link>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="px-4 py-16 text-center sm:px-6 lg:px-8" role="status">
        <div className="mx-auto h-64 w-full max-w-md animate-pulse rounded-lg bg-neutral-200" />
        <div className="mx-auto mt-6 h-6 w-48 animate-pulse rounded bg-neutral-200" />
        <div className="mx-auto mt-3 h-4 w-32 animate-pulse rounded bg-neutral-200" />
        <span className="sr-only">Loading product details...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="px-4 py-16 text-center sm:px-6 lg:px-8" role="alert">
        <h1 className="text-2xl font-bold text-neutral-900">
          Something went wrong
        </h1>
        <p className="mt-2 text-neutral-600">
          We could not load this product. Please try again.
        </p>
        <Link
          to="/"
          className="mt-6 inline-block text-sm font-semibold text-primary-700 hover:text-primary-900"
        >
          &larr; Back to products
        </Link>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="px-4 py-16 text-center sm:px-6 lg:px-8">
        <h1 className="text-2xl font-bold text-neutral-900">
          Product not found
        </h1>
        <p className="mt-2 text-neutral-600">
          The product you are looking for does not exist or has been removed.
        </p>
        <Link
          to="/"
          className="mt-6 inline-block text-sm font-semibold text-primary-700 hover:text-primary-900"
        >
          &larr; Back to products
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <nav className="mb-8 text-sm text-neutral-500">
        <Link to="/" className="hover:text-primary-700">
          Home
        </Link>
        <span className="mx-2">/</span>
        <span className="text-neutral-900">{product.name}</span>
      </nav>

      <div className="grid gap-8 lg:grid-cols-2">
        <div className="aspect-[4/5] w-full overflow-hidden rounded-lg bg-neutral-100">
          <div className="flex h-full items-center justify-center text-neutral-400">
            <svg
              className="h-20 w-20"
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
        </div>

        <div className="flex flex-col gap-6">
          <div>
            <p className="mb-2 text-sm font-medium uppercase tracking-wide text-neutral-500">
              {product.category_detail.name}
            </p>
            <h1 className="font-heading text-2xl font-bold text-neutral-900">
              {product.name}
            </h1>
          </div>

          <p className="text-3xl font-bold text-primary-700">
            {formatPrice(product.price)}
          </p>

          <p className="leading-relaxed text-neutral-600">
            {product.description}
          </p>
        </div>
      </div>
    </div>
  );
}
