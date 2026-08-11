import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router';
import AddToCartButton from '../AddToCartButton';

const mockMutate = vi.fn();

vi.mock('../../hooks/useCart', () => ({
  useAddToCart: () => ({ mutate: mockMutate, isPending: false }),
}));

describe('AddToCartButton', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders with default text', () => {
    render(
      <MemoryRouter>
        <AddToCartButton variantId={1} />
      </MemoryRouter>,
    );
    expect(screen.getByRole('button')).toHaveTextContent('Add to Cart');
  });

  it('calls mutate with variant_id on click', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <AddToCartButton variantId={42} />
      </MemoryRouter>,
    );

    await user.click(screen.getByRole('button'));

    expect(mockMutate).toHaveBeenCalledWith(
      { variant_id: 42, quantity: 1 },
      expect.any(Object),
    );
  });

  it('is disabled when disabled prop is true', () => {
    render(
      <MemoryRouter>
        <AddToCartButton variantId={1} disabled />
      </MemoryRouter>,
    );
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('shows Go to Cart link to /cart once item is added', async () => {
    const user = userEvent.setup();
    mockMutate.mockImplementation((_payload, opts) => {
      opts.onSuccess();
    });

    render(
      <MemoryRouter>
        <AddToCartButton variantId={7} />
      </MemoryRouter>,
    );

    await user.click(screen.getByRole('button'));

    const link = screen.getByRole('link', { name: /go to cart/i });
    expect(link).toHaveAttribute('href', '/cart');
  });
});