'use client';

import { useState, useEffect } from 'react';
import { useWishlistStore } from '@/lib/wishlist-store';
import type { ShopifyProduct } from '@/types/shopify';

interface WishlistButtonProps {
    product: ShopifyProduct;
    className?: string;
}

export default function WishlistButton({ product, className = '' }: WishlistButtonProps) {
    const { addItem, removeItem, isInWishlist } = useWishlistStore();
    const [isMounted, setIsMounted] = useState(false);

    // Handle client-side hydration for Zustand store
    useEffect(() => {
        const timer = setTimeout(() => setIsMounted(true), 0);
        return () => clearTimeout(timer);
    }, []);

    if (!isMounted) {
        return (
            <button className={`p-2 rounded-full bg-white/80 hover:bg-white text-gray-400 transition-colors ${className}`} aria-label="Add to wishlist">
                <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                    />
                </svg>
            </button>
        );
    }

    const inWishlist = isInWishlist(product.id);

    const toggleWishlist = (e: React.MouseEvent) => {
        e.preventDefault(); // Prevent linking if inside a Link component
        e.stopPropagation();

        if (inWishlist) {
            removeItem(product.id);
        } else {
            addItem(product);
        }
    };

    return (
        <button
            onClick={toggleWishlist}
            className={`p-2 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 z-10 ${inWishlist
                    ? 'bg-red-50 text-red-500 hover:bg-red-100'
                    : 'bg-white/80 hover:bg-white text-gray-400 hover:text-red-500'
                } ${className}`}
            aria-label={inWishlist ? "Remove from wishlist" : "Add to wishlist"}
            title={inWishlist ? "Remove from wishlist" : "Add to wishlist"}
        >
            <svg
                className="w-5 h-5"
                fill={inWishlist ? "currentColor" : "none"}
                stroke="currentColor"
                viewBox="0 0 24 24"
            >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
            </svg>
        </button>
    );
}
