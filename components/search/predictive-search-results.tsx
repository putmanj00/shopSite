'use client';

import Link from 'next/link';
import Image from 'next/image';

export interface SearchResult {
    id: string;
    handle: string;
    title: string;
    price: number;
    currencyCode: string;
    image: string | null;
    imageAlt: string | null;
    category: string;
}

interface PredictiveSearchResultsProps {
    results: SearchResult[];
    query: string;
    isLoading: boolean;
    isOpen: boolean;
    onClose: () => void;
    recentSearches: string[];
    onClearRecent: (term: string) => void;
    onClearAllRecent: () => void;
    onSelectTerm: (term: string) => void;
}

export default function PredictiveSearchResults({
    results,
    query,
    isLoading,
    isOpen,
    onClose,
    recentSearches,
    onClearRecent,
    onClearAllRecent,
    onSelectTerm
}: PredictiveSearchResultsProps) {
    if (!isOpen) return null;

    // Render recent searches if no query
    if (!query) {
        if (recentSearches.length === 0) return null;

        return (
            <div className="absolute top-full left-0 right-0 z-50 mt-2 bg-white rounded-lg shadow-xl border border-gray-100 overflow-hidden max-h-[80vh] overflow-y-auto">
                <div className="p-4">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                            Recent Searches
                        </h3>
                        <button
                            onClick={onClearAllRecent}
                            className="text-xs text-primary-600 hover:text-primary-700"
                        >
                            Clear all
                        </button>
                    </div>
                    <ul>
                        {recentSearches.map((term) => (
                            <li key={term} className="flex items-center justify-between group">
                                <button
                                    onClick={() => onSelectTerm(term)}
                                    className="flex-grow flex items-center py-2 text-sm text-gray-700 hover:text-primary-600 text-left"
                                >
                                    <svg
                                        className="w-4 h-4 mr-3 text-gray-400"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                        />
                                    </svg>
                                    {term}
                                </button>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onClearRecent(term);
                                    }}
                                    className="p-1 text-gray-400 hover:text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity"
                                    aria-label={`Remove ${term} from history`}
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Popular Searches - Hardcoded for now */}
                <div className="bg-gray-50 p-4 border-t border-gray-100">
                    <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                        Popular Suggestions
                    </h3>
                    <div className="flex flex-wrap gap-2">
                        {['Tie Dye', 'Leather', 'Gold Necklace', 'Silver Ring', 'Abstract Art'].map((term) => (
                            <button
                                key={term}
                                onClick={() => onSelectTerm(term)}
                                className="px-3 py-1 bg-white border border-gray-200 rounded-full text-sm text-gray-700 hover:border-primary-500 hover:text-primary-600 transition-colors"
                            >
                                {term}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    // Render loading state
    if (isLoading) {
        return (
            <div className="absolute top-full left-0 right-0 z-50 mt-2 bg-white rounded-lg shadow-xl border border-gray-100 p-8 flex justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
            </div>
        );
    }

    // Render empty state
    if (results.length === 0) {
        return (
            <div className="absolute top-full left-0 right-0 z-50 mt-2 bg-white rounded-lg shadow-xl border border-gray-100 p-4 text-center">
                <p className="text-sm text-gray-500">No results found for &quot;{query}&quot;</p>
            </div>
        );
    }

    // Render results
    return (
        <div className="absolute top-full left-0 right-0 z-50 mt-2 bg-white rounded-lg shadow-xl border border-gray-100 overflow-hidden max-h-[80vh] overflow-y-auto">
            <div className="p-2">
                <h3 className="px-2 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Products
                </h3>
                <ul>
                    {results.map((product) => (
                        <li key={product.id}>
                            <Link
                                href={`/products/${product.handle}`}
                                onClick={onClose}
                                className="flex items-center gap-4 p-2 rounded-lg hover:bg-gray-50 transition-colors group"
                            >
                                <div className="relative w-12 h-12 bg-gray-100 rounded-md overflow-hidden flex-shrink-0">
                                    {product.image ? (
                                        <Image
                                            src={product.image}
                                            alt={product.imageAlt || product.title}
                                            fill
                                            className="object-cover"
                                            sizes="48px"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                            </svg>
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-gray-900 truncate group-hover:text-primary-600">
                                        {product.title}
                                    </p>
                                    <p className="text-xs text-gray-500 truncate">
                                        {product.category}
                                    </p>
                                </div>
                                <div className="text-sm font-medium text-gray-900">
                                    {new Intl.NumberFormat('en-US', {
                                        style: 'currency',
                                        currency: product.currencyCode,
                                    }).format(product.price)}
                                </div>
                            </Link>
                        </li>
                    ))}
                </ul>
            </div>
            <div className="bg-gray-50 p-3 border-t border-gray-100 text-center">
                <Link
                    href={`/collections/all?search=${encodeURIComponent(query)}`}
                    onClick={onClose}
                    className="text-sm font-medium text-primary-600 hover:text-primary-700"
                >
                    View all results ({results.length}+)
                </Link>
            </div>
        </div>
    );
}
