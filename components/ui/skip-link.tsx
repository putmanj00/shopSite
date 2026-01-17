'use client';

import Link from 'next/link';

interface SkipLinkProps {
    href?: string;
    children?: React.ReactNode;
}

/**
 * Skip navigation link - WCAG 2.1 AA requirement
 * Allows keyboard users to skip repetitive navigation and jump to main content
 * Should be the first focusable element on the page
 */
export function SkipLink({
    href = '#main-content',
    children = 'Skip to main content',
}: SkipLinkProps) {
    return (
        <Link
            href={href}
            className="skip-link"
            onClick={(e) => {
                // Ensure focus moves to main content
                const target = document.querySelector(href);
                if (target instanceof HTMLElement) {
                    e.preventDefault();
                    target.focus();
                    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            }}
        >
            {children}
        </Link>
    );
}

export default SkipLink;
