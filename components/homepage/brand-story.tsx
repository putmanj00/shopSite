import Image from 'next/image';
import Link from 'next/link';

export default function BrandStory() {
  return (
    <section className="bg-white py-16 lg:py-24">
      <div className="container mx-auto px-4">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-center">
          {/* Image Section */}
          <div className="relative">
            <div className="aspect-[4/3] relative overflow-hidden rounded-2xl bg-neutral-200">
              {/* Placeholder image - replace with actual artisan workshop image */}
              <Image
                src="https://images.unsplash.com/photo-1452860606245-08befc0ff44b?w=800&h=600&fit=crop"
                alt="Artisan crafting handmade products in workshop"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            </div>
            {/* Decorative element */}
            <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-primary-100 rounded-2xl -z-10 hidden lg:block" />
          </div>

          {/* Content Section */}
          <div className="lg:pl-8">
            <span className="text-primary-600 font-medium text-sm uppercase tracking-wider">
              Born from a Love of the Untamed
            </span>
            <h2 className="mt-3 text-3xl font-bold text-neutral-900 sm:text-4xl lg:text-5xl font-heading">
              Wild Beauty,{' '}
              <span className="text-primary-600">Crafted with Intention</span>
            </h2>
            <div className="mt-6 space-y-4 text-neutral-600 text-lg leading-relaxed">
              <p>
                Like the wildflower that blooms where it chooses, every piece in our
                collection celebrates the untamed spirit. From vibrant tie-dye
                textiles to hand-selected crystals and artisan jewelry, each treasure
                is chosen with intention and care.
              </p>
              <p>
                We partner directly with skilled craftspeople who pour their energy
                into every creation. When you choose Wildenflower, you&apos;re not just
                finding a beautiful piece—you&apos;re connecting with the maker&apos;s story
                and supporting authentic craftsmanship.
              </p>
            </div>

            {/* Features */}
            <div className="mt-8 grid grid-cols-2 gap-6">
              <div>
                <div className="text-3xl font-bold text-neutral-900 font-heading">50+</div>
                <div className="text-sm text-neutral-600">Artisan Partners</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-neutral-900 font-heading">100%</div>
                <div className="text-sm text-neutral-600">Handpicked Treasures</div>
              </div>
            </div>

            <Link
              href="/collections"
              className="mt-8 inline-flex items-center gap-2 text-primary-600 font-semibold hover:text-primary-700 transition-colors group"
            >
              Explore Our Treasures
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
