'use client';

import { useState } from 'react';
import type { ShopifyProduct, ShopifyProductVariant } from '@/types/shopify';

interface AddToCartButtonProps {
  variant: ShopifyProductVariant;
  product: ShopifyProduct;
}

export default function AddToCartButton({
  variant,
  product,
}: AddToCartButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleAddToCart = async () => {
    // Placeholder for cart functionality (Story #6)
    setIsLoading(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 500));

    setIsLoading(false);
    setShowSuccess(true);

    // Reset success message after 3 seconds
    setTimeout(() => setShowSuccess(false), 3000);

    console.log('Added to cart:', {
      product: product.title,
      variant: variant.title,
      variantId: variant.id,
    });
  };

  return (
    <div className="space-y-3">
      <button
        onClick={handleAddToCart}
        disabled={!variant.availableForSale || isLoading}
        className={`
          w-full py-4 px-6 rounded-lg font-semibold text-lg transition-all
          ${
            !variant.availableForSale
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : isLoading
                ? 'bg-blue-400 text-white cursor-wait'
                : 'bg-blue-600 text-white hover:bg-blue-700 active:scale-95'
          }
        `}
      >
        {isLoading ? (
          <span className="flex items-center justify-center gap-2">
            <svg
              className="animate-spin h-5 w-5"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            Adding...
          </span>
        ) : !variant.availableForSale ? (
          'Out of Stock'
        ) : (
          'Add to Cart'
        )}
      </button>

      {showSuccess && (
        <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg flex items-center gap-2">
          <svg
            className="w-5 h-5"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
          <span className="font-medium">Added to cart!</span>
        </div>
      )}

      <p className="text-xs text-gray-500 text-center">
        Note: Cart functionality will be implemented in Story #6
      </p>
    </div>
  );
}
