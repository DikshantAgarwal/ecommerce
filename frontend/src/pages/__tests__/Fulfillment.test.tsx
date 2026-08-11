import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router';
import Fulfillment from '../Fulfillment';
import { useAuthStore } from '../../store/auth.store';

vi.mock('../../hooks/useOrder', () => ({
  useOrders: vi.fn(),
}));

import { useOrders } from '../../hooks/useOrder';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function createMockOrder(overrides = {}): any {
  return {
    id: 'order-1',
    user: 'user-1',
    status: 'pending',
    payment_status: 'unpaid',
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
    shipping_address: {
      name: 'Test User',
      phone: '9876543210',
      address_line1: '123 Test Street',
      address_line2: '',
      city: 'Bengaluru',
      state: 'Karnataka',
      postal_code: '560001',
      country: 'India',
    },
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
    ...overrides,
  };
}

function renderPage(orders = [createMockOrder()]) {
  vi.mocked(useOrders).mockReturnValue({
    data: orders,
    isLoading: false,
    error: null,
  } as never);

  return render(
    <MemoryRouter initialEntries={['/fulfillment']}>
      <Fulfillment />
    </MemoryRouter>,
  );
}

describe('Fulfillment', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAuthStore.setState({
      user: { id: 'u1', email: 'staff@example.com', full_name: 'Staff', avatar: '', is_staff: true },
      isAuthenticated: true,
      isInitialized: true,
    });
  });

  it('shows loading skeletons', () => {
    vi.mocked(useOrders).mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
    } as never);
    render(
      <MemoryRouter initialEntries={['/fulfillment']}>
        <Fulfillment />
      </MemoryRouter>,
    );
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('shows error state', () => {
    vi.mocked(useOrders).mockReturnValue({
      data: undefined,
      isLoading: false,
      error: new Error('boom'),
    } as never);
    render(
      <MemoryRouter initialEntries={['/fulfillment']}>
        <Fulfillment />
      </MemoryRouter>,
    );
    expect(screen.getByRole('alert')).toHaveTextContent(/could not load orders/i);
  });

  it('restricts access for non-staff users', () => {
    useAuthStore.setState({
      user: { id: 'u1', email: 'customer@example.com', full_name: 'Customer', avatar: '', is_staff: false },
      isAuthenticated: true,
      isInitialized: true,
    });
    renderPage();
    expect(screen.getByRole('alert')).toHaveTextContent(/access restricted/i);
  });

  it('renders order cards with fulfillment details', () => {
    renderPage();
    expect(screen.getByText('Fulfillment')).toBeInTheDocument();
    expect(screen.getByText(/ORDER-1/)).toBeInTheDocument();
    expect(screen.getByText('Test Shirt')).toBeInTheDocument();
    expect(screen.getByText('Pending')).toBeInTheDocument();
    expect(screen.getByText('Payment: unpaid')).toBeInTheDocument();
    expect(screen.getByText((content) => content.includes('Bengaluru, Karnataka 560001'))).toBeInTheDocument();
  });

  it('filters orders by status', async () => {
    const user = userEvent.setup();
    const orders = [
      createMockOrder({ id: 'o1', status: 'pending' }),
      createMockOrder({ id: 'o2', status: 'delivered' }),
    ];
    renderPage(orders);

    await user.click(screen.getByRole('button', { name: /delivered \(1\)/i }));

    expect(screen.queryByText(/Order #O1/)).not.toBeInTheDocument();
    expect(screen.getByText(/Order #O2/)).toBeInTheDocument();  });

  it('shows empty state when no orders match the filter', async () => {
    const user = userEvent.setup();
    renderPage([createMockOrder({ id: 'o1', status: 'pending' })]);

    await user.click(screen.getByRole('button', { name: /shipped \(0\)/i }));

    expect(screen.getByText(/no orders in this status/i)).toBeInTheDocument();
  });
});
