import { Suspense } from 'react';
import Hero from '@/components/hero';
import FeaturedProducts from '@/components/featured-products';
import ProductCardSkeleton from '@/components/product-card-skeleton';

function FeaturedProductsSkeleton() {
  return (
    <section className="container mx-auto px-4 py-16">
      <div className="mb-8 flex items-center justify-between">
        <div className="h-10 w-64 animate-pulse rounded bg-zinc-200"></div>
        <div className="h-6 w-24 animate-pulse rounded bg-zinc-200"></div>
      </div>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </div>
    </section>
  );
}

export default function Home() {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Store',
    name: 'ShopSite',
    description: 'Premier destination for modern products.',
    url: 'https://shopsite.com',
    potentialAction: {
      '@type': 'SearchAction',
      target: 'https://shopsite.com/search?q={search_term_string}',
      'query-input': 'required name=search_term_string'
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <Hero />
      <Suspense fallback={<FeaturedProductsSkeleton />}>
        <FeaturedProducts />
      </Suspense>
    </div>
  );
}
