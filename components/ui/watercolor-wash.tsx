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
        dustyRose: 'bg-secondary-100', // Pink/Rose
        lavender: 'bg-primary-100',    // Purple
        sage: 'bg-lime-100',           // Green
        gold: 'bg-gold-100',           // Gold
    };

    return (
        <div className={`rounded-lg p-3 ${variantStyles[variant]} ${className}`}>
            {children}
        </div>
    );
}
