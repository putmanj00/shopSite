'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRecentlyViewedStore } from '@/lib/recently-viewed-store';

export default function RecentlyViewed() {
  const [isMounted, setIsMounted] = useState(false);
  const products = useRecentlyViewedStore((state) => state.products);
  const clearHistory = useRecentlyViewedStore((state) => state.clearHistory);

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

  const recentProducts = products.slice(0, 8);

  if (recentProducts.length === 0) {
    return (
      <div className="bg-gray-50 rounded-lg p-6 text-center">
        <svg className="w-10 h-10 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h3 className="font-medium text-gray-900 mb-1">No recently viewed items</h3>
        <p className="text-sm text-gray-500">Items you view will appear here.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <p className="text-sm text-gray-500">{recentProducts.length} items</p>
        <button
          onClick={clearHistory}
          className="text-sm text-gray-500 hover:text-gray-700"
        >
          Clear history
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {recentProducts.map((product) => (
          <Link
            key={product.id}
            href={`/products/${product.handle}`}
            className="group"
          >
            <div className="aspect-square relative rounded-lg overflow-hidden bg-gray-100 mb-2">
              {product.imageUrl ? (
                <Image
                  src={product.imageUrl}
                  alt={product.imageAlt || product.title}
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
            </div>
            <h4 className="text-sm font-medium text-gray-900 truncate group-hover:text-primary-600">
              {product.title}
            </h4>
            <p className="text-sm text-gray-600">
              {new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: product.currencyCode,
              }).format(parseFloat(product.price))}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
