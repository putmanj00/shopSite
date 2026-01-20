import ComingSoon from '@/components/coming-soon';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Contact Us | Wildenflower',
    description: 'Get in touch with the Wildenflower team.',
};

export default function ContactPage() {
    return <ComingSoon title="Contact Us" description="Our customer support team is getting ready to help you. In the meantime, please check our FAQ." />;
}
