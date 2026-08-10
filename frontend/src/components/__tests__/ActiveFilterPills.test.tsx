import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ActiveFilterPills from '../ActiveFilterPills';

const mockCategories = [
  { id: 1, name: 'Anime', slug: 'anime', section: 'men' as const, is_active: true, description: '' },
  { id: 2, name: 'Quotes', slug: 'quotes', section: 'men' as const, is_active: true, description: '' },
];

const defaultProps = {
  selectedThemes: [] as string[],
  categories: mockCategories,
  priceMin: '',
  priceMax: '',
  inStockOnly: false,
  onRemoveTheme: vi.fn(),
  onClearPrice: vi.fn(),
  onToggleStock: vi.fn(),
  onClearAll: vi.fn(),
};

describe('ActiveFilterPills', () => {
  it('renders nothing when there are no active filters', () => {
    const { container } = render(<ActiveFilterPills {...defaultProps} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders theme pills', () => {
    render(<ActiveFilterPills {...defaultProps} selectedThemes={['anime']} />);

    expect(screen.getByText('Anime')).toBeInTheDocument();
  });

  it('renders price range pill', () => {
    render(<ActiveFilterPills {...defaultProps} priceMin="10" priceMax="50" />);

    expect(screen.getByText('₹10 – ₹50')).toBeInTheDocument();
  });

  it('renders in stock pill', () => {
    render(<ActiveFilterPills {...defaultProps} inStockOnly />);

    expect(screen.getByText('In Stock')).toBeInTheDocument();
  });

  it('calls onRemoveTheme when pill X is clicked', () => {
    const onRemoveTheme = vi.fn();
    render(
      <ActiveFilterPills
        {...defaultProps}
        selectedThemes={['anime']}
        onRemoveTheme={onRemoveTheme}
      />,
    );

    fireEvent.click(screen.getByLabelText('Remove Anime filter'));
    expect(onRemoveTheme).toHaveBeenCalledWith('anime');
  });

  it('calls onClearAll when Clear All is clicked', () => {
    const onClearAll = vi.fn();
    render(
      <ActiveFilterPills
        {...defaultProps}
        selectedThemes={['anime']}
        onClearAll={onClearAll}
      />,
    );

    fireEvent.click(screen.getByText('Clear All'));
    expect(onClearAll).toHaveBeenCalled();
  });
});
