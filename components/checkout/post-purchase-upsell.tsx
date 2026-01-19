import Link from 'next/link';
import Image from 'next/image';
import { getProducts } from '@/lib/shopify-helpers';
import type { ShopifyProduct } from '@/types/shopify';
import Price from '@/components/price';

/**
 * Post-purchase upsell recommendations
 * Shows on the thank-you page to encourage additional purchases
 */
export default async function PostPurchaseUpsell() {
  let products: ShopifyProduct[] = [];

  try {
    const response = await getProducts({ first: 4 });
    products = response.products.edges.map((edge) => edge.node);
  } catch (error) {
    console.error('Failed to fetch upsell products:', error);
    return null;
  }

  if (products.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6">
      <h2 className="text-lg font-semibold text-neutral-900 mb-2">
        Complete your collection
      </h2>
      <p className="text-sm text-neutral-600 mb-6">
        Customers who bought similar items also loved these
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {products.slice(0, 4).map((product) => {
          const firstImage = product.images.edges[0]?.node;
          const price = product.priceRange.minVariantPrice;

          return (
            <Link
              key={product.id}
              href={`/products/${product.handle}`}
              className="group"
            >
              <div className="relative aspect-square rounded-lg overflow-hidden bg-neutral-100 mb-2">
                {firstImage && (
                  <Image
                    src={firstImage.url}
                    alt={firstImage.altText || product.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                    sizes="(max-width: 640px) 50vw, 25vw"
                  />
                )}
              </div>
              <h3 className="text-sm font-medium text-neutral-900 line-clamp-1 group-hover:text-primary-600 transition-colors">
                {product.title}
              </h3>
              <p className="text-sm text-neutral-600">
                <Price amount={price.amount} currencyCode={price.currencyCode} />
              </p>
            </Link>
          );
        })}
      </div>

      <div className="mt-6 text-center">
        <Link
          href="/collections/all"
          className="text-sm text-primary-600 hover:text-primary-700 font-medium"
        >
          View all products →
        </Link>
      </div>
    </div>
  );
}
