'use client';

import { useState } from 'react';

interface GiftMessageInputProps {
  onMessageChange: (message: string, isGift: boolean) => void;
  initialMessage?: string;
  initialIsGift?: boolean;
}

/**
 * Gift message input for checkout
 * Allows customers to mark order as gift and add a personal message
 * WCAG 2.1 AA compliant
 */
export default function GiftMessageInput({
  onMessageChange,
  initialMessage = '',
  initialIsGift = false,
}: GiftMessageInputProps) {
  const [isGift, setIsGift] = useState(initialIsGift);
  const [message, setMessage] = useState(initialMessage);
  const maxLength = 200;

  const handleGiftToggle = () => {
    const newIsGift = !isGift;
    setIsGift(newIsGift);
    if (!newIsGift) {
      setMessage('');
      onMessageChange('', false);
    } else {
      onMessageChange(message, true);
    }
  };

  const handleMessageChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newMessage = e.target.value.slice(0, maxLength);
    setMessage(newMessage);
    onMessageChange(newMessage, isGift);
  };

  return (
    <div className="border border-neutral-200 rounded-lg p-4">
      <div className="flex items-start gap-3">
        <div className="flex items-center h-5 mt-0.5">
          <input
            id="is-gift"
            type="checkbox"
            checked={isGift}
            onChange={handleGiftToggle}
            className="h-4 w-4 rounded border-neutral-300 text-primary-600 focus:ring-primary-500 focus:ring-offset-0"
          />
        </div>
        <div className="flex-1">
          <label
            htmlFor="is-gift"
            className="text-sm font-medium text-neutral-900 cursor-pointer"
          >
            This order is a gift
          </label>
          <p className="text-xs text-neutral-500 mt-0.5">
            We&apos;ll include a gift receipt (no prices shown)
          </p>
        </div>
        <svg
          className="w-5 h-5 text-neutral-400 flex-shrink-0"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7"
          />
        </svg>
      </div>

      {isGift && (
        <div className="mt-4">
          <label
            htmlFor="gift-message"
            className="block text-sm font-medium text-neutral-700 mb-1"
          >
            Add a gift message (optional)
          </label>
          <textarea
            id="gift-message"
            value={message}
            onChange={handleMessageChange}
            placeholder="Write a personal message to include with your gift..."
            rows={3}
            maxLength={maxLength}
            className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
            aria-describedby="gift-message-count"
          />
          <p
            id="gift-message-count"
            className="text-xs text-neutral-500 text-right mt-1"
          >
            {message.length}/{maxLength} characters
          </p>
        </div>
      )}
    </div>
  );
}
