'use client';

import { useState } from 'react';

interface StarRatingProps {
    rating: number; // 0 to 5
    maxStats?: number; // default 5
    size?: 'sm' | 'md' | 'lg';
    interactive?: boolean;
    onRatingChange?: (rating: number) => void;
}

export default function StarRating({
    rating,
    maxStats = 5,
    size = 'md',
    interactive = false,
    onRatingChange,
}: StarRatingProps) {
    const [hoverRating, setHoverRating] = useState<number | null>(null);

    const sizeClasses = {
        sm: 'w-4 h-4',
        md: 'w-5 h-5',
        lg: 'w-8 h-8',
    };

    const currentDisplayRating = hoverRating !== null ? hoverRating : rating;

    return (
        <div className="flex items-center gap-1">
            {[...Array(maxStats)].map((_, index) => {
                const starValue = index + 1;
                const filled = starValue <= Math.round(currentDisplayRating);

                return (
                    <button
                        key={index}
                        type={interactive ? 'button' : undefined}
                        disabled={!interactive}
                        onClick={() => interactive && onRatingChange?.(starValue)}
                        onMouseEnter={() => interactive && setHoverRating(starValue)}
                        onMouseLeave={() => interactive && setHoverRating(null)}
                        className={`transition-colors ${interactive ? 'cursor-pointer hover:scale-110' : 'cursor-default'
                            }`}
                    >
                        <svg
                            className={`${sizeClasses[size]} ${filled ? 'text-yellow-400' : 'text-gray-300'
                                }`}
                            fill="currentColor"
                            viewBox="0 0 20 20"
                        >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                    </button>
                );
            })}
        </div>
    );
}
