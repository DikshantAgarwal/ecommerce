import { useCallback, useLayoutEffect, useRef, useState } from 'react';

interface SnapCarouselOptions {
  count: number;
  cycles?: number;
  initialIndex?: number;
  resetThreshold?: number;
  fallbackShare?: number;
}

interface DragState {
  startX: number;
  startLeft: number;
  moved: boolean;
}

export function normalize(value: number, mod: number) {
  return ((value % mod) + mod) % mod;
}

export function useSnapCarousel({
  count,
  cycles = 3,
  initialIndex,
  resetThreshold = 2,
  fallbackShare = 0.85,
}: SnapCarouselOptions) {
  const trackRef = useRef<HTMLDivElement>(null);
  const slideRefs = useRef<Array<HTMLElement | null>>([]);
  const textRefs = useRef<Array<HTMLElement | null>>([]);
  const dragRef = useRef<DragState | null>(null);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);
  const touchMovedRef = useRef(false);
  const reducedRef = useRef(false);
  const activeRef = useRef(initialIndex ?? count);
  const slideCount = count * cycles;
  const [activeIndex, setActiveIndex] = useState(initialIndex ?? count);

  const measureUnit = useCallback((track: HTMLDivElement) => {
    const first = track.children[0] as HTMLElement | undefined;
    const second = track.children[1] as HTMLElement | undefined;
    if (first && second) {
      const unit = second.getBoundingClientRect().left - first.getBoundingClientRect().left;
      if (unit > 0) return unit;
    }
    const width = track.clientWidth || window.innerWidth;
    return width * fallbackShare;
  }, [fallbackShare]);

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
    if (raw >= count * resetThreshold) {
      el.scrollLeft -= count * unit;
      raw = el.scrollLeft / unit;
    }
    applyStyles(raw);
    const rounded = Math.round(raw);
    if (rounded !== activeRef.current) {
      activeRef.current = rounded;
      setActiveIndex(rounded);
    }
  }, [count, measureUnit, applyStyles, resetThreshold]);

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
    track.scrollLeft = (initialIndex ?? count) * unit;
    applyStyles(initialIndex ?? count);
  }, [count, measureUnit, applyStyles, initialIndex]);

  return {
    trackRef,
    slideRefs,
    textRefs,
    slideCount,
    activeIndex,
    handleScroll,
    handleKeyDown,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    handleClickCapture,
  };
}