import Image from 'next/image';
import Link from 'next/link';

export default function BrandStory() {
  return (
    <section className="bg-forest text-parchment py-16 lg:py-24">
      <div className="container mx-auto px-4">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-center">
          {/* Image Section */}
          <div className="relative">
            <div className="aspect-[4/3] relative overflow-hidden rounded-2xl bg-neutral-200">
              {/* Placeholder image - replace with actual artisan workshop image */}
              <Image
                src="/assets/images/about/love.jpeg"
                alt="Artisan crafting handmade products in workshop"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            </div>
            {/* Decorative element */}
            <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-gold/20 rounded-2xl -z-10 hidden lg:block" />
          </div>

          {/* Content Section */}
          <div className="lg:pl-8">
            <span className="catalog-label text-gold">
              Made by Hand
            </span>
            <h2 className="mt-3 text-3xl font-bold text-cream sm:text-4xl lg:text-5xl font-heading">
              Found by the heart{' '}
              <span className="text-gold">that needs it</span>
            </h2>
            <div className="mt-6 space-y-4 text-parchment/80 text-lg leading-relaxed">
              <p>
                Every piece starts in our hands — dyed in the backyard, tooled
                at the workbench, set stone by stone. We are the makers, and we
                pour genuine care into everything we create.
              </p>
              <p>
                When you choose Wildenflower, you&apos;re not just buying
                something to own. You&apos;re carrying forward the intention of
                the person who made it — and supporting a slower, more
                considered way of making things.
              </p>
            </div>

            {/* Features */}
            <div className="mt-8 grid grid-cols-2 gap-6">
              <div>
                <div className="text-3xl font-bold text-gold font-heading">100%</div>
                <div className="text-sm text-parchment/70">Handmade by Us</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-gold font-heading">Lifetime</div>
                <div className="text-sm text-parchment/70">Repair Promise</div>
              </div>
            </div>

            <Link
              href="/collections/all"
              className="mt-8 inline-flex items-center gap-2 text-gold font-semibold hover:text-gold/80 transition-colors group"
            >
              Explore the Collection
              <svg
                className="w-5 h-5 transition-transform group-hover:translate-x-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 8l4 4m0 0l-4 4m4-4H3"
                />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
