'use client';

import React from 'react';
import Link from 'next/link';

interface SectionTitleProps {
    title: string;
    action?: { label: string; onClick?: () => void; href?: string };
    centered?: boolean;
    className?: string;
}

export function SectionTitle({ title, action, centered, className = '' }: SectionTitleProps) {
    const actionClassName = "font-sans text-sm text-lime-700 hover:opacity-80 transition-opacity font-medium tracking-wide";

    return (
        <div className={`flex flex-row items-center justify-between mx-4 mb-6 ${centered ? 'justify-center mx-0' : ''} ${className}`}>
            <h2 className="font-heading text-3xl text-secondary-700">
                {title}
            </h2>
            {action && !centered && (
                action.href ? (
                    <Link href={action.href} className={actionClassName}>
                        {action.label}
                    </Link>
                ) : (
                    <button onClick={action.onClick} className={actionClassName}>
                        {action.label}
                    </button>
                )
            )}
        </div>
    );
}
