import * as React from 'react';
import { EmailLayout, EmailButton, EmailProductCard } from './email-layout';

interface FeaturedProduct {
  title: string;
  price: string;
  imageUrl?: string;
  productUrl: string;
}

interface WinbackEmailProps {
  firstName: string;
  daysSinceLastPurchase: number;
  lastPurchaseTitle?: string;
  discountCode: string;
  discountPercent: number;
  featuredProducts: FeaturedProduct[];
}

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

export function WinbackEmail({
  firstName,
  daysSinceLastPurchase,
  lastPurchaseTitle,
  discountCode,
  discountPercent,
  featuredProducts,
}: WinbackEmailProps) {
  const monthsAgo = Math.floor(daysSinceLastPurchase / 30);
  const timeAgoText = monthsAgo === 1 ? 'a month' : `${monthsAgo} months`;

  return (
    <EmailLayout previewText={`We miss you, ${firstName}! Here's ${discountPercent}% off to welcome you back.`}>
      <h1 style={{
        fontSize: '28px',
        fontWeight: 700,
        color: '#1e293b',
        margin: '0 0 16px 0',
        textAlign: 'center',
      }}>
        We Miss You, {firstName}! 💔
      </h1>

      <p style={{ textAlign: 'center', color: '#64748b', marginBottom: '16px' }}>
        It&apos;s been {timeAgoText} since your last visit
        {lastPurchaseTitle && <> when you got your <strong>{lastPurchaseTitle}</strong></>}.
        We&apos;ve been busy adding new handcrafted treasures, and we&apos;d love to see you again!
      </p>

      {/* Discount offer */}
      <div style={{
        backgroundColor: '#fef2f2',
        border: '2px solid #fecaca',
        borderRadius: '12px',
        padding: '24px',
        textAlign: 'center',
        marginBottom: '32px',
      }}>
        <p style={{ margin: '0 0 8px 0', color: '#dc2626', fontWeight: 600 }}>
          Welcome Back Gift
        </p>
        <p style={{
          fontSize: '36px',
          fontWeight: 700,
          color: '#b91c1c',
          margin: '0 0 8px 0',
        }}>
          {discountPercent}% OFF
        </p>
        <p style={{ margin: '0 0 16px 0', color: '#64748b' }}>
          Use code at checkout:
        </p>
        <div style={{
          display: 'inline-block',
          backgroundColor: '#ffffff',
          padding: '12px 24px',
          borderRadius: '8px',
          fontFamily: 'monospace',
          fontSize: '20px',
          fontWeight: 700,
          letterSpacing: '2px',
          color: '#1e293b',
        }}>
          {discountCode}
        </div>
        <p style={{ margin: '16px 0 0 0', color: '#dc2626', fontSize: '14px' }}>
          ⏰ Valid for 7 days only!
        </p>
      </div>

      {/* What's new section */}
      <div style={{ marginBottom: '32px' }}>
        <h2 style={{
          fontSize: '18px',
          fontWeight: 600,
          color: '#1e293b',
          margin: '0 0 16px 0',
        }}>
          What&apos;s New Since You Left
        </h2>

        <div style={{
          backgroundColor: '#f8fafc',
          borderRadius: '8px',
          padding: '16px',
          marginBottom: '16px',
        }}>
          <table role="presentation" width="100%" style={{ borderCollapse: 'collapse' }}>
            <tbody>
              <tr>
                <td style={{ padding: '8px 0', verticalAlign: 'top', width: '24px' }}>
                  <span style={{ color: '#C8642A' }}>✨</span>
                </td>
                <td style={{ padding: '8px 0', color: '#475569' }}>
                  <strong>New Collections</strong> — Fresh arrivals from talented artisans
                </td>
              </tr>
              <tr>
                <td style={{ padding: '8px 0', verticalAlign: 'top' }}>
                  <span style={{ color: '#C8642A' }}>🎁</span>
                </td>
                <td style={{ padding: '8px 0', color: '#475569' }}>
                  <strong>Loyalty Rewards</strong> — Earn points on every purchase
                </td>
              </tr>
              <tr>
                <td style={{ padding: '8px 0', verticalAlign: 'top' }}>
                  <span style={{ color: '#C8642A' }}>🚚</span>
                </td>
                <td style={{ padding: '8px 0', color: '#475569' }}>
                  <strong>Free Shipping</strong> — On orders over $75
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Featured products */}
      {featuredProducts.length > 0 && (
        <div style={{ marginBottom: '32px' }}>
          <h2 style={{
            fontSize: '18px',
            fontWeight: 600,
            color: '#1e293b',
            margin: '0 0 16px 0',
          }}>
            Picked Just for You
          </h2>

          {featuredProducts.map((product, index) => (
            <EmailProductCard
              key={index}
              title={product.title}
              price={product.price}
              imageUrl={product.imageUrl}
              href={product.productUrl}
            />
          ))}
        </div>
      )}

      {/* CTA */}
      <div style={{ textAlign: 'center' }}>
        <EmailButton href={`${baseUrl}/collections?discount=${discountCode}`}>
          Shop Now & Save {discountPercent}%
        </EmailButton>
      </div>

      {/* Unsubscribe note */}
      <p style={{
        textAlign: 'center',
        marginTop: '32px',
        fontSize: '12px',
        color: '#94a3b8',
      }}>
        If you no longer wish to receive promotional emails, you can update your
        {' '}<a href={`${baseUrl}/account/preferences`} style={{ color: '#b05523' }}>email preferences</a>.
      </p>
    </EmailLayout>
  );
}

export default WinbackEmail;
