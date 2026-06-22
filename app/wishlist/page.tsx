'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useWishlistStore } from '@/lib/wishlist-store';
import ProductCard from '@/components/product-card';

export default function WishlistPage() {
    const { items } = useWishlistStore();
    const [isMounted, setIsMounted] = useState(false);

    // Handle client-side hydration for Zustand store
    useEffect(() => {
        // Using setTimeout to prevent cascading renders
        const timer = setTimeout(() => setIsMounted(true), 0);
        return () => clearTimeout(timer);
    }, []);

    if (!isMounted) {
        return null;
    }

    if (items.length === 0) {
        return (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
                <img
                    src="/assets/images/empty-states/empty-favorites.png"
                    alt="Empty wishlist"
                    className="mx-auto w-64 h-64 object-contain"
                />
                <h1 className="text-3xl font-bold text-gray-900 mb-4">Your wishlist is empty</h1>
                <p className="text-gray-500 mb-8 max-w-md mx-auto">
                    Browse our collections and tap the heart icon to save products you love.
                </p>
                <Button href="/collections/all" variant="primary" size="lg" className="hover:scale-105">
                    Wander the Shop
                </Button>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">My Wishlist</h1>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {items.map((product) => (
                    <ProductCard key={product.id} product={product} />
                ))}
            </div>
        </div>
    );
}
