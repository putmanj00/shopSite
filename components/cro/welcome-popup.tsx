'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';

interface WelcomePopupProps {
    discountCode?: string;
    discountPercent?: number;
}

export default function WelcomePopup({
    discountCode = 'WELCOME15',
    discountPercent = 15,
}: WelcomePopupProps) {
    const [isVisible, setIsVisible] = useState(false);
    const [email, setEmail] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);

    useEffect(() => {
        // Check if already shown
        const alreadyShown = localStorage.getItem('welcomePopupShown');
        if (alreadyShown) return;

        // Show after a short delay
        const timer = setTimeout(() => {
            setIsVisible(true);
            localStorage.setItem('welcomePopupShown', 'true');
        }, 3000);

        return () => clearTimeout(timer);
    }, []);

    const handleClose = useCallback(() => {
        setIsVisible(false);
    }, []);

    // Handle escape key
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isVisible) {
                handleClose();
            }
        };

        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, [isVisible, handleClose]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            await fetch('/api/newsletter', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });
            setIsSubmitted(true);
        } catch (error) {
            console.error('Failed to subscribe:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isVisible) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            role="dialog"
            aria-modal="true"
            aria-labelledby="welcome-title"
        >
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={handleClose}
                aria-hidden="true"
            />

            {/* Modal */}
            <div className="relative bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden animate-in zoom-in-95 duration-300">
                <button
                    onClick={handleClose}
                    className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 transition-colors z-10"
                    aria-label="Close popup"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>

                <div className="grid grid-cols-1 md:grid-cols-2">
                    {/* Image Side */}
                    <div
                        className="hidden md:block bg-cover bg-center min-h-[300px]"
                        style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=600&fit=crop)' }}
                    />

                    {/* Content Side */}
                    <div className="p-8">
                        {isSubmitted ? (
                            <div className="text-center py-8">
                                <div className="text-5xl mb-4">✨</div>
                                <h3 className="text-xl font-bold text-neutral-900 mb-2 font-heading">Welcome to the Wildenflower community!</h3>
                                <p className="text-neutral-600 mb-6">
                                    Your discount code has been sent to your email.
                                </p>
                                <div className="bg-primary-50 rounded-lg p-4 mb-6">
                                    <p className="text-sm text-primary-600 mb-1">Your code:</p>
                                    <p className="text-2xl font-bold text-primary-700 font-mono">{discountCode}</p>
                                </div>
                                <Link
                                    href="/collections/all"
                                    onClick={handleClose}
                                    className="inline-block px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-lg transition-colors"
                                >
                                    Start Shopping
                                </Link>
                            </div>
                        ) : (
                            <>
                                <div className="text-center mb-6">
                                    <h2 id="welcome-title" className="text-2xl font-bold text-neutral-900 mb-2 font-heading">
                                        Welcome, Free Spirit ✨
                                    </h2>
                                    <p className="text-neutral-600">
                                        Join our community of seekers and get
                                    </p>
                                    <p className="text-4xl font-bold text-primary-600 my-2">
                                        {discountPercent}% OFF
                                    </p>
                                    <p className="text-neutral-600 text-sm">
                                        your first treasure
                                    </p>
                                </div>

                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div>
                                        <label htmlFor="welcome-email" className="sr-only">
                                            Email address
                                        </label>
                                        <input
                                            type="email"
                                            id="welcome-email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            placeholder="Enter your email"
                                            required
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                        />
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="w-full py-3 bg-primary-600 hover:bg-primary-700 disabled:bg-primary-400 text-white font-semibold rounded-lg transition-colors"
                                    >
                                        {isSubmitting ? 'Joining...' : 'Unlock My Discount'}
                                    </button>
                                </form>

                                <p className="text-xs text-gray-500 text-center mt-4">
                                    By subscribing, you agree to receive marketing emails. Unsubscribe anytime.
                                </p>

                                <button
                                    onClick={handleClose}
                                    className="w-full mt-3 py-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
                                >
                                    No thanks
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
