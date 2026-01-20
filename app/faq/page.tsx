import ComingSoon from '@/components/coming-soon';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'FAQ | Wildenflower',
    description: 'Frequently asked questions about Wildenflower products and services.',
};

export default function FAQPage() {
    return <ComingSoon title="Frequently Asked Questions" description="We are compiling a list of common questions to help you better." />;
}
