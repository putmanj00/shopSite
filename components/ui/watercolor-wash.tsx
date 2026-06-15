'use client';

import React, { ReactNode } from 'react';

interface WatercolorWashProps {
    variant?: 'dustyRose' | 'lavender' | 'sage' | 'gold';
    children?: ReactNode;
    className?: string;
}

export function WatercolorWash({
    variant = 'dustyRose',
    children,
    className = '',
}: WatercolorWashProps) {
    // Map to the theme variables from globals.css
    const variantStyles = {
        dustyRose: 'bg-dusty-rose/20',
        lavender: 'bg-primary-100',
        sage: 'bg-sage/20',
        gold: 'bg-gold/15',
    };

    return (
        <div className={`rounded-lg p-3 ${variantStyles[variant]} ${className}`}>
            {children}
        </div>
    );
}
