'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useQuickViewStore } from '@/lib/quick-view-store';
import { isProductOnSale } from '@/lib/shopify-helpers';
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

  // State starts fresh for each product due to key prop on parent
  const [selectedVariant, setSelectedVariant] = useState<ShopifyProductVariant>(
    variants[0]
  );
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  // Handle escape key
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    },
    [onClose]
  );

  // Focus trap
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

    // Focus the close button
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
        className="absolute inset-0 bg-black/60 transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Content */}
      <div
        ref={modalRef}
        className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden max-h-[90vh]"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 z-10 p-2 rounded-full bg-white/80 hover:bg-white shadow-md transition-colors"
          aria-label="Close quick view"
        >
          <svg
            className="w-5 h-5 text-gray-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        <div className="grid md:grid-cols-2 max-h-[90vh] overflow-y-auto">
          {/* Image Section */}
          <div className="p-6 bg-zinc-50">
            {/* Main Image */}
            <div className="relative aspect-square bg-white rounded-lg overflow-hidden mb-4">
              {images[selectedImageIndex] ? (
                <Image
                  src={images[selectedImageIndex].url}
                  alt={images[selectedImageIndex].altText || product.title}
                  fill
                  className="object-contain"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              ) : (
                <div className="flex items-center justify-center h-full text-zinc-400">
                  No image available
                </div>
              )}
              {onSale && (
                <span className="absolute top-3 left-3 bg-red-500 text-white text-xs font-semibold px-3 py-1 rounded-full">
                  Sale
                </span>
              )}
            </div>

            {/* Thumbnail Grid */}
            {images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {images.slice(0, 4).map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`relative aspect-square rounded-md overflow-hidden transition-all ${index === selectedImageIndex
                      ? 'ring-2 ring-blue-500'
                      : 'ring-1 ring-gray-200 hover:ring-gray-300'
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

          {/* Product Info Section */}
          <div className="p-6 flex flex-col">
            {/* Vendor */}
            {product.vendor && (
              <p className="text-sm text-zinc-500 mb-1">{product.vendor}</p>
            )}

            {/* Title */}
            <h2
              id="quick-view-title"
              className="text-2xl font-bold text-zinc-900 mb-4"
            >
              {product.title}
            </h2>

            {/* Price */}
            <div className="flex items-baseline gap-3 mb-6">
              <span className="text-2xl font-bold text-zinc-900">
                {selectedVariant && <Price amount={selectedVariant.price.amount} currencyCode={selectedVariant.price.currencyCode} />}
              </span>
              {onSale && compareAtPrice && parseFloat(compareAtPrice.amount) > 0 && (
                <span className="text-lg text-zinc-400 line-through">
                  <Price amount={compareAtPrice.amount} currencyCode={compareAtPrice.currencyCode} />
                </span>
              )}
            </div>

            {/* Description - Truncated */}
            <p className="text-zinc-600 mb-6 line-clamp-3">
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
            <div className="mt-auto space-y-4">
              {/* Add to Cart */}
              {selectedVariant && <AddToCartButton variant={selectedVariant} />}

              {/* Wishlist and View Details */}
              <div className="flex gap-3">
                <WishlistButton
                  product={product}
                  className="flex-1 justify-center border border-zinc-300 hover:border-zinc-400 bg-white"
                />
                <Link
                  href={`/products/${product.handle}`}
                  onClick={onClose}
                  className="flex-1 py-3 px-4 text-center text-blue-600 font-semibold border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
                >
                  View Full Details
                </Link>
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

  // Key ensures the inner component resets state when product changes
  return (
    <QuickViewContent
      key={product.id}
      product={product}
      onClose={closeQuickView}
    />
  );
}
