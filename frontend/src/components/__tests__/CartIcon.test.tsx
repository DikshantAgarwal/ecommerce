import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router';
import CartIcon from '../CartIcon';

vi.mock('../../hooks/useCart', () => ({
  useCart: vi.fn(),
}));

import { useCart } from '../../hooks/useCart';

describe('CartIcon', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders cart link', () => {
    vi.mocked(useCart).mockReturnValue({
      data: { items: [], total: '0.00' },
      isLoading: false,
    } as any);

    render(
      <BrowserRouter>
        <CartIcon />
      </BrowserRouter>,
    );

    expect(screen.getByRole('link')).toHaveAttribute('href', '/cart');
  });

  it('shows badge with item count', () => {
    vi.mocked(useCart).mockReturnValue({
      data: {
        items: [
          { quantity: 2 },
          { quantity: 3 },
        ],
        total: '50.00',
      },
      isLoading: false,
    } as any);

    render(
      <BrowserRouter>
        <CartIcon />
      </BrowserRouter>,
    );

    expect(screen.getByText('5')).toBeInTheDocument();
  });

  it('hides badge when cart is empty', () => {
    vi.mocked(useCart).mockReturnValue({
      data: { items: [], total: '0.00' },
      isLoading: false,
    } as any);

    const { container } = render(
      <BrowserRouter>
        <CartIcon />
      </BrowserRouter>,
    );

    expect(container.querySelector('.bg-primary-700')).not.toBeInTheDocument();
  });

  it('shows 99+ for large counts', () => {
    vi.mocked(useCart).mockReturnValue({
      data: {
        items: [{ quantity: 100 }],
        total: '1000.00',
      },
      isLoading: false,
    } as any);

    render(
      <BrowserRouter>
        <CartIcon />
      </BrowserRouter>,
    );

    expect(screen.getByText('99+')).toBeInTheDocument();
  });
});
