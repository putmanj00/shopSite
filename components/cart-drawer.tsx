'use client';

import { useEffect, useState, useMemo } from 'react';
import Image from 'next/image';

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
import { Button } from '@/components/ui/button';

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

  const handleApplyDiscount = async (code: string) => {
    console.log('Applying discount code:', code);
    throw new Error('Discount codes coming soon!');
  };

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-forest/50 z-40 transition-opacity duration-300"
          onClick={closeCart}
          aria-hidden="true"
        />
      )}

      {/* Drawer */}
      <div
        className={`
          fixed top-0 right-0 h-full w-full max-w-md bg-parchment shadow-2xl z-50
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : 'translate-x-full'}
        `}
      >
        <div className="flex flex-col h-full">

          {/* Header — forest with botanical image */}
          <div className="relative flex items-center justify-between px-6 py-5 bg-forest overflow-hidden flex-shrink-0">
            {/* Botanical backdrop */}
            <div className="absolute inset-0 opacity-20 pointer-events-none" aria-hidden="true">
              <Image
                src="/assets/images/headers/botanical-header-small.png"
                alt=""
                fill
                className="object-cover object-top"
                priority
              />
            </div>
            <div className="relative">
              <p className="text-gold font-medium text-xs uppercase tracking-widest mb-0.5">
                Wildenflower
              </p>
              <h2 className="text-xl font-bold text-white font-heading leading-tight">
                Your Gathering
                {!isEmpty && (
                  <span className="ml-2 text-base font-normal text-parchment/70">
                    ({cart?.totalQuantity} {cart?.totalQuantity === 1 ? 'item' : 'items'})
                  </span>
                )}
              </h2>
            </div>
            <button
              onClick={closeCart}
              className="relative p-2 -mr-2 rounded-lg text-parchment/70 hover:text-parchment hover:bg-white/10 transition-colors"
              aria-label="Close cart"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Cart Contents */}
          {isEmpty ? (
            <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
              <div className="relative w-56 h-36 mb-2 opacity-50">
                <Image
                  src="/assets/images/empty-states/empty-cart.png"
                  alt="Botanical illustration"
                  fill
                  className="object-contain"
                />
              </div>
              <h3 className="text-xl font-semibold text-forest font-heading mb-2">
                Your basket is empty
              </h3>
              <p className="text-earth mb-6 max-w-xs leading-relaxed">
                Wander the shop and find something made for you.
              </p>
              <Button href="/collections/all" onClick={closeCart} variant="primary">
                Explore the Shop
              </Button>
            </div>
          ) : (
            <>
              {/* Scrollable region: line items + order summary.
                  min-h-0 lets this flex child shrink and scroll instead of
                  collapsing to 0 height behind a tall pinned footer on mobile. */}
              <div className="flex-1 min-h-0 overflow-y-auto">
                {/* Items List */}
                <div className="px-6">
                  <div className="divide-y divide-gold/20">
                    {lines.map(({ node }) => (
                      <CartItem key={node.id} line={node} />
                    ))}
                  </div>

                  <CartCrossSell
                    cartProductTypes={cartProductTypes}
                    cartProductIds={cartProductIds}
                  />
                </div>

                {/* Botanical divider strip */}
                <div className="relative h-14 -mb-1 opacity-30 pointer-events-none" aria-hidden="true">
                  <Image
                    src="/assets/images/about/dividder-fallen-log-no-bg.png"
                    alt=""
                    fill
                    className="object-contain object-center"
                  />
                </div>

                {/* Order summary (scrolls with items) */}
                <div className="border-t border-gold/30 bg-parchment px-6 py-4 space-y-4">
                  {/* Free Shipping Progress Bar */}
                  <FreeShippingBar
                    currentTotal={cartSubtotal}
                    threshold={75}
                    currencyCode={cart?.cost.subtotalAmount.currencyCode}
                  />

                  {/* Discount Code Input */}
                  <DiscountCodeInput onApply={handleApplyDiscount} />

                  {/* Gift Message Option */}
                  <GiftMessageInput
                    onMessageChange={handleGiftMessageChange}
                    initialMessage={giftMessage}
                    initialIsGift={isGift}
                  />

                  {/* Express Checkout Buttons */}
                  <ExpressCheckoutButtons />
                </div>
              </div>

              {/* Pinned action bar — always visible so the item totals and
                  checkout stay reachable even when the cart overflows on mobile. */}
              <div className="flex-shrink-0 border-t border-gold/30 bg-parchment px-6 py-4 space-y-3">
                {/* Subtotal */}
                <div className="flex items-center justify-between text-lg">
                  <span className="font-semibold text-forest font-heading">Subtotal</span>
                  <span className="font-bold text-forest">
                    {cart && <Price amount={cart.cost.subtotalAmount.amount} currencyCode={cart.cost.subtotalAmount.currencyCode} />}
                  </span>
                </div>

                {cart?.cost.totalTaxAmount && (
                  <p className="text-sm text-earth">
                    Tax: <Price amount={cart.cost.totalTaxAmount.amount} currencyCode={cart.cost.totalTaxAmount.currencyCode} />
                  </p>
                )}

                <p className="text-sm text-earth/70">
                  Shipping and taxes calculated at checkout
                </p>

                {/* Checkout Button */}
                <Button
                  onClick={() => {
                    if (cart?.checkoutUrl) {
                      setIsRedirecting(true);
                      const checkoutUrl = isAuthenticated
                        ? `${cart.checkoutUrl}${cart.checkoutUrl.includes('?') ? '&' : '?'}logged_in=true`
                        : cart.checkoutUrl;
                      window.location.href = checkoutUrl;
                    }
                  }}
                  disabled={!cart?.checkoutUrl || isRedirecting}
                  fullWidth
                  size="lg"
                  className="disabled:cursor-not-allowed"
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
                </Button>

                {/* Trust Badges */}
                <TrustBadgesCompact />

                {/* Continue Shopping */}
                <button
                  onClick={closeCart}
                  className="w-full py-2 text-gold text-center font-semibold hover:text-gold/80 transition-colors"
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
