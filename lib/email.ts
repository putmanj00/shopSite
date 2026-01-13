import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY || 're_mock_key'); // Prevents crash on init if missing

interface SendEmailParams {
  to: string;
  subject: string;
  react: React.ReactElement;
}

export async function sendEmail({ to, subject, react }: SendEmailParams) {
  // Mock Mode: If no API key is set in production/dev, or if explicitly in a test environment
  const isMockMode = !process.env.RESEND_API_KEY || process.env.RESEND_API_KEY.startsWith('re_mock');

  if (isMockMode) {
    console.log('----------------------------------------------------');
    console.log('📧 [MOCK EMAIL SENT]');
    console.log(`To: ${to}`);
    console.log(`Subject: ${subject}`);
    console.log('Content (React Component):', react); // In a real app we might render this to string, but logging the component object is enough to verify data flow
    console.log('----------------------------------------------------');
    
    return { success: true, id: 'mock-email-id' };
  }

  try {
    const data = await resend.emails.send({
      from: 'ShopSite <onboarding@resend.dev>', // Default Resend test domain
      to,
      subject,
      react,
    });
    
    return { success: true, id: data.data?.id };
  } catch (error) {
    console.error('Failed to send email:', error);
    return { success: false, error };
  }
}
