import type { Category } from '../types';

interface CategoryFilterProps {
  categories: Category[];
  selectedSection: string | null;
  selectedCategory: string | null;
  onSectionChange: (section: string | null) => void;
  onCategoryChange: (slug: string | null) => void;
  isLoading: boolean;
  error: Error | null;
}

const SECTIONS = [
  { value: null, label: 'All' },
  { value: 'men', label: 'Men' },
  { value: 'women', label: 'Women' },
];

export default function CategoryFilter({
  categories,
  selectedSection,
  selectedCategory,
  onSectionChange,
  onCategoryChange,
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

  const filteredCategories = selectedSection
    ? categories.filter((c) => c.section === selectedSection)
    : categories;

  return (
    <div className="space-y-4">
      <div className="flex gap-1 rounded-lg bg-neutral-100 p-1 sm:inline-flex">
        {SECTIONS.map((s) => (
          <button
            key={s.label}
            onClick={() => {
              onSectionChange(s.value);
              onCategoryChange(null);
            }}
            className={`rounded-md px-4 py-1.5 text-sm font-medium transition-colors ${
              selectedSection === s.value
                ? 'bg-white text-neutral-900 shadow-sm'
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => onCategoryChange(null)}
          className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
            selectedCategory === null
              ? 'bg-neutral-900 text-white'
              : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
          }`}
        >
          All Categories
        </button>
        {filteredCategories.map((category) => (
          <button
            key={category.id}
            onClick={() => onCategoryChange(category.slug)}
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
    </div>
  );
}