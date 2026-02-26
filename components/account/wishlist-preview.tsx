'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useWishlistStore } from '@/lib/wishlist-store';
import { useCartStore } from '@/lib/cart-store';
import Price from '@/components/price';

export default function WishlistPreview() {
  const [isMounted, setIsMounted] = useState(false);
  const items = useWishlistStore((state) => state.items);
  const removeItem = useWishlistStore((state) => state.removeItem);
  const addToCart = useCartStore((state) => state.addToCart);

  useEffect(() => {
    const timer = setTimeout(() => setIsMounted(true), 0);
    return () => clearTimeout(timer);
  }, []);

  if (!isMounted) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="animate-pulse">
            <div className="aspect-square bg-gray-200 rounded-lg mb-2" />
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-1" />
            <div className="h-4 bg-gray-200 rounded w-1/2" />
          </div>
        ))}
      </div>
    );
  }

  const displayItems = items.slice(0, 8);

  if (displayItems.length === 0) {
    return (
      <div className="bg-gray-50 rounded-lg p-6 text-center">
        <svg className="w-10 h-10 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
        <h3 className="font-medium text-gray-900 mb-1">Your wishlist is empty</h3>
        <p className="text-sm text-gray-500 mb-4">Save items you love to buy later.</p>
        <Link
          href="/collections/all"
          className="inline-block px-4 py-2 bg-primary-600 text-white text-sm rounded-lg hover:bg-primary-700 transition-colors"
        >
          Browse Products
        </Link>
      </div>
    );
  }

  const handleAddToCart = async (productId: string, e: React.MouseEvent) => {
    e.preventDefault();
    const product = items.find((item) => item.id === productId);
    if (!product) return;

    const firstVariant = product.variants.edges[0]?.node;
    if (firstVariant) {
      await addToCart(firstVariant.id, 1);
    }
  };

  const handleRemove = (productId: string, e: React.MouseEvent) => {
    e.preventDefault();
    removeItem(productId);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <p className="text-sm text-gray-500">{items.length} items saved</p>
        {items.length > 8 && (
          <Link
            href="/wishlist"
            className="text-sm text-primary-600 hover:text-primary-700 font-medium"
          >
            View all →
          </Link>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {displayItems.map((product) => {
          const image = product.images.edges[0]?.node;
          const price = product.priceRange.minVariantPrice;

          return (
            <div key={product.id} className="group relative">
              <Link href={`/products/${product.handle}`}>
                <div className="aspect-square relative rounded-lg overflow-hidden bg-gray-100 mb-2">
                  {image ? (
                    <Image
                      src={image.url}
                      alt={image.altText || product.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform"
                      sizes="(max-width: 640px) 50vw, 25vw"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <svg className="w-10 h-10 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  )}

                  {/* Action buttons overlay */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-end justify-center pb-2 opacity-0 group-hover:opacity-100">
                    <div className="flex gap-1">
                      <button
                        onClick={(e) => handleAddToCart(product.id, e)}
                        className="px-3 py-1.5 bg-white text-gray-900 text-xs font-medium rounded-lg shadow hover:bg-gray-50 transition-colors"
                      >
                        Add to Cart
                      </button>
                      <button
                        onClick={(e) => handleRemove(product.id, e)}
                        className="p-1.5 bg-white text-red-500 rounded-lg shadow hover:bg-red-50 transition-colors"
                        aria-label="Remove from wishlist"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>

                <h4 className="text-sm font-medium text-gray-900 truncate group-hover:text-primary-600">
                  {product.title}
                </h4>
                <p className="text-sm text-gray-600">
                  <Price amount={price.amount} currencyCode={price.currencyCode} />
                </p>
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
}
