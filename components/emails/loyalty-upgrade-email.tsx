import * as React from 'react';
import { EmailLayout, EmailButton } from './email-layout';

type LoyaltyTier = 'bronze' | 'silver' | 'gold' | 'platinum';

interface TierBenefit {
  icon: string;
  title: string;
  description: string;
}

interface LoyaltyUpgradeEmailProps {
  firstName: string;
  newTier: LoyaltyTier;
  totalPoints: number;
  newBenefits: TierBenefit[];
}

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

const tierConfig: Record<LoyaltyTier, { name: string; color: string; bgColor: string; emoji: string }> = {
  bronze: {
    name: 'Bronze',
    color: '#b45309',
    bgColor: '#fef3c7',
    emoji: '🥉',
  },
  silver: {
    name: 'Silver',
    color: '#64748b',
    bgColor: '#f1f5f9',
    emoji: '🥈',
  },
  gold: {
    name: 'Gold',
    color: '#ca8a04',
    bgColor: '#fef9c3',
    emoji: '🥇',
  },
  platinum: {
    name: 'Platinum',
    color: '#475569',
    bgColor: '#e2e8f0',
    emoji: '💎',
  },
};

export function LoyaltyUpgradeEmail({
  firstName,
  newTier,
  totalPoints,
  newBenefits,
}: LoyaltyUpgradeEmailProps) {
  const tier = tierConfig[newTier];

  return (
    <EmailLayout previewText={`Congratulations ${firstName}! You've reached ${tier.name} status! 🎉`}>
      {/* Celebration header */}
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <div style={{
          fontSize: '60px',
          marginBottom: '16px',
        }}>
          🎊 {tier.emoji} 🎊
        </div>

        <h1 style={{
          fontSize: '28px',
          fontWeight: 700,
          color: '#1e293b',
          margin: '0 0 16px 0',
        }}>
          You&apos;ve Leveled Up!
        </h1>

        <p style={{ color: '#64748b', fontSize: '18px', marginBottom: '0' }}>
          Congratulations {firstName}, you&apos;ve reached <strong style={{ color: tier.color }}>{tier.name}</strong> status!
        </p>
      </div>

      {/* Tier badge */}
      <div style={{
        backgroundColor: tier.bgColor,
        borderRadius: '16px',
        padding: '32px',
        textAlign: 'center',
        marginBottom: '32px',
      }}>
        <p style={{
          margin: '0 0 8px 0',
          color: tier.color,
          fontWeight: 600,
          textTransform: 'uppercase',
          fontSize: '14px',
          letterSpacing: '1px',
        }}>
          Your New Status
        </p>
        <p style={{
          fontSize: '40px',
          fontWeight: 700,
          color: tier.color,
          margin: '0 0 16px 0',
        }}>
          {tier.name} Member
        </p>
        <p style={{ margin: 0, color: tier.color }}>
          {totalPoints.toLocaleString()} points earned
        </p>
      </div>

      {/* New benefits */}
      <div style={{ marginBottom: '32px' }}>
        <h2 style={{
          fontSize: '18px',
          fontWeight: 600,
          color: '#1e293b',
          margin: '0 0 16px 0',
        }}>
          Your New Benefits
        </h2>

        <div style={{
          backgroundColor: '#f0fdf4',
          borderRadius: '12px',
          padding: '20px',
        }}>
          {newBenefits.map((benefit, index) => (
            <div
              key={index}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '12px',
                marginBottom: index < newBenefits.length - 1 ? '16px' : '0',
              }}
            >
              <span style={{ fontSize: '24px' }}>{benefit.icon}</span>
              <div>
                <p style={{ margin: '0 0 4px 0', fontWeight: 600, color: '#166534' }}>
                  {benefit.title}
                </p>
                <p style={{ margin: 0, fontSize: '14px', color: '#15803d' }}>
                  {benefit.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* How to use benefits */}
      <div style={{
        padding: '20px',
        border: '1px solid #e2e8f0',
        borderRadius: '8px',
        marginBottom: '32px',
      }}>
        <h3 style={{
          fontSize: '14px',
          fontWeight: 600,
          color: '#1e293b',
          margin: '0 0 12px 0',
        }}>
          How to Use Your Benefits
        </h3>
        <p style={{ margin: 0, fontSize: '14px', color: '#64748b' }}>
          Your new benefits are automatically applied to your account. Discounts will be
          applied at checkout, and you&apos;ll see early access products in your account dashboard.
        </p>
      </div>

      {/* CTA */}
      <div style={{ textAlign: 'center' }}>
        <EmailButton href={`${baseUrl}/account?tab=rewards`}>
          View Your Rewards
        </EmailButton>
      </div>

      {/* Next tier progress (if not platinum) */}
      {newTier !== 'platinum' && (
        <div style={{
          textAlign: 'center',
          marginTop: '32px',
          padding: '16px',
          backgroundColor: '#f8fafc',
          borderRadius: '8px',
        }}>
          <p style={{ margin: 0, fontSize: '14px', color: '#64748b' }}>
            Keep earning points to unlock even more benefits at the next tier!
          </p>
        </div>
      )}

      {/* Thank you message */}
      <p style={{
        textAlign: 'center',
        marginTop: '32px',
        color: '#64748b',
        fontStyle: 'italic',
      }}>
        Thank you for being a valued member of the Artisan Collective family!
      </p>
    </EmailLayout>
  );
}

export default LoyaltyUpgradeEmail;
