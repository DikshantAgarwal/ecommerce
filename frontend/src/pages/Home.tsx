import { Link } from 'react-router';
import { useProducts } from '../hooks/useProducts';
import { ProductGrid, HeroBanner, PopularThemes } from '../components';

export default function Home() {
  const { data, isLoading, error } = useProducts();

  const products = data?.pages.flatMap((page) => page.results) ?? [];
  const teaserProducts = products.slice(0, 8);

  return (
    <>
      <HeroBanner />

      <PopularThemes />

      <section className="bg-neutral-100 py-12 lg:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-neutral-900">Featured Products</h2>
            <Link
              to="/products"
              className="text-sm font-semibold text-neutral-600 transition-colors hover:text-primary-900"
            >
              View All &rarr;
            </Link>
          </div>

          {isLoading ? (
            <div className="py-8 text-center text-neutral-600" role="status">
              Loading products...
            </div>
          ) : error ? (
            <div className="py-8 text-center text-red-600" role="alert">
              Failed to load products. Please try again later.
            </div>
          ) : (
            <ProductGrid products={teaserProducts} />
          )}
        </div>
      </section>
    </>
  );
}