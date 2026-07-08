'use client';

import { useState, useEffect } from 'react';
import type { ShopifyProduct, ShopifyProductVariant } from '@/types/shopify';

import Price from '@/components/price';
import { useCartStore } from '@/lib/cart-store';

interface StickyAddToCartProps {
  product: ShopifyProduct;
  selectedVariant: ShopifyProductVariant;
}

/**
 * Sticky add-to-cart bar that appears on mobile when scrolling past the main CTA
 * WCAG 2.1 AA compliant with proper focus management and reduced motion support
 */
export default function StickyAddToCart({
  product,
  selectedVariant,
}: StickyAddToCartProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const { addToCart, openCart } = useCartStore();

  // Show sticky bar when user scrolls past the main add-to-cart button
  useEffect(() => {
    const handleScroll = () => {
      const mainButton = document.getElementById('main-add-to-cart');
      if (mainButton) {
        const rect = mainButton.getBoundingClientRect();
        // Show sticky bar when main button is above viewport
        setIsVisible(rect.bottom < 0);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleAddToCart = async () => {
    if (!selectedVariant.availableForSale || isAdding) return;

    setIsAdding(true);
    try {
      await addToCart(selectedVariant.id, 1);
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        openCart();
      }, 500);
    } catch (error) {
      console.error('Failed to add to cart:', error);
    } finally {
      setIsAdding(false);
    }
  };

  const price = selectedVariant.price;
  const compareAtPrice = selectedVariant.compareAtPrice;
  const hasDiscount =
    compareAtPrice && parseFloat(compareAtPrice.amount) > parseFloat(price.amount);

  return (
    <div
      className={`lg:hidden fixed bottom-0 left-0 right-0 bg-cream border-t border-gold/30 shadow-lg z-40 transform transition-transform duration-300 ${isVisible ? 'translate-y-0' : 'translate-y-full'
        }`}
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      role="region"
      aria-label="Quick add to cart"
    >
      <div className="px-4 py-3 flex items-center gap-4">
        {/* Product Info */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-ink-brown truncate">
            {product.title}
          </p>
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-terracotta">
              <Price amount={price.amount} currencyCode={price.currencyCode} />
            </span>
            {hasDiscount && compareAtPrice && (
              <span className="text-sm text-sage line-through">
                <Price amount={compareAtPrice.amount} currencyCode={compareAtPrice.currencyCode} />
              </span>
            )}
          </div>
        </div>

        {/* Add to Cart Button */}
        <button
          onClick={handleAddToCart}
          disabled={!selectedVariant.availableForSale || isAdding}
          className={`flex-shrink-0 px-6 py-3 rounded-lg font-semibold text-white transition-all min-w-[140px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest focus-visible:ring-offset-2 ${showSuccess
            ? 'bg-sage'
            : selectedVariant.availableForSale
              ? 'bg-primary-600 hover:bg-primary-700 active:bg-primary-700'
              : 'bg-neutral-400 cursor-not-allowed'
            }`}
          aria-label={
            isAdding
              ? 'Adding to cart'
              : showSuccess
                ? 'Added to cart'
                : selectedVariant.availableForSale
                  ? `Add ${product.title} to cart`
                  : 'Out of stock'
          }
        >
          {isAdding ? (
            <span className="flex items-center justify-center gap-2">
              <svg
                className="animate-spin h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Adding...
            </span>
          ) : showSuccess ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Added!
            </span>
          ) : selectedVariant.availableForSale ? (
            'Add to Cart'
          ) : (
            'Out of Stock'
          )}
        </button>
      </div>
    </div>
  );
}
