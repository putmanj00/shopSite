'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { useQuickViewStore } from '@/lib/quick-view-store';
import { isProductOnSale } from '@/lib/shopify-helpers';
import { normalizeVendor } from '@/lib/product-filters';
import Price from '@/components/price';
import type { ShopifyProduct, ShopifyProductVariant } from '@/types/shopify';
import VariantSelector from './variant-selector';
import AddToCartButton from './add-to-cart-button';
import WishlistButton from './wishlist-button';

// Inner component that handles state - resets when product changes via key
function QuickViewContent({
  product,
  onClose,
}: {
  product: ShopifyProduct;
  onClose: () => void;
}) {
  const modalRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<Element | null>(null);

  const variants = useMemo(
    () => product.variants.edges.map((edge) => edge.node),
    [product]
  );
  const images = useMemo(
    () => product.images.edges.map((edge) => edge.node),
    [product]
  );

  const [selectedVariant, setSelectedVariant] = useState<ShopifyProductVariant>(
    variants[0]
  );
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    },
    [onClose]
  );

  const handleTabKey = useCallback((event: KeyboardEvent) => {
    if (event.key !== 'Tab' || !modalRef.current) return;
    const focusableElements = modalRef.current.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;
    if (event.shiftKey) {
      if (document.activeElement === firstElement) {
        lastElement?.focus();
        event.preventDefault();
      }
    } else {
      if (document.activeElement === lastElement) {
        firstElement?.focus();
        event.preventDefault();
      }
    }
  }, []);

  useEffect(() => {
    previousActiveElement.current = document.activeElement;
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keydown', handleTabKey);
    const timer = setTimeout(() => {
      const closeButton = modalRef.current?.querySelector('button');
      closeButton?.focus();
    }, 0);
    return () => {
      clearTimeout(timer);
      document.body.style.overflow = 'unset';
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keydown', handleTabKey);
      if (previousActiveElement.current instanceof HTMLElement) {
        previousActiveElement.current.focus();
      }
    };
  }, [handleKeyDown, handleTabKey]);

  const onSale = isProductOnSale(product);
  const compareAtPrice = selectedVariant?.compareAtPrice;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="quick-view-title"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-forest/60 transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Content */}
      <div
        ref={modalRef}
        className="relative w-full max-w-4xl bg-parchment rounded-2xl shadow-2xl overflow-hidden max-h-[90vh]"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 z-10 p-2 rounded-full bg-parchment/90 hover:bg-parchment shadow-md transition-colors"
          aria-label="Close quick view"
        >
          <svg className="w-5 h-5 text-forest" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="grid md:grid-cols-2 max-h-[90vh] overflow-y-auto">
          {/* Image Section — forest background */}
          <div className="p-6 bg-forest flex flex-col">
            {/* Main Image */}
            <div className="relative aspect-square bg-white/10 rounded-xl overflow-hidden mb-4 flex-1">
              {images[selectedImageIndex] ? (
                <Image
                  src={images[selectedImageIndex].url}
                  alt={images[selectedImageIndex].altText || product.title}
                  fill
                  className="object-contain"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              ) : (
                <div className="flex items-center justify-center h-full text-parchment/40">
                  No image available
                </div>
              )}
              {onSale && (
                <span className="absolute top-3 left-3 bg-primary-600 text-white text-xs font-semibold px-3 py-1 rounded-full">
                  Sale
                </span>
              )}
            </div>

            {/* Thumbnail Grid */}
            {images.length > 1 && (
              <div className="grid grid-cols-4 gap-2 mt-auto">
                {images.slice(0, 4).map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`relative aspect-square rounded-lg overflow-hidden transition-all ${index === selectedImageIndex
                        ? 'ring-2 ring-gold ring-offset-1 ring-offset-forest'
                        : 'ring-1 ring-white/20 hover:ring-white/50'
                      }`}
                  >
                    <Image
                      src={image.url}
                      alt={image.altText || `${product.title} - Image ${index + 1}`}
                      fill
                      className="object-cover"
                      sizes="80px"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info Section — parchment */}
          <div className="p-6 flex flex-col bg-parchment">
            {/* Vendor */}
            {product.vendor && (
              <p className="text-gold-ink font-medium text-xs uppercase tracking-widest mb-2">
                {normalizeVendor(product.vendor)}
              </p>
            )}

            {/* Title */}
            <h2
              id="quick-view-title"
              className="text-2xl font-bold text-forest font-heading mb-4 leading-snug"
            >
              {product.title}
            </h2>

            {/* Price */}
            <div className="flex items-baseline gap-3 mb-5">
              <span className="text-2xl font-bold text-terracotta font-heading">
                {selectedVariant && (
                  <Price
                    amount={selectedVariant.price.amount}
                    currencyCode={selectedVariant.price.currencyCode}
                  />
                )}
              </span>
              {onSale && compareAtPrice && parseFloat(compareAtPrice.amount) > 0 && (
                <span className="text-lg text-earth/50 line-through">
                  <Price amount={compareAtPrice.amount} currencyCode={compareAtPrice.currencyCode} />
                </span>
              )}
            </div>

            {/* Description */}
            <p className="text-earth leading-relaxed mb-6 line-clamp-3">
              {product.description}
            </p>

            {/* Variant Selector */}
            {variants.length > 1 && selectedVariant && (
              <div className="mb-6">
                <VariantSelector
                  variants={variants}
                  selectedVariant={selectedVariant}
                  onVariantChange={setSelectedVariant}
                />
              </div>
            )}

            {/* Actions */}
            <div className="mt-auto space-y-3">
              {/* Add to Cart */}
              {selectedVariant && <AddToCartButton variant={selectedVariant} />}

              {/* Wishlist and View Details */}
              <div className="flex gap-3 items-center">
                {/* Small circular wishlist icon button — no flex-1 so it stays its natural size */}
                <WishlistButton
                  product={product}
                  className="flex-none"
                />
                <Button
                  href={`/products/${product.handle}`}
                  onClick={onClose}
                  variant="outline"
                  className="flex-1"
                >
                  View Full Details
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Wrapper component that handles open/close state
export default function QuickViewModal() {
  const { isOpen, product, closeQuickView } = useQuickViewStore();

  if (!isOpen || !product) return null;

  return (
    <QuickViewContent
      key={product.id}
      product={product}
      onClose={closeQuickView}
    />
  );
}
