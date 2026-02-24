'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

interface CategoryChipProps {
    category: { label: string; icon: string };
    href: string;
    isActive?: boolean;
    className?: string;
}

const CATEGORY_ICONS: Record<string, string> = {
    mushroom: '/assets/images/icons/categories/icon-mushroom.png',
    sunburst: '/assets/images/icons/categories/icon-sunburst.png',
    vines: '/assets/images/icons/categories/icon-vines-circle.png',
    'vines-circle': '/assets/images/icons/categories/icon-vines-circle.png',
    seedling: '/assets/images/icons/categories/icon-seedling.png',
    fern: '/assets/images/icons/categories/icon-fern.png',
    crystal: '/assets/images/icons/categories/icon-crystal.png',
    wildflower: '/assets/images/icons/categories/icon-wildflower.png',
    vine: '/assets/images/icons/categories/icon-vine.png',
};

export function CategoryChip({ category, href, isActive = false, className = '' }: CategoryChipProps) {
    const iconSource = CATEGORY_ICONS[category.icon] || CATEGORY_ICONS['seedling'];

    return (
        <Link
            href={href}
            className={`flex flex-col items-center w-20 cursor-pointer group hover:opacity-80 transition-opacity ${className}`}
            aria-pressed={isActive}
        >
            <div className={`
        w-[72px] h-[72px] rounded-full flex items-center justify-center mb-2 border transition-colors
        ${isActive ? 'border-secondary-500 bg-secondary-100' : 'bg-[#FDF8F3] border-neutral-200'}
      `}>
                {iconSource ? (
                    <div className="relative w-[44px] h-[44px]">
                        <Image sizes="(max-width: 768px) 44px, 44px" src={iconSource} alt={category.label} fill className="object-contain" />
                    </div>
                ) : (
                    <span className="font-bold text-xl text-neutral-800">
                        {category.icon[0].toUpperCase()}
                    </span>
                )}
            </div>
            <span className={`
        font-sans text-sm text-center max-w-[80px] mt-1
        ${isActive ? 'text-secondary-600 font-medium' : 'text-neutral-600'}
      `}>
                {category.label}
            </span>
        </Link>
    );
}
