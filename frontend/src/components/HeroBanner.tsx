import { Link } from 'react-router';
import { useSnapCarousel } from '../hooks/useSnapCarousel';

interface HeroSlide {
  eyebrow: string;
  headline: string;
  subtext: string;
  cta: string;
  to: string;
  image: string;
}

const SLIDES: HeroSlide[] = [
  {
    eyebrow: 'New Season — Pure Cotton',
    headline: 'Premium Fashion,',
    subtext: 'Crafted for you. Quiet luxury prints, made to last.',
    cta: 'Shop Now',
    to: '/products',
    image: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=1600&q=80',
  },
  {
    eyebrow: 'The Men\u2019s Edit',
    headline: 'Bold prints, clean fits.',
    subtext: 'Streetwear that speaks without shouting.',
    cta: 'Shop Men',
    to: '/products?section=men',
    image: 'https://images.unsplash.com/photo-1506277886164-e25aa3f4ef7f?w=1600&q=80',
  },
  {
    eyebrow: 'The Women\u2019s Edit',
    headline: 'Wear your confidence.',
    subtext: 'Soft silhouettes, statement graphics.',
    cta: 'Shop Women',
    to: '/products?section=women',
    image: 'https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?w=1600&q=80',
  },
];

const CYCLES = 3;

export default function HeroBanner() {
  const count = SLIDES.length;
  const {
    trackRef,
    slideRefs,
    textRefs,
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
  } = useSnapCarousel({ count, cycles: CYCLES, initialIndex: 0 });

  return (
    <section className="py-6 sm:py-8 lg:py-10" aria-label="Featured collection">
      <div
        ref={trackRef}
        role="group"
        aria-roledescription="carousel"
        aria-label="Featured editorial"
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
        className="flex cursor-grab snap-x snap-mandatory overflow-x-auto scroll-pl-[7.5%] scroll-pr-[7.5%] select-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-700 active:cursor-grabbing sm:scroll-pl-[17%] sm:scroll-pr-[17%] lg:scroll-pl-[22%] lg:scroll-pr-[22%] [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {SLIDES.map((slide, r) => {
          const isActive = r === activeIndex;
          return (
            <li
              key={slide.headline}
              aria-hidden={!isActive}
              className="relative w-[85%] shrink-0 snap-center sm:w-[66%] lg:w-[56%]"
              style={{ transformOrigin: 'center center' }}
            >
              <article
                ref={(el) => {
                  slideRefs.current[r] = el;
                }}
                className="relative aspect-[16/10] w-full overflow-hidden rounded-lg bg-neutral-100 sm:aspect-[16/9]"
              >
                <img
                  src={slide.image}
                  alt=""
                  draggable={false}
                  loading={r === count ? 'eager' : 'lazy'}
                  decoding="async"
                  className="absolute inset-0 h-full w-full object-cover"
                />
                <div className="absolute inset-x-4 bottom-4 max-w-md rounded-lg bg-neutral-0 p-5 shadow-sm sm:inset-x-6 sm:bottom-6 sm:p-6">
                  <p
                    ref={(el) => {
                      textRefs.current[r] = el;
                    }}
                    className="text-xs font-semibold uppercase tracking-wider text-neutral-500"
                  >
                    {slide.eyebrow}
                  </p>
                  {isActive ? (
                    <h1 className="mt-1 text-2xl font-bold text-neutral-900 sm:text-3xl">
                      {slide.headline}
                    </h1>
                  ) : (
                    <p className="mt-1 text-2xl font-bold text-neutral-900 sm:text-3xl">
                      {slide.headline}
                    </p>
                  )}
                  {isActive && (
                    <>
                      <p className="mt-1.5 hidden text-sm text-neutral-600 sm:block">
                        {slide.subtext}
                      </p>
                      <Link
                        to={slide.to}
                        tabIndex={isActive ? 0 : -1}
                        className="mt-3 inline-flex h-10 items-center rounded-lg bg-primary-900 px-6 text-sm font-semibold text-white transition-colors duration-200 hover:bg-primary-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-700"
                      >
                        {slide.cta}
                      </Link>
                    </>
                  )}
                </div>
              </article>
            </li>
          );
        })}
      </div>
    </section>
  );
}