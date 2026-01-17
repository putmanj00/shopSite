'use client';

import { useEffect, useRef, useCallback } from 'react';

interface SizeGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  productType?: string;
}

/**
 * Size guide modal with measurement information
 * WCAG 2.1 AA compliant with focus trap and keyboard navigation
 */
export default function SizeGuideModal({
  isOpen,
  onClose,
  productType,
}: SizeGuideModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<Element | null>(null);

  // Handle escape key
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    },
    [onClose]
  );

  // Focus trap
  const handleTabKey = useCallback((event: KeyboardEvent) => {
    if (event.key !== 'Tab' || !modalRef.current) return;

    const focusableElements = modalRef.current.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

    if (event.shiftKey) {
      if (document.activeElement === firstElement) {
        lastElement?.focus();
        event.preventDefault();
      }
    } else {
      if (document.activeElement === lastElement) {
        firstElement?.focus();
        event.preventDefault();
      }
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      previousActiveElement.current = document.activeElement;
      document.body.style.overflow = 'hidden';
      document.addEventListener('keydown', handleKeyDown);
      document.addEventListener('keydown', handleTabKey);

      // Focus the close button
      setTimeout(() => {
        const closeButton = modalRef.current?.querySelector('button');
        closeButton?.focus();
      }, 0);
    } else {
      document.body.style.overflow = 'unset';
      if (previousActiveElement.current instanceof HTMLElement) {
        previousActiveElement.current.focus();
      }
    }

    return () => {
      document.body.style.overflow = 'unset';
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keydown', handleTabKey);
    };
  }, [isOpen, handleKeyDown, handleTabKey]);

  if (!isOpen) return null;

  // Determine which size guide to show based on product type
  const type = productType?.toLowerCase() || '';
  const isApparel = type.includes('apparel') || type.includes('clothing') || type.includes('tie-dye') || type.includes('shirt') || type.includes('hoodie');
  const isJewelry = type.includes('jewelry') || type.includes('ring') || type.includes('bracelet');

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="size-guide-title"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Content */}
      <div
        ref={modalRef}
        className="relative w-full max-w-2xl bg-white rounded-xl shadow-2xl max-h-[90vh] overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200">
          <h2
            id="size-guide-title"
            className="text-xl font-semibold text-neutral-900"
          >
            Size Guide
          </h2>
          <button
            onClick={onClose}
            className="p-2 -mr-2 rounded-lg hover:bg-neutral-100 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
            aria-label="Close size guide"
          >
            <svg
              className="w-5 h-5 text-neutral-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto max-h-[calc(90vh-80px)] p-6">
          {isApparel ? (
            <ApparelSizeGuide />
          ) : isJewelry ? (
            <JewelrySizeGuide />
          ) : (
            <GeneralSizeGuide />
          )}

          {/* How to Measure */}
          <div className="mt-8 p-4 bg-neutral-50 rounded-lg">
            <h3 className="text-sm font-semibold text-neutral-900 mb-2">
              How to Measure
            </h3>
            <p className="text-sm text-neutral-600">
              For the most accurate fit, take measurements over undergarments.
              Use a flexible measuring tape and keep it snug but not tight.
              If you&apos;re between sizes, we recommend sizing up for a more comfortable fit.
            </p>
          </div>

          {/* Contact */}
          <p className="mt-4 text-sm text-neutral-600 text-center">
            Need help? <a href="/contact" className="text-primary-600 hover:text-primary-700 font-medium">Contact us</a> for personalized sizing assistance.
          </p>
        </div>
      </div>
    </div>
  );
}

function ApparelSizeGuide() {
  return (
    <div>
      <h3 className="text-lg font-semibold text-neutral-900 mb-4">Apparel Size Chart</h3>

      {/* Size Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-neutral-100">
              <th className="px-4 py-3 text-left font-semibold text-neutral-900">Size</th>
              <th className="px-4 py-3 text-left font-semibold text-neutral-900">Chest (in)</th>
              <th className="px-4 py-3 text-left font-semibold text-neutral-900">Waist (in)</th>
              <th className="px-4 py-3 text-left font-semibold text-neutral-900">Length (in)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-200">
            <tr><td className="px-4 py-3">XS</td><td className="px-4 py-3">32-34</td><td className="px-4 py-3">26-28</td><td className="px-4 py-3">27</td></tr>
            <tr className="bg-neutral-50"><td className="px-4 py-3">S</td><td className="px-4 py-3">35-37</td><td className="px-4 py-3">29-31</td><td className="px-4 py-3">28</td></tr>
            <tr><td className="px-4 py-3">M</td><td className="px-4 py-3">38-40</td><td className="px-4 py-3">32-34</td><td className="px-4 py-3">29</td></tr>
            <tr className="bg-neutral-50"><td className="px-4 py-3">L</td><td className="px-4 py-3">41-43</td><td className="px-4 py-3">35-37</td><td className="px-4 py-3">30</td></tr>
            <tr><td className="px-4 py-3">XL</td><td className="px-4 py-3">44-46</td><td className="px-4 py-3">38-40</td><td className="px-4 py-3">31</td></tr>
            <tr className="bg-neutral-50"><td className="px-4 py-3">2XL</td><td className="px-4 py-3">47-49</td><td className="px-4 py-3">41-43</td><td className="px-4 py-3">32</td></tr>
            <tr><td className="px-4 py-3">3XL</td><td className="px-4 py-3">50-52</td><td className="px-4 py-3">44-46</td><td className="px-4 py-3">33</td></tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

function JewelrySizeGuide() {
  return (
    <div className="space-y-8">
      {/* Ring Size Guide */}
      <div>
        <h3 className="text-lg font-semibold text-neutral-900 mb-4">Ring Size Chart</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-neutral-100">
                <th className="px-4 py-3 text-left font-semibold text-neutral-900">US Size</th>
                <th className="px-4 py-3 text-left font-semibold text-neutral-900">Inner Diameter (mm)</th>
                <th className="px-4 py-3 text-left font-semibold text-neutral-900">Circumference (mm)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200">
              <tr><td className="px-4 py-3">5</td><td className="px-4 py-3">15.7</td><td className="px-4 py-3">49.3</td></tr>
              <tr className="bg-neutral-50"><td className="px-4 py-3">6</td><td className="px-4 py-3">16.5</td><td className="px-4 py-3">51.9</td></tr>
              <tr><td className="px-4 py-3">7</td><td className="px-4 py-3">17.3</td><td className="px-4 py-3">54.4</td></tr>
              <tr className="bg-neutral-50"><td className="px-4 py-3">8</td><td className="px-4 py-3">18.1</td><td className="px-4 py-3">56.9</td></tr>
              <tr><td className="px-4 py-3">9</td><td className="px-4 py-3">19.0</td><td className="px-4 py-3">59.5</td></tr>
              <tr className="bg-neutral-50"><td className="px-4 py-3">10</td><td className="px-4 py-3">19.8</td><td className="px-4 py-3">62.1</td></tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Bracelet Size Guide */}
      <div>
        <h3 className="text-lg font-semibold text-neutral-900 mb-4">Bracelet Size Chart</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-neutral-100">
                <th className="px-4 py-3 text-left font-semibold text-neutral-900">Size</th>
                <th className="px-4 py-3 text-left font-semibold text-neutral-900">Wrist (in)</th>
                <th className="px-4 py-3 text-left font-semibold text-neutral-900">Bracelet Length (in)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200">
              <tr><td className="px-4 py-3">XS</td><td className="px-4 py-3">5.5-6.0</td><td className="px-4 py-3">6.5</td></tr>
              <tr className="bg-neutral-50"><td className="px-4 py-3">S</td><td className="px-4 py-3">6.0-6.5</td><td className="px-4 py-3">7.0</td></tr>
              <tr><td className="px-4 py-3">M</td><td className="px-4 py-3">6.5-7.0</td><td className="px-4 py-3">7.5</td></tr>
              <tr className="bg-neutral-50"><td className="px-4 py-3">L</td><td className="px-4 py-3">7.0-7.5</td><td className="px-4 py-3">8.0</td></tr>
              <tr><td className="px-4 py-3">XL</td><td className="px-4 py-3">7.5-8.0</td><td className="px-4 py-3">8.5</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function GeneralSizeGuide() {
  return (
    <div className="text-center py-8">
      <svg
        className="mx-auto h-12 w-12 text-neutral-400 mb-4"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
        />
      </svg>
      <p className="text-neutral-600">
        Size information varies by product. Please check the product description for specific measurements,
        or contact us for sizing assistance.
      </p>
    </div>
  );
}
