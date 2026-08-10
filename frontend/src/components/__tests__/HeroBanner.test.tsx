import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router';
import HeroBanner from '../HeroBanner';

describe('HeroBanner', () => {
  it('renders the editorial carousel region', () => {
    render(
      <BrowserRouter>
        <HeroBanner />
      </BrowserRouter>,
    );

    expect(screen.getByRole('group', { name: 'Featured editorial' })).toBeInTheDocument();
  });

  it('renders active slide heading', () => {
    render(
      <BrowserRouter>
        <HeroBanner />
      </BrowserRouter>,
    );

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Premium Fashion,');
  });

  it('renders active slide copy', () => {
    render(
      <BrowserRouter>
        <HeroBanner />
      </BrowserRouter>,
    );

    expect(screen.getByText(/Quiet luxury prints/)).toBeInTheDocument();
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

  it('navigates to the next slide with the right arrow key', () => {
    const { container } = render(
      <BrowserRouter>
        <HeroBanner />
      </BrowserRouter>,
    );

    const region = container.querySelector('[role="group"]') as HTMLElement;
    expect(region).not.toBeNull();

    fireEvent.keyDown(region, { key: 'ArrowRight' });
    fireEvent.scroll(region);

    expect(screen.getByText(/Streetwear that speaks/)).toBeInTheDocument();
  });
});