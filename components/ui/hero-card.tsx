'use client';

import React from 'react';
import Image from 'next/image';

interface HeroCardProps {
    tagline?: string;
    onExploreClick?: () => void;
    className?: string;
}

export function HeroCard({
    tagline = "Handcrafted with intention, from our studio to your sanctuary.",
    onExploreClick,
    className = ''
}: HeroCardProps) {
    return (
        <div className={`flex flex-col md:flex-row bg-lime-900 rounded-2xl border border-neutral-700 md:mx-4 mb-8 overflow-hidden min-h-[140px] shadow-lg ${className}`}>
            <div className="flex-[0.55] p-6 flex flex-col justify-center">
                <h2 className="font-accent text-3xl text-neutral-50 leading-[1.4]">
                    {tagline}
                </h2>
                {onExploreClick && (
                    <div className="mt-6">
                        <button
                            onClick={onExploreClick}
                            className="px-6 py-2 bg-primary-600 text-white rounded-full font-medium hover:bg-primary-700 transition-colors"
                        >
                            Wander the Shop
                        </button>
                    </div>
                )}
            </div>
            <div className="flex-[0.45] relative overflow-hidden min-h-[140px]">
                <Image
                    src="/assets/images/headers/botanical-header-small.png"
                    alt="Botanical Hero"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    fill
                    priority
                    className="object-cover"
                />
            </div>
        </div>
    );
}
