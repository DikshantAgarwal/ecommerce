import { Link } from 'react-router';

export default function HeroBanner() {
  return (
    <section className="relative flex min-h-[50vh] items-center md:min-h-[60vh]">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=1600&q=80')" }}
        aria-hidden="true"
      />
      <div
        className="absolute inset-0 bg-gradient-to-br from-neutral-900/70 via-neutral-900/50 to-neutral-900/30"
        aria-hidden="true"
      />
      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-lg">
          <h1 className="text-4xl font-bold text-white sm:text-5xl lg:text-6xl">
            Premium Fashion,
            <br />
            Crafted for You
          </h1>
          <p className="mt-4 text-lg text-white/80 sm:text-xl">
            Discover custom apparel that speaks your language. From anime to minimal — wear what you love.
          </p>
          <Link
            to="/products"
            className="mt-8 inline-flex h-12 items-center rounded-lg bg-primary-900 px-8 text-sm font-semibold text-white transition-colors duration-200 hover:bg-primary-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            Shop Now
          </Link>
        </div>
      </div>
    </section>
  );
}
