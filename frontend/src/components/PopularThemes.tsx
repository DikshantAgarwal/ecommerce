import { Link } from 'react-router';

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
    <section className="py-12 lg:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 className="mb-8 text-2xl font-bold text-neutral-900">Popular Themes</h2>

        <div className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-4 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:grid md:grid-cols-4 md:gap-6 md:overflow-visible md:pb-0">
          {THEMES.map((theme) => (
            <Link
              key={theme.name}
              to={`/products?theme=${encodeURIComponent(theme.match)}`}
              className="group relative aspect-[4/5] w-64 shrink-0 snap-center overflow-hidden rounded-lg border border-neutral-300 border-opacity-50 shadow-sm md:w-auto md:shadow-none"
            >
              <img
                src={theme.image}
                alt={theme.name}
                className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
                loading="lazy"
              />
              <div className="absolute inset-0 pointer-events-none [background:linear-gradient(to_right,rgba(0,0,0,0.3),transparent_12%)] md:hidden" aria-hidden="true" />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-4 pt-12">
                <span className="text-lg font-semibold text-white">{theme.name}</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}