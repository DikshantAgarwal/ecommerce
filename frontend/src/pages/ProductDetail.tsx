import { useState, useMemo, useEffect } from 'react';
import { useParams, Link } from 'react-router';
import { useProduct } from '../hooks/useProduct';
import { AddToCartButton } from '../components';

function formatPrice(price: string | number): string {
  return `$${Number(price).toFixed(2)}`;
}

export default function ProductDetail() {
  const { slug } = useParams<{ slug: string }>();
  const { data: product, isLoading, error } = useProduct(slug);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);

  useEffect(() => {
    if (product && product.variants.length > 0) {
      if (!selectedColor) setSelectedColor(product.variants[0].color_code);
      if (!selectedSize) setSelectedSize(product.variants[0].size);
    }
  }, [product]);

  const colors = useMemo(() => {
    if (!product) return [];
    const seen = new Set<string>();
    return product.variants.filter((v) => {
      if (seen.has(v.color_code)) return false;
      seen.add(v.color_code);
      return true;
    });
  }, [product]);

  const availableSizes = useMemo(() => {
    if (!product || !selectedColor) return [];
    return product.variants
      .filter((v) => v.color_code === selectedColor)
      .sort((a, b) => ['S', 'M', 'L', 'XL', 'XXL'].indexOf(a.size) - ['S', 'M', 'L', 'XL', 'XXL'].indexOf(b.size));
  }, [product, selectedColor]);

  const selectedVariant = useMemo(() => {
    if (!product || !selectedColor || !selectedSize) return null;
    return product.variants.find(
      (v) => v.color_code === selectedColor && v.size === selectedSize,
    ) ?? null;
  }, [product, selectedColor, selectedSize]);

  const displayPrice = selectedVariant?.price ?? product?.price ?? '0';
  const displayImage = selectedVariant?.image || product?.image || '';
  const inStock = selectedVariant ? selectedVariant.stock_quantity > 0 : true;

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
          {displayImage ? (
            <img
              src={displayImage}
              alt={product.name}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-neutral-400">
              <svg className="h-20 w-20" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          )}
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
            {formatPrice(displayPrice)}
          </p>

          <p className="leading-relaxed text-neutral-600">
            {product.description}
          </p>

          <div>
            <p className="mb-2 text-sm font-medium text-neutral-700">Color</p>
            <div className="flex gap-2">
              {colors.map((v) => (
                <button
                  key={v.color_code}
                  onClick={() => {
                    setSelectedColor(v.color_code);
                    const firstSize = product?.variants
                      .filter((v2) => v2.color_code === v.color_code)
                      .sort((a, b) => ['S', 'M', 'L', 'XL', 'XXL'].indexOf(a.size) - ['S', 'M', 'L', 'XL', 'XXL'].indexOf(b.size))[0]?.size;
                    setSelectedSize(firstSize ?? null);
                  }}
                  className={`size-9 rounded-full border-2 transition-all ${
                    selectedColor === v.color_code
                      ? 'border-neutral-900 ring-2 ring-neutral-900 ring-offset-2'
                      : 'border-neutral-300 hover:border-neutral-500'
                  }`}
                  style={{ backgroundColor: v.color_code }}
                  aria-label={v.color}
                  title={v.color}
                />
              ))}
            </div>
          </div>

          {selectedColor && (
            <div>
              <p className="mb-2 text-sm font-medium text-neutral-700">
                Size
              </p>
              <div className="flex flex-wrap gap-2">
                {availableSizes.map((v) => {
                  const isSelected = selectedSize === v.size;
                  const outOfStock = v.stock_quantity === 0;
                  return (
                    <button
                      key={v.size}
                      onClick={() => setSelectedSize(v.size)}
                      disabled={outOfStock}
                      className={`h-10 min-w-10 rounded-md border px-3 text-sm font-medium transition-all ${
                        isSelected
                          ? 'border-neutral-900 bg-neutral-900 text-white'
                          : outOfStock
                            ? 'cursor-not-allowed border-neutral-200 text-neutral-300 line-through'
                            : 'border-neutral-300 text-neutral-700 hover:border-neutral-500'
                      }`}
                    >
                      {v.size}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {selectedVariant && !inStock && (
            <p className="text-sm font-medium text-red-600">Out of stock</p>
          )}

          <AddToCartButton
            variantId={selectedVariant?.id ?? product.variants[0]?.id}
            disabled={!selectedVariant || !inStock}
            className="w-full sm:w-auto"
          />
        </div>
      </div>
    </div>
  );
}
