'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import type { ShopifyCartLine } from '@/types/shopify';
import { useCartStore } from '@/lib/cart-store';
import { entryNoFromMetafields, formatEntryNo } from '@/lib/product-entry';

import Price from '@/components/price';

interface CartItemProps {
  line: ShopifyCartLine;
}

export default function CartItem({ line }: CartItemProps) {
  const { updateCartLine, removeFromCart } = useCartStore();
  const [isUpdating, setIsUpdating] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);

  const handleQuantityChange = async (newQuantity: number) => {
    if (newQuantity < 1) return;
    setIsUpdating(true);
    try {
      await updateCartLine(line.id, newQuantity);
    } catch (error) {
      console.error('Failed to update quantity:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleRemove = async () => {
    setIsRemoving(true);
    try {
      await removeFromCart(line.id);
    } catch (error) {
      console.error('Failed to remove item:', error);
      setIsRemoving(false);
    }
  };

  const { merchandise, quantity, cost } = line;
  const imageUrl = merchandise.image?.url || '/placeholder.png';
  const imageAlt = merchandise.image?.altText || merchandise.product.title;

  // Entry № for the plate language. null (zero-metafield seed catalog) →
  // empty string → the eyebrow is not rendered at all. Once SHOP-01 data entry
  // sets `custom.entry_no`, the cart line shows the same № as the PDP/card.
  const entryLabel = formatEntryNo(
    entryNoFromMetafields(merchandise.product.metafields)
  );

  const onSale =
    merchandise.compareAtPrice &&
    parseFloat(merchandise.compareAtPrice.amount) >
      parseFloat(merchandise.price.amount);

  return (
    <div
      className={`flex gap-4 border-b border-gold/20 py-5 last:border-b-0 ${
        isRemoving ? 'pointer-events-none opacity-50' : ''
      }`}
    >
      {/* Plate — the photograph, matching the catalog card frame. */}
      <Link
        href={`/products/${merchandise.product.handle}`}
        className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-md bg-parchment-deep"
      >
        <Image
          src={imageUrl}
          alt={imageAlt}
          fill
          className="object-cover"
          sizes="96px"
        />
      </Link>

      {/* Entry body — text sits on the parchment, no inner box. */}
      <div className="flex min-w-0 flex-1 flex-col justify-between">
        <div className="flex flex-col gap-1">
          {entryLabel && (
            <span
              data-testid="cart-entry-no"
              className="text-[11px] uppercase tracking-[0.2em] text-gold-ink"
            >
              Entry {entryLabel}
            </span>
          )}

          <Link
            href={`/products/${merchandise.product.handle}`}
            className="font-heading text-lg font-semibold leading-tight text-ink-brown transition-colors hover:text-terracotta line-clamp-2"
          >
            {merchandise.product.title}
          </Link>

          {/* Variant options (skip the default single "Title" option). */}
          {merchandise.selectedOptions &&
            merchandise.selectedOptions.some(
              (option) => option.name !== 'Title'
            ) && (
              <div className="text-sm text-earth/70">
                {merchandise.selectedOptions
                  .filter((option) => option.name !== 'Title')
                  .map((option) => option.value)
                  .join(' / ')}
              </div>
            )}

          {/* Unit price + compare-at when on sale. */}
          <div className="mt-0.5 flex items-baseline gap-2">
            <span className="font-heading font-semibold text-ink-brown">
              <Price
                amount={merchandise.price.amount}
                currencyCode={merchandise.price.currencyCode}
              />
            </span>
            {onSale && merchandise.compareAtPrice && (
              <span className="text-sm text-earth/60 line-through">
                <Price
                  amount={merchandise.compareAtPrice.amount}
                  currencyCode={merchandise.compareAtPrice.currencyCode}
                />
              </span>
            )}
          </div>

          {/* Scarcity note — catalog small-caps, on-brand terracotta. */}
          {merchandise.quantityAvailable > 0 &&
            merchandise.quantityAvailable <= 5 && (
              <p className="text-[11px] uppercase tracking-[0.16em] text-terracotta">
                Only {merchandise.quantityAvailable} left
              </p>
            )}
        </div>

        {/* Quantity stepper + remove. */}
        <div className="mt-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleQuantityChange(quantity - 1)}
              disabled={isUpdating || quantity <= 1}
              className="flex min-h-11 min-w-11 items-center justify-center rounded-md border border-gold/40 text-ink-brown transition-colors hover:bg-sage/10 disabled:cursor-not-allowed disabled:opacity-50"
              aria-label="Decrease quantity"
            >
              <svg
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M20 12H4"
                />
              </svg>
            </button>

            <span className="w-8 text-center font-heading font-medium text-forest">
              {quantity}
            </span>

            <button
              onClick={() => handleQuantityChange(quantity + 1)}
              disabled={isUpdating}
              className="flex min-h-11 min-w-11 items-center justify-center rounded-md border border-gold/40 text-ink-brown transition-colors hover:bg-sage/10 disabled:cursor-not-allowed disabled:opacity-50"
              aria-label="Increase quantity"
            >
              <svg
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
            </button>
          </div>

          <button
            onClick={handleRemove}
            disabled={isRemoving}
            className="flex min-h-11 items-center px-2 text-sm text-earth/70 underline-offset-2 transition-colors hover:text-terracotta hover:underline disabled:opacity-50"
          >
            Remove
          </button>
        </div>
      </div>

      {/* Line total. */}
      <div className="flex-shrink-0 text-right">
        <div className="font-heading font-semibold text-ink-brown">
          <Price
            amount={cost.totalAmount.amount}
            currencyCode={cost.totalAmount.currencyCode}
          />
        </div>
      </div>
    </div>
  );
}
