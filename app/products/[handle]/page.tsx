import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { getProductByHandle } from '@/lib/shopify-helpers';
import type { Metadata } from 'next';
import ImageGallery from '@/components/image-gallery';
import ProductInfo from '@/components/product-info';
import Breadcrumbs from '@/components/breadcrumbs';
import RelatedProducts from '@/components/related-products';
import ProductCardSkeleton from '@/components/product-card-skeleton';

interface ProductPageProps {
  params: Promise<{
    handle: string;
  }>;
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
    title: `${product.title} | shopSite`,
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
      '@type': 'Offer',
      url: `https://shopsite.com/products/${product.handle}`,
      priceCurrency: price.currencyCode,
      price: price.amount,
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

      <div className="min-h-screen bg-gray-50">
        {/* Breadcrumbs */}
        <div className="bg-white border-b">
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

          {/* Product Description */}
          {product.descriptionHtml && (
            <div className="mt-12 bg-white rounded-lg shadow-sm p-6 lg:p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Description
              </h2>
              <div
                className="prose max-w-none text-gray-700"
                dangerouslySetInnerHTML={{ __html: product.descriptionHtml }}
              />
            </div>
          )}

          {/* Related Products */}
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
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
