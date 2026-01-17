'use client';

import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

const MOCK_PURCHASES = [
    { name: 'Sarah from New York', product: 'Tie-Dye Hoodie', time: '2 minutes ago' },
    { name: 'Mike from Austin', product: 'Leather Wallet', time: '5 minutes ago' },
    { name: 'Jessica from Portland', product: 'Silver Ring', time: '12 minutes ago' },
    { name: 'David from London', product: 'Abstract Canvas Print', time: '15 minutes ago' },
    { name: 'Emma from Toronto', product: 'Macrame Wall Hanging', time: '25 minutes ago' },
];

export default function SocialProofToast() {
    const [isVisible, setIsVisible] = useState(false);
    const [purchase, setPurchase] = useState(MOCK_PURCHASES[0]);

    useEffect(() => {
        // Initial delay before first toast
        const initialTimer = setTimeout(() => {
            setIsVisible(true);
        }, 5000);

        // Interval to show new toasts
        const interval = setInterval(() => {
            setIsVisible(false);

            // Wait for exit animation then show next
            setTimeout(() => {
                const randomPurchase = MOCK_PURCHASES[Math.floor(Math.random() * MOCK_PURCHASES.length)];
                setPurchase(randomPurchase);
                setIsVisible(true);
            }, 1000);

            // Hide after 5 seconds
            setTimeout(() => {
                setIsVisible(false);
            }, 6000);

        }, 20000); // Every 20 seconds

        return () => {
            clearTimeout(initialTimer);
            clearInterval(interval);
        };
    }, []);

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 0, y: 50, x: -20 }}
                    animate={{ opacity: 1, y: 0, x: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    className="fixed bottom-4 left-4 z-50 bg-white border border-gray-200 shadow-lg rounded-lg p-4 max-w-xs flex items-center gap-3 hidden md:flex"
                >
                    <div className="flex-shrink-0 relative w-12 h-12 bg-gray-100 rounded-md overflow-hidden">
                        {/* Placeholder image since we don't have product images in mock data easily mapping */}
                        <div className="w-full h-full flex items-center justify-center bg-primary-100 text-primary-600 font-bold text-xs">
                            SOLD
                        </div>
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-900">
                            {purchase.name} purchased
                        </p>
                        <p className="text-xs text-gray-600 truncate w-40">
                            {purchase.product}
                        </p>
                        <p className="text-[10px] text-gray-400 mt-1">
                            {purchase.time}
                        </p>
                    </div>
                    <button
                        onClick={() => setIsVisible(false)}
                        className="absolute top-1 right-1 text-gray-400 hover:text-gray-600"
                        aria-label="Close notification"
                    >
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
