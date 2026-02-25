'use client';

import { useState, useEffect, useCallback, useRef, useSyncExternalStore } from 'react';

interface CarouselProps {
  children: React.ReactNode[];
  autoPlay?: boolean;
  autoPlayInterval?: number;
  showDots?: boolean;
  showArrows?: boolean;
  className?: string;
  itemsPerView?: {
    mobile: number;
    tablet: number;
    desktop: number;
  };
}

// Custom hook for reduced motion preference
function usePrefersReducedMotion() {
  const subscribe = useCallback((callback: () => void) => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    mediaQuery.addEventListener('change', callback);
    return () => mediaQuery.removeEventListener('change', callback);
  }, []);

  const getSnapshot = useCallback(() => {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }, []);

  const getServerSnapshot = useCallback(() => false, []);

  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

// Custom hook for responsive items per view
function useResponsiveItemsPerView(itemsPerView: { mobile: number; tablet: number; desktop: number }) {
  const subscribe = useCallback((callback: () => void) => {
    window.addEventListener('resize', callback);
    return () => window.removeEventListener('resize', callback);
  }, []);

  const getSnapshot = useCallback(() => {
    const width = window.innerWidth;
    if (width >= 1024) return itemsPerView.desktop;
    if (width >= 768) return itemsPerView.tablet;
    return itemsPerView.mobile;
  }, [itemsPerView]);

  const getServerSnapshot = useCallback(() => itemsPerView.mobile, [itemsPerView.mobile]);

  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

export default function Carousel({
  children,
  autoPlay = true,
  autoPlayInterval = 5000,
  showDots = true,
  showArrows = true,
  className = '',
  itemsPerView = { mobile: 1, tablet: 2, desktop: 3 },
}: CarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const autoPlayRef = useRef<NodeJS.Timeout | null>(null);

  const prefersReducedMotion = usePrefersReducedMotion();
  const visibleItems = useResponsiveItemsPerView(itemsPerView);

  const totalItems = children.length;
  const maxIndex = Math.max(0, totalItems - visibleItems);

  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
  }, [maxIndex]);

  const goToPrev = useCallback(() => {
    setCurrentIndex((prev) => (prev <= 0 ? maxIndex : prev - 1));
  }, [maxIndex]);

  const goToSlide = useCallback((index: number) => {
    setCurrentIndex(Math.min(index, maxIndex));
  }, [maxIndex]);

  // Auto-play logic
  useEffect(() => {
    if (autoPlay && !isPaused && !prefersReducedMotion) {
      autoPlayRef.current = setInterval(goToNext, autoPlayInterval);
    }

    return () => {
      if (autoPlayRef.current) {
        clearInterval(autoPlayRef.current);
      }
    };
  }, [autoPlay, isPaused, prefersReducedMotion, goToNext, autoPlayInterval]);

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      switch (event.key) {
        case 'ArrowLeft':
          goToPrev();
          event.preventDefault();
          break;
        case 'ArrowRight':
          goToNext();
          event.preventDefault();
          break;
      }
    },
    [goToNext, goToPrev]
  );

  // Pause on hover/focus
  const handleMouseEnter = () => setIsPaused(true);
  const handleMouseLeave = () => setIsPaused(false);
  const handleFocus = () => setIsPaused(true);
  const handleBlur = (e: React.FocusEvent) => {
    if (!containerRef.current?.contains(e.relatedTarget as Node)) {
      setIsPaused(false);
    }
  };

  const togglePause = () => setIsPaused((prev) => !prev);

  // Calculate the number of dots needed
  const dotCount = maxIndex + 1;

  return (
    <div
      ref={containerRef}
      className={`relative ${className}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onFocus={handleFocus}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      role="region"
      aria-roledescription="carousel"
      aria-label="Content carousel"
    >
      {/* Carousel Track */}
      <div className="overflow-hidden">
        <div
          className={`flex ${prefersReducedMotion ? '' : 'transition-transform duration-500 ease-in-out'}`}
          style={{
            transform: `translateX(-${currentIndex * (100 / visibleItems)}%)`,
          }}
          aria-live={isPaused ? 'polite' : 'off'}
        >
          {children.map((child, index) => (
            <div
              key={index}
              className="flex-shrink-0 px-2"
              style={{ width: `${100 / visibleItems}%` }}
              role="group"
              aria-roledescription="slide"
              aria-label={`Slide ${index + 1} of ${totalItems}`}
            >
              {child}
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Arrows */}
      {showArrows && totalItems > visibleItems && (
        <>
          <button
            onClick={goToPrev}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 z-10"
            aria-label="Previous slide"
          >
            <svg
              className="w-5 h-5 text-gray-700"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
          <button
            onClick={goToNext}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 z-10"
            aria-label="Next slide"
          >
            <svg
              className="w-5 h-5 text-gray-700"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        </>
      )}

      {/* Controls: Dots and Pause Button */}
      {(showDots || autoPlay) && totalItems > visibleItems && (
        <div className="flex items-center justify-center gap-4 mt-6">
          {/* Pause/Play Button */}
          {autoPlay && !prefersReducedMotion && (
            <button
              onClick={togglePause}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label={isPaused ? 'Play carousel' : 'Pause carousel'}
              aria-pressed={isPaused}
            >
              {isPaused ? (
                <svg
                  className="w-5 h-5 text-gray-600"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M8 5v14l11-7z" />
                </svg>
              ) : (
                <svg
                  className="w-5 h-5 text-gray-600"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
                </svg>
              )}
            </button>
          )}

          {/* Dot Indicators */}
          {showDots && (
            <div className="flex gap-2" role="tablist" aria-label="Slide navigation">
              {Array.from({ length: dotCount }).map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className={`w-2.5 h-2.5 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-terracotta focus:ring-offset-2 ${
                    index === currentIndex
                      ? 'bg-terracotta'
                      : 'bg-gray-300 hover:bg-gray-400'
                  }`}
                  role="tab"
                  aria-selected={index === currentIndex}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
