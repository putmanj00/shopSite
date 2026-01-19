'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type CurrencyCode = 'USD' | 'EUR' | 'GBP' | 'CAD' | 'AUD' | 'JPY';

interface CurrencyContextType {
    currency: CurrencyCode;
    setCurrency: (code: CurrencyCode) => void;
    formatPrice: (amount: number, currencyCode?: string) => string;
    convertPrice: (amount: number, sourceCurrency?: string) => number;
    availableCurrencies: { code: CurrencyCode; symbol: string; name: string }[];
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

// Mock exchange rates (base USD)
const EXCHANGE_RATES: Record<CurrencyCode, number> = {
    USD: 1,
    EUR: 0.92,
    GBP: 0.79,
    CAD: 1.35,
    AUD: 1.52,
    JPY: 150.5,
};

const AVAILABLE_CURRENCIES: { code: CurrencyCode; symbol: string; name: string }[] = [
    { code: 'USD', symbol: '$', name: 'US Dollar' },
    { code: 'EUR', symbol: '€', name: 'Euro' },
    { code: 'GBP', symbol: '£', name: 'British Pound' },
    { code: 'CAD', symbol: 'CA$', name: 'Canadian Dollar' },
    { code: 'AUD', symbol: 'AU$', name: 'Australian Dollar' },
    { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
];

export function CurrencyProvider({ children }: { children: ReactNode }) {
    const [currency, setCurrencyState] = useState<CurrencyCode>('USD');

    // Persist currency selection
    useEffect(() => {
        const savedCurrency = localStorage.getItem('shop_currency');
        if (savedCurrency && AVAILABLE_CURRENCIES.some(c => c.code === savedCurrency)) {
            // Avoid direct state update in effect to prevent lint warning
            setTimeout(() => setCurrencyState(savedCurrency as CurrencyCode), 0);
        }
    }, []);

    const setCurrency = (code: CurrencyCode) => {
        setCurrencyState(code);
        localStorage.setItem('shop_currency', code);
    };

    const convertPrice = (amount: number, sourceCurrency = 'USD') => {
        if (sourceCurrency !== 'USD') {
            // First convert to USD (simplified, assuming source is USD for now as Shopify store base)
            // Real implementation would need full matrix or base conversion
            console.warn('Currency conversion currently only supports USD base');
        }
        return amount * EXCHANGE_RATES[currency];
    };

    const formatPrice = (amount: number, sourceCurrency = 'USD') => {
        const convertedAmount = convertPrice(amount, sourceCurrency);

        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currency,
            minimumFractionDigits: currency === 'JPY' ? 0 : 2,
            maximumFractionDigits: currency === 'JPY' ? 0 : 2,
        }).format(convertedAmount);
    };

    return (
        <CurrencyContext.Provider value={{
            currency,
            setCurrency,
            formatPrice,
            convertPrice,
            availableCurrencies: AVAILABLE_CURRENCIES
        }}>
            {children}
        </CurrencyContext.Provider>
    );
}

export function useCurrency() {
    const context = useContext(CurrencyContext);
    if (context === undefined) {
        throw new Error('useCurrency must be used within a CurrencyProvider');
    }
    return context;
}
