'use client';

import { useCurrency } from '@/lib/currency-context';
import { useState, useRef, useEffect } from 'react';

export default function CurrencySelector() {
    const { currency, setCurrency, availableCurrencies } = useCurrency();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-1 text-sm font-medium text-parchment hover:text-white transition-colors px-2 py-1 rounded-md hover:bg-white/10"
                aria-label="Select currency"
                aria-expanded={isOpen}
            >
                <span>{currency}</span>
                <span className="text-xs text-parchment/60">
                    {availableCurrencies.find(c => c.code === currency)?.symbol}
                </span>
                <svg
                    className={`w-4 h-4 text-parchment/60 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 z-50 py-1 origin-top-right animate-in fade-in zoom-in-95 duration-100">
                    {availableCurrencies.map((c) => (
                        <button
                            key={c.code}
                            onClick={() => {
                                setCurrency(c.code);
                                setIsOpen(false);
                            }}
                            className={`w-full text-left px-4 py-2 text-sm flex items-center justify-between ${currency === c.code ? 'bg-primary-50 text-primary-700' : 'text-gray-700 hover:bg-gray-50'
                                }`}
                        >
                            <span className="font-medium">{c.code}</span>
                            <span className="text-gray-500">{c.name}</span>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
