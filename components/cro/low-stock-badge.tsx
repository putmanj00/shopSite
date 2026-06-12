'use client';

import { useState, useEffect } from 'react';

interface LowStockBadgeProps {
    quantity: number;
    threshold?: number;
    showExact?: boolean;
}

export default function LowStockBadge({
    quantity,
    threshold = 5,
    showExact = false,
}: LowStockBadgeProps) {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Small delay for animation
        const timer = setTimeout(() => {
            setIsVisible(quantity > 0 && quantity <= threshold);
        }, 100);
        return () => clearTimeout(timer);
    }, [quantity, threshold]);

    if (!isVisible) return null;

    return (
        <div
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary-50 border border-primary-200 rounded-full animate-in fade-in duration-300"
            role="status"
            aria-live="polite"
        >
            <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-terracotta/70 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-terracotta" />
            </span>
            <span className="text-sm font-medium text-[#8f441c]">
                {showExact ? (
                    <>Only {quantity} left!</>
                ) : (
                    <>Low stock - order soon!</>
                )}
            </span>
        </div>
    );
}
