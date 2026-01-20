import type { Metadata } from 'next';
import AboutHero from '@/components/about/about-hero';
import BrandTimeline from '@/components/about/brand-timeline';
import MeetTheMakers from '@/components/about/meet-the-makers';
import VideoShowcase from '@/components/about/video-showcase';
import BehindTheScenes from '@/components/about/behind-the-scenes';
import MissionValues from '@/components/about/mission-values';
import Sustainability from '@/components/about/sustainability';
import PressMentions from '@/components/about/press-mentions';

export const metadata: Metadata = {
    title: 'Our Story | Wildenflower',
    description:
        'Born from a love of the untamed. Discover the Wildenflower story, meet our artisan partners, and explore our commitment to handpicked treasures crafted with intention.',
    openGraph: {
        title: 'Our Story | Wildenflower',
        description:
            'Born from a love of the untamed. Discover the Wildenflower story and meet our artisan partners.',
        type: 'website',
        images: [
            {
                url: 'https://images.unsplash.com/photo-1599643478518-17488fbbcd75?w=1200&h=630&fit=crop',
                width: 1200,
                height: 630,
                alt: 'Artisan workshop with handcrafted treasures',
            },
        ],
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Our Story | Wildenflower',
        description:
            'Born from a love of the untamed. Discover the Wildenflower story and meet our artisan partners.',
    },
};

export default function AboutPage() {
    return (
        <>
            {/* Hero Section with Founder Story */}
            <AboutHero />

            {/* Company Timeline */}
            <BrandTimeline />

            {/* Meet the Makers */}
            <MeetTheMakers />

            {/* Video Showcase */}
            <VideoShowcase />

            {/* Behind the Scenes Gallery */}
            <BehindTheScenes />

            {/* Mission and Values */}
            <MissionValues />

            {/* Sustainability */}
            <Sustainability />

            {/* Press Mentions */}
            <PressMentions />
        </>
    );
}
