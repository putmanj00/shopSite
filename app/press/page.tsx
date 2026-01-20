import ComingSoon from '@/components/coming-soon';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Press | Wildenflower',
    description: 'Wildenflower in the news.',
};

export default function PressPage() {
    return <ComingSoon title="Press" description="Media features and press releases will be listed here." />;
}
