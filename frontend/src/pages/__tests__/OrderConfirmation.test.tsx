import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router';
import OrderConfirmation from '../OrderConfirmation';

const mockInitiate = vi.fn();

vi.mock('../../hooks/useOrder', () => ({
  useOrder: vi.fn(),
}));

vi.mock('../../hooks/usePayment', () => ({
  useInitiatePayment: () => ({ mutate: mockInitiate, isPending: false }),
  usePaymentStatus: vi.fn(),
}));

vi.mock('../../lib/cashfree', () => ({
  openCashfreeCheckout: vi.fn(),
}));

import { useOrder } from '../../hooks/useOrder';
import { usePaymentStatus } from '../../hooks/usePayment';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function createMockOrder(overrides = {}): any {
  return {
    id: 'order-123',
    user: 'user-1',
    status: 'pending',
    payment_status: 'pending',
    total: '89.97',
    items: [
      {
        id: 'item-1',
        variant: 1,
        quantity: 1,
        unit_price: '89.97',
        total_price: '89.97',
        product_name: 'Test Shirt',
        product_slug: 'test-shirt',
        product_image: '',
        color: 'Black',
        size: 'M',
      },
    ],
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
    ...overrides,
  };
}

function renderPage(order = createMockOrder(), paymentStatus?: string) {
  vi.mocked(useOrder).mockReturnValue({
    data: order,
    isLoading: false,
    error: null,
  } as never);

  vi.mocked(usePaymentStatus).mockReturnValue({
    data: paymentStatus ? { payment_status: paymentStatus, order_status: 'pending' } : undefined,
    isLoading: false,
    isError: false,
  } as never);

  return render(
    <MemoryRouter initialEntries={['/orders/order-123/confirmation']}>
      <Routes>
        <Route path="/orders/:id/confirmation" element={<OrderConfirmation />} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('OrderConfirmation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('shows paid success state', () => {
    renderPage(createMockOrder(), 'paid');
    expect(screen.getByText('Payment Successful!')).toBeInTheDocument();
    expect(screen.getByText('Thank you for your purchase. Your order has been placed successfully.')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /continue shopping/i })).toBeInTheDocument();
  });

  it('shows failed state with retry payment', () => {
    renderPage(createMockOrder(), 'failed');
    expect(screen.getByText('Payment Failed')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /retry payment/i })).toBeInTheDocument();
  });

  it('shows awaiting while payment is pending', () => {
    vi.useFakeTimers();
    renderPage(createMockOrder(), 'pending');
    expect(screen.getByText('Awaiting Payment...')).toBeInTheDocument();
  });

  it('flips to payment not completed after timeout', () => {
    vi.useFakeTimers();
    renderPage(createMockOrder(), 'pending');

    act(() => {
      vi.advanceTimersByTime(21000);
    });

    expect(screen.getByText('Payment Not Completed')).toBeInTheDocument();
    expect(screen.getByText(/no amount was charged/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /retry payment/i })).toBeInTheDocument();
  });

  it('does not flip to not completed once payment succeeds within timeout', () => {
    vi.useFakeTimers();

    // start on pending, then payment resolves to paid before timeout elapses
    vi.mocked(useOrder).mockReturnValue({
      data: createMockOrder({ payment_status: 'pending' }),
      isLoading: false,
      error: null,
    } as never);
    vi.mocked(usePaymentStatus).mockReturnValue({
      data: { payment_status: 'pending', order_status: 'pending' },
      isLoading: false,
      isError: false,
    } as never);

    const { rerender } = render(
      <MemoryRouter initialEntries={['/orders/order-123/confirmation']}>
        <Routes>
          <Route path="/orders/:id/confirmation" element={<OrderConfirmation />} />
        </Routes>
      </MemoryRouter>,
    );

    vi.mocked(useOrder).mockReturnValue({
      data: createMockOrder({ payment_status: 'paid' }),
      isLoading: false,
      error: null,
    } as never);
    vi.mocked(usePaymentStatus).mockReturnValue({
      data: { payment_status: 'paid', order_status: 'confirmed' },
      isLoading: false,
      isError: false,
    } as never);
    rerender(
      <MemoryRouter initialEntries={['/orders/order-123/confirmation']}>
        <Routes>
          <Route path="/orders/:id/confirmation" element={<OrderConfirmation />} />
        </Routes>
      </MemoryRouter>,
    );

    act(() => {
      vi.advanceTimersByTime(21000);
    });

    expect(screen.queryByText('Payment Not Completed')).not.toBeInTheDocument();
    expect(screen.getByText('Payment Successful!')).toBeInTheDocument();
  });

  it('retry payment re-initiates payment and opens cashfree', async () => {
    const user = userEvent.setup();
    mockInitiate.mockImplementation((_payload, opts) => {
      opts.onSuccess({ payment_session_id: 'session_1', order_id: 'order-123', payment_status: 'pending' });
    });
    renderPage(createMockOrder(), 'failed');

    await user.click(screen.getByRole('button', { name: /retry payment/i }));

    expect(mockInitiate).toHaveBeenCalledWith(
      expect.objectContaining({
        orderId: 'order-123',
        returnUrl: expect.stringContaining('/orders/order-123/confirmation'),
      }),
      expect.anything(),
    );
  });
});