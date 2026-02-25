'use client';

import React from 'react';
import Image from 'next/image';

interface BotanicalDividerProps {
    variant?: 'fern-mushroom' | 'wildflower' | 'vine-trail' | 'mushroom-cluster' | 'fern-spiral';
    className?: string;
}

const DIVIDER_ASSETS = {
    'fern-mushroom': '/assets/images/dividers/divider-fern-mushroom.png',
    'wildflower': '/assets/images/dividers/divider-wildflower.png',
    'vine-trail': '/assets/images/dividers/divider-vine-trail.png',
    'mushroom-cluster': '/assets/images/dividers/divider-mushroom-cluster.png',
    'fern-spiral': '/assets/images/dividers/divider-fern-spiral.png',
};

export function BotanicalDivider({ variant = 'fern-mushroom', className = '' }: BotanicalDividerProps) {
    return (
        <div className={`w-full h-32 my-6 flex items-center justify-center mx-auto max-w-[1500px] relative ${className}`}>
            <Image
                src={DIVIDER_ASSETS[variant]}
                alt={`Botanical divider - ${variant}`}
                fill
                sizes="(max-width: 1500px) 100vw, 1500px"
                className="object-contain"
            />
        </div>
    );
}
