import { useState, useCallback } from 'react';
import { useProducts } from '../hooks/useProducts';
import { useCategories } from '../hooks/useCategories';
import { useDebounce } from '../hooks/useDebounce';
import {
  ProductGrid,
  SearchBar,
  LoadMoreButton,
  HeroBanner,
  PopularThemes,
  FilterSidebar,
  SortSelect,
  ActiveFilterPills,
  MobileFilterDrawer,
} from '../components';
import { SlidersHorizontal } from 'lucide-react';

const DEBOUNCE_DELAY = 400;

export default function Home() {
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [selectedSection, setSelectedSection] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchInput, setSearchInput] = useState('');
  const [selectedThemes, setSelectedThemes] = useState<string[]>([]);
  const [priceMin, setPriceMin] = useState('');
  const [priceMax, setPriceMax] = useState('');
  const [inStockOnly, setInStockOnly] = useState(false);
  const [sortBy, setSortBy] = useState('created_at');
  const debouncedSearch = useDebounce(searchInput, DEBOUNCE_DELAY);

  const {
    data: categories,
    isLoading: categoriesLoading,
    error: categoriesError,
  } = useCategories();

  const categoryParam = selectedThemes.length > 0 ? selectedThemes.join(',') : selectedCategory;
  const {
    data,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    error,
  } = useProducts(categoryParam, debouncedSearch, selectedSection, sortBy, inStockOnly);

  const products = data?.pages.flatMap((page) => page.results) ?? [];

  const handleThemeChange = useCallback((slug: string) => {
    setSelectedThemes((prev) =>
      prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug],
    );
    setSelectedCategory(null);
  }, []);

  const handleClearPrice = useCallback(() => {
    setPriceMin('');
    setPriceMax('');
  }, []);

  const handleClearAll = useCallback(() => {
    setSelectedThemes([]);
    setSelectedCategory(null);
    setPriceMin('');
    setPriceMax('');
    setInStockOnly(false);
    setSortBy('created_at');
  }, []);

  const activeFilterCount =
    selectedThemes.length + (priceMin || priceMax ? 1 : 0) + (inStockOnly ? 1 : 0);

  const sharedFilterProps = {
    categories: categories ?? [],
    selectedThemes,
    priceMin,
    priceMax,
    inStockOnly,
    onThemeChange: handleThemeChange,
    onPriceMinChange: setPriceMin,
    onPriceMaxChange: setPriceMax,
    onStockToggle: () => setInStockOnly((prev) => !prev),
    onClearAll: handleClearAll,
  };

  return (
    <>
      <HeroBanner />

      <PopularThemes />

      <section className="bg-neutral-100 py-12 lg:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="mb-6 text-2xl font-bold text-neutral-900">All Products</h2>

          <div className="mb-6">
            <SearchBar value={searchInput} onChange={setSearchInput} />
          </div>

          <div className="mb-4 flex items-center gap-3 md:hidden">
            <button
              onClick={() => setMobileFiltersOpen(true)}
              className="flex h-10 items-center gap-2 rounded-lg border border-neutral-200 bg-neutral-0 px-4 text-sm font-medium text-neutral-900 transition-colors hover:bg-neutral-100"
            >
              <SlidersHorizontal className="size-4" />
              Filters{activeFilterCount > 0 ? ` (${activeFilterCount})` : ''}
            </button>
            <SortSelect value={sortBy} onChange={setSortBy} />
          </div>

          <div className="mb-4 hidden items-center justify-end md:flex">
            <SortSelect value={sortBy} onChange={setSortBy} />
          </div>

          <ActiveFilterPills
            selectedThemes={selectedThemes}
            categories={categories ?? []}
            priceMin={priceMin}
            priceMax={priceMax}
            inStockOnly={inStockOnly}
            onRemoveTheme={(slug) =>
              setSelectedThemes((prev) => prev.filter((s) => s !== slug))
            }
            onClearPrice={handleClearPrice}
            onToggleStock={() => setInStockOnly(false)}
            onClearAll={handleClearAll}
          />

          <div className="flex gap-8">
            {!categoriesLoading && !categoriesError && (
              <div className="hidden md:block">
                <FilterSidebar {...sharedFilterProps} />
              </div>
            )}

            <div className="min-w-0 flex-1">
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
          </div>
        </div>
      </section>

      <MobileFilterDrawer
        isOpen={mobileFiltersOpen}
        onClose={() => setMobileFiltersOpen(false)}
        {...sharedFilterProps}
      />
    </>
  );
}