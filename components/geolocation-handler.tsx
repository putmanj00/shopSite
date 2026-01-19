'use client';

import { useEffect } from 'react';
import { useCurrency, type CurrencyCode } from '@/lib/currency-context';

export default function GeolocationHandler() {
    const { setCurrency } = useCurrency();

    useEffect(() => {
        const hasAutoDetected = localStorage.getItem('currency_autodetected');
        if (hasAutoDetected) return;

        // Simple heuristic-based detection logic
        // In a real app, you'd call an IP geolocation API route
        try {
            const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
            let detectedCurrency: CurrencyCode | null = null;

            if (timezone.includes('Europe')) {
                // Exclude UK
                if (timezone.includes('London')) detectedCurrency = 'GBP';
                else detectedCurrency = 'EUR';
            } else if (timezone.includes('America/New_York') || timezone.includes('America/Los_Angeles')) {
                detectedCurrency = 'USD';
            } else if (timezone.includes('America/Toronto')) {
                detectedCurrency = 'CAD';
            } else if (timezone.includes('Australia')) {
                detectedCurrency = 'AUD';
            } else if (timezone.includes('Tokyo')) {
                detectedCurrency = 'JPY';
            }

            if (detectedCurrency) {
                setCurrency(detectedCurrency);
                localStorage.setItem('currency_autodetected', 'true');
                console.log(`Auto-detected currency: ${detectedCurrency} based on timezone ${timezone}`);
            }
        } catch (e) {
            console.warn('Failed to detect location for currency', e);
        }
    }, [setCurrency]);

    return null;
}
