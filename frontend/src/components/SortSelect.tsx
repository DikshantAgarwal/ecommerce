const SORT_OPTIONS = [
  { value: 'created_at', label: 'Newest' },
  { value: 'price', label: 'Price: Low to High' },
  { value: '-price', label: 'Price: High to Low' },
];

interface SortSelectProps {
  value: string;
  onChange: (value: string) => void;
}

export default function SortSelect({ value, onChange }: SortSelectProps) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="h-10 rounded-lg border border-neutral-200 bg-neutral-0 px-3 text-sm text-neutral-900 transition-colors focus:border-primary-900 focus:outline-none focus:ring-2 focus:ring-primary-300"
      aria-label="Sort by"
    >
      {SORT_OPTIONS.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}
