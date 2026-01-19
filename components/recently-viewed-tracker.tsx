'use client';

import { useEffect } from 'react';
import { useRecentlyViewedStore } from '@/lib/recently-viewed-store';

interface RecentlyViewedTrackerProps {
  product: {
    id: string;
    handle: string;
    title: string;
    images: {
      edges: {
        node: {
          url: string;
          altText: string | null;
        };
      }[];
    };
    priceRange: {
      minVariantPrice: {
        amount: string;
        currencyCode: string;
      };
    };
  };
}

export default function RecentlyViewedTracker({ product }: RecentlyViewedTrackerProps) {
  const addProduct = useRecentlyViewedStore((state) => state.addProduct);

  useEffect(() => {
    const image = product.images.edges[0]?.node;
    const price = product.priceRange.minVariantPrice;

    addProduct({
      id: product.id,
      handle: product.handle,
      title: product.title,
      imageUrl: image?.url || null,
      imageAlt: image?.altText || null,
      price: price.amount,
      currencyCode: price.currencyCode,
    });
  }, [product, addProduct]);

  return null;
}
