'use client';

import { useEffect } from 'react';
import { useCartStore } from '@/lib/cart-store';
import { formatMoney } from '@/lib/shopify-helpers';
import CartItem from './cart-item';

export default function CartDrawer() {
  const { cart, isOpen, closeCart } = useCartStore();

  // Prevent body scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const lines = cart?.lines.edges || [];
  const isEmpty = lines.length === 0;

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 transition-opacity duration-300"
          onClick={closeCart}
          aria-hidden="true"
        />
      )}

      {/* Drawer */}
      <div
        className={`
          fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-2xl z-50
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : 'translate-x-full'}
        `}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900">
              Shopping Cart
              {!isEmpty && (
                <span className="ml-2 text-lg font-normal text-gray-500">
                  ({cart?.totalQuantity} {cart?.totalQuantity === 1 ? 'item' : 'items'})
                </span>
              )}
            </h2>
            <button
              onClick={closeCart}
              className="p-2 -mr-2 rounded-lg hover:bg-gray-100 transition-colors"
              aria-label="Close cart"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
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

          {/* Cart Contents */}
          {isEmpty ? (
            <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
              <svg
                className="w-24 h-24 text-gray-300 mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                />
              </svg>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Your cart is empty
              </h3>
              <p className="text-gray-500 mb-6">
                Add some products to get started!
              </p>
              <button
                onClick={closeCart}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                Continue Shopping
              </button>
            </div>
          ) : (
            <>
              {/* Items List */}
              <div className="flex-1 overflow-y-auto px-6">
                <div className="divide-y divide-gray-200">
                  {lines.map(({ node }) => (
                    <CartItem key={node.id} line={node} />
                  ))}
                </div>
              </div>

              {/* Footer */}
              <div className="border-t border-gray-200 px-6 py-4 space-y-4">
                {/* Subtotal */}
                <div className="flex items-center justify-between text-lg">
                  <span className="font-semibold text-gray-900">Subtotal</span>
                  <span className="font-bold text-gray-900">
                    {cart && formatMoney(cart.cost.subtotalAmount)}
                  </span>
                </div>

                {/* Tax Notice */}
                {cart?.cost.totalTaxAmount && (
                  <p className="text-sm text-gray-500">
                    Tax: {formatMoney(cart.cost.totalTaxAmount)}
                  </p>
                )}

                <p className="text-sm text-gray-500">
                  Shipping and taxes calculated at checkout
                </p>

                {/* Checkout Button */}
                {cart?.checkoutUrl && (
                  <a
                    href={cart.checkoutUrl}
                    className="block w-full py-4 bg-blue-600 text-white text-center rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                  >
                    Proceed to Checkout
                  </a>
                )}

                {/* Continue Shopping */}
                <button
                  onClick={closeCart}
                  className="w-full py-3 text-blue-600 text-center font-semibold hover:text-blue-700 transition-colors"
                >
                  Continue Shopping
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
