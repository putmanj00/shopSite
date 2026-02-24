'use client';

import React from 'react';
import Image from 'next/image';

interface BotanicalHeaderProps {
  variant?: 'large' | 'small' | 'faq' | 'blog';
  className?: string;
}

const HEADER_ASSETS = {
  large: '/assets/images/headers/botanical-header-large.png',
  small: '/assets/images/headers/botanical-header-small.png',
  faq: '/assets/images/headers/botanical-header-faq.png',
  blog: '/assets/images/headers/botanical-header-blog.png',
};

const ASPECT_RATIOS = {
  large: 1408 / 768, // ~1.83
  small: 1170 / 360, // 3.25
  faq: 1170 / 400,   // 2.925
  blog: 1170 / 480,  // 2.4375
};

export function BotanicalHeader({ variant = 'large', className = '' }: BotanicalHeaderProps) {
  const ratio = ASPECT_RATIOS[variant] || ASPECT_RATIOS.large;
  
  return (
    <div 
      className={`w-full overflow-hidden mx-auto max-w-[800px] bg-[#e6e2da] ${className}`}
      style={{ aspectRatio: `${ratio}` }}
    >
      <div className="relative w-full h-full">
        <Image
          src={HEADER_ASSETS[variant]}
          alt={`Botanical header - ${variant}`}
          fill
          priority
          sizes="(max-width: 800px) 100vw, 800px"
          className="object-cover"
        />
      </div>
    </div>
  );
}
