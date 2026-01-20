import ComingSoon from '@/components/coming-soon';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Blog | Wildenflower',
    description: 'Stories from the artisan community and bohemian lifestyle tips.',
};

export default function BlogPage() {
    return <ComingSoon title="Journal" description="Our blog features stories from our artisans and lifestyle inspiration. First post coming soon!" />;
}
