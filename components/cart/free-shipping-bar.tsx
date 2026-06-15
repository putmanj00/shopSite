'use client';

interface FreeShippingBarProps {
  currentTotal: number;
  threshold?: number;
  currencyCode?: string;
}

/**
 * Progress bar showing how close the customer is to free shipping
 * WCAG 2.1 AA compliant with proper ARIA attributes
 */
import Price from '@/components/price';

export default function FreeShippingBar({
  currentTotal,
  threshold = 75,
  currencyCode = 'USD',
}: FreeShippingBarProps) {
  const remaining = Math.max(0, threshold - currentTotal);
  const progress = Math.min(100, (currentTotal / threshold) * 100);
  const qualified = currentTotal >= threshold;

  return (
    <div className="bg-neutral-50 rounded-lg p-3">
      {qualified ? (
        <div className="flex items-center gap-2 text-forest">
          <svg
            className="w-5 h-5 flex-shrink-0"
            fill="currentColor"
            viewBox="0 0 20 20"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
          <span className="text-sm font-medium">
            You&apos;ve unlocked free shipping!
          </span>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-neutral-700">
              <span className="font-medium text-primary-600">
                <Price amount={remaining} currencyCode={currencyCode} />
              </span>{' '}
              away from free shipping
            </span>
            <svg
              className="w-5 h-5 text-neutral-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"
              />
            </svg>
          </div>
          <div
            className="h-2 bg-neutral-200 rounded-full overflow-hidden"
            role="progressbar"
            aria-valuenow={Math.round(progress)}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`${Math.round(progress)}% towards free shipping`}
          >
            <div
              className="h-full bg-primary-500 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-xs text-neutral-500 mt-1">
            Free shipping on orders over <Price amount={threshold} currencyCode={currencyCode} />
          </p>
        </>
      )}
    </div>
  );
}
