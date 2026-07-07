import { useProducts } from '../hooks/useProducts';
import { ProductGrid } from '../components';

export default function Home() {
  const { data, isLoading, error } = useProducts();

  if (isLoading) {
    return (
      <div className="p-8 text-neutral-500" role="status">
        Loading products...
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-red-600" role="alert">
        Failed to load products. Please try again later.
      </div>
    );
  }

  return (
    <section className="px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="mb-6 text-2xl font-bold text-neutral-900">Products</h1>
      <ProductGrid products={data?.results ?? []} />
    </section>
  );
}
