import { Suspense } from 'react';
import Link from 'next/link';
import type { Metadata } from 'next';
import PostPurchaseUpsell from '@/components/checkout/post-purchase-upsell';
import ProductCardSkeleton from '@/components/product-card-skeleton';

export const metadata: Metadata = {
  title: 'Thank You for Your Order | Wildenflower',
  description: 'Your order has been confirmed. Thank you for shopping with us!',
};

export default function ThankYouPage() {
  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="max-w-3xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
        {/* Success Message */}
        <div className="text-center mb-12">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6">
            <svg
              className="w-8 h-8 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-neutral-900 mb-2">
            Thank you for your order!
          </h1>
          <p className="text-lg text-neutral-600">
            We&apos;ve received your order and will begin processing it right away.
          </p>
        </div>

        {/* Order Info Card */}
        <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6 mb-8">
          <h2 className="text-lg font-semibold text-neutral-900 mb-4">
            What happens next?
          </h2>
          <ol className="space-y-4">
            <li className="flex gap-4">
              <span className="flex-shrink-0 w-8 h-8 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center font-semibold text-sm">
                1
              </span>
              <div>
                <p className="font-medium text-neutral-900">Order Confirmation</p>
                <p className="text-sm text-neutral-600">
                  You&apos;ll receive an email confirmation with your order details shortly.
                </p>
              </div>
            </li>
            <li className="flex gap-4">
              <span className="flex-shrink-0 w-8 h-8 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center font-semibold text-sm">
                2
              </span>
              <div>
                <p className="font-medium text-neutral-900">Crafting Your Items</p>
                <p className="text-sm text-neutral-600">
                  Our artisans will carefully prepare your handcrafted items with love.
                </p>
              </div>
            </li>
            <li className="flex gap-4">
              <span className="flex-shrink-0 w-8 h-8 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center font-semibold text-sm">
                3
              </span>
              <div>
                <p className="font-medium text-neutral-900">Shipping Updates</p>
                <p className="text-sm text-neutral-600">
                  We&apos;ll send you tracking information once your order ships.
                </p>
              </div>
            </li>
          </ol>
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-12">
          <Link
            href="/account"
            className="flex items-center justify-center gap-2 px-6 py-3 bg-white border border-neutral-200 rounded-lg text-neutral-700 font-medium hover:bg-neutral-50 transition-colors"
          >
            <svg
              className="w-5 h-5"
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
            View Your Account
          </Link>
          <Link
            href="/collections/all"
            className="flex items-center justify-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors"
          >
            <svg
              className="w-5 h-5"
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
            Continue Shopping
          </Link>
        </div>

        {/* Post-Purchase Upsell */}
        <Suspense
          fallback={
            <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6">
              <div className="h-6 w-48 bg-neutral-200 rounded animate-pulse mb-4" />
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <ProductCardSkeleton key={i} />
                ))}
              </div>
            </div>
          }
        >
          <PostPurchaseUpsell />
        </Suspense>

        {/* Support Info */}
        <div className="mt-12 text-center">
          <p className="text-sm text-neutral-600">
            Questions about your order?{' '}
            <Link
              href="/contact"
              className="text-primary-600 hover:text-primary-700 font-medium"
            >
              Contact our support team
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
