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
            <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4 lg:gap-6" role="status">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="animate-pulse">
                  <div className="aspect-[4/5] rounded-lg bg-neutral-200" />
                  <div className="mt-3 h-4 w-2/3 rounded bg-neutral-200" />
                  <div className="mt-2 h-4 w-1/3 rounded bg-neutral-200" />
                </div>
              ))}
              <span className="sr-only">Loading products...</span>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center py-16 text-center" role="alert">
              <p className="text-lg font-semibold text-neutral-900">
                Something went wrong
              </p>
              <p className="mt-2 text-neutral-600">
                We could not load the featured products. Please try again.
              </p>
            </div>
          ) : (
            <ProductGrid products={teaserProducts} />
          )}
        </div>
      </section>
    </>
  );
}