import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router';
import PopularThemes from '../PopularThemes';

describe('PopularThemes', () => {
  it('renders section heading', () => {
    render(
      <BrowserRouter>
        <PopularThemes />
      </BrowserRouter>,
    );

    expect(screen.getByText('Popular Themes')).toBeInTheDocument();
  });

  it('renders all four theme cards', () => {
    render(
      <BrowserRouter>
        <PopularThemes />
      </BrowserRouter>,
    );

    expect(screen.getByText('Anime')).toBeInTheDocument();
    expect(screen.getByText('Quotes')).toBeInTheDocument();
    expect(screen.getByText('Gods')).toBeInTheDocument();
    expect(screen.getByText('Music')).toBeInTheDocument();
  });

  it('renders theme images with alt text', () => {
    render(
      <BrowserRouter>
        <PopularThemes />
      </BrowserRouter>,
    );

    const images = screen.getAllByRole('img');
    expect(images).toHaveLength(4);
    expect(images[0]).toHaveAttribute('alt', 'Anime');
    expect(images[1]).toHaveAttribute('alt', 'Quotes');
  });

  it('links each theme to /products with theme param', () => {
    render(
      <BrowserRouter>
        <PopularThemes />
      </BrowserRouter>,
    );

    const links = screen.getAllByRole('link');
    expect(links[0]).toHaveAttribute('href', '/products?theme=anime');
    expect(links[1]).toHaveAttribute('href', '/products?theme=quotes');
    expect(links[2]).toHaveAttribute('href', '/products?theme=gods');
    expect(links[3]).toHaveAttribute('href', '/products?theme=music');
  });
});
