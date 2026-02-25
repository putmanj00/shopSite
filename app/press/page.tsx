import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { BotanicalHeader } from '@/components/ui/botanical-header';

export const metadata: Metadata = {
    title: 'Press | Wildenflower',
    description: 'Wildenflower in the news — media features, press mentions, and press inquiry information.',
};

const pressFeatures = [
    {
        publication: 'Vogue',
        quote: '"A treasure trove of handcrafted wonders — Wildenflower brings artisan craft back into the spotlight."',
        date: 'December 2025',
    },
    {
        publication: 'Forbes',
        quote: '"Leading the artisan renaissance, Wildenflower proves that ethical sourcing and beautiful design aren\'t mutually exclusive."',
        date: 'October 2025',
    },
    {
        publication: 'Architectural Digest',
        quote: '"From natural dye textiles to hand-stitched leather goods, every piece tells a story of craftsmanship."',
        date: 'August 2025',
    },
];

const mediaLogos = [
    'Vogue', 'Forbes', 'Elle', 'Architectural Digest',
    'The New York Times', 'Refinery29', 'Domino', 'Who What Wear',
];

export default function PressPage() {
    return (
        <>
            <BotanicalHeader />

            {/* Hero */}
            <section className="bg-parchment py-20 lg:py-28">
                <div className="container mx-auto px-4 max-w-4xl text-center">
                    <span className="text-terracotta font-medium text-sm uppercase tracking-wider">
                        In the Press
                    </span>
                    <h1 className="mt-3 text-4xl font-bold font-heading text-ink-brown sm:text-5xl lg:text-6xl">
                        As Seen In
                    </h1>
                    <p className="mt-6 text-xl text-earth leading-relaxed max-w-2xl mx-auto">
                        We&apos;re honored to be featured by some of the world&apos;s leading publications
                        for our commitment to artisan craftsmanship and sustainable design.
                    </p>
                </div>
            </section>

            {/* Logo Grid */}
            <section className="bg-white py-16 lg:py-20">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 items-center justify-items-center max-w-4xl mx-auto">
                        {mediaLogos.map((name) => (
                            <div
                                key={name}
                                className="px-6 py-4 text-center opacity-60 hover:opacity-100 transition-opacity"
                            >
                                <span className="text-lg font-heading font-bold text-ink-brown/70">{name}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Featured Quotes */}
            <section className="bg-parchment py-16 lg:py-24">
                <div className="container mx-auto px-4 max-w-4xl">
                    <div className="text-center mb-14">
                        <h2 className="text-3xl font-bold font-heading text-ink-brown sm:text-4xl">
                            What They&apos;re Saying
                        </h2>
                    </div>
                    <div className="space-y-8">
                        {pressFeatures.map((feature, i) => (
                            <blockquote
                                key={i}
                                className="bg-white p-8 rounded-2xl shadow-sm relative"
                            >
                                <svg
                                    className="absolute top-6 left-6 w-8 h-8 text-gold/40"
                                    fill="currentColor"
                                    viewBox="0 0 32 32"
                                    aria-hidden="true"
                                >
                                    <path d="M9.352 4C4.456 7.456 1 13.12 1 19.36c0 5.088 3.072 8.064 6.624 8.064 3.36 0 5.856-2.688 5.856-5.856 0-3.168-2.208-5.472-5.088-5.472-.576 0-1.344.096-1.536.192.48-3.264 3.552-7.104 6.624-9.024L9.352 4zm16.512 0c-4.8 3.456-8.256 9.12-8.256 15.36 0 5.088 3.072 8.064 6.624 8.064 3.264 0 5.856-2.688 5.856-5.856 0-3.168-2.304-5.472-5.184-5.472-.576 0-1.248.096-1.44.192.48-3.264 3.456-7.104 6.528-9.024L25.864 4z" />
                                </svg>
                                <p className="text-xl font-medium text-ink-brown italic pl-12 leading-relaxed">
                                    {feature.quote}
                                </p>
                                <div className="mt-4 pl-12 flex items-center justify-between">
                                    <cite className="text-terracotta font-semibold not-italic">
                                        — {feature.publication}
                                    </cite>
                                    <span className="text-earth/60 text-sm">{feature.date}</span>
                                </div>
                            </blockquote>
                        ))}
                    </div>
                </div>
            </section>

            {/* Press Inquiries */}
            <section className="bg-forest text-parchment py-16 lg:py-20">
                <div className="container mx-auto px-4 max-w-2xl text-center">
                    <h2 className="text-3xl font-bold font-heading sm:text-4xl mb-6">
                        Press Inquiries
                    </h2>
                    <p className="text-parchment/80 leading-relaxed mb-8">
                        For media inquiries, interview requests, or high-resolution images,
                        please contact our press team.
                    </p>
                    <a
                        href="mailto:press@wildenflower.com"
                        className="inline-flex items-center px-6 py-3 bg-terracotta hover:bg-terracotta/90 text-white font-semibold rounded-lg transition-colors"
                    >
                        press@wildenflower.com
                    </a>
                    <p className="mt-6 text-parchment/50 text-sm">
                        We typically respond to press inquiries within 24 hours.
                    </p>
                </div>
            </section>
        </>
    );
}
