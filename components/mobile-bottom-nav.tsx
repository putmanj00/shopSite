'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCartStore } from '@/lib/cart-store';
import { useAuthStore } from '@/lib/auth-store';
import { useState, useEffect } from 'react';

export default function MobileBottomNav() {
  const pathname = usePathname();
  const { cart, openCart } = useCartStore();
  const { isAuthenticated } = useAuthStore();
  const [isMounted, setIsMounted] = useState(false);

  // Handle client-side hydration for Zustand stores
  useEffect(() => {
    const timer = setTimeout(() => setIsMounted(true), 0);
    return () => clearTimeout(timer);
  }, []);

  const itemCount = cart?.totalQuantity || 0;

  const navItems = [
    {
      href: '/',
      label: 'Home',
      icon: (
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
          />
        </svg>
      ),
      isActive: pathname === '/',
    },
    {
      href: '/collections/all',
      label: 'Shop',
      icon: (
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
          />
        </svg>
      ),
      isActive: pathname.startsWith('/collections'),
    },
    {
      href: '#cart',
      label: 'Cart',
      icon: (
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
          />
        </svg>
      ),
      isCart: true,
      badge: isMounted && itemCount > 0 ? (itemCount > 9 ? '9+' : itemCount) : null,
    },
    {
      href: isAuthenticated ? '/account' : '/login',
      label: isAuthenticated ? 'Account' : 'Sign In',
      icon: (
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
          />
        </svg>
      ),
      isActive: pathname === '/account' || pathname === '/login',
    },
  ];

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-neutral-200 safe-area-bottom md:hidden"
      aria-label="Mobile navigation"
    >
      <div className="flex items-center justify-around h-16">
        {navItems.map((item) =>
          item.isCart ? (
            <button
              key={item.label}
              onClick={openCart}
              className="relative flex flex-col items-center justify-center min-w-16 min-h-12 px-2 py-1 text-neutral-600 hover:text-primary-600 transition-colors"
              aria-label={`Open cart${item.badge ? `, ${item.badge} items` : ''}`}
            >
              <span className="relative">
                {item.icon}
                {item.badge && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary-600 text-white text-xs font-bold rounded-full flex items-center justify-center">
                    {item.badge}
                  </span>
                )}
              </span>
              <span className="text-xs mt-1">{item.label}</span>
            </button>
          ) : (
            <Link
              key={item.label}
              href={item.href}
              className={`flex flex-col items-center justify-center min-w-16 min-h-12 px-2 py-1 transition-colors ${item.isActive
                  ? 'text-primary-600'
                  : 'text-neutral-600 hover:text-primary-600'
                }`}
              aria-current={item.isActive ? 'page' : undefined}
            >
              {item.icon}
              <span className="text-xs mt-1">{item.label}</span>
            </Link>
          )
        )}
      </div>
    </nav>
  );
}
