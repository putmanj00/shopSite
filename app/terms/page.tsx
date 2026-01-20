import ComingSoon from '@/components/coming-soon';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Terms of Service | Wildenflower',
    description: 'Terms and conditions for using our website.',
};

export default function TermsPage() {
    return <ComingSoon title="Terms of Service" description="Our terms of service are being updated." />;
}
