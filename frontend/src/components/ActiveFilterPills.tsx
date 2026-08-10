import type { Category } from '../types';

interface ActiveFilterPillsProps {
  selectedThemes: string[];
  categories: Category[];
  priceMin: string;
  priceMax: string;
  inStockOnly: boolean;
  onRemoveTheme: (slug: string) => void;
  onClearPrice: () => void;
  onToggleStock: () => void;
  onClearAll: () => void;
}

export default function ActiveFilterPills({
  selectedThemes,
  categories,
  priceMin,
  priceMax,
  inStockOnly,
  onRemoveTheme,
  onClearPrice,
  onToggleStock,
  onClearAll,
}: ActiveFilterPillsProps) {
  const hasFilters = selectedThemes.length > 0 || priceMin || priceMax || inStockOnly;

  if (!hasFilters) return null;

  const themeNames = categories
    .filter((c) => selectedThemes.includes(c.slug))
    .map((c) => c.name);

  return (
    <div className="mb-4 flex flex-wrap items-center gap-2">
      {themeNames.map((name) => (
        <span
          key={name}
          className="inline-flex items-center gap-1 rounded-full bg-neutral-100 px-3 py-1 text-sm text-neutral-900"
        >
          {name}
          <button
            onClick={() => {
              const slug = categories.find((c) => c.name === name)?.slug;
              if (slug) onRemoveTheme(slug);
            }}
            className="text-neutral-400 transition-colors hover:text-neutral-900"
            aria-label={`Remove ${name} filter`}
          >
            ✕
          </button>
        </span>
      ))}

      {(priceMin || priceMax) && (
        <span className="inline-flex items-center gap-1 rounded-full bg-neutral-100 px-3 py-1 text-sm text-neutral-900">
          {priceMin ? `₹${priceMin}` : '₹0'} – {priceMax ? `₹${priceMax}` : '∞'}
          <button
            onClick={onClearPrice}
            className="text-neutral-400 transition-colors hover:text-neutral-900"
            aria-label="Clear price filter"
          >
            ✕
          </button>
        </span>
      )}

      {inStockOnly && (
        <span className="inline-flex items-center gap-1 rounded-full bg-neutral-100 px-3 py-1 text-sm text-neutral-900">
          In Stock
          <button
            onClick={onToggleStock}
            className="text-neutral-400 transition-colors hover:text-neutral-900"
            aria-label="Remove in stock filter"
          >
            ✕
          </button>
        </span>
      )}

      <button
        onClick={onClearAll}
        className="text-sm text-neutral-600 transition-colors hover:text-primary-900"
      >
        Clear All
      </button>
    </div>
  );
}
