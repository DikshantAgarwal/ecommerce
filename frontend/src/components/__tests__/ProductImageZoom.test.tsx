import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ProductImageZoom from '../ProductImageZoom';

const SRC = 'https://example.com/shirt.jpg';
const ALT = 'Cool shirt';

describe('ProductImageZoom', () => {
  it('renders the image with alt text', () => {
    render(<ProductImageZoom src={SRC} alt={ALT} />);

    const img = screen.getByRole('img');
    expect(img).toHaveAttribute('src', SRC);
    expect(img).toHaveAttribute('alt', ALT);
  });

  it('renders the expand button', () => {
    render(<ProductImageZoom src={SRC} alt={ALT} />);

    expect(screen.getByRole('button', { name: `Zoom ${ALT}` })).toBeInTheDocument();
  });

  it('opens the full-view modal on click and closes with the close button', () => {
    render(<ProductImageZoom src={SRC} alt={ALT} />);

    fireEvent.click(screen.getByRole('button', { name: `Zoom ${ALT}` }));

    expect(screen.getByRole('dialog', { name: `Zoomed view of ${ALT}` })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Close zoom' })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Close zoom' }));

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('closes the modal on Escape key', () => {
    render(<ProductImageZoom src={SRC} alt={ALT} />);

    fireEvent.click(screen.getByRole('button', { name: `Zoom ${ALT}` }));
    expect(screen.getByRole('dialog')).toBeInTheDocument();

    fireEvent.keyDown(document, { key: 'Escape' });

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});