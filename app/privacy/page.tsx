import ComingSoon from '@/components/coming-soon';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Privacy Policy | Wildenflower',
    description: 'Our privacy policy and data protection practices.',
};

export default function PrivacyPage() {
    return <ComingSoon title="Privacy Policy" description="Our updated privacy policy is being finalized." />;
}
