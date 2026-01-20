import ComingSoon from '@/components/coming-soon';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Sustainability | Wildenflower',
    description: 'Our commitment to ethical sourcing and environmental responsibility.',
};

export default function SustainabilityPage() {
    return <ComingSoon title="Sustainability" description="Learn about our eco-friendly practices and ethical sourcing soon." />;
}
