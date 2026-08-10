import { Link } from 'react-router';
import { ArrowRight } from 'lucide-react';
import ThemeCarousel from './ThemeCarousel';

interface Theme {
  name: string;
  image: string;
  match: string;
}

const THEMES: Theme[] = [
  {
    name: 'God',
    match: 'gods & mythology',
    image: 'https://images.unsplash.com/photo-1618336753974-aae8e04506aa?w=600&q=80',
  },
  {
    name: 'Quotes',
    match: 'motivation & quotes',
    image: 'https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?w=600&q=80',
  },
  {
    name: 'Premium',
    match: 'premium',
    image: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=600&q=80',
  },
  {
    name: 'Alcohol',
    match: 'alcohol',
    image: 'https://images.unsplash.com/photo-1506277886164-e25aa3f4ef7f?w=600&q=80',
  },
];

export default function PopularThemes() {
  return (
    <section className="py-10 lg:py-14">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-baseline justify-between gap-4">
          <h2 className="text-2xl font-bold text-neutral-900">
            Popular Themes
          </h2>
          <Link
            to="/products"
            className="hidden text-sm font-semibold text-neutral-600 transition-colors hover:text-primary-900 sm:inline-flex sm:items-center sm:gap-1"
          >
            Shop All
            <ArrowRight aria-hidden="true" className="size-4" />
          </Link>
        </div>

        <div className="md:hidden">
          <ThemeCarousel themes={THEMES} />
        </div>

        <div className="hidden gap-6 md:grid md:grid-cols-4">
          {THEMES.map((theme) => (
            <Link
              key={theme.name}
              to={`/products?theme=${encodeURIComponent(theme.match)}`}
              className="group flex flex-col overflow-hidden rounded-lg border border-neutral-200 bg-neutral-0 transition-shadow duration-300 hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-700"
            >
              <div className="aspect-[4/5] w-full overflow-hidden bg-neutral-100">
                <img
                  src={theme.image}
                  alt={theme.name}
                  loading="lazy"
                  decoding="async"
                  className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
                />
              </div>
              <span className="flex items-center justify-between gap-2 px-4 py-3 sm:px-5">
                <span className="text-sm font-semibold text-neutral-900">
                  {theme.name}
                </span>
                <ArrowRight
                  aria-hidden="true"
                  className="size-4 -translate-x-1 text-primary-900 opacity-0 transition duration-300 group-hover:translate-x-0 group-hover:opacity-100"
                />
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}