import { useEffect } from 'react';
import { X } from 'lucide-react';
import FilterSidebar from './FilterSidebar';
import type { Category } from '../types';

interface MobileFilterDrawerProps {
  isOpen: boolean;
  onClose: () => void;
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

export default function MobileFilterDrawer({
  isOpen,
  onClose,
  ...filterProps
}: MobileFilterDrawerProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 md:hidden">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} aria-hidden="true" />
      <div className="absolute bottom-0 left-0 right-0 max-h-[85vh] overflow-y-auto rounded-t-xl bg-neutral-0 p-6 shadow-lg">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-neutral-900">Filters</h2>
          <button
            onClick={onClose}
            className="text-neutral-600 transition-colors hover:text-neutral-900"
            aria-label="Close filters"
          >
            <X className="size-5" />
          </button>
        </div>
        <FilterSidebar {...filterProps} />
      </div>
    </div>
  );
}
