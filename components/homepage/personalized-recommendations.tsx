'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRecentlyViewedStore } from '@/lib/recently-viewed-store';
import Price from '@/components/price';

export default function PersonalizedRecommendations() {
    const [isMounted, setIsMounted] = useState(false);
    const products = useRecentlyViewedStore((state) => state.products);

    useEffect(() => {
        const timer = setTimeout(() => setIsMounted(true), 0);
        return () => clearTimeout(timer);
    }, []);

    if (!isMounted || products.length === 0) {
        return null;
    }

    // Only show first 4 items for homepage
    const recentProducts = products.slice(0, 4);

    return (
        <section className="container mx-auto px-4 py-8 sm:py-12 bg-white rounded-2xl my-8">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl font-display">
                        Pick Up Where You Left Off
                    </h2>
                    <p className="mt-2 text-gray-600">
                        Recently viewed items just for you
                    </p>
                </div>
                <Link
                    href="/history"
                    className="text-primary-600 font-medium hover:text-primary-700 hover:underline"
                >
                    View all
                </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {recentProducts.map((product) => (
                    <Link
                        key={product.id}
                        href={`/products/${product.handle}`}
                        className="group flex flex-col"
                    >
                        <div className="relative aspect-[4/5] bg-gray-100 rounded-xl overflow-hidden mb-4">
                            {product.imageUrl ? (
                                <Image
                                    src={product.imageUrl}
                                    alt={product.imageAlt || product.title}
                                    fill
                                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-400">
                                    <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                </div>
                            )}
                        </div>

                        <h3 className="font-medium text-gray-900 group-hover:text-primary-600 transition-colors">
                            {product.title}
                        </h3>

                        <p className="text-gray-500 mt-1">
                            <Price amount={product.price} currencyCode={product.currencyCode} />
                        </p>
                    </Link>
                ))}
            </div>
        </section>
    );
}
