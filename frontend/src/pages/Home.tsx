import { useState } from 'react';
import { useProducts } from '../hooks/useProducts';
import { useCategories } from '../hooks/useCategories';
import { ProductGrid, CategoryFilter } from '../components';

export default function Home() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const {
    data: categories,
    isLoading: categoriesLoading,
    error: categoriesError,
  } = useCategories();
  const { data, isLoading, error } = useProducts(selectedCategory);

  return (
    <section className="px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="mb-6 text-2xl font-bold text-neutral-900">Products</h1>

      <div className="mb-6">
        <CategoryFilter
          categories={categories ?? []}
          selectedCategory={selectedCategory}
          onSelect={setSelectedCategory}
          isLoading={categoriesLoading}
          error={categoriesError}
        />
      </div>

      {isLoading ? (
        <div className="py-8 text-center text-neutral-500" role="status">
          Loading products...
        </div>
      ) : error ? (
        <div className="py-8 text-center text-red-600" role="alert">
          Failed to load products. Please try again later.
        </div>
      ) : (
        <ProductGrid products={data?.results ?? []} />
      )}
    </section>
  );
}
