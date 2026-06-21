import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { getProductByHandle, getAllProductsHandles } from '@/lib/shopify-helpers';
import type { Metadata } from 'next';
import ImageGallery from '@/components/image-gallery';
import ProductInfo from '@/components/product-info';
import Breadcrumbs from '@/components/breadcrumbs';
import RelatedProducts from '@/components/related-products';
import ProductCardSkeleton from '@/components/product-card-skeleton';
import ReviewList from '@/components/reviews/review-list';
import ProductAccordion from '@/components/product-accordion';
import { getProductAccordionSections } from '@/lib/product-utils';
import RecentlyViewedTracker from '@/components/recently-viewed-tracker';
import { BotanicalHeader } from '@/components/ui/botanical-header';
import { buildBreadcrumbList, SITE_URL } from '@/lib/structured-data';

interface ProductPageProps {
  params: Promise<{
    handle: string;
  }>;
}

export const revalidate = 60;

export async function generateStaticParams() {
  const handles = await getAllProductsHandles();
  return handles.map((handle) => ({
    handle,
  }));
}

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { handle } = await params;

  let product;
  try {
    product = await getProductByHandle(handle);
  } catch {
    return {
      title: 'Product Not Found',
    };
  }

  if (!product) {
    return {
      title: 'Product Not Found',
    };
  }

  const firstImage = product.images.edges[0]?.node;
  const price = product.priceRange.minVariantPrice;

  return {
    title: `${product.title} | Wildenflower`,
    description: product.description || `Shop ${product.title}`,
    openGraph: {
      title: product.title,
      description: product.description,
      images: firstImage ? [{ url: firstImage.url }] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title: product.title,
      description: product.description,
      images: firstImage ? [firstImage.url] : [],
    },
    other: {
      'product:price:amount': price.amount,
      'product:price:currency': price.currencyCode,
    },
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { handle } = await params;

  let product;
  try {
    product = await getProductByHandle(handle);
  } catch (error) {
    console.error('Error fetching product:', error);
    notFound();
  }

  if (!product) {
    notFound();
  }

  // Generate structured data for SEO
  const price = product.priceRange.minVariantPrice;

  const breadcrumbData = buildBreadcrumbList([
    { name: 'Home', url: SITE_URL },
    { name: 'Shop', url: `${SITE_URL}/collections` },
    { name: product.title, url: `${SITE_URL}/products/${handle}` },
  ]);

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.title,
    description: product.description,
    image: product.images.edges.map((edge) => edge.node.url),
    brand: {
      '@type': 'Brand',
      name: product.vendor,
    },
    offers: {
      '@type': 'AggregateOffer',
      url: `${SITE_URL}/products/${product.handle}`,
      priceCurrency: price.currencyCode,
      highPrice: product.priceRange?.maxVariantPrice?.amount || price.amount,
      lowPrice: price.amount,
      availability: product.availableForSale
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
    },
    ...(product.tags.length > 0 && {
      keywords: product.tags.join(', '),
    }),
  };

  return (
    <>
      {/* Structured Data for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbData) }}
      />

      {/* Track recently viewed product */}
      <RecentlyViewedTracker product={product} />

      <BotanicalHeader variant="small" />

      <div className="min-h-screen bg-parchment">
        {/* Breadcrumbs */}
        <div className="bg-parchment border-b border-gold/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <Breadcrumbs product={product} />
          </div>
        </div>

        {/* Product Details */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
            {/* Image Gallery */}
            <ImageGallery product={product} />

            {/* Product Info (Title, Price, Variants, Add to Cart) */}
            <ProductInfo product={product} />
          </div>

          {/* Product Details Accordion */}
          <div className="mt-12 bg-cream rounded-lg border border-gold/25 p-6 lg:p-8">
            <ProductAccordion
              sections={getProductAccordionSections({
                descriptionHtml: product.descriptionHtml,
                productType: product.productType,
                tags: product.tags,
              })}
            />
          </div>

          {/* Product Reviews */}
          <div className="bg-cream rounded-lg border border-gold/25 p-6 lg:p-8 mt-12">
            <ReviewList productId={product.handle} />
          </div>

          {/* Related Products */}
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-ink-brown mb-6">
              You May Also Like
            </h2>
            <Suspense
              fallback={
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <ProductCardSkeleton key={i} />
                  ))}
                </div>
              }
            >
              <RelatedProducts
                productType={product.productType}
                currentProductId={product.id}
                tags={product.tags}
              />
            </Suspense>
          </div>
        </div>
      </div>
    </>
  );
}
