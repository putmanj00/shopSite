'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import type { ShopifyCartLine } from '@/types/shopify';
import { useCartStore } from '@/lib/cart-store';

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

  return (
    <div
      className={`flex gap-4 py-4 ${isRemoving ? 'opacity-50 pointer-events-none' : ''}`}
    >
      {/* Product Image */}
      <Link
        href={`/products/${merchandise.product.handle}`}
        className="relative w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100"
      >
        <Image
          src={imageUrl}
          alt={imageAlt}
          fill
          className="object-cover"
          sizes="96px"
        />
      </Link>

      {/* Product Details */}
      <div className="flex-1 flex flex-col justify-between min-w-0">
        <div>
          <Link
            href={`/products/${merchandise.product.handle}`}
            className="font-semibold text-ink-brown hover:text-terracotta transition-colors line-clamp-2"
          >
            {merchandise.product.title}
          </Link>

          {/* Variant Options */}
          {merchandise.selectedOptions &&
            merchandise.selectedOptions.length > 0 &&
            merchandise.selectedOptions.some(
              (option) => option.name !== 'Title'
            ) && (
              <div className="mt-1 text-sm text-gray-500">
                {merchandise.selectedOptions
                  .filter((option) => option.name !== 'Title')
                  .map((option) => option.value)
                  .join(' / ')}
              </div>
            )}

          {/* Price */}
          <div className="mt-1">
            {merchandise.compareAtPrice &&
              parseFloat(merchandise.compareAtPrice.amount) >
              parseFloat(merchandise.price.amount) ? (
              <div className="flex items-center gap-2">
                <span className="font-semibold text-gray-900">
                  <Price amount={merchandise.price.amount} currencyCode={merchandise.price.currencyCode} />
                </span>
                <span className="text-sm text-gray-500 line-through">
                  <Price amount={merchandise.compareAtPrice.amount} currencyCode={merchandise.compareAtPrice.currencyCode} />
                </span>
              </div>
            ) : (
              <span className="font-semibold text-gray-900">
                <Price amount={merchandise.price.amount} currencyCode={merchandise.price.currencyCode} />
              </span>
            )}
          </div>

          {/* Low Stock Warning */}
          {merchandise.quantityAvailable > 0 &&
            merchandise.quantityAvailable <= 5 && (
              <div className="mt-1 flex items-center gap-1 text-orange-600">
                <svg
                  className="w-4 h-4 flex-shrink-0"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="text-xs font-medium">
                  Only {merchandise.quantityAvailable} left
                </span>
              </div>
            )}
        </div>

        {/* Quantity Controls & Remove Button */}
        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleQuantityChange(quantity - 1)}
              disabled={isUpdating || quantity <= 1}
              className="min-w-11 min-h-11 flex items-center justify-center rounded-md border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              aria-label="Decrease quantity"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M20 12H4"
                />
              </svg>
            </button>

            <span className="w-8 text-center font-medium text-gray-900">
              {quantity}
            </span>

            <button
              onClick={() => handleQuantityChange(quantity + 1)}
              disabled={isUpdating}
              className="min-w-11 min-h-11 flex items-center justify-center rounded-md border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              aria-label="Increase quantity"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
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
            className="min-h-11 px-2 flex items-center text-sm text-red-600 hover:text-red-700 font-medium transition-colors disabled:opacity-50"
          >
            Remove
          </button>
        </div>
      </div>

      {/* Line Total */}
      <div className="flex-shrink-0 text-right">
        <div className="font-semibold text-gray-900">
          <Price amount={cost.totalAmount.amount} currencyCode={cost.totalAmount.currencyCode} />
        </div>
      </div>
    </div>
  );
}
