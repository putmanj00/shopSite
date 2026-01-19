import * as React from 'react';
import { EmailLayout, EmailButton, EmailProductCard } from './email-layout';

interface CartItem {
  title: string;
  price: string;
  imageUrl?: string;
  productUrl: string;
}

interface AbandonedCartEmailProps {
  firstName: string;
  cartItems: CartItem[];
  cartTotal: string;
  cartUrl: string;
  emailNumber: 1 | 2 | 3; // Which email in the sequence
  discountCode?: string;
  discountPercent?: number;
}

export function AbandonedCartEmail({
  firstName,
  cartItems,
  cartTotal,
  cartUrl,
  emailNumber,
  discountCode,
  discountPercent,
}: AbandonedCartEmailProps) {
  const emailContent = {
    1: {
      subject: 'Did you forget something?',
      previewText: `Hey ${firstName}, you left some items in your cart`,
      headline: 'You Left Something Behind',
      message: "We noticed you didn't complete your purchase. No worries — we saved your items for you!",
      showDiscount: false,
    },
    2: {
      subject: 'Your cart is waiting for you',
      previewText: `Your handcrafted items are still available, ${firstName}`,
      headline: 'Still Thinking It Over?',
      message: "Great taste! The items in your cart are popular, and we'd hate for you to miss out. Here's a little nudge to help you decide.",
      showDiscount: false,
    },
    3: {
      subject: `${firstName}, here's 10% off to complete your order`,
      previewText: `Special offer inside: 10% off your cart items`,
      headline: 'A Special Offer Just for You',
      message: "We really want you to have these beautiful pieces. Use this exclusive discount to complete your order:",
      showDiscount: true,
    },
  };

  const content = emailContent[emailNumber];

  return (
    <EmailLayout previewText={content.previewText}>
      <h1 style={{
        fontSize: '28px',
        fontWeight: 700,
        color: '#1e293b',
        margin: '0 0 16px 0',
        textAlign: 'center',
      }}>
        {content.headline}
      </h1>

      <p style={{ textAlign: 'center', color: '#64748b', marginBottom: '24px' }}>
        {content.message}
      </p>

      {/* Discount banner for email 3 */}
      {content.showDiscount && discountCode && (
        <div style={{
          backgroundColor: '#fef3c7',
          border: '2px dashed #f59e0b',
          borderRadius: '12px',
          padding: '20px',
          textAlign: 'center',
          marginBottom: '24px',
        }}>
          <p style={{
            fontSize: '24px',
            fontWeight: 700,
            color: '#b45309',
            margin: '0 0 8px 0',
          }}>
            {discountPercent || 10}% OFF
          </p>
          <p style={{ margin: '0 0 12px 0', color: '#64748b' }}>
            Use code:
          </p>
          <div style={{
            display: 'inline-block',
            backgroundColor: '#ffffff',
            padding: '10px 20px',
            borderRadius: '6px',
            fontFamily: 'monospace',
            fontSize: '18px',
            fontWeight: 700,
            letterSpacing: '2px',
            color: '#1e293b',
          }}>
            {discountCode}
          </div>
        </div>
      )}

      {/* Cart items */}
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{
          fontSize: '16px',
          fontWeight: 600,
          color: '#1e293b',
          margin: '0 0 16px 0',
        }}>
          Your Cart Items
        </h2>

        {cartItems.map((item, index) => (
          <EmailProductCard
            key={index}
            title={item.title}
            price={item.price}
            imageUrl={item.imageUrl}
            href={item.productUrl}
          />
        ))}

        <div style={{
          textAlign: 'right',
          padding: '16px 0',
          borderTop: '2px solid #e2e8f0',
        }}>
          <span style={{ color: '#64748b' }}>Cart Total: </span>
          <span style={{ fontSize: '20px', fontWeight: 700, color: '#1e293b' }}>{cartTotal}</span>
        </div>
      </div>

      {/* CTA */}
      <div style={{ textAlign: 'center', marginBottom: '24px' }}>
        <EmailButton href={cartUrl}>
          Complete Your Purchase
        </EmailButton>
      </div>

      {/* Urgency message */}
      {emailNumber === 3 && (
        <p style={{ textAlign: 'center', color: '#ef4444', fontSize: '14px' }}>
          ⏰ This offer expires in 24 hours!
        </p>
      )}

      {/* Social proof */}
      <div style={{
        backgroundColor: '#f8fafc',
        borderRadius: '8px',
        padding: '16px',
        marginTop: '24px',
      }}>
        <p style={{ margin: 0, fontSize: '14px', color: '#64748b', textAlign: 'center', fontStyle: 'italic' }}>
          &ldquo;These handcrafted pieces are absolutely stunning. The quality is exceptional!&rdquo;
          <br />
          <span style={{ fontWeight: 600 }}>— Sarah M., Verified Buyer</span>
        </p>
      </div>
    </EmailLayout>
  );
}

export default AbandonedCartEmail;
