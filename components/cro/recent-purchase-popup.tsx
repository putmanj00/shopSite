'use client';

import { useState, useEffect } from 'react';

interface Purchase {
    productTitle: string;
    location: string;
    time: string;
}

const mockPurchases: Purchase[] = [
    { productTitle: 'Sunset Tie-Dye Hoodie', location: 'Los Angeles, CA', time: '2 minutes ago' },
    { productTitle: 'Leather Crossbody Bag', location: 'New York, NY', time: '5 minutes ago' },
    { productTitle: 'Silver Moon Pendant', location: 'Austin, TX', time: '8 minutes ago' },
    { productTitle: 'Abstract Canvas Print', location: 'Seattle, WA', time: '12 minutes ago' },
    { productTitle: 'Handcrafted Leather Wallet', location: 'Chicago, IL', time: '15 minutes ago' },
];

export default function RecentPurchasePopup() {
    const [isVisible, setIsVisible] = useState(false);
    const [currentPurchase, setCurrentPurchase] = useState<Purchase | null>(null);

    useEffect(() => {
        // Don't show on mobile for UX reasons
        if (window.innerWidth < 768) return;

        let purchaseIndex = 0;

        const showPopup = () => {
            setCurrentPurchase(mockPurchases[purchaseIndex]);
            setIsVisible(true);

            // Hide after 5 seconds
            setTimeout(() => {
                setIsVisible(false);
            }, 5000);

            // Move to next purchase
            purchaseIndex = (purchaseIndex + 1) % mockPurchases.length;
        };

        // Initial delay before first popup
        const initialDelay = setTimeout(() => {
            showPopup();
        }, 10000);

        // Show popup every 30 seconds
        const interval = setInterval(() => {
            showPopup();
        }, 30000);

        return () => {
            clearTimeout(initialDelay);
            clearInterval(interval);
        };
    }, []);

    if (!isVisible || !currentPurchase) return null;

    return (
        <div
            className="fixed bottom-4 left-4 z-40 max-w-sm bg-white rounded-lg shadow-xl border border-gray-100 overflow-hidden animate-in slide-in-from-left duration-500"
            role="status"
            aria-live="polite"
        >
            <div className="p-4">
                <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                        <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">
                            Someone in {currentPurchase.location}
                        </p>
                        <p className="text-sm text-gray-600 truncate">
                            just purchased <span className="font-medium">{currentPurchase.productTitle}</span>
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                            {currentPurchase.time}
                        </p>
                    </div>
                    <button
                        onClick={() => setIsVisible(false)}
                        className="flex-shrink-0 p-1 text-gray-400 hover:text-gray-600 transition-colors"
                        aria-label="Dismiss notification"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
            </div>
            {/* Progress bar */}
            <div className="h-1 bg-gray-100">
                <div className="h-full bg-green-500 animate-[shrink_5s_linear]" style={{ width: '100%' }} />
            </div>
        </div>
    );
}
