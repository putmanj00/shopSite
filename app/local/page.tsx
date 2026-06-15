import type { Metadata } from 'next';
import Link from 'next/link';
import { BotanicalHeader } from '@/components/ui/botanical-header';
import { localBusinessSchema } from '@/lib/structured-data';

export const metadata: Metadata = {
  title: 'Visit Wildenflower | Northern Kentucky Handmade Shop',
  description:
    'Wildenflower is a handmade goods shop rooted in Northern Kentucky. Find tie-dye, leather, jewelry, crystals, and artwork — all made by hand.',
  openGraph: {
    title: 'Visit Wildenflower | Northern Kentucky Handmade Shop',
    description:
      'Handcrafted goods rooted in Northern Kentucky. Tie-dye, leather, jewelry, crystals, and artwork — made by hand, found by heart.',
  },
};

const categories = [
  { name: 'Tie-Dye', href: '/collections/tie-dye', description: 'Hand-dyed in small batches' },
  { name: 'Leather', href: '/collections/leather', description: 'Tooled by hand, worn for decades' },
  { name: 'Jewelry', href: '/collections/jewelry', description: 'Foraged shapes, gathered light' },
  { name: 'Crystals', href: '/collections/crystals', description: 'Earth-kept for years' },
  { name: 'Artwork', href: '/collections/artwork', description: 'Original pieces — no prints' },
];

export default function LocalPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }}
      />

      <BotanicalHeader variant="small" />

      <div className="min-h-screen bg-parchment">
        {/* Hero */}
        <section className="py-16 lg:py-20">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <span className="text-terracotta font-medium text-sm uppercase tracking-wider">
              Northern Kentucky
            </span>
            <h1 className="mt-3 text-4xl sm:text-5xl font-bold font-heading text-ink-brown">
              Visit Wildenflower
            </h1>
            <p className="mt-4 text-lg text-earth max-w-2xl mx-auto">
              We are rooted in Northern Kentucky — a corner of the country where
              things are still made slowly and meant to last. Wildenflower brings
              handcrafted goods from makers who work with their hands.
            </p>
          </div>
        </section>

        {/* What We Carry */}
        <section className="bg-white py-16 lg:py-20">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold font-heading text-ink-brown mb-8 text-center">
              What You&apos;ll Find
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {categories.map((cat) => (
                <Link
                  key={cat.name}
                  href={cat.href}
                  className="group block p-6 bg-parchment rounded-xl border border-gold/20 hover:border-terracotta/40 transition-colors"
                >
                  <h3 className="font-bold font-heading text-forest text-lg group-hover:text-terracotta transition-colors">
                    {cat.name}
                  </h3>
                  <p className="mt-1 text-earth text-sm">{cat.description}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Location Info */}
        <section className="py-16 lg:py-20">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-white rounded-2xl p-8 border border-gold/20 text-center">
              <h2 className="text-2xl font-bold font-heading text-ink-brown mb-4">
                Find Us
              </h2>
              {/* TODO: Update with real address, phone, and hours once confirmed */}
              <address className="not-italic text-earth space-y-2">
                <p className="font-semibold text-forest">Wildenflower</p>
                <p>Alexandria, Kentucky</p>
                <p>Northern Kentucky Area</p>
              </address>
              <p className="mt-6 text-sm text-earth/70">
                Hours and location details coming soon. Shop online anytime at wildenflower.com.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/collections/all"
                  className="inline-block px-6 py-3 bg-terracotta text-white rounded-lg font-semibold hover:bg-terracotta/90 transition-colors"
                >
                  Shop Online
                </Link>
                <Link
                  href="/contact"
                  className="inline-block px-6 py-3 border border-forest text-forest rounded-lg font-semibold hover:bg-forest hover:text-parchment transition-colors"
                >
                  Get in Touch
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
