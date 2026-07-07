'use client';

import Image from 'next/image';
import Link from 'next/link';
import type { ShopifyProduct } from '@/types/shopify';
import { isProductOnSale } from '@/lib/shopify-helpers';
import { normalizeVendor } from '@/lib/product-filters';
import { parseEntry, formatEntryNo, isOneOfOne, soldStateLabel } from '@/lib/product-entry';
import Price from '@/components/price';
import { useQuickViewStore } from '@/lib/quick-view-store';
import WishlistButton from './wishlist-button';

interface ProductCardProps {
  product: ShopifyProduct;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { openQuickView } = useQuickViewStore();
  const firstImage = product.images.edges[0]?.node;
  const minPrice = product.priceRange.minVariantPrice;
  const compareAtPrice = product.compareAtPriceRange.minVariantPrice;
  const onSale = isProductOnSale(product);

  // Entry model — nullable; renders sanely when a product has no metafields.
  const entry = parseEntry(product);
  const entryLabel = formatEntryNo(entry.entryNo);
  const oneOfOne = isOneOfOne(entry);
  const soldOut = !product.availableForSale;

  const handleQuickView = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    openQuickView(product);
  };

  return (
    <Link
      href={`/products/${product.handle}`}
      className="group relative flex h-full flex-col text-left"
    >
      {/* Plate — the photograph sits directly on the page, no card box (concept 05). */}
      <div className="relative aspect-[4/5] overflow-hidden rounded-md bg-parchment-deep">
        {firstImage && (
          <Image
            src={firstImage.url}
            alt={firstImage.altText || product.title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        )}

        {/* One-of-one is the piece's defining fact — surface it on the plate. */}
        {oneOfOne && !soldOut && (
          <span className="absolute left-3 top-3 rounded-full bg-forest/90 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.14em] text-woods-ink">
            One of one
          </span>
        )}
        {onSale && !soldOut && (
          <span className="absolute right-3 top-3 rounded-full bg-dusty-rose px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-white">
            Sale
          </span>
        )}

        <div className="absolute right-2 top-2 z-20">
          <WishlistButton product={product} />
        </div>

        {/* Quick View — appears on hover */}
        <button
          onClick={handleQuickView}
          className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-lg bg-white/95 px-4 py-2 text-sm font-semibold text-ink-brown opacity-0 shadow-lg transition-all duration-300 translate-y-2 group-hover:translate-y-0 group-hover:opacity-100 hover:bg-white focus:outline-none focus:ring-2 focus:ring-terracotta focus:ring-offset-2"
          aria-label={`Quick view ${product.title}`}
        >
          Quick View
        </button>
      </div>

      {/* Entry body — no white box; text sits on the page. */}
      <div className="flex flex-grow flex-col gap-1.5 px-1 pt-3">
        {entryLabel && (
          <span className="text-[11px] uppercase tracking-[0.2em] text-gold-ink">
            Entry {entryLabel}
          </span>
        )}
        <h3 className="font-heading text-xl font-semibold leading-tight text-ink-brown group-hover:text-terracotta">
          {product.title}
        </h3>
        {entry.technique && (
          <p className="text-sm italic text-earth/80">{entry.technique}</p>
        )}

        <div className="mt-1 flex items-baseline gap-2">
          {soldOut ? (
            <span className="text-sm font-medium uppercase tracking-[0.1em] text-rose-ink">
              {soldStateLabel(entry)}
            </span>
          ) : (
            <>
              <span className="font-heading text-xl font-semibold text-ink-brown">
                <Price amount={minPrice.amount} currencyCode={minPrice.currencyCode} />
              </span>
              {onSale && parseFloat(compareAtPrice.amount) > 0 && (
                <span className="text-sm text-earth/60 line-through">
                  <Price
                    amount={compareAtPrice.amount}
                    currencyCode={compareAtPrice.currencyCode}
                  />
                </span>
              )}
            </>
          )}
        </div>

        {/* Maker line — only when no technique already carries the craft story. */}
        {!entry.technique && product.vendor && (
          <p className="mt-1 text-[11px] uppercase tracking-[0.18em] text-earth/60">
            {normalizeVendor(product.vendor)}
          </p>
        )}
      </div>
    </Link>
  );
}
