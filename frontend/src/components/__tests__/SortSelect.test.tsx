import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import SortSelect from '../SortSelect';

describe('SortSelect', () => {
  it('renders with default value', () => {
    render(<SortSelect value="created_at" onChange={vi.fn()} />);

    const select = screen.getByLabelText('Sort by') as HTMLSelectElement;
    expect(select.value).toBe('created_at');
  });

  it('calls onChange when selection changes', () => {
    const onChange = vi.fn();
    render(<SortSelect value="created_at" onChange={onChange} />);

    fireEvent.change(screen.getByLabelText('Sort by'), { target: { value: 'price' } });
    expect(onChange).toHaveBeenCalledWith('price');
  });

  it('renders all sort options', () => {
    render(<SortSelect value="created_at" onChange={vi.fn()} />);

    expect(screen.getByText('Newest')).toBeInTheDocument();
    expect(screen.getByText('Price: Low to High')).toBeInTheDocument();
    expect(screen.getByText('Price: High to Low')).toBeInTheDocument();
  });
});
