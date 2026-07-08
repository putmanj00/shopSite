'use client';

import { useState } from 'react';

interface BackInStockFormProps {
    productId: string;
    productTitle: string;
    variantId?: string;
    variantTitle?: string;
}

export default function BackInStockForm({
    productId,
    productTitle,
    variantId,
    variantTitle,
}: BackInStockFormProps) {
    const [email, setEmail] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError('');

        try {
            const response = await fetch('/api/back-in-stock', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email,
                    productId,
                    productTitle,
                    variantId,
                    variantTitle,
                }),
            });

            if (!response.ok) throw new Error('Failed to subscribe');

            setIsSubmitted(true);
        } catch (err) {
            setError('Failed to subscribe. Please try again.');
            console.error(err);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isSubmitted) {
        return (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center gap-3">
                    <div className="flex-shrink-0">
                        <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                    </div>
                    <div>
                        <p className="font-medium text-green-800">You&apos;re on the list!</p>
                        <p className="text-sm text-green-700">
                            We&apos;ll email you when this item is back in stock.
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                <h3 className="font-medium text-gray-900">Notify me when available</h3>
            </div>

            <p className="text-sm text-gray-600 mb-4">
                Enter your email and we&apos;ll let you know when {productTitle} is back in stock.
            </p>

            <form onSubmit={handleSubmit} className="flex gap-2">
                <div className="flex-1">
                    <label htmlFor="back-in-stock-email" className="sr-only">
                        Email address
                    </label>
                    <input
                        type="email"
                        id="back-in-stock-email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter your email"
                        required
                        className="w-full px-4 py-2 border border-gold/30 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                    />
                </div>
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-4 py-2 bg-primary-600 hover:bg-primary-700 disabled:bg-primary-400 text-white font-medium rounded-lg transition-colors text-sm whitespace-nowrap"
                >
                    {isSubmitting ? 'Subscribing...' : 'Notify Me'}
                </button>
            </form>

            {error && (
                <p className="text-sm text-red-600 mt-2">{error}</p>
            )}
        </div>
    );
}
