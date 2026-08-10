import { afterEach, describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter, useLocation } from 'react-router';
import MobileCategoryNav from '../MobileCategoryNav';
import type { Category } from '../../types';

vi.mock('../../services/category.service', () => ({
  getCategories: vi.fn(),
}));

import { getCategories } from '../../services/category.service';

const CATEGORIES: Category[] = [
  { id: 1, name: 'Gods & Mythology', slug: 'men-gods-mythology', section: 'men', is_active: true, description: '' },
  { id: 2, name: 'Gods & Mythology', slug: 'women-gods-mythology', section: 'women', is_active: true, description: '' },
  { id: 3, name: 'Premium', slug: 'men-premium', section: 'men', is_active: true, description: '' },
  { id: 4, name: 'Premium', slug: 'women-premium', section: 'women', is_active: true, description: '' },
  { id: 5, name: 'Alcohol', slug: 'men-alcohol', section: 'men', is_active: true, description: '' },
  { id: 6, name: 'Alcohol', slug: 'women-alcohol', section: 'women', is_active: true, description: '' },
  { id: 7, name: 'Motivation & Quotes', slug: 'men-motivation-quotes', section: 'men', is_active: true, description: '' },
  { id: 8, name: 'Motivation & Quotes', slug: 'women-motivation-quotes', section: 'women', is_active: true, description: '' },
];

function LocationProbe() {
  const { pathname, search } = useLocation();
  return <output data-testid="location">{pathname + search}</output>;
}

function renderNav(entry = '/') {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 } },
  });
  return render(
    <QueryClientProvider client={client}>
      <MemoryRouter initialEntries={[entry]}>
        <MobileCategoryNav />
        <LocationProbe />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

function themesTab() {
  return screen.getByRole('button', { name: /Themes/ });
}

describe('MobileCategoryNav', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders Men and Women links and a Themes trigger', () => {
    renderNav('/');

    expect(screen.getByRole('link', { name: 'Men' })).toHaveAttribute(
      'href',
      '/products?section=men',
    );
    expect(screen.getByRole('link', { name: 'Women' })).toHaveAttribute(
      'href',
      '/products?section=women',
    );
    expect(themesTab()).toBeInTheDocument();
  });

  it('highlights the active Men tab without also highlighting Themes', () => {
    renderNav('/products?section=men');

    expect(screen.getByRole('link', { name: 'Men' })).toHaveAttribute(
      'aria-current',
      'page',
    );
    expect(screen.getByRole('link', { name: 'Women' })).not.toHaveAttribute(
      'aria-current',
    );
    expect(themesTab().querySelector('.bg-primary-900')).toBeNull();
  });

  it('highlights the Themes tab when a theme filter is active', () => {
    renderNav('/products?theme=Premium');

    expect(themesTab().querySelector('.bg-primary-900')).not.toBeNull();
    expect(screen.getByRole('link', { name: 'Men' })).not.toHaveAttribute(
      'aria-current',
    );
  });

  it('has no active tab on the home page', () => {
    renderNav('/');

    expect(screen.getByRole('link', { name: 'Men' })).not.toHaveAttribute(
      'aria-current',
    );
    expect(screen.getByRole('link', { name: 'Women' })).not.toHaveAttribute(
      'aria-current',
    );
    expect(themesTab().querySelector('.bg-primary-900')).toBeNull();
  });

  it('opens the theme selector and navigates when a theme is tapped', async () => {
    vi.mocked(getCategories).mockResolvedValue(CATEGORIES);
    renderNav('/');

    fireEvent.click(themesTab());
    expect(themesTab()).toHaveAttribute('aria-expanded', 'true');

    const gods = await screen.findByRole('link', {
      name: /Gods & Mythology/,
    });
    fireEvent.click(gods);

    expect(screen.getByTestId('location').textContent).toBe(
      '/products?theme=Gods%20%26%20Mythology',
    );
  });

  it('lists each theme once, deduplicated across sections', async () => {
    vi.mocked(getCategories).mockResolvedValue(CATEGORIES);
    renderNav('/');

    fireEvent.click(themesTab());

    expect(await screen.findByRole('link', { name: /Premium/ })).toBeInTheDocument();
    expect(screen.getAllByRole('link', { name: /Gods & Mythology/ })).toHaveLength(1);
    expect(screen.getAllByRole('link', { name: /Premium/ })).toHaveLength(1);
    expect(screen.getAllByRole('link', { name: /Alcohol/ })).toHaveLength(1);
    expect(screen.getAllByRole('link', { name: /Motivation & Quotes/ })).toHaveLength(1);
  });

  it('closes the theme selector on Escape', async () => {
    vi.mocked(getCategories).mockResolvedValue(CATEGORIES);
    renderNav('/');

    fireEvent.click(themesTab());
    expect(screen.getByText('View All Themes \u2192')).toBeInTheDocument();

    fireEvent.keyDown(document, { key: 'Escape' });

    expect(screen.queryByText('View All Themes \u2192')).not.toBeInTheDocument();
    expect(themesTab()).toHaveAttribute('aria-expanded', 'false');
  });

  it('closes the theme selector when tapping outside', async () => {
    vi.mocked(getCategories).mockResolvedValue(CATEGORIES);
    renderNav('/');
    document.body.appendChild(document.createElement('button'));

    fireEvent.click(themesTab());
    expect(themesTab()).toHaveAttribute('aria-expanded', 'true');

    fireEvent.pointerDown(document.body);

    expect(themesTab()).toHaveAttribute('aria-expanded', 'false');
  });

  it('opens all themes from the View All link', async () => {
    vi.mocked(getCategories).mockResolvedValue(CATEGORIES);
    renderNav('/');

    fireEvent.click(themesTab());
    const viewAll = await screen.findByText('View All Themes \u2192');
    fireEvent.click(viewAll.closest('a')!);

    expect(screen.getByTestId('location').textContent).toBe('/products');
  });
});