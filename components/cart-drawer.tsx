'use client';

import { useEffect, useState, useMemo } from 'react';

import { useCartStore } from '@/lib/cart-store';
import { useAuthStore } from '@/lib/auth-store';
import Price from '@/components/price';
import CartItem from './cart-item';
import FreeShippingBar from './cart/free-shipping-bar';
import DiscountCodeInput from './cart/discount-code-input';
import CartCrossSell from './cart/cart-cross-sell';
import ExpressCheckoutButtons from './cart/express-checkout-buttons';
import { TrustBadgesCompact } from './checkout/trust-badges';
import GiftMessageInput from './checkout/gift-message-input';

export default function CartDrawer() {
  const { cart, isOpen, closeCart } = useCartStore();
  const { isAuthenticated } = useAuthStore();
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [giftMessage, setGiftMessage] = useState('');
  const [isGift, setIsGift] = useState(false);

  const handleGiftMessageChange = (message: string, gift: boolean) => {
    setGiftMessage(message);
    setIsGift(gift);
  };

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

  const lines = useMemo(() => cart?.lines.edges || [], [cart?.lines.edges]);
  const isEmpty = lines.length === 0;

  // Calculate cart totals and metadata for new features
  const cartSubtotal = useMemo(() => {
    if (!cart?.cost.subtotalAmount) return 0;
    return parseFloat(cart.cost.subtotalAmount.amount);
  }, [cart]);

  const cartProductTypes = useMemo(() => {
    return lines
      .map((line) => line.node.merchandise.product.productType)
      .filter((type): type is string => Boolean(type));
  }, [lines]);

  const cartProductIds = useMemo(() => {
    return lines.map((line) => line.node.merchandise.product.id);
  }, [lines]);

  // Placeholder discount code handlers (would connect to Shopify API)
  const handleApplyDiscount = async (code: string) => {
    // TODO: Implement Shopify cart discount code mutation
    console.log('Applying discount code:', code);
    throw new Error('Discount codes coming soon!');
  };

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

                {/* Cross-sell Recommendations */}
                <CartCrossSell
                  cartProductTypes={cartProductTypes}
                  cartProductIds={cartProductIds}
                />
              </div>

              {/* Footer */}
              <div className="border-t border-gray-200 px-6 py-4 space-y-4">
                {/* Free Shipping Progress Bar */}
                <FreeShippingBar
                  currentTotal={cartSubtotal}
                  threshold={75}
                  currencyCode={cart?.cost.subtotalAmount.currencyCode}
                />

                {/* Discount Code Input */}
                <DiscountCodeInput onApply={handleApplyDiscount} />

                {/* Subtotal */}
                <div className="flex items-center justify-between text-lg">
                  <span className="font-semibold text-gray-900">Subtotal</span>
                  <span className="font-bold text-gray-900">
                    {cart && <Price amount={cart.cost.subtotalAmount.amount} currencyCode={cart.cost.subtotalAmount.currencyCode} />}
                  </span>
                </div>

                {/* Tax Notice */}
                {cart?.cost.totalTaxAmount && (
                  <p className="text-sm text-gray-500">
                    Tax: <Price amount={cart.cost.totalTaxAmount.amount} currencyCode={cart.cost.totalTaxAmount.currencyCode} />
                  </p>
                )}

                <p className="text-sm text-gray-500">
                  Shipping and taxes calculated at checkout
                </p>

                {/* Gift Message Option */}
                <GiftMessageInput
                  onMessageChange={handleGiftMessageChange}
                  initialMessage={giftMessage}
                  initialIsGift={isGift}
                />

                {/* Express Checkout Buttons */}
                <ExpressCheckoutButtons />

                {/* Checkout Button */}
                <button
                  onClick={() => {
                    if (cart?.checkoutUrl) {
                      setIsRedirecting(true);
                      // Add logged_in=true for SSO with new Customer Accounts
                      const checkoutUrl = isAuthenticated
                        ? `${cart.checkoutUrl}${cart.checkoutUrl.includes('?') ? '&' : '?'}logged_in=true`
                        : cart.checkoutUrl;
                      window.location.href = checkoutUrl;
                    }
                  }}
                  disabled={!cart?.checkoutUrl || isRedirecting}
                  className="w-full py-4 bg-blue-600 text-white text-center rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isRedirecting ? (
                    <>
                      <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Redirecting...
                    </>
                  ) : (
                    'Proceed to Checkout'
                  )}
                </button>

                {/* Trust Badges */}
                <TrustBadgesCompact />

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
