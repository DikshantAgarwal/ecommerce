import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router';
import PopularThemes from '../PopularThemes';

const EXPECTED_HREFS = [
  '/products?theme=gods%20%26%20mythology',
  '/products?theme=motivation%20%26%20quotes',
  '/products?theme=premium',
  '/products?theme=alcohol',
];

describe('PopularThemes', () => {
  it('renders the section heading', () => {
    render(
      <BrowserRouter>
        <PopularThemes />
      </BrowserRouter>,
    );

    expect(screen.getByText('Popular Themes')).toBeInTheDocument();
  });

  it('renders the swipeable carousel for mobile', () => {
    render(
      <BrowserRouter>
        <PopularThemes />
      </BrowserRouter>,
    );

    expect(screen.getByRole('group', { name: 'Popular themes' })).toBeInTheDocument();
  });

  it('renders desktop theme cards linking to their collections', () => {
    render(
      <BrowserRouter>
        <PopularThemes />
      </BrowserRouter>,
    );

    const hrefs = screen.getAllByRole('link').map((l) => l.getAttribute('href'));
    for (const href of EXPECTED_HREFS) {
      expect(hrefs).toContain(href);
    }
  });

  it('exposes theme images with meaningful alt text', () => {
    render(
      <BrowserRouter>
        <PopularThemes />
      </BrowserRouter>,
    );

    const alts = screen.getAllByRole('img').map((i) => i.getAttribute('alt'));
    for (const name of ['God', 'Quotes', 'Premium', 'Alcohol']) {
      expect(alts).toContain(name);
    }
  });

  it('navigates to the next theme with the right arrow key', () => {
    const { container } = render(
      <BrowserRouter>
        <PopularThemes />
      </BrowserRouter>,
    );

    expect(screen.getByText('Explore the God collection \u2192')).toBeInTheDocument();

    const region = container.querySelector('[role="group"]') as HTMLElement;
    expect(region).not.toBeNull();

    fireEvent.keyDown(region, { key: 'ArrowRight' });
    fireEvent.scroll(region);

    expect(screen.getByText('Explore the Quotes collection \u2192')).toBeInTheDocument();
  });
});