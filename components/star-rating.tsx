'use client';

import { useState } from 'react';

interface StarRatingProps {
    rating: number; // 0 to 5
    maxStats?: number; // default 5
    size?: 'sm' | 'md' | 'lg';
    interactive?: boolean;
    onRatingChange?: (rating: number) => void;
    ariaLabelledBy?: string;
}

export default function StarRating({
    rating,
    maxStats = 5,
    size = 'md',
    interactive = false,
    onRatingChange,
    ariaLabelledBy,
}: StarRatingProps) {
    const [hoverRating, setHoverRating] = useState<number | null>(null);

    const sizeClasses = {
        sm: 'w-4 h-4',
        md: 'w-5 h-5',
        lg: 'w-8 h-8',
    };

    // Touch target sizes for interactive stars
    const touchTargetClasses = {
        sm: 'min-w-8 min-h-8',
        md: 'min-w-10 min-h-10',
        lg: 'min-w-11 min-h-11',
    };

    const currentDisplayRating = hoverRating !== null ? hoverRating : rating;
    const roundedRating = Math.round(rating);

    // Non-interactive display
    if (!interactive) {
        return (
            <div
                className="flex items-center gap-0.5"
                role="img"
                aria-label={`${roundedRating} out of ${maxStats} stars`}
            >
                {[...Array(maxStats)].map((_, index) => {
                    const starValue = index + 1;
                    const filled = starValue <= roundedRating;

                    return (
                        <svg
                            key={index}
                            className={`${sizeClasses[size]} ${filled ? 'text-yellow-400' : 'text-gray-300'}`}
                            fill="currentColor"
                            viewBox="0 0 20 20"
                            aria-hidden="true"
                        >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                    );
                })}
            </div>
        );
    }

    // Interactive rating selector
    return (
        <div
            className="flex items-center gap-0.5"
            role="radiogroup"
            aria-labelledby={ariaLabelledBy}
            aria-label={ariaLabelledBy ? undefined : 'Rating'}
        >
            {[...Array(maxStats)].map((_, index) => {
                const starValue = index + 1;
                const filled = starValue <= Math.round(currentDisplayRating);
                const isSelected = starValue === roundedRating;

                return (
                    <button
                        key={index}
                        type="button"
                        role="radio"
                        aria-checked={isSelected}
                        aria-label={`${starValue} star${starValue !== 1 ? 's' : ''}`}
                        onClick={() => onRatingChange?.(starValue)}
                        onMouseEnter={() => setHoverRating(starValue)}
                        onMouseLeave={() => setHoverRating(null)}
                        onFocus={() => setHoverRating(starValue)}
                        onBlur={() => setHoverRating(null)}
                        className={`${touchTargetClasses[size]} flex items-center justify-center cursor-pointer transition-transform hover:scale-110 focus-visible:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 rounded`}
                    >
                        <svg
                            className={`${sizeClasses[size]} ${filled ? 'text-yellow-400' : 'text-gray-300'} transition-colors`}
                            fill="currentColor"
                            viewBox="0 0 20 20"
                            aria-hidden="true"
                        >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                    </button>
                );
            })}
        </div>
    );
}
