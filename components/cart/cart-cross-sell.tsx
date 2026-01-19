'use client';

import { useEffect, useState, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import type { ShopifyProduct } from '@/types/shopify';

import Price from '@/components/price';
import { useCartStore } from '@/lib/cart-store';

interface CartCrossSellProps {
  cartProductTypes: string[];
  cartProductIds: string[];
}

/**
 * Cross-sell recommendations shown in the cart drawer
 * Fetches related products based on items in cart
 */
export default function CartCrossSell({
  cartProductTypes,
  cartProductIds,
}: CartCrossSellProps) {
  const [products, setProducts] = useState<ShopifyProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { addToCart } = useCartStore();
  const [addingId, setAddingId] = useState<string | null>(null);
  const fetchedRef = useRef(false);

  useEffect(() => {
    if (fetchedRef.current) return;

    const fetchRecommendations = async () => {
      if (cartProductTypes.length === 0) {
        setIsLoading(false);
        return;
      }

      try {
        // Fetch products of similar types
        const productType = cartProductTypes[0];
        const response = await fetch(
          `/api/products?productType=${encodeURIComponent(productType)}&limit=4`
        );

        if (response.ok) {
          const data = await response.json();
          // Filter out products already in cart
          const filtered = (data.products || []).filter(
            (p: ShopifyProduct) => !cartProductIds.includes(p.id)
          );
          setProducts(filtered.slice(0, 3));
        }
      } catch (error) {
        console.error('Failed to fetch cross-sell products:', error);
      } finally {
        setIsLoading(false);
        fetchedRef.current = true;
      }
    };

    // Use setTimeout to avoid setState in effect warning
    const timeoutId = setTimeout(() => {
      fetchRecommendations();
    }, 0);

    return () => clearTimeout(timeoutId);
  }, [cartProductTypes, cartProductIds]);

  const handleQuickAdd = async (product: ShopifyProduct) => {
    const firstVariant = product.variants.edges[0]?.node;
    if (!firstVariant || !firstVariant.availableForSale) return;

    setAddingId(product.id);
    try {
      await addToCart(firstVariant.id, 1);
    } catch (error) {
      console.error('Failed to add to cart:', error);
    } finally {
      setAddingId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="py-4 border-t border-neutral-200">
        <p className="text-sm font-medium text-neutral-700 mb-3">
          You might also like
        </p>
        <div className="flex gap-3 overflow-x-auto pb-2">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="flex-shrink-0 w-24 animate-pulse"
            >
              <div className="w-24 h-24 bg-neutral-200 rounded-lg mb-2" />
              <div className="h-3 bg-neutral-200 rounded w-20 mb-1" />
              <div className="h-3 bg-neutral-200 rounded w-12" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (products.length === 0) {
    return null;
  }

  return (
    <div className="py-4 border-t border-neutral-200">
      <p className="text-sm font-medium text-neutral-700 mb-3">
        You might also like
      </p>
      <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1">
        {products.map((product) => {
          const firstImage = product.images.edges[0]?.node;
          const firstVariant = product.variants.edges[0]?.node;
          const isAdding = addingId === product.id;

          return (
            <div
              key={product.id}
              className="flex-shrink-0 w-24 group"
            >
              <Link
                href={`/products/${product.handle}`}
                className="block relative w-24 h-24 rounded-lg overflow-hidden bg-neutral-100 mb-2"
              >
                {firstImage && (
                  <Image
                    src={firstImage.url}
                    alt={firstImage.altText || product.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform"
                    sizes="96px"
                  />
                )}
              </Link>
              <Link
                href={`/products/${product.handle}`}
                className="text-xs font-medium text-neutral-900 line-clamp-2 hover:text-primary-600 transition-colors"
              >
                {product.title}
              </Link>
              <p className="text-xs text-neutral-600 mt-0.5">
                <Price amount={product.priceRange.minVariantPrice.amount} currencyCode={product.priceRange.minVariantPrice.currencyCode} />
              </p>
              {firstVariant?.availableForSale && (
                <button
                  onClick={() => handleQuickAdd(product)}
                  disabled={isAdding}
                  className="mt-1 text-xs text-primary-600 hover:text-primary-700 font-medium disabled:opacity-50"
                  aria-label={`Quick add ${product.title} to cart`}
                >
                  {isAdding ? 'Adding...' : '+ Add'}
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
