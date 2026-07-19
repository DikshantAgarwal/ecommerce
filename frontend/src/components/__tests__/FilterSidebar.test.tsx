import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import FilterSidebar from '../FilterSidebar';

const mockCategories = [
  { id: 1, name: 'Anime', slug: 'anime', section: 'men' as const, is_active: true, description: '' },
  { id: 2, name: 'Quotes', slug: 'quotes', section: 'men' as const, is_active: true, description: '' },
];

const defaultProps = {
  categories: mockCategories,
  selectedThemes: [] as string[],
  priceMin: '',
  priceMax: '',
  inStockOnly: false,
  onThemeChange: vi.fn(),
  onPriceMinChange: vi.fn(),
  onPriceMaxChange: vi.fn(),
  onStockToggle: vi.fn(),
  onClearAll: vi.fn(),
};

describe('FilterSidebar', () => {
  it('renders filter sections', () => {
    render(<FilterSidebar {...defaultProps} />);

    expect(screen.getByText('Filters')).toBeInTheDocument();
    expect(screen.getByText('Theme')).toBeInTheDocument();
    expect(screen.getByText('Price Range')).toBeInTheDocument();
    expect(screen.getByText('In Stock Only')).toBeInTheDocument();
    expect(screen.getByText('Clear All')).toBeInTheDocument();
  });

  it('renders all categories as checkboxes', () => {
    render(<FilterSidebar {...defaultProps} />);

    expect(screen.getByLabelText('Anime')).toBeInTheDocument();
    expect(screen.getByLabelText('Quotes')).toBeInTheDocument();
  });

  it('calls onThemeChange when checkbox is clicked', () => {
    const onThemeChange = vi.fn();
    render(<FilterSidebar {...defaultProps} onThemeChange={onThemeChange} />);

    fireEvent.click(screen.getByLabelText('Anime'));
    expect(onThemeChange).toHaveBeenCalledWith('anime');
  });

  it('calls onClearAll when Clear All is clicked', () => {
    const onClearAll = vi.fn();
    render(<FilterSidebar {...defaultProps} onClearAll={onClearAll} />);

    fireEvent.click(screen.getByText('Clear All'));
    expect(onClearAll).toHaveBeenCalled();
  });
});
