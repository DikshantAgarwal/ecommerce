import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, useLocation } from 'react-router';
import ThemeCarousel from '../ThemeCarousel';

const THEMES = [
  { name: 'God', match: 'gods & mythology', image: 'god.jpg' },
  { name: 'Quotes', match: 'motivation & quotes', image: 'quotes.jpg' },
  { name: 'Premium', match: 'premium', image: 'premium.jpg' },
  { name: 'Alcohol', match: 'alcohol', image: 'alcohol.jpg' },
];

function LocationProbe() {
  const { pathname, search } = useLocation();
  return <output data-testid="location">{pathname + search}</output>;
}

function renderCarousel() {
  return render(
    <MemoryRouter initialEntries={['/']}>
      <ThemeCarousel themes={THEMES} />
      <LocationProbe />
    </MemoryRouter>,
  );
}

describe('ThemeCarousel', () => {
  it('navigates immediately when any card is tapped', () => {
    const { container } = renderCarousel();

    const premium = Array.from(container.querySelectorAll('a')).find(
      (l) => l.getAttribute('href') === '/products?theme=premium',
    );
    expect(premium).toBeDefined();

    fireEvent.click(premium!);

    expect(screen.getByTestId('location').textContent).toBe('/products?theme=premium');
  });

  it('suppresses navigation after a swipe gesture', () => {
    const { container } = renderCarousel();
    const region = screen.getByRole('group');

    fireEvent.touchStart(region, {
      touches: [{ clientX: 200, clientY: 10 }],
    });
    fireEvent.touchMove(region, {
      touches: [{ clientX: 50, clientY: 12 }],
    });
    fireEvent.touchEnd(region);

    const premium = Array.from(container.querySelectorAll('a')).find(
      (l) => l.getAttribute('href') === '/products?theme=premium',
    );
    fireEvent.click(premium!);

    expect(screen.getByTestId('location').textContent).toBe('/');
  });
});