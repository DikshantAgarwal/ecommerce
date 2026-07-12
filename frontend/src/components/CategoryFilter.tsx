interface Category {
  id: number;
  name: string;
  slug: string;
}

interface CategoryFilterProps {
  categories: Category[];
  selectedCategory: string | null;
  onSelect: (slug: string | null) => void;
  isLoading: boolean;
  error: Error | null;
}

export default function CategoryFilter({
  categories,
  selectedCategory,
  onSelect,
  isLoading,
  error,
}: CategoryFilterProps) {
  if (error) {
    return (
      <div className="text-sm text-red-600" role="alert">
        Failed to load categories.
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex flex-wrap gap-2" role="status">
        <div className="h-8 w-28 animate-pulse rounded-full bg-neutral-200" />
        <div className="h-8 w-20 animate-pulse rounded-full bg-neutral-200" />
        <div className="h-8 w-24 animate-pulse rounded-full bg-neutral-200" />
        <span className="sr-only">Loading categories...</span>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      <button
        onClick={() => onSelect(null)}
        className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
          selectedCategory === null
            ? 'bg-neutral-900 text-white'
            : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
        }`}
      >
        All Categories
      </button>
      {categories.map((category) => (
        <button
          key={category.id}
          onClick={() => onSelect(category.slug)}
          className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
            selectedCategory === category.slug
              ? 'bg-neutral-900 text-white'
              : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
          }`}
        >
          {category.name}
        </button>
      ))}
    </div>
  );
}
