'use client';

import { useState, useEffect, useCallback } from 'react';

interface ExitIntentPopupProps {
    discountCode?: string;
    discountPercent?: number;
    onClose?: () => void;
}

export default function ExitIntentPopup({
    discountCode = 'STAYWITHUS15',
    discountPercent = 15,
    onClose,
}: ExitIntentPopupProps) {
    const [isVisible, setIsVisible] = useState(false);
    const [hasShown, setHasShown] = useState(false);
    const [email, setEmail] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);

    const handleClose = useCallback(() => {
        setIsVisible(false);
        onClose?.();
    }, [onClose]);

    useEffect(() => {
        // Check if already shown in this session
        const alreadyShown = sessionStorage.getItem('exitIntentShown');
        if (alreadyShown) {
            setHasShown(true);
            return;
        }

        const handleMouseLeave = (e: MouseEvent) => {
            // Only trigger when mouse leaves from the top of the viewport
            if (e.clientY <= 0 && !hasShown) {
                setIsVisible(true);
                setHasShown(true);
                sessionStorage.setItem('exitIntentShown', 'true');
            }
        };

        // Only add listener after a delay to avoid immediate triggering
        const timer = setTimeout(() => {
            document.addEventListener('mouseleave', handleMouseLeave);
        }, 5000);

        return () => {
            clearTimeout(timer);
            document.removeEventListener('mouseleave', handleMouseLeave);
        };
    }, [hasShown]);

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
            // Simulated API call
            await new Promise((resolve) => setTimeout(resolve, 1000));
            setIsSubmitted(true);
        } catch (error) {
            console.error('Failed to submit:', error);
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
            aria-labelledby="exit-intent-title"
        >
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={handleClose}
                aria-hidden="true"
            />

            {/* Modal */}
            <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-300">
                <button
                    onClick={handleClose}
                    className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 transition-colors z-10"
                    aria-label="Close popup"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>

                <div className="bg-gradient-to-br from-primary-600 to-primary-700 p-8 text-center text-white">
                    <div className="text-6xl mb-4">🎁</div>
                    <h2 id="exit-intent-title" className="text-2xl font-bold mb-2">
                        Wait! Don&apos;t leave yet!
                    </h2>
                    <p className="text-primary-100">
                        Here&apos;s a special offer just for you
                    </p>
                </div>

                <div className="p-8">
                    {isSubmitted ? (
                        <div className="text-center">
                            <div className="text-5xl mb-4">✨</div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">You&apos;re all set!</h3>
                            <p className="text-gray-600 mb-4">
                                Check your email for your exclusive discount code.
                            </p>
                            <div className="bg-gray-100 rounded-lg p-4">
                                <p className="text-sm text-gray-500 mb-1">Your code:</p>
                                <p className="text-2xl font-bold text-primary-600 font-mono">{discountCode}</p>
                            </div>
                        </div>
                    ) : (
                        <>
                            <div className="text-center mb-6">
                                <p className="text-4xl font-bold text-primary-600 mb-2">{discountPercent}% OFF</p>
                                <p className="text-gray-600">
                                    Enter your email to unlock your exclusive discount
                                </p>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label htmlFor="exit-email" className="sr-only">
                                        Email address
                                    </label>
                                    <input
                                        type="email"
                                        id="exit-email"
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
                                    {isSubmitting ? 'Sending...' : 'Get My Discount'}
                                </button>
                            </form>

                            <button
                                onClick={handleClose}
                                className="w-full mt-3 py-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
                            >
                                No thanks, I&apos;ll pay full price
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
