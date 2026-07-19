import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
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
    render(<AddToCartButton variantId={1} />);
    expect(screen.getByRole('button')).toHaveTextContent('Add to Cart');
  });

  it('calls mutate with variant_id on click', async () => {
    const user = userEvent.setup();
    render(<AddToCartButton variantId={42} />);

    await user.click(screen.getByRole('button'));

    expect(mockMutate).toHaveBeenCalledWith({ variant_id: 42, quantity: 1 });
  });

  it('is disabled when disabled prop is true', () => {
    render(<AddToCartButton variantId={1} disabled />);
    expect(screen.getByRole('button')).toBeDisabled();
  });
});
