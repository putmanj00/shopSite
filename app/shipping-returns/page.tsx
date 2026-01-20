import ComingSoon from '@/components/coming-soon';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Shipping & Returns | Wildenflower',
    description: 'Information about our shipping policies and return process.',
};

export default function ShippingPage() {
    return <ComingSoon title="Shipping & Returns" description="Detailed shipping information will be available here shortly." />;
}
