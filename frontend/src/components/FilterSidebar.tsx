import type { Category } from '../types';

interface FilterSidebarProps {
  categories: Category[];
  selectedThemes: string[];
  priceMin: string;
  priceMax: string;
  inStockOnly: boolean;
  onThemeChange: (slug: string) => void;
  onPriceMinChange: (value: string) => void;
  onPriceMaxChange: (value: string) => void;
  onStockToggle: () => void;
  onClearAll: () => void;
}

export default function FilterSidebar({
  categories,
  selectedThemes,
  priceMin,
  priceMax,
  inStockOnly,
  onThemeChange,
  onPriceMinChange,
  onPriceMaxChange,
  onStockToggle,
  onClearAll,
}: FilterSidebarProps) {
  return (
    <aside className="w-64 shrink-0">
      <div className="sticky top-24 space-y-8">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-neutral-900">Filters</h3>
          <button
            onClick={onClearAll}
            className="text-sm text-neutral-600 transition-colors hover:text-primary-900"
          >
            Clear All
          </button>
        </div>

        <fieldset>
          <legend className="mb-3 text-sm font-semibold text-neutral-900">Theme</legend>
          <div className="space-y-2">
            {categories.map((category) => (
              <label
                key={category.id}
                className="flex cursor-pointer items-center gap-2 text-sm text-neutral-600 transition-colors hover:text-neutral-900"
              >
                <input
                  type="checkbox"
                  checked={selectedThemes.includes(category.slug)}
                  onChange={() => onThemeChange(category.slug)}
                  className="size-4 accent-primary-900"
                />
                {category.name}
              </label>
            ))}
          </div>
        </fieldset>

        <fieldset>
          <legend className="mb-3 text-sm font-semibold text-neutral-900">Price Range</legend>
          <div className="flex items-center gap-2">
            <input
              type="number"
              min={0}
              value={priceMin}
              onChange={(e) => onPriceMinChange(e.target.value)}
              placeholder="Min"
              className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm text-neutral-900 placeholder-neutral-400 transition-colors focus:border-primary-900 focus:outline-none focus:ring-2 focus:ring-primary-300"
              aria-label="Minimum price"
            />
            <span className="text-neutral-400">—</span>
            <input
              type="number"
              min={0}
              value={priceMax}
              onChange={(e) => onPriceMaxChange(e.target.value)}
              placeholder="Max"
              className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm text-neutral-900 placeholder-neutral-400 transition-colors focus:border-primary-900 focus:outline-none focus:ring-2 focus:ring-primary-300"
              aria-label="Maximum price"
            />
          </div>
        </fieldset>

        <label className="flex cursor-pointer items-center gap-2 text-sm text-neutral-600 transition-colors hover:text-neutral-900">
          <input
            type="checkbox"
            checked={inStockOnly}
            onChange={onStockToggle}
            className="size-4 accent-primary-900"
          />
          In Stock Only
        </label>
      </div>
    </aside>
  );
}
