import { useState, useCallback, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router';
import { useProducts } from '../hooks/useProducts';
import { useCategories } from '../hooks/useCategories';
import { useDebounce } from '../hooks/useDebounce';
import {
  ProductGrid,
  SearchBar,
  LoadMoreButton,
  FilterSidebar,
  SortSelect,
  ActiveFilterPills,
  MobileFilterDrawer,
} from '../components';
import { SlidersHorizontal } from 'lucide-react';

const DEBOUNCE_DELAY = 400;

function getHeading(section: string | null, theme: string | null): string {
  if (theme) return `${theme.charAt(0).toUpperCase() + theme.slice(1)} Collection`;
  if (section === 'men') return "Men's Collection";
  if (section === 'women') return "Women's Collection";
  return 'All Products';
}

export default function Products() {
  const [searchParams] = useSearchParams();
  const sectionFromUrl = searchParams.get('section');
  const themeFromUrl = searchParams.get('theme');

  const { data: categories } = useCategories();
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const selectedSection = sectionFromUrl;
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchInput, setSearchInput] = useState('');
  const [selectedThemes, setSelectedThemes] = useState<string[]>([]);
  const [priceMin, setPriceMin] = useState('');
  const [priceMax, setPriceMax] = useState('');
  const [inStockOnly, setInStockOnly] = useState(false);
  const [sortBy, setSortBy] = useState('created_at');
  const debouncedSearch = useDebounce(searchInput, DEBOUNCE_DELAY);

  useEffect(() => {
    if (themeFromUrl && categories) {
      const match = categories.find(
        (c) => c.name.toLowerCase() === themeFromUrl.toLowerCase(),
      );
      if (match) {
        setSelectedCategory(match.slug);
      }
    }
  }, [themeFromUrl, categories]);

  const categoryParam = selectedThemes.length > 0
    ? selectedThemes.join(',')
    : selectedCategory;

  const {
    data,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    error,
  } = useProducts(categoryParam, debouncedSearch, selectedSection, sortBy, inStockOnly);

  const products = data?.pages.flatMap((page) => page.results) ?? [];

  const heading = useMemo(
    () => getHeading(selectedSection, themeFromUrl),
    [selectedSection, themeFromUrl],
  );

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
    <section className="bg-neutral-100 py-12 lg:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h1 className="mb-6 text-2xl font-bold text-neutral-900">{heading}</h1>

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
          <div className="hidden md:block">
            <FilterSidebar {...sharedFilterProps} />
          </div>

          <div className="min-w-0 flex-1">
            {isLoading ? (
              <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3 lg:gap-6" role="status">
                {[1, 2, 3, 4, 5, 6].map((i) => (
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
                  We could not load the products. Please try again.
                </p>
              </div>
            ) : products.length === 0 ? (
              <div className="flex flex-col items-center py-16 text-center">
                <p className="text-lg font-semibold text-neutral-900">
                  No products found
                </p>
                <p className="mt-2 text-neutral-600">
                  Try adjusting your filters or search.
                </p>
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

      <MobileFilterDrawer
        isOpen={mobileFiltersOpen}
        onClose={() => setMobileFiltersOpen(false)}
        {...sharedFilterProps}
      />
    </section>
  );
}
