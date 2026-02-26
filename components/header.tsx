'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useCartStore } from '@/lib/cart-store';
import { useAuthStore } from '@/lib/auth-store';
import { useWishlistStore } from '@/lib/wishlist-store';
import { useState, useEffect, useRef } from 'react';
import CurrencySelector from '@/components/currency-selector';
import MobileDrawer from '@/components/mobile-drawer';
import type { NavItem } from '@/lib/shopify-helpers';

export default function Header({ navItems }: { navItems: NavItem[] }) {
  const { cart, openCart } = useCartStore();
  const { isAuthenticated, checkAuth } = useAuthStore();
  const { items: wishlistItems } = useWishlistStore();
  const [isMounted, setIsMounted] = useState(false);
  const [shopOpen, setShopOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Handle client-side hydration for Zustand stores
  useEffect(() => {
    const timer = setTimeout(() => setIsMounted(true), 0);
    return () => clearTimeout(timer);
  }, []);

  // Close Shop dropdown on Escape key or outside click
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setShopOpen(false);
    };
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShopOpen(false);
      }
    };
    document.addEventListener('keydown', handleKey);
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.removeEventListener('mousedown', handleClickOutside);
    };
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
          <nav className="hidden lg:flex items-center gap-8" aria-label="Primary navigation">
            {/* Home */}
            <Link
              href="/"
              className="text-parchment hover:text-terracotta font-medium transition-colors duration-200"
            >
              Home
            </Link>

            {/* Shop dropdown */}
            <div
              ref={dropdownRef}
              className="relative"
              onMouseEnter={() => setShopOpen(true)}
              onMouseLeave={() => setShopOpen(false)}
            >
              <button
                onClick={() => setShopOpen((prev) => !prev)}
                aria-expanded={shopOpen}
                aria-haspopup="true"
                aria-controls="shop-dropdown"
                className="text-parchment hover:text-terracotta font-medium transition-colors duration-200 flex items-center gap-1"
              >
                Shop
                <svg
                  className={`w-4 h-4 transition-transform duration-200 ${shopOpen ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {shopOpen && (
                <div
                  id="shop-dropdown"
                  role="menu"
                  aria-label="Shop categories"
                  className="absolute top-full left-0 mt-1 bg-forest border border-gold/30 rounded-md shadow-lg py-2 min-w-[10rem] z-50"
                >
                  {navItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      role="menuitem"
                      className="block px-4 py-2 text-parchment hover:text-terracotta hover:bg-white/5 transition-colors font-medium"
                      onClick={() => setShopOpen(false)}
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* About */}
            <Link
              href="/about"
              className="text-parchment hover:text-terracotta font-medium transition-colors duration-200"
            >
              About
            </Link>
          </nav>

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
