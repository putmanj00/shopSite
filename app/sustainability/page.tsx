import type { Metadata } from 'next';
import Image from 'next/image';
import { BotanicalHeader } from '@/components/ui/botanical-header';

export const metadata: Metadata = {
    title: 'Sustainability | Wildenflower',
    description: 'Our commitment to ethical sourcing, eco-friendly materials, and supporting artisan communities worldwide.',
};

const practices = [
    {
        icon: '🌿',
        title: 'Natural Dyes',
        description: 'Plant-based dyes for our tie-dye collection, avoiding harmful chemicals and reducing water pollution.',
    },
    {
        icon: '🐄',
        title: 'Ethical Leather',
        description: 'Vegetable-tanned leather from certified sustainable sources with full supply chain transparency.',
    },
    {
        icon: '♻️',
        title: 'Recycled Metals',
        description: 'Jewelry crafted with recycled gold and silver to reduce the environmental impact of mining.',
    },
    {
        icon: '📦',
        title: 'Eco Packaging',
        description: 'Recyclable and biodegradable packaging materials for all shipments — zero single-use plastics.',
    },
    {
        icon: '🌍',
        title: 'Carbon Neutral',
        description: 'Offsetting 100% of shipping emissions through verified reforestation and clean energy programs.',
    },
    {
        icon: '💛',
        title: 'Fair Wages',
        description: 'All artisans receive above-market compensation, ensuring dignified livelihoods for their families.',
    },
];

const milestones = [
    { year: '2021', text: 'Switched to 100% recycled packaging materials' },
    { year: '2022', text: 'Achieved carbon neutral shipping across all orders' },
    { year: '2023', text: 'Launched artisan cooperative partnership program' },
    { year: '2024', text: 'Certified B Corp — meeting highest social & environmental standards' },
    { year: '2025', text: 'Introduced plant-based dye collection, eliminating synthetic chemicals' },
];

export default function SustainabilityPage() {
    return (
        <>
            <BotanicalHeader />

            {/* Hero */}
            <section className="bg-forest text-parchment py-20 lg:py-28">
                <div className="container mx-auto px-4 max-w-4xl text-center">
                    <span className="text-gold font-medium text-sm uppercase tracking-wider">
                        Our Commitment
                    </span>
                    <h1 className="mt-3 text-4xl font-bold font-heading sm:text-5xl lg:text-6xl">
                        Sustainability & Ethical Sourcing
                    </h1>
                    <p className="mt-6 text-xl text-parchment/80 leading-relaxed max-w-2xl mx-auto">
                        We believe beautiful products shouldn&apos;t come at the cost of our
                        planet or people. Every material we use is carefully selected for
                        its environmental and social impact.
                    </p>
                </div>
            </section>

            {/* Practices Grid */}
            <section className="bg-parchment py-16 lg:py-24">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-14">
                        <span className="text-terracotta font-medium text-sm uppercase tracking-wider">
                            How We Work
                        </span>
                        <h2 className="mt-3 text-3xl font-bold font-heading text-ink-brown sm:text-4xl">
                            Our Sustainable Practices
                        </h2>
                    </div>
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 max-w-5xl mx-auto">
                        {practices.map((practice) => (
                            <div
                                key={practice.title}
                                className="bg-white p-6 rounded-2xl shadow-sm text-center"
                            >
                                <span className="text-3xl mb-4 block">{practice.icon}</span>
                                <h3 className="text-lg font-semibold text-ink-brown mb-2">{practice.title}</h3>
                                <p className="text-earth text-sm leading-relaxed">{practice.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Impact Numbers */}
            <section className="bg-sage/10 py-16 lg:py-20">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold font-heading text-ink-brown sm:text-4xl">
                            Our Impact
                        </h2>
                    </div>
                    <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4 max-w-4xl mx-auto text-center">
                        <div>
                            <p className="text-4xl font-bold text-terracotta">100%</p>
                            <p className="mt-2 text-earth text-sm">Carbon Neutral Shipping</p>
                        </div>
                        <div>
                            <p className="text-4xl font-bold text-terracotta">200+</p>
                            <p className="mt-2 text-earth text-sm">Artisan Partners</p>
                        </div>
                        <div>
                            <p className="text-4xl font-bold text-terracotta">0</p>
                            <p className="mt-2 text-earth text-sm">Single-Use Plastics</p>
                        </div>
                        <div>
                            <p className="text-4xl font-bold text-terracotta">15</p>
                            <p className="mt-2 text-earth text-sm">Countries Represented</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Timeline */}
            <section className="bg-parchment py-16 lg:py-24">
                <div className="container mx-auto px-4 max-w-3xl">
                    <div className="text-center mb-14">
                        <span className="text-terracotta font-medium text-sm uppercase tracking-wider">
                            Our Journey
                        </span>
                        <h2 className="mt-3 text-3xl font-bold font-heading text-ink-brown sm:text-4xl">
                            Sustainability Milestones
                        </h2>
                    </div>
                    <div className="space-y-8">
                        {milestones.map((milestone, i) => (
                            <div key={i} className="flex gap-6 items-start">
                                <div className="flex-shrink-0 w-16 text-right">
                                    <span className="text-lg font-bold text-terracotta">{milestone.year}</span>
                                </div>
                                <div className="flex-shrink-0 w-3 h-3 rounded-full bg-sage mt-2" />
                                <p className="text-earth leading-relaxed">{milestone.text}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Certifications */}
            <section className="bg-forest text-parchment py-16 lg:py-20">
                <div className="container mx-auto px-4 text-center">
                    <h2 className="text-3xl font-bold font-heading sm:text-4xl mb-8">
                        Our Certifications
                    </h2>
                    <div className="flex flex-wrap justify-center gap-4 max-w-2xl mx-auto">
                        <span className="inline-flex items-center px-5 py-3 rounded-full bg-forest/80 border border-gold/30 text-parchment/90 text-sm font-medium">
                            🌱 Certified B Corp
                        </span>
                        <span className="inline-flex items-center px-5 py-3 rounded-full bg-forest/80 border border-gold/30 text-parchment/90 text-sm font-medium">
                            ♻️ 1% for the Planet
                        </span>
                        <span className="inline-flex items-center px-5 py-3 rounded-full bg-forest/80 border border-gold/30 text-parchment/90 text-sm font-medium">
                            🤝 Fair Trade Certified
                        </span>
                        <span className="inline-flex items-center px-5 py-3 rounded-full bg-forest/80 border border-gold/30 text-parchment/90 text-sm font-medium">
                            🌊 Ocean Positive
                        </span>
                    </div>
                    <p className="mt-8 text-parchment/60 text-sm max-w-xl mx-auto">
                        We hold ourselves to the highest standards of social and environmental performance,
                        accountability, and transparency.
                    </p>
                </div>
            </section>
        </>
    );
}
