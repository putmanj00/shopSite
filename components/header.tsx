'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useCartStore } from '@/lib/cart-store';
import { useAuthStore } from '@/lib/auth-store';
import { useWishlistStore } from '@/lib/wishlist-store';
import { useState, useEffect } from 'react';
import CurrencySelector from '@/components/currency-selector';
import MobileDrawer from '@/components/mobile-drawer';

export default function Header() {
  const { cart, openCart } = useCartStore();
  const { isAuthenticated, checkAuth } = useAuthStore();
  const { items: wishlistItems } = useWishlistStore();
  const [isMounted, setIsMounted] = useState(false);

  // Handle client-side hydration for Zustand stores
  useEffect(() => {
    const timer = setTimeout(() => setIsMounted(true), 0);
    return () => clearTimeout(timer);
  }, []);

  // Check auth status on mount
  useEffect(() => {
    if (isMounted) {
      checkAuth();
    }
  }, [isMounted, checkAuth]);
  const itemCount = cart?.totalQuantity || 0;

  return (
    <header className="sticky top-0 z-30 bg-forest border-b border-gold">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" aria-label="Main navigation">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <MobileDrawer />
            {/* Logo */}
            <Link href="/" className="flex items-center">
              <div className="relative h-12 w-12">
                <Image
                  src="/assets/images/logo/logo-mark.png"
                  alt="Wildenflower"
                  fill
                  className="object-contain"
                  priority
                />
              </div>
            </Link>
          </div>

          {/* Navigation Links */}
          <div className="hidden lg:flex items-center gap-6 lg:gap-8">
            <Link
              href="/collections/all"
              className="text-parchment hover:text-terracotta font-medium transition-colors duration-200"
            >
              Shop All
            </Link>
            <Link
              href="/collections/leather"
              className="text-parchment hover:text-terracotta font-medium transition-colors duration-200"
            >
              Leather Goods
            </Link>
            <Link
              href="/collections/jewelry"
              className="text-parchment hover:text-terracotta font-medium transition-colors duration-200"
            >
              Jewelry
            </Link>
            <Link
              href="/collections/tie-dye"
              className="text-parchment hover:text-terracotta font-medium transition-colors duration-200"
            >
              Tie-Dye
            </Link>
            <Link
              href="/collections/art"
              className="text-parchment hover:text-terracotta font-medium transition-colors duration-200"
            >
              Art
            </Link>
            <Link
              href="/about"
              className="text-parchment hover:text-terracotta font-medium transition-colors duration-200"
            >
              Our Story
            </Link>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden lg:block">
              <CurrencySelector />
            </div>

            {/* Wishlist Link */}
            <Link
              href="/wishlist"
              className="relative min-w-11 min-h-11 p-2 flex items-center justify-center rounded-lg hover:bg-white/10 transition-colors"
              aria-label="Wishlist"
            >
              <svg
                className="w-6 h-6 text-parchment"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
              </svg>
              {isMounted && wishlistItems.length > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-terracotta text-white text-xs font-bold rounded-full flex items-center justify-center">
                  {wishlistItems.length}
                </span>
              )}
            </Link>

            {/* Account Link */}
            {isMounted && isAuthenticated ? (
              <Link
                href="/account"
                className="min-w-11 min-h-11 p-2 flex items-center justify-center rounded-lg hover:bg-white/10 transition-colors"
                aria-label="Account"
              >
                <svg
                  className="w-6 h-6 text-parchment"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              </Link>
            ) : (
              <Link
                href="/login"
                className="min-h-11 px-3 flex items-center text-sm font-medium text-parchment hover:text-gold transition-colors"
              >
                Sign In
              </Link>
            )}

            {/* Cart Icon */}
            <button
              onClick={openCart}
              className="relative min-w-11 min-h-11 p-2 flex items-center justify-center rounded-lg hover:bg-white/10 transition-colors"
              aria-label="Open cart"
            >
              <svg
                className="w-6 h-6 text-parchment"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                />
              </svg>

              {/* Item Count Badge */}
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-terracotta text-white text-xs font-bold rounded-full flex items-center justify-center">
                  {itemCount > 9 ? '9+' : itemCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </nav>
    </header>
  );
}
