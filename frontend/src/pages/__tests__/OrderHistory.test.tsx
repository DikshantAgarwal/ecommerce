import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router';
import OrderHistory from '../OrderHistory';
import { useAuthStore } from '../../store/auth.store';

vi.mock('../../hooks/useOrder', () => ({
  useMyOrders: vi.fn(),
}));

import { useMyOrders } from '../../hooks/useOrder';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function createMockOrder(overrides = {}): any {
  return {
    id: 'order-1',
    user: 'user-1',
    status: 'shipped',
    payment_status: 'paid',
    total: '100.00',
    items: [
      {
        id: 'item-1',
        variant: 1,
        quantity: 2,
        unit_price: '50.00',
        total_price: '100.00',
        product_name: 'Test Shirt',
        product_slug: 'test-shirt',
        product_image: '',
        color: 'Black',
        size: 'M',
      },
    ],
    shipping_address: null,
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
    ...overrides,
  };
}

function renderPage(orders = [createMockOrder()]) {
  vi.mocked(useMyOrders).mockReturnValue({
    data: orders,
    isLoading: false,
    error: null,
  } as never);

  return render(
    <MemoryRouter initialEntries={['/orders']}>
      <OrderHistory />
    </MemoryRouter>,
  );
}

describe('OrderHistory', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAuthStore.setState({
      user: { id: 'u1', email: 'user@example.com', full_name: 'User', avatar: '', is_staff: false },
      isAuthenticated: true,
      isInitialized: true,
    });
  });

  it('shows loading skeletons', () => {
    vi.mocked(useMyOrders).mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
    } as never);
    render(
      <MemoryRouter initialEntries={['/orders']}>
        <OrderHistory />
      </MemoryRouter>,
    );
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('shows error state', () => {
    vi.mocked(useMyOrders).mockReturnValue({
      data: undefined,
      isLoading: false,
      error: new Error('boom'),
    } as never);
    render(
      <MemoryRouter initialEntries={['/orders']}>
        <OrderHistory />
      </MemoryRouter>,
    );
    expect(screen.getByRole('alert')).toHaveTextContent(/could not load your orders/i);
  });

  it('renders order cards with status and payment', () => {
    renderPage();
    expect(screen.getByText('Your orders')).toBeInTheDocument();
    expect(screen.getByText(/ORDER-1/)).toBeInTheDocument();
    expect(screen.getByText('Test Shirt')).toBeInTheDocument();
    expect(screen.getByText('Shipped')).toBeInTheDocument();
    expect(screen.getByText('Payment: paid')).toBeInTheDocument();
  });

  it('shows empty state with a start-shopping link', () => {
    renderPage([]);
    expect(screen.getByText(/haven't placed any orders/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /start shopping/i })).toBeInTheDocument();
  });

  it('links to the confirmation page for details', async () => {
    const user = userEvent.setup();
    renderPage();
    await user.click(screen.getByRole('link', { name: /view details/i }));
    expect(screen.getByRole('link', { name: /view details/i })).toHaveAttribute(
      'href',
      '/orders/order-1/confirmation',
    );
  });
});
