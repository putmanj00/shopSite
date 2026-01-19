import { NextRequest, NextResponse } from 'next/server';
import { sendEmail } from '@/lib/email';
import { LoyaltyUpgradeEmail } from '@/components/emails/loyalty-upgrade-email';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      email,
      firstName,
      newTier,
      totalPoints,
      newBenefits,
    } = body;

    if (!email || !firstName || !newTier || typeof totalPoints !== 'number' || !newBenefits) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const tierNames: Record<string, string> = {
      bronze: 'Bronze',
      silver: 'Silver',
      gold: 'Gold',
      platinum: 'Platinum',
    };

    if (!tierNames[newTier]) {
      return NextResponse.json(
        { error: 'Invalid tier. Must be bronze, silver, gold, or platinum' },
        { status: 400 }
      );
    }

    const result = await sendEmail({
      to: email,
      subject: `Congratulations! You've reached ${tierNames[newTier]} status! 🎉`,
      react: LoyaltyUpgradeEmail({
        firstName,
        newTier: newTier as 'bronze' | 'silver' | 'gold' | 'platinum',
        totalPoints,
        newBenefits,
      }),
    });

    if (result.success) {
      return NextResponse.json({ success: true, id: result.id });
    } else {
      throw result.error;
    }
  } catch (error) {
    console.error('Loyalty upgrade email error:', error);
    return NextResponse.json(
      { error: 'Failed to send email' },
      { status: 500 }
    );
  }
}
