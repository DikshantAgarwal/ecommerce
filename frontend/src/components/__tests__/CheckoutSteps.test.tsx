import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import CheckoutSteps from '../CheckoutSteps';

describe('CheckoutSteps', () => {
  it('renders all three steps', () => {
    render(<CheckoutSteps current="cart" />);
    const nav = screen.getByLabelText('Checkout progress');
    expect(nav.textContent).toContain('Cart');
    expect(nav.textContent).toContain('Address');
    expect(nav.textContent).toContain('Payment');
  });

  it('marks the current step', () => {
    render(<CheckoutSteps current="address" />);
    const current = screen.getByLabelText('Checkout progress').querySelector('[aria-current="step"]');
    expect(current?.textContent).toContain('Address');
  });

  it('shows completed steps as checked', () => {
    render(<CheckoutSteps current="payment" />);
    const nav = screen.getByLabelText('Checkout progress');
    expect(nav.querySelectorAll('[aria-hidden="true"]')).toBeTruthy();
  });
});