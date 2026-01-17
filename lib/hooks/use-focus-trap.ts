import { useEffect, useRef, useCallback } from 'react';

/**
 * Focus trap hook for modals, dialogs, and drawers
 * Keeps focus within the container when active (WCAG 2.1 requirement)
 *
 * @example
 * function Modal({ isOpen, onClose }) {
 *   const containerRef = useFocusTrap<HTMLDivElement>(isOpen);
 *   return isOpen ? <div ref={containerRef}>...</div> : null;
 * }
 */
export function useFocusTrap<T extends HTMLElement>(
  isActive: boolean,
  options?: {
    initialFocusRef?: React.RefObject<HTMLElement | null>;
    returnFocusOnDeactivate?: boolean;
  }
) {
  const containerRef = useRef<T>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);

  const { initialFocusRef, returnFocusOnDeactivate = true } = options || {};

  const getFocusableElements = useCallback(() => {
    if (!containerRef.current) return [];

    const focusableSelectors = [
      'button:not([disabled])',
      'a[href]',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      '[tabindex]:not([tabindex="-1"])',
    ].join(', ');

    return Array.from(
      containerRef.current.querySelectorAll<HTMLElement>(focusableSelectors)
    ).filter(
      (el) => el.offsetParent !== null // Element is visible
    );
  }, []);

  // Handle tab key to trap focus
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (event.key !== 'Tab') return;

      const focusableElements = getFocusableElements();
      if (focusableElements.length === 0) return;

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      // Shift + Tab on first element -> go to last
      if (event.shiftKey && document.activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
        return;
      }

      // Tab on last element -> go to first
      if (!event.shiftKey && document.activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
        return;
      }
    },
    [getFocusableElements]
  );

  useEffect(() => {
    if (!isActive) return;

    // Store the currently focused element to restore later
    previousActiveElement.current = document.activeElement as HTMLElement;

    // Set initial focus
    const focusableElements = getFocusableElements();
    if (initialFocusRef?.current) {
      initialFocusRef.current.focus();
    } else if (focusableElements.length > 0) {
      focusableElements[0].focus();
    } else if (containerRef.current) {
      // If no focusable elements, make container focusable
      containerRef.current.setAttribute('tabindex', '-1');
      containerRef.current.focus();
    }

    // Add keydown listener
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);

      // Return focus to previous element when deactivating
      if (returnFocusOnDeactivate && previousActiveElement.current) {
        previousActiveElement.current.focus();
      }
    };
  }, [
    isActive,
    handleKeyDown,
    getFocusableElements,
    initialFocusRef,
    returnFocusOnDeactivate,
  ]);

  return containerRef;
}

export default useFocusTrap;
