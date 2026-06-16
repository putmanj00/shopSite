import * as React from 'react';
import { EmailLayout, EmailButton } from './email-layout';

interface WelcomeEmailProps {
  firstName: string;
  discountCode?: string;
  discountPercent?: number;
}

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

export function WelcomeEmail({
  firstName,
  discountCode = 'WELCOME15',
  discountPercent = 15,
}: WelcomeEmailProps) {
  return (
    <EmailLayout previewText={`Welcome to Wildenflower, ${firstName}! Enjoy ${discountPercent}% off your first order.`}>
      {/* Welcome message */}
      <h1 style={{
        fontSize: '28px',
        fontWeight: 700,
        color: '#1e293b',
        margin: '0 0 16px 0',
        textAlign: 'center',
      }}>
        Welcome to the Family, {firstName}!
      </h1>

      <p style={{ textAlign: 'center', color: '#64748b', marginBottom: '32px' }}>
        We&apos;re so excited to have you join our community of artisan craft lovers.
      </p>

      {/* Discount banner */}
      <div style={{
        backgroundColor: '#FDF8F3', // Warm Cream
        border: '2px dashed #C9A642', // Gold
        borderRadius: '12px',
        padding: '24px',
        textAlign: 'center',
        marginBottom: '32px',
      }}>
        <p style={{ margin: '0 0 8px 0', color: '#b05523', fontWeight: 600 }}>
          Your Exclusive Welcome Gift
        </p>
        <p style={{
          fontSize: '32px',
          fontWeight: 700,
          color: '#C8642A',
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
      </div>

      {/* Our story */}
      <div style={{ marginBottom: '32px' }}>
        <h2 style={{
          fontSize: '20px',
          fontWeight: 600,
          color: '#1e293b',
          margin: '0 0 16px 0',
        }}>
          Our Story
        </h2>
        <p style={{ color: '#475569', margin: '0 0 16px 0' }}>
          Wildenflower celebrates the wild beauty of handmade craftsmanship. Every piece in our
          collection tells a story — of makers who pour their souls into their work, of sustainable
          practices, and of authentic artistry that mass production can never replicate.
        </p>
        <p style={{ color: '#475569', margin: 0 }}>
          When you shop with us, you&apos;re not just buying a product — you&apos;re supporting
          independent artists and preserving traditional craftsmanship for future generations.
        </p>
      </div>

      {/* What to expect */}
      <div style={{
        backgroundColor: '#f8fafc',
        borderRadius: '12px',
        padding: '24px',
        marginBottom: '32px',
      }}>
        <h2 style={{
          fontSize: '18px',
          fontWeight: 600,
          color: '#1e293b',
          margin: '0 0 16px 0',
        }}>
          What You Can Expect
        </h2>
        <table role="presentation" width="100%" style={{ borderCollapse: 'collapse' }}>
          <tbody>
            <tr>
              <td style={{ padding: '8px 0', verticalAlign: 'top' }}>
                <span style={{ color: '#C8642A', marginRight: '8px' }}>✨</span>
              </td>
              <td style={{ padding: '8px 0', color: '#475569' }}>
                Early access to new collections
              </td>
            </tr>
            <tr>
              <td style={{ padding: '8px 0', verticalAlign: 'top' }}>
                <span style={{ color: '#C8642A', marginRight: '8px' }}>🎁</span>
              </td>
              <td style={{ padding: '8px 0', color: '#475569' }}>
                Exclusive member-only discounts
              </td>
            </tr>
            <tr>
              <td style={{ padding: '8px 0', verticalAlign: 'top' }}>
                <span style={{ color: '#C8642A', marginRight: '8px' }}>📖</span>
              </td>
              <td style={{ padding: '8px 0', color: '#475569' }}>
                Behind-the-scenes artisan stories
              </td>
            </tr>
            <tr>
              <td style={{ padding: '8px 0', verticalAlign: 'top' }}>
                <span style={{ color: '#C8642A', marginRight: '8px' }}>💝</span>
              </td>
              <td style={{ padding: '8px 0', color: '#475569' }}>
                Special birthday surprises
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* CTA */}
      <div style={{ textAlign: 'center' }}>
        <EmailButton href={`${baseUrl}/collections`}>
          Start Shopping Now
        </EmailButton>
      </div>
    </EmailLayout>
  );
}

export default WelcomeEmail;
