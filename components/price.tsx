'use client';

import { useCurrency } from '@/lib/currency-context';

interface PriceProps {
    amount: string | number;
    currencyCode?: string;
    className?: string;
}

export default function Price({ amount, currencyCode = 'USD', className = '' }: PriceProps) {
    const { formatPrice } = useCurrency();
    const numAmount = typeof amount == 'string' ? parseFloat(amount) : amount;
    // Handle invalid amounts gracefully
    if (isNaN(numAmount)) {
        return <span className={className}>-</span>;
    }

    return (
        <span className={className}>
            {formatPrice(numAmount, currencyCode)}
        </span>
    );
}
