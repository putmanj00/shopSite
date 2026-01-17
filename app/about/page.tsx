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
    title: 'About Us | Artisan Collective',
    description:
        'Discover the story behind Artisan Collective. Meet our talented artisans, learn about our commitment to handcrafted quality, and explore our sustainable practices.',
    openGraph: {
        title: 'About Us | Artisan Collective',
        description:
            'Discover the story behind Artisan Collective. Meet our talented artisans and learn about our commitment to handcrafted quality.',
        type: 'website',
        images: [
            {
                url: 'https://images.unsplash.com/photo-1452860606245-08befc0ff44b?w=1200&h=630&fit=crop',
                width: 1200,
                height: 630,
                alt: 'Artisan workshop',
            },
        ],
    },
    twitter: {
        card: 'summary_large_image',
        title: 'About Us | Artisan Collective',
        description:
            'Discover the story behind Artisan Collective. Meet our talented artisans and learn about our commitment to handcrafted quality.',
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
