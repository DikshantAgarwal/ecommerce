import { useState } from 'react';
import { useProducts } from '../hooks/useProducts';
import { useCategories } from '../hooks/useCategories';
import { useDebounce } from '../hooks/useDebounce';
import {
  ProductGrid,
  CategoryFilter,
  SearchBar,
  LoadMoreButton,
  HeroBanner,
  PopularThemes,
} from '../components';

const DEBOUNCE_DELAY = 400;

export default function Home() {
  const [selectedSection, setSelectedSection] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchInput, setSearchInput] = useState('');
  const debouncedSearch = useDebounce(searchInput, DEBOUNCE_DELAY);
  const {
    data: categories,
    isLoading: categoriesLoading,
    error: categoriesError,
  } = useCategories();
  const {
    data,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    error,
  } = useProducts(selectedCategory, debouncedSearch, selectedSection);

  const products = data?.pages.flatMap((page) => page.results) ?? [];

  return (
    <>
      <HeroBanner />

      <PopularThemes />

      <section className="bg-neutral-100 py-12 lg:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="mb-8 text-2xl font-bold text-neutral-900">All Products</h2>

          <div className="mb-6">
            <SearchBar value={searchInput} onChange={setSearchInput} />
          </div>

          <div className="mb-6">
            <CategoryFilter
              categories={categories ?? []}
              selectedSection={selectedSection}
              selectedCategory={selectedCategory}
              onSectionChange={setSelectedSection}
              onCategoryChange={setSelectedCategory}
              isLoading={categoriesLoading}
              error={categoriesError}
            />
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
            <>
              <ProductGrid products={products} />
              {hasNextPage && (
                <LoadMoreButton
                  onClick={() => fetchNextPage()}
                  isLoading={isFetchingNextPage}
                />
              )}
            </>
          )}
        </div>
      </section>
    </>
  );
}