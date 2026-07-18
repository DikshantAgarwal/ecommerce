import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router';
import Cart from '../Cart';

const mockMutateUpdate = vi.fn();
const mockMutateRemove = vi.fn();

vi.mock('../../hooks/useCart', () => ({
  useCart: vi.fn(),
  useUpdateCartItem: () => ({ mutate: mockMutateUpdate }),
  useRemoveCartItem: () => ({ mutate: mockMutateRemove }),
}));

import { useCart } from '../../hooks/useCart';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function createMockCart(overrides = {}): any {
  return {
    data: {
      id: 'cart-1',
      items: [
        {
          id: 'item-1',
          product: 1,
          product_detail: {
            id: 1,
            name: 'Test Shirt',
            slug: 'test-shirt',
            price: '29.99',
            stock_quantity: 10,
            description: 'A test shirt',
            category: 1,
            category_detail: { id: 1, name: 'T-Shirts', slug: 't-shirts', is_active: true, description: '' },
            created_at: '2026-01-01T00:00:00Z',
            updated_at: '2026-01-01T00:00:00Z',
          },
          quantity: 3,
          created_at: '2026-01-01T00:00:00Z',
          updated_at: '2026-01-01T00:00:00Z',
        },
      ],
      total: '89.97',
      created_at: '2026-01-01T00:00:00Z',
      updated_at: '2026-01-01T00:00:00Z',
    },
    isLoading: false,
    error: null,
    ...overrides,
  };
}

describe('Cart', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows loading skeletons', () => {
    vi.mocked(useCart).mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
    } as any);

    render(
      <BrowserRouter>
        <Cart />
      </BrowserRouter>,
    );

    expect(screen.getByRole('status')).toHaveTextContent('Loading cart...');
  });

  it('shows error state', () => {
    vi.mocked(useCart).mockReturnValue({
      data: undefined,
      isLoading: false,
      error: new Error('Failed'),
    } as any);

    render(
      <BrowserRouter>
        <Cart />
      </BrowserRouter>,
    );

    expect(screen.getByRole('alert')).toHaveTextContent('Could not load cart');
  });

  it('shows empty cart', () => {
    vi.mocked(useCart).mockReturnValue({
      data: { id: 'cart-1', items: [], total: '0.00', created_at: '', updated_at: '' },
      isLoading: false,
      error: null,
    } as any);

    render(
      <BrowserRouter>
        <Cart />
      </BrowserRouter>,
    );

    expect(screen.getByText('Your cart is empty')).toBeInTheDocument();
    expect(screen.getByText('Start shopping')).toBeInTheDocument();
  });

  it('renders cart items', () => {
    vi.mocked(useCart).mockReturnValue(createMockCart() as any);

    render(
      <BrowserRouter>
        <Cart />
      </BrowserRouter>,
    );

    expect(screen.getByText('Shopping Cart')).toBeInTheDocument();
    expect(screen.getByText('Test Shirt')).toBeInTheDocument();
    expect(screen.getAllByText('$89.97')).toHaveLength(2);
  });

  it('shows item quantity', () => {
    vi.mocked(useCart).mockReturnValue(createMockCart() as any);

    render(
      <BrowserRouter>
        <Cart />
      </BrowserRouter>,
    );

    expect(screen.getByLabelText('Quantity: 3')).toBeInTheDocument();
  });

  it('shows total', () => {
    vi.mocked(useCart).mockReturnValue(createMockCart() as any);

    render(
      <BrowserRouter>
        <Cart />
      </BrowserRouter>,
    );

    expect(screen.getByText('Total')).toBeInTheDocument();
    expect(screen.getAllByText('$89.97')).toHaveLength(2);
  });
});
