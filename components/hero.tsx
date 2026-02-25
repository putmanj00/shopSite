import Link from 'next/link';

export default function Hero() {
  return (
    <section className="relative bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 text-white">
      <div className="container mx-auto px-4 py-24 md:py-32 lg:py-40">
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="mb-6 text-5xl font-bold tracking-tight md:text-6xl lg:text-7xl">
            Discover Your Perfect{' '}
            <span className="bg-gradient-to-r from-terracotta to-gold bg-clip-text text-transparent">
              Style
            </span>
          </h1>
          <p className="mb-8 text-lg text-zinc-300 md:text-xl lg:text-2xl">
            Curated collections of premium products. Exceptional quality,
            modern design, delivered to your door.
          </p>
          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <Link
              href="/collections"
              className="inline-flex items-center justify-center rounded-lg bg-white px-8 py-4 text-base font-semibold text-zinc-900 transition-all hover:bg-zinc-100 hover:scale-105"
            >
              Shop Now
            </Link>
            <Link
              href="/collections"
              className="inline-flex items-center justify-center rounded-lg border-2 border-white px-8 py-4 text-base font-semibold text-white transition-all hover:bg-white hover:text-zinc-900 hover:scale-105"
            >
              Browse Collections
            </Link>
          </div>
        </div>
      </div>
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-zinc-600 to-transparent"></div>
    </section>
  );
}
