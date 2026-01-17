'use client';

import { useState } from 'react';

interface DiscountCodeInputProps {
  onApply: (code: string) => Promise<void>;
  appliedCode?: string | null;
  onRemove?: () => Promise<void>;
}

/**
 * Discount/promo code input field for cart
 * WCAG 2.1 AA compliant with proper labels and error states
 */
export default function DiscountCodeInput({
  onApply,
  appliedCode,
  onRemove,
}: DiscountCodeInputProps) {
  const [code, setCode] = useState('');
  const [isApplying, setIsApplying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);

  const handleApply = async () => {
    if (!code.trim()) return;

    setIsApplying(true);
    setError(null);

    try {
      await onApply(code.trim().toUpperCase());
      setCode('');
      setIsExpanded(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid discount code');
    } finally {
      setIsApplying(false);
    }
  };

  const handleRemove = async () => {
    if (!onRemove) return;
    setIsApplying(true);
    try {
      await onRemove();
    } finally {
      setIsApplying(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleApply();
    }
  };

  if (appliedCode) {
    return (
      <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-lg px-3 py-2">
        <div className="flex items-center gap-2">
          <svg
            className="w-4 h-4 text-green-600"
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
          <span className="text-sm font-medium text-green-800">
            {appliedCode}
          </span>
        </div>
        {onRemove && (
          <button
            onClick={handleRemove}
            disabled={isApplying}
            className="text-sm text-green-700 hover:text-green-800 font-medium disabled:opacity-50"
            aria-label={`Remove discount code ${appliedCode}`}
          >
            Remove
          </button>
        )}
      </div>
    );
  }

  return (
    <div>
      {!isExpanded ? (
        <button
          onClick={() => setIsExpanded(true)}
          className="text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
            />
          </svg>
          Add discount code
        </button>
      ) : (
        <div className="space-y-2">
          <label htmlFor="discount-code" className="sr-only">
            Discount code
          </label>
          <div className="flex gap-2">
            <input
              id="discount-code"
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              onKeyDown={handleKeyDown}
              placeholder="Enter code"
              className="flex-1 px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              disabled={isApplying}
              aria-describedby={error ? 'discount-error' : undefined}
            />
            <button
              onClick={handleApply}
              disabled={!code.trim() || isApplying}
              className="px-4 py-2 bg-neutral-900 text-white text-sm font-medium rounded-lg hover:bg-neutral-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isApplying ? 'Applying...' : 'Apply'}
            </button>
          </div>
          {error && (
            <p id="discount-error" className="text-sm text-red-600" role="alert">
              {error}
            </p>
          )}
          <button
            onClick={() => {
              setIsExpanded(false);
              setCode('');
              setError(null);
            }}
            className="text-xs text-neutral-500 hover:text-neutral-700"
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
}
