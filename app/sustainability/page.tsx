import type { Metadata } from 'next';
import { PageHero } from '@/components/ui/page-hero';

export const metadata: Metadata = {
    title: 'Our Approach | Wildenflower',
    description: 'How we work — small batch, handmade, and growing toward better every day.',
};

const practices = [
    {
        icon: '🤲',
        title: 'Handmade & Small Batch',
        description: 'We make in small runs, which naturally reduces overproduction and waste. Every piece is made to order or in limited quantities — we don\'t manufacture excess.',
    },
    {
        icon: '🛡️',
        title: 'Built to Last',
        description: 'We focus on quality so pieces are kept and loved for years, not thrown away. A well-made piece that lasts a decade is more sustainable than any certification.',
    },
    {
        icon: '🧵',
        title: 'Thoughtful Materials',
        description: 'We source quality materials for our leather and metalwork from trusted suppliers. We care about what goes into our work, and we\'re always looking for better options.',
    },
    {
        icon: '📦',
        title: 'Eco Packaging',
        description: 'We use recyclable packaging where possible and avoid unnecessary materials. No excess tissue paper, no plastic wrap — just what the piece needs to arrive safely.',
    },
    {
        icon: '💛',
        title: 'Honest Craft',
        description: 'We use professional-grade dyes for our tie-dye work. We\'re not greenwashing — we\'re a small studio doing our best and being honest about where we are.',
    },
    {
        icon: '🌱',
        title: 'Growing Toward Better',
        description: 'We\'re a small business actively exploring how we can reduce our footprint as we grow. This page will evolve as we do. We\'d rather be honest than claim more than we\'ve earned.',
    },
];

export default function SustainabilityPage() {
    return (
        <>
            <PageHero
                backgroundImage="/assets/images/headers/botanical-header-large-about.png"
                label="How We Work"
                title="Our Approach"
                subtitle="We're a small handmade studio. We make honest choices about how we work — and we're upfront about where we are and where we're headed."
            />

            {/* Practices Grid */}
            <section className="bg-parchment py-16 lg:py-24">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-14 max-w-2xl mx-auto">
                        <span className="text-terracotta font-medium text-sm uppercase tracking-wider">
                            What We Actually Do
                        </span>
                        <h2 className="mt-3 text-3xl font-bold font-heading text-ink-brown sm:text-4xl">
                            Six Things We Can Stand Behind
                        </h2>
                        <p className="mt-4 text-earth leading-relaxed">
                            No certifications. No greenwashing. Just honest practices from a
                            small studio that cares about making things well.
                        </p>
                    </div>
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 max-w-5xl mx-auto">
                        {practices.map((practice) => (
                            <div
                                key={practice.title}
                                className="bg-white p-6 rounded-2xl shadow-sm"
                            >
                                <span className="text-3xl mb-4 block">{practice.icon}</span>
                                <h3 className="text-lg font-semibold text-ink-brown mb-2">{practice.title}</h3>
                                <p className="text-earth text-sm leading-relaxed">{practice.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Honest Note */}
            <section className="bg-forest text-parchment py-16 lg:py-20">
                <div className="container mx-auto px-4 max-w-2xl text-center">
                    <h2 className="text-3xl font-bold font-heading sm:text-4xl mb-6">
                        A Note From Us
                    </h2>
                    <p className="text-parchment/80 leading-relaxed mb-6">
                        We&apos;re Karen, James, and Terry — three people making things by hand
                        in a studio in Northern Kentucky. We don&apos;t have a sustainability
                        department. We have a backyard and a workbench and a real commitment
                        to making things that last.
                    </p>
                    <p className="text-parchment/70 leading-relaxed">
                        We think honesty is its own kind of sustainability. We&apos;d rather
                        tell you exactly where we are than dress it up with credentials we
                        haven&apos;t earned. We&apos;re growing, and this page will grow with us.
                    </p>
                </div>
            </section>
        </>
    );
}
