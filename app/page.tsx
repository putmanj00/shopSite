import { Suspense } from 'react';
import EnhancedHero from '@/components/homepage/enhanced-hero';
import { BotanicalDivider } from '@/components/ui/botanical-divider';
import CategoryCards from '@/components/homepage/category-cards';
import FeaturedProducts from '@/components/featured-products';
import BrandStory from '@/components/homepage/brand-story';
import TrustBar from '@/components/homepage/trust-bar';
import TestimonialCarousel from '@/components/homepage/testimonial-carousel';
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

function TestimonialSkeleton() {
  return (
    <section className="bg-zinc-50 py-16 lg:py-24">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <div className="h-10 w-64 mx-auto animate-pulse rounded bg-zinc-200"></div>
          <div className="h-6 w-96 mx-auto mt-4 animate-pulse rounded bg-zinc-200"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl p-6 shadow-sm animate-pulse">
              <div className="h-4 w-24 bg-zinc-200 rounded mb-4"></div>
              <div className="space-y-2">
                <div className="h-4 bg-zinc-200 rounded"></div>
                <div className="h-4 bg-zinc-200 rounded w-5/6"></div>
                <div className="h-4 bg-zinc-200 rounded w-4/6"></div>
              </div>
              <div className="flex items-center gap-3 mt-6 pt-4 border-t border-zinc-100">
                <div className="w-12 h-12 bg-zinc-200 rounded-full"></div>
                <div>
                  <div className="h-4 w-24 bg-zinc-200 rounded"></div>
                  <div className="h-3 w-16 bg-zinc-200 rounded mt-1"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
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

      {/* Enhanced Hero with background image */}
      <EnhancedHero
        heading="Made by hand. Found by heart."
        subheading="Gathered from maker hands and meadow roots. Every piece finds the heart that needs it."
        backgroundImage="/assets/images/headers/botanical-header-large.png"
        overlayOpacity={25}
        ctas={[
          { label: 'Wander the Shop', href: '/collections', variant: 'primary' },
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

      {/* Testimonials */}
      <Suspense fallback={<TestimonialSkeleton />}>
        <TestimonialCarousel />
      </Suspense>

      {/* Instagram Gallery */}
      <InstagramGallery />

      {/* Newsletter Signup */}
      <NewsletterSignup />
    </div>
  );
}
