import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router';
import PopularThemes from '../PopularThemes';

const EXPECTED_HREFS = [
  '/products?theme=gods%20%26%20mythology',
  '/products?theme=motivation%20%26%20quotes',
  '/products?theme=premium',
  '/products?theme=alcohol',
];

describe('PopularThemes', () => {
  it('renders section heading', () => {
    render(
      <BrowserRouter>
        <PopularThemes />
      </BrowserRouter>,
    );

    expect(screen.getByText('Popular Themes')).toBeInTheDocument();
  });

  it('renders the four theme cards across carousel and desktop grid', () => {
    render(
      <BrowserRouter>
        <PopularThemes />
      </BrowserRouter>,
    );

    // Text queries match regardless of aria-hidden; each theme label appears
    // once in the carousel stack and once in the desktop grid.
    expect(screen.getAllByText('God')).toHaveLength(2);
    expect(screen.getAllByText('Quotes')).toHaveLength(2);
    expect(screen.getAllByText('Premium')).toHaveLength(2);
    expect(screen.getAllByText('Alcohol')).toHaveLength(2);
  });

  it('renders theme images with alt text', () => {
    render(
      <BrowserRouter>
        <PopularThemes />
      </BrowserRouter>,
    );

    const images = screen.getAllByRole('img');
    expect(images).toHaveLength(5);
    expect(images[0]).toHaveAttribute('alt', 'God');
  });

  it('links the front carousel theme and all grid themes to /products', () => {
    render(
      <BrowserRouter>
        <PopularThemes />
      </BrowserRouter>,
    );

    const hrefs = screen.getAllByRole('link').map((l) => l.getAttribute('href'));
    expect(hrefs.filter((h) => h === EXPECTED_HREFS[0])).toHaveLength(2);
    expect(hrefs.filter((h) => h === EXPECTED_HREFS[1])).toHaveLength(1);
    expect(hrefs.filter((h) => h === EXPECTED_HREFS[2])).toHaveLength(1);
    expect(hrefs.filter((h) => h === EXPECTED_HREFS[3])).toHaveLength(1);
  });
});