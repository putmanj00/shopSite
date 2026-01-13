import Image from 'next/image';
import Link from 'next/link';
import type { ShopifyProduct } from '@/types/shopify';
import { formatMoney, isProductOnSale } from '@/lib/shopify-helpers';

interface ProductCardProps {
  product: ShopifyProduct;
}

export default function ProductCard({ product }: ProductCardProps) {
  const firstImage = product.images.edges[0]?.node;
  const minPrice = product.priceRange.minVariantPrice;
  const compareAtPrice = product.compareAtPriceRange.minVariantPrice;
  const onSale = isProductOnSale(product);

  return (
    <Link
      href={`/products/${product.handle}`}
      className="group relative overflow-hidden rounded-lg bg-white shadow-sm transition-all hover:shadow-xl"
    >
      <div className="relative aspect-square overflow-hidden bg-zinc-100">
        {firstImage ? (
          <Image
            src={firstImage.url}
            alt={firstImage.altText || product.title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-110"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-zinc-400">
            No image
          </div>
        )}
        {onSale && (
          <div className="absolute right-2 top-2 rounded-full bg-red-500 px-3 py-1 text-xs font-semibold text-white">
            Sale
          </div>
        )}
        {!product.availableForSale && (
          <div className="absolute left-2 top-2 rounded-full bg-zinc-800 px-3 py-1 text-xs font-semibold text-white">
            Sold Out
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="mb-2 text-lg font-semibold text-zinc-900 line-clamp-2 group-hover:text-blue-600">
          {product.title}
        </h3>
        <div className="flex items-baseline gap-2">
          <span className="text-xl font-bold text-zinc-900">
            {formatMoney(minPrice)}
          </span>
          {onSale && parseFloat(compareAtPrice.amount) > 0 && (
            <span className="text-sm text-zinc-500 line-through">
              {formatMoney(compareAtPrice)}
            </span>
          )}
        </div>
        {product.vendor && (
          <p className="mt-1 text-sm text-zinc-500">{product.vendor}</p>
        )}
      </div>
    </Link>
  );
}
