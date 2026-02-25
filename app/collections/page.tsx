import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { getAllCollections } from '@/lib/shopify-helpers';

export const metadata: Metadata = {
  title: 'Collections | Wildenflower',
  description: 'Browse all our handcrafted collections',
};

export default async function CollectionsPage() {
  const collections = await getAllCollections();

  return (
    <div className="min-h-screen bg-parchment">
      <section className="bg-parchment py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="text-terracotta font-medium text-sm uppercase tracking-wider">
            Shop
          </span>
          <h1 className="mt-3 text-4xl font-bold font-heading text-ink-brown sm:text-5xl mb-4">
            Browse Collections
          </h1>
          <p className="text-lg text-earth max-w-2xl mx-auto">
            Explore our curated collections of premium products
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        {collections.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-earth text-lg">No collections available yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {collections.map((collection) => (
              <Link
                key={collection.id}
                href={`/collections/${collection.handle}`}
                className="group relative overflow-hidden rounded-2xl bg-white shadow-sm hover:shadow-md transition-all duration-300"
              >
                {collection.image && (
                  <div className="aspect-[4/3] overflow-hidden relative">
                    <Image
                      src={collection.image.url}
                      alt={collection.image.altText || collection.title}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                )}
                <div className="p-6">
                  <h2 className="text-2xl font-bold text-ink-brown mb-2 group-hover:text-terracotta transition-colors">
                    {collection.title}
                  </h2>
                  {collection.description && (
                    <p className="text-earth line-clamp-2">
                      {collection.description}
                    </p>
                  )}
                  <div className="mt-4 flex items-center text-terracotta font-medium">
                    Shop Collection
                    <svg
                      className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
