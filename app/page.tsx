import { Suspense } from 'react';
import { localBusinessSchema, organizationSchema } from '@/lib/structured-data';
import EnhancedHero from '@/components/homepage/enhanced-hero';
import { BotanicalDivider } from '@/components/ui/botanical-divider';
import CategoryCards from '@/components/homepage/category-cards';
import FeaturedProducts from '@/components/featured-products';
import BrandStory from '@/components/homepage/brand-story';
import TrustBar from '@/components/homepage/trust-bar';
import FindUsInTheWild from '@/components/homepage/find-us-in-the-wild';
import InstagramGallery from '@/components/homepage/instagram-gallery';
import NewsletterSignup from '@/components/homepage/newsletter-signup';
import ProductCardSkeleton from '@/components/product-card-skeleton';
import PersonalizedRecommendations from '@/components/homepage/personalized-recommendations';

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
    name: 'Wildenflower',
    description: 'Handpicked treasures for the untamed spirit. Curated bohemian jewelry, crystals, tie-dye, and artisan leather goods.',
    url: 'https://wildenflower.com',
    potentialAction: {
      '@type': 'SearchAction',
      target: 'https://wildenflower.com/search?q={search_term_string}',
      'query-input': 'required name=search_term_string'
    }
  };

  return (
    <div className="min-h-screen bg-[#F5EDD6]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />

      {/* Enhanced Hero with background image */}
      <EnhancedHero
        heading="Made by hand. Found by heart."
        subheading="Gathered from maker hands and meadow roots. Every piece finds the heart that needs it."
        backgroundImage="/assets/images/headers/botanical-hero2.png"
        overlayOpacity={15}
        ctas={[
          { label: 'Wander the Shop', href: '/collections/all', variant: 'primary' },
          { label: 'Our Story', href: '#brand-story', variant: 'secondary' },
        ]}
      />

      <BotanicalDivider variant="wildflower" />

      {/* Category Cards */}
      <CategoryCards />

      <BotanicalDivider variant="fern-mushroom" />

      {/* Personalized Recommendations (Client-side only) */}
      <div>
        <PersonalizedRecommendations />
      </div>

      {/* Featured Products */}
      <Suspense fallback={<FeaturedProductsSkeleton />}>
        <FeaturedProducts />
      </Suspense>

      <BotanicalDivider variant="fern-spiral" />

      {/* Brand Story */}
      <div id="brand-story">
        <BrandStory />
      </div>

      {/* Trust Bar */}
      <TrustBar />

      {/* Find Us in the Wild — upcoming markets */}
      <FindUsInTheWild />

      {/* Instagram Gallery */}
      <InstagramGallery />

      {/* Newsletter Signup */}
      <NewsletterSignup />
    </div>
  );
}
