import { useCallback, useLayoutEffect, useRef, useState } from 'react';
import { Link } from 'react-router';

interface ColorTheme {
  name: string;
  image: string;
  match: string;
}

interface ThemeCarouselProps {
  themes: ColorTheme[];
}

const CYCLES = 3;
const RESET_THRESHOLD = 2;
const FALLBACK_SLIDE_SHARE = 0.85;

interface DragState {
  startX: number;
  startLeft: number;
  moved: boolean;
}

function normalize(value: number, mod: number) {
  return ((value % mod) + mod) % mod;
}

export default function ThemeCarousel({ themes }: ThemeCarouselProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const slideRefs = useRef<Array<HTMLAnchorElement | null>>([]);
  const textRefs = useRef<Array<HTMLDivElement | null>>([]);
  const dragRef = useRef<DragState | null>(null);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);
  const touchMovedRef = useRef(false);
  const reducedRef = useRef(false);
  const count = themes.length;
  const activeRef = useRef(count);
  const slideCount = count * CYCLES;
  const [activeIndex, setActiveIndex] = useState(count);

  const measureUnit = useCallback((track: HTMLDivElement) => {
    const first = track.children[0] as HTMLElement | undefined;
    const second = track.children[1] as HTMLElement | undefined;
    if (first && second) {
      const unit = second.getBoundingClientRect().left - first.getBoundingClientRect().left;
      if (unit > 0) return unit;
    }
    const width = track.clientWidth || window.innerWidth;
    return width * FALLBACK_SLIDE_SHARE;
  }, []);

  const applyStyles = useCallback(
    (raw: number) => {
      const reduced = reducedRef.current;
      slideRefs.current.forEach((el, i) => {
        if (!el) return;
        const phase = normalize(i - raw, count);
        const near = Math.min(phase, count - phase);
        if (reduced) {
          el.style.transform = 'none';
          el.style.opacity = '1';
          el.style.filter = 'none';
          el.style.zIndex = '0';
        } else {
          const scale = 1 - near * 0.09;
          el.style.transform = `scale(${scale})`;
          el.style.opacity = String(1 - near * 0.3);
          el.style.filter = `brightness(${1 - near * 0.16})`;
          el.style.zIndex = String(count - Math.round(near));
        }
        const text = textRefs.current[i];
        if (text) {
          text.style.opacity = String(near < 0.5 ? 1 - near / 0.5 : 0);
        }
      });
    },
    [count],
  );

  const handleScroll = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    const unit = measureUnit(el);
    let raw = el.scrollLeft / unit;
    if (raw >= count * RESET_THRESHOLD) {
      el.scrollLeft -= count * unit;
      raw = el.scrollLeft / unit;
    }
    applyStyles(raw);
    const rounded = Math.round(raw);
    if (rounded !== activeRef.current) {
      activeRef.current = rounded;
      setActiveIndex(rounded);
    }
  }, [count, measureUnit, applyStyles]);

  const goTo = useCallback((targetLeft: number) => {
    const el = trackRef.current;
    if (!el) return;
    const extent = el.scrollWidth - el.clientWidth;
    const max = extent > 0 ? extent : Number.POSITIVE_INFINITY;
    el.scrollLeft = Math.min(Math.max(0, targetLeft), max);
  }, []);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      const direction = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
      if (!direction) return;
      e.preventDefault();
      const el = trackRef.current;
      if (!el) return;
      goTo(el.scrollLeft + direction * measureUnit(el));
    },
    [goTo, measureUnit],
  );

  const handlePointerDown = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== 'mouse') return;
    const el = trackRef.current;
    if (!el) return;
    dragRef.current = { startX: e.clientX, startLeft: el.scrollLeft, moved: false };
    el.setPointerCapture?.(e.pointerId);
  }, []);

  const handlePointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    const el = trackRef.current;
    if (!drag || !el) return;
    const dx = e.clientX - drag.startX;
    if (Math.abs(dx) > 6) drag.moved = true;
    el.scrollLeft = drag.startLeft - dx;
  }, []);

  const handlePointerUp = useCallback(() => {
    dragRef.current = null;
  }, []);

  const handleTouchStart = useCallback((e: React.TouchEvent<HTMLDivElement>) => {
    const touch = e.touches[0];
    if (!touch) return;
    touchStartRef.current = { x: touch.clientX, y: touch.clientY };
    touchMovedRef.current = false;
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent<HTMLDivElement>) => {
    const start = touchStartRef.current;
    const touch = e.touches[0];
    if (!start || !touch) return;
    const dx = Math.abs(touch.clientX - start.x);
    const dy = Math.abs(touch.clientY - start.y);
    if (dx > 8 || dy > 8) touchMovedRef.current = true;
  }, []);

  const handleTouchEnd = useCallback(() => {
    touchStartRef.current = null;
  }, []);

  const handleClickCapture = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (dragRef.current?.moved || touchMovedRef.current) {
      e.preventDefault();
      e.stopPropagation();
    }
    touchMovedRef.current = false;
  }, []);

  useLayoutEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    reducedRef.current = typeof window.matchMedia === 'function'
      ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
      : false;
    const unit = measureUnit(track);
    track.scrollLeft = count * unit;
    applyStyles(count);
  }, [count, measureUnit, applyStyles]);

  return (
    <div
      ref={trackRef}
      role="group"
      aria-roledescription="carousel"
      aria-label="Popular themes"
      onScroll={handleScroll}
      onKeyDown={handleKeyDown}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onClickCapture={handleClickCapture}
      tabIndex={0}
      className="flex cursor-grab snap-x snap-mandatory overflow-x-auto scroll-pl-[7.5%] scroll-pr-[7.5%] select-none pb-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-700 active:cursor-grabbing sm:scroll-pl-[19%] sm:scroll-pr-[19%] lg:scroll-pl-[27%] lg:scroll-pr-[27%] [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
    >
      {Array.from({ length: slideCount }).map((_, r) => {
        const theme = themes[r % count];
        const isActive = r === activeIndex;
        return (
          <li
            key={r}
            aria-hidden={!isActive}
            className="relative w-[85%] shrink-0 cursor-pointer snap-center overflow-hidden rounded-lg sm:w-[62%] lg:w-[46%]"
            style={{ transformOrigin: 'center center' }}
          >
            <Link
              ref={(el) => {
                slideRefs.current[r] = el;
              }}
              to={`/products?theme=${encodeURIComponent(theme.match)}`}
              tabIndex={isActive ? 0 : -1}
              className={`group relative block aspect-[4/5] overflow-hidden rounded-lg border border-neutral-300/70 bg-neutral-100 shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-700 lg:aspect-[3/4]`}
            >
              <img
                src={theme.image}
                alt={theme.name}
                draggable={false}
                loading={r === count ? 'eager' : 'lazy'}
                decoding="async"
                className="absolute inset-0 size-full object-cover"
              />
              <div
                className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent"
                aria-hidden="true"
              />
              <div
                ref={(el) => {
                  textRefs.current[r] = el;
                }}
                className="absolute inset-x-0 bottom-0 p-5 sm:p-6 lg:p-8"
              >
                <span className="block text-xl font-semibold leading-tight text-white sm:text-2xl">
                  {theme.name}
                </span>
                {isActive && (
                  <span className="mt-2 block text-sm font-normal text-white/80">
                    Explore the {theme.name} collection &rarr;
                  </span>
                )}
              </div>
            </Link>
          </li>
        );
      })}
    </div>
  );
}