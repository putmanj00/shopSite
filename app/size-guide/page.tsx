import ComingSoon from '@/components/coming-soon';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Size Guide | Wildenflower',
    description: 'Size charts and fitting guides for our apparel and jewelry.',
};

export default function SizeGuidePage() {
    return <ComingSoon title="Size Guide" description="Detailed size charts for all our products are coming soon." />;
}
