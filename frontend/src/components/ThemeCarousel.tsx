import { memo, useCallback } from 'react';
import { Link } from 'react-router';
import { ArrowRight } from 'lucide-react';
import { useSnapCarousel } from '../hooks/useSnapCarousel';

interface ColorTheme {
  name: string;
  image: string;
  match: string;
}

interface ThemeCarouselProps {
  themes: ColorTheme[];
}

interface ThemeSlideProps {
  theme: ColorTheme;
  isActive: boolean;
  slideRef: (el: HTMLAnchorElement | null) => void;
  textRef: (el: HTMLDivElement | null) => void;
}

const ThemeSlide = memo(function ThemeSlide({
  theme,
  isActive,
  slideRef,
  textRef,
}: ThemeSlideProps) {
  return (
    <li
      aria-hidden={!isActive}
      className="relative w-[85%] shrink-0 snap-center sm:w-[62%] lg:w-[46%]"
      style={{ transformOrigin: 'center center' }}
    >
      <Link
        ref={slideRef}
        to={`/products?theme=${encodeURIComponent(theme.match)}`}
        tabIndex={isActive ? 0 : -1}
        className="group block overflow-hidden rounded-lg border border-neutral-200 bg-neutral-0 transition-shadow duration-300 hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-700"
      >
        <div className="aspect-[4/5] w-full overflow-hidden bg-neutral-100">
          <img
            src={theme.image}
            alt={theme.name}
            draggable={false}
            loading="eager"
            decoding="async"
            className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
          />
        </div>

        <div
          ref={textRef}
          className="px-4 py-3 sm:px-5 sm:py-4"
        >
          <span className="flex items-center justify-between gap-2">
            <span className="text-sm font-semibold text-neutral-900">
              {theme.name}
            </span>
            <ArrowRight
              aria-hidden="true"
              className="size-4 -translate-x-1 text-primary-900 opacity-0 transition duration-300 group-hover:translate-x-0 group-hover:opacity-100"
            />
          </span>
          <span
            aria-hidden={!isActive}
            className="mt-1 block truncate text-xs font-medium text-neutral-500"
          >
            {isActive ? `Explore the ${theme.name} collection \u2192` : '\u00A0'}
          </span>
        </div>
      </Link>
    </li>
  );
});

export default function ThemeCarousel({ themes }: ThemeCarouselProps) {
  const count = themes.length;
  const {
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
  } = useSnapCarousel({ count });

  const setSlideRef = useCallback(
    (r: number) => (el: HTMLAnchorElement | null) => {
      slideRefs.current[r] = el;
    },
    [slideRefs],
  );

  const setTextRef = useCallback(
    (r: number) => (el: HTMLDivElement | null) => {
      textRefs.current[r] = el;
    },
    [textRefs],
  );

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
      {Array.from({ length: slideCount }).map((_, r) => (
        <ThemeSlide
          key={r}
          theme={themes[r % count]}
          isActive={r === activeIndex}
          slideRef={setSlideRef(r)}
          textRef={setTextRef(r)}
        />
      ))}
    </div>
  );
}