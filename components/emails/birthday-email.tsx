import * as React from 'react';
import { EmailLayout, EmailButton } from './email-layout';

interface BirthdayEmailProps {
  firstName: string;
  discountCode: string;
  discountPercent: number;
  expiryDays?: number;
}

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

export function BirthdayEmail({
  firstName,
  discountCode,
  discountPercent,
  expiryDays = 7,
}: BirthdayEmailProps) {
  return (
    <EmailLayout previewText={`Happy Birthday, ${firstName}! 🎂 Enjoy ${discountPercent}% off as our gift to you.`}>
      {/* Birthday header */}
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <div style={{
          fontSize: '60px',
          marginBottom: '16px',
        }}>
          🎂
        </div>

        <h1 style={{
          fontSize: '32px',
          fontWeight: 700,
          background: 'linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          margin: '0 0 16px 0',
          color: '#ec4899', // Fallback for email clients that don't support gradients
        }}>
          Happy Birthday, {firstName}!
        </h1>

        <p style={{ color: '#64748b', fontSize: '18px', marginBottom: '0' }}>
          It&apos;s your special day, and we want to celebrate with you!
        </p>
      </div>

      {/* Birthday discount */}
      <div style={{
        background: 'linear-gradient(135deg, #fdf4ff 0%, #faf5ff 100%)',
        border: '2px solid #e879f9',
        borderRadius: '16px',
        padding: '32px',
        textAlign: 'center',
        marginBottom: '32px',
      }}>
        <p style={{
          margin: '0 0 8px 0',
          color: '#a855f7',
          fontWeight: 600,
          textTransform: 'uppercase',
          fontSize: '14px',
          letterSpacing: '1px',
        }}>
          Your Birthday Gift
        </p>
        <p style={{
          fontSize: '48px',
          fontWeight: 700,
          color: '#9333ea',
          margin: '0 0 8px 0',
        }}>
          {discountPercent}% OFF
        </p>
        <p style={{ margin: '0 0 20px 0', color: '#7e22ce' }}>
          Everything in store!
        </p>

        <div style={{
          display: 'inline-block',
          backgroundColor: '#ffffff',
          padding: '16px 32px',
          borderRadius: '12px',
          fontFamily: 'monospace',
          fontSize: '24px',
          fontWeight: 700,
          letterSpacing: '3px',
          color: '#9333ea',
          boxShadow: '0 2px 8px rgba(147, 51, 234, 0.15)',
        }}>
          {discountCode}
        </div>

        <p style={{
          margin: '20px 0 0 0',
          color: '#a855f7',
          fontSize: '14px',
        }}>
          🎁 Valid for {expiryDays} days from your birthday
        </p>
      </div>

      {/* Birthday wishes */}
      <div style={{
        backgroundColor: '#fefce8',
        borderRadius: '12px',
        padding: '24px',
        textAlign: 'center',
        marginBottom: '32px',
      }}>
        <p style={{
          margin: 0,
          color: '#854d0e',
          fontStyle: 'italic',
          fontSize: '16px',
          lineHeight: 1.6,
        }}>
          &ldquo;May this year bring you joy, creativity, and beautiful handcrafted
          treasures to brighten your days. Thank you for being part of our artisan family!&rdquo;
        </p>
        <p style={{
          margin: '12px 0 0 0',
          color: '#a16207',
          fontWeight: 600,
        }}>
          — The Artisan Collective Team
        </p>
      </div>

      {/* CTA */}
      <div style={{ textAlign: 'center' }}>
        <EmailButton href={`${baseUrl}/collections?discount=${discountCode}`}>
          Treat Yourself Today 🎉
        </EmailButton>
      </div>

      {/* Confetti decoration (emoji row) */}
      <p style={{
        textAlign: 'center',
        marginTop: '32px',
        fontSize: '24px',
        letterSpacing: '8px',
      }}>
        🎈🎁🎂🎉🌟
      </p>
    </EmailLayout>
  );
}

export default BirthdayEmail;
