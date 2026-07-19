import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router';
import HeroBanner from '../HeroBanner';

describe('HeroBanner', () => {
  it('renders heading', () => {
    render(
      <BrowserRouter>
        <HeroBanner />
      </BrowserRouter>,
    );

    expect(screen.getByText((content) => content.includes('Premium Fashion,'))).toBeInTheDocument();
    expect(screen.getByText((content) => content.includes('Crafted for You'))).toBeInTheDocument();
  });

  it('renders subtext', () => {
    render(
      <BrowserRouter>
        <HeroBanner />
      </BrowserRouter>,
    );

    expect(screen.getByText(/Discover custom apparel/)).toBeInTheDocument();
  });

  it('renders CTA link to /products', () => {
    render(
      <BrowserRouter>
        <HeroBanner />
      </BrowserRouter>,
    );

    const cta = screen.getByRole('link', { name: 'Shop Now' });
    expect(cta).toHaveAttribute('href', '/products');
  });
});
