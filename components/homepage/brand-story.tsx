import Image from 'next/image';
import Link from 'next/link';

export default function BrandStory() {
  return (
    <section className="bg-white py-16 lg:py-24">
      <div className="container mx-auto px-4">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-center">
          {/* Image Section */}
          <div className="relative">
            <div className="aspect-[4/3] relative overflow-hidden rounded-2xl bg-zinc-200">
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
            <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-amber-100 rounded-2xl -z-10 hidden lg:block" />
          </div>

          {/* Content Section */}
          <div className="lg:pl-8">
            <span className="text-amber-600 font-medium text-sm uppercase tracking-wider">
              Our Story
            </span>
            <h2 className="mt-3 text-3xl font-bold text-zinc-900 sm:text-4xl lg:text-5xl">
              Crafted by Hand,{' '}
              <span className="text-amber-600">Made with Heart</span>
            </h2>
            <div className="mt-6 space-y-4 text-zinc-600 text-lg leading-relaxed">
              <p>
                Every piece in our collection tells a story. From vibrant tie-dye
                textiles to hand-tooled leather goods, our artisans pour their
                passion into creating unique works that can&apos;t be replicated by
                machines.
              </p>
              <p>
                We partner directly with skilled craftspeople who have honed their
                techniques over generations. When you choose our products, you&apos;re
                not just buying an item—you&apos;re supporting real artists and
                preserving traditional craftsmanship.
              </p>
            </div>

            {/* Features */}
            <div className="mt-8 grid grid-cols-2 gap-6">
              <div>
                <div className="text-3xl font-bold text-zinc-900">50+</div>
                <div className="text-sm text-zinc-600">Artisan Partners</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-zinc-900">100%</div>
                <div className="text-sm text-zinc-600">Handmade Products</div>
              </div>
            </div>

            <Link
              href="/collections"
              className="mt-8 inline-flex items-center gap-2 text-amber-600 font-semibold hover:text-amber-700 transition-colors group"
            >
              Explore Our Collections
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
