import { useCallback, useLayoutEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router';

interface StackTheme {
  name: string;
  match: string;
  image: string;
}

interface ThemeStackCarouselProps {
  themes: StackTheme[];
}

const PEAK_STEP = 24;
const FAN_STEP = 28;
const SCALE_FACTOR = 0.02;
const RESET_CYCLE = 2;

function normalizeDepth(value: number, count: number) {
  return ((value % count) + count) % count;
}

export default function ThemeStackCarousel({ themes }: ThemeStackCarouselProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const deckRefs = useRef<Array<HTMLAnchorElement | null>>([]);
  const activeRef = useRef(0);
  const navigate = useNavigate();
  const count = themes.length;
  const slotCount = count * RESET_CYCLE + 1;
  const [activeIndex, setActiveIndex] = useState(0);

  const applyStyles = useCallback(
    (progress: number) => {
      deckRefs.current.forEach((el, i) => {
        if (!el) return;
        const depth = normalizeDepth(i - progress, count);
        const front = Math.min(depth, count - depth);
        const fanX = Math.sin((Math.PI * depth) / 2) * FAN_STEP;
        const scale = 1 - front * SCALE_FACTOR;
        const opacity = 1 - front * 0.18;
        el.style.transform = `translate(-50%, ${depth * PEAK_STEP}px) translateX(${fanX}px) scale(${scale})`;
        el.style.opacity = String(opacity);
        el.style.zIndex = String(40 - depth);
      });
    },
    [count],
  );

  const handleScroll = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    const width = el.clientWidth || 1;
    let raw = el.scrollLeft / width;
    if (raw >= count * RESET_CYCLE) {
      el.scrollLeft = el.scrollLeft - count * RESET_CYCLE * width;
      raw = el.scrollLeft / width;
    }
    applyStyles(raw);
    const rounded = Math.round(raw) % count;
    if (rounded !== activeRef.current) {
      activeRef.current = rounded;
      setActiveIndex(rounded);
    }
  }, [count, applyStyles]);

  useLayoutEffect(() => {
    applyStyles(0);
  }, [applyStyles]);

  const handleTap = useCallback(() => {
    const theme = themes[activeRef.current % count];
    if (theme) {
      navigate(`/products?theme=${encodeURIComponent(theme.match)}`);
    }
  }, [navigate, themes, count]);

  return (
    <div className="md:hidden">
      <div className="relative mb-14">
        {/* Visual deck: main theme on top, the rest peeking out below it */}
        <div className="pointer-events-none relative aspect-[4/5]">
          {themes.map((theme, i) => (
            <Link
              key={theme.name}
              ref={(el) => {
                deckRefs.current[i] = el;
              }}
              to={`/products?theme=${encodeURIComponent(theme.match)}`}
              className="group absolute left-1/2 top-0 flex aspect-[4/5] w-full flex-col justify-end overflow-hidden rounded-lg border border-white/40 shadow-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-700"
              aria-hidden={i !== activeIndex}
              tabIndex={i === activeIndex ? 0 : -1}
            >
              <img
                src={theme.image}
                alt={theme.name}
                className="absolute inset-0 size-full object-cover"
                loading="lazy"
              />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent px-4 pb-3 pt-12">
                <span className="block text-lg font-semibold text-white">{theme.name}</span>
                {i === activeIndex && (
                  <span className="mt-1 block text-xs font-medium text-white/70">
                    Swipe to explore
                  </span>
                )}
              </div>
            </Link>
          ))}
        </div>

        {/* Invisible scroller: captures swipe and tap gestures, loops at the end */}
        <div
          ref={trackRef}
          onScroll={handleScroll}
          onClick={handleTap}
          className="absolute inset-0 z-50 flex cursor-pointer snap-x snap-mandatory overflow-x-auto opacity-0 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          role="group"
          aria-label="Popular themes"
        >
          {Array.from({ length: slotCount }).map((_, slot) => (
            <div key={slot} className="w-full shrink-0 snap-center" />
          ))}
        </div>
      </div>
    </div>
  );
}