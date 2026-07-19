import { Link } from 'react-router';

interface Theme {
  name: string;
  image: string;
  slug: string;
}

const THEMES: Theme[] = [
  {
    name: 'Anime',
    slug: 'anime',
    image: 'https://images.unsplash.com/photo-1567095761054-7a02e69e5c43?w=600&q=80',
  },
  {
    name: 'Quotes',
    slug: 'quotes',
    image: 'https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?w=600&q=80',
  },
  {
    name: 'Gods',
    slug: 'gods',
    image: 'https://images.unsplash.com/photo-1618336753974-aae8e04506aa?w=600&q=80',
  },
  {
    name: 'Music',
    slug: 'music',
    image: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=600&q=80',
  },
];

export default function PopularThemes() {
  return (
    <section className="py-12 lg:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 className="mb-8 text-2xl font-bold text-neutral-900">Popular Themes</h2>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
          {THEMES.map((theme) => (
            <Link
              key={theme.slug}
              to={`/products?theme=${theme.slug}`}
              className="group relative aspect-[4/5] overflow-hidden rounded-lg"
            >
              <img
                src={theme.image}
                alt={theme.name}
                className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
                loading="lazy"
              />
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
