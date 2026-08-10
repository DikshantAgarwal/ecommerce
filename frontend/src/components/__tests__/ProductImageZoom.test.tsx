import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ProductImageZoom from '../ProductImageZoom';

const SRC = 'https://example.com/shirt.jpg';
const ALT = 'Cool shirt';
const OPEN_LABEL = `Open full-size preview of ${ALT}`;

let matchMediaMock: ReturnType<typeof vi.fn>;

function mockHoverMediaQuery(matches: boolean) {
  matchMediaMock = vi.fn((query: string) => ({
    matches: query === '(hover: hover) and (pointer: fine)' ? matches : false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }));
  window.matchMedia = matchMediaMock as unknown as typeof window.matchMedia;
}

function mockContainerRect(container: HTMLElement) {
  vi.spyOn(container, 'getBoundingClientRect').mockReturnValue({
    width: 400,
    height: 500,
    left: 20,
    top: 10,
    right: 420,
    bottom: 510,
    x: 20,
    y: 10,
    toJSON: () => ({}),
  } as DOMRect);
}

function flushFrames() {
  return new Promise<void>((resolve) => {
    requestAnimationFrame(() => resolve());
  });
}

function getContainer(): HTMLElement {
  const img = screen.getByRole('img');
  const parent = img.parentElement;
  if (!parent) throw new Error('image has no container');
  return parent;
}

describe('ProductImageZoom', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    matchMediaMock = undefined as never;
  });

  it('renders the image with meaningful alt text', () => {
    render(<ProductImageZoom src={SRC} alt={ALT} />);

    const img = screen.getByRole('img');
    expect(img).toHaveAttribute('src', SRC);
    expect(img).toHaveAttribute('alt', ALT);
  });

  it('renders a keyboard-accessible full-size preview button', () => {
    render(<ProductImageZoom src={SRC} alt={ALT} />);

    expect(screen.getByRole('button', { name: OPEN_LABEL })).toBeInTheDocument();
  });

  it('exposes the zoomed image inside aria-hidden lens chrome', () => {
    render(<ProductImageZoom src={SRC} alt={ALT} />);

    const hidden = screen.queryByAltText('');
    expect(hidden).toBeInTheDocument();
    expect(hidden).toHaveAttribute('aria-hidden', 'true');
  });

  it('does not engage the lens on touch-only devices', () => {
    mockHoverMediaQuery(false);
    render(<ProductImageZoom src={SRC} alt={ALT} />);
    const container = getContainer();
    mockContainerRect(container);

    fireEvent.mouseEnter(container);
    fireEvent.mouseMove(container, { clientX: 220, clientY: 260 });
    const lens = container.querySelector('[aria-hidden="true"]') as HTMLElement;

    expect(lens.style.opacity).toBe('0');
  });

  it('positions the lens and pans the magnified image in sync with the cursor', async () => {
    mockHoverMediaQuery(true);
    render(<ProductImageZoom src={SRC} alt={ALT} />);
    const container = getContainer();
    mockContainerRect(container);

    fireEvent.mouseEnter(container);
    fireEvent.mouseMove(container, { clientX: 220, clientY: 260 });
    await flushFrames();

    const lens = container.children[1] as HTMLElement;
    const zoomImg = lens.querySelector('img') as HTMLImageElement;

    // cursor halfway across a 400x500 box → lens centred at 200,250
    expect(lens.style.opacity).toBe('1');
    expect(lens.style.left).toBe('140px');
    expect(lens.style.top).toBe('190px');
    // 2.5x magnification and pan such that the cursor point sits at lens centre
    expect(zoomImg.style.width).toBe('1000px');
    expect(zoomImg.style.height).toBe('1250px');
    expect(zoomImg.style.transform).toBe('translate(-440px, -565px)');
  });

  it('hides the lens when the cursor leaves the image', async () => {
    mockHoverMediaQuery(true);
    render(<ProductImageZoom src={SRC} alt={ALT} />);
    const container = getContainer();
    mockContainerRect(container);

    fireEvent.mouseEnter(container);
    fireEvent.mouseMove(container, { clientX: 220, clientY: 260 });
    await flushFrames();
    fireEvent.mouseLeave(container);
    await flushFrames();

    const lens = container.querySelector('[aria-hidden="true"]') as HTMLElement;
    expect(lens.style.opacity).toBe('0');
  });

  it('opens the full-view dialog on click and closes with the close button', () => {
    render(<ProductImageZoom src={SRC} alt={ALT} />);

    fireEvent.click(screen.getByRole('button', { name: OPEN_LABEL }));

    expect(screen.getByRole('dialog', { name: `Zoomed preview of ${ALT}` })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Close zoom preview' })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Close zoom preview' }));

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('closes the dialog on Escape key', () => {
    render(<ProductImageZoom src={SRC} alt={ALT} />);

    fireEvent.click(screen.getByRole('button', { name: OPEN_LABEL }));
    expect(screen.getByRole('dialog')).toBeInTheDocument();

    fireEvent.keyDown(document, { key: 'Escape' });

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});