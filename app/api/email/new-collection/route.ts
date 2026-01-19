import { NextRequest, NextResponse } from 'next/server';
import { sendEmail } from '@/lib/email';
import { NewCollectionEmail } from '@/components/emails/new-collection-email';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      email,
      firstName,
      collectionName,
      collectionDescription,
      collectionUrl,
      heroImageUrl,
      featuredProducts,
      isEarlyAccess,
      launchDate,
    } = body;

    if (!email || !firstName || !collectionName || !collectionDescription || !collectionUrl) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const subjectPrefix = isEarlyAccess ? '🔓 Early Access: ' : '';

    const result = await sendEmail({
      to: email,
      subject: `${subjectPrefix}Introducing our new ${collectionName} collection`,
      react: NewCollectionEmail({
        firstName,
        collectionName,
        collectionDescription,
        collectionUrl,
        heroImageUrl,
        featuredProducts: featuredProducts || [],
        isEarlyAccess,
        launchDate,
      }),
    });

    if (result.success) {
      return NextResponse.json({ success: true, id: result.id });
    } else {
      throw result.error;
    }
  } catch (error) {
    console.error('New collection email error:', error);
    return NextResponse.json(
      { error: 'Failed to send email' },
      { status: 500 }
    );
  }
}
