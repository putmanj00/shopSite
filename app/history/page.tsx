'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRecentlyViewedStore } from '@/lib/recently-viewed-store';
import CollectionBreadcrumbs from '@/components/collection-breadcrumbs';

export default function HistoryPage() {
    const [isMounted, setIsMounted] = useState(false);
    const products = useRecentlyViewedStore((state) => state.products);
    const clearHistory = useRecentlyViewedStore((state) => state.clearHistory);

    useEffect(() => {
        const timer = setTimeout(() => setIsMounted(true), 0);
        return () => clearTimeout(timer);
    }, []);

    if (!isMounted) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="h-8 w-48 bg-gray-200 rounded animate-pulse mb-8" />
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                        <div key={i} className="aspect-[4/5] bg-gray-200 rounded-lg animate-pulse" />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white">
            <div className="container mx-auto px-4 py-8">
                <div className="mb-6">
                    <Link href="/" className="text-sm text-gray-500 hover:text-gray-900">
                        Home
                    </Link>
                    <span className="mx-2 text-gray-300">/</span>
                    <span className="text-sm text-gray-900">Recently Viewed</span>
                </div>

                <div className="flex items-center justify-between mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Recently Viewed</h1>
                    {products.length > 0 && (
                        <button
                            onClick={clearHistory}
                            className="text-sm text-red-600 hover:text-red-700 font-medium"
                        >
                            Clear History
                        </button>
                    )}
                </div>

                {products.length === 0 ? (
                    <div className="text-center py-16 bg-gray-50 rounded-2xl">
                        <svg
                            className="mx-auto h-16 w-16 text-gray-300 mb-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={1}
                                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                        </svg>
                        <h2 className="text-xl font-medium text-gray-900 mb-2">
                            No recently viewed items
                        </h2>
                        <p className="text-gray-500 mb-6">
                            Items you view while shopping will appear here.
                        </p>
                        <Link
                            href="/collections/all"
                            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 transition-colors"
                        >
                            Start Shopping
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {products.map((product) => (
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
                                            <svg
                                                className="w-12 h-12"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={1}
                                                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                                                />
                                            </svg>
                                        </div>
                                    )}

                                    {/* Recently Viewed Badge/Time could go here */}
                                </div>

                                <div className="flex-1">
                                    <h3 className="text-lg font-medium text-gray-900 group-hover:text-primary-600 transition-colors">
                                        {product.title}
                                    </h3>
                                    <p className="mt-1 text-gray-500">
                                        {new Intl.NumberFormat('en-US', {
                                            style: 'currency',
                                            currency: product.currencyCode,
                                        }).format(parseFloat(product.price))}
                                    </p>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
