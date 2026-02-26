interface Practice {
    icon: React.ReactNode;
    title: string;
    description: string;
}

const practices: Practice[] = [
    {
        icon: (
            <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
            >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M7 11.5V14m0-2.5v-6a1.5 1.5 0 113 0m-3 6a1.5 1.5 0 00-3 0v2a7.5 7.5 0 0015 0v-5a1.5 1.5 0 00-3 0m-6-3V11m0-5.5v-1a1.5 1.5 0 013 0v1m0 0V11m0-5.5a1.5 1.5 0 013 0v3m0 0V11"
                />
            </svg>
        ),
        title: 'Handmade & Small Batch',
        description: 'We make in small runs, which naturally reduces overproduction and waste.',
    },
    {
        icon: (
            <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
            >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                />
            </svg>
        ),
        title: 'Built to Last',
        description: 'We focus on quality so pieces are kept and loved for years, not thrown away.',
    },
    {
        icon: (
            <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
            >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
                />
            </svg>
        ),
        title: 'Thoughtful Materials',
        description: 'We source quality materials for our leather and metalwork from trusted suppliers.',
    },
    {
        icon: (
            <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
            >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                />
            </svg>
        ),
        title: 'Eco Packaging',
        description: 'We use recyclable packaging where possible and avoid unnecessary materials.',
    },
    {
        icon: (
            <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
            >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
            </svg>
        ),
        title: 'Honest Craft',
        description: "We use professional-grade dyes for our tie-dye work. We're not greenwashing — we're a small studio doing our best.",
    },
    {
        icon: (
            <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
            >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                />
            </svg>
        ),
        title: 'Growing Toward Better',
        description: "We're a small business exploring how we can reduce our footprint as we grow.",
    },
];

export default function Sustainability() {
    return (
        <section className="bg-forest text-parchment py-16 lg:py-24">
            <div className="container mx-auto px-4">
                <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-center">
                    {/* Content */}
                    <div>
                        <span className="text-gold font-medium text-sm uppercase tracking-wider">
                            How We Work
                        </span>
                        <h2 className="mt-3 text-3xl font-bold font-heading sm:text-4xl">
                            Our Approach
                        </h2>
                        <p className="mt-6 text-lg text-parchment/80 leading-relaxed">
                            We believe beautiful products should be made with care — for the
                            people who make them and the world we all share. As a small
                            handmade studio, we make intentional choices about how we work.
                        </p>
                        <p className="mt-4 text-parchment/70 leading-relaxed">
                            We&apos;re not perfect, and we&apos;re not making grand claims.
                            We&apos;re a small shop doing our best to make things well and
                            leave things better than we found them.
                        </p>
                    </div>

                    {/* Practices Grid */}
                    <div className="grid gap-4 sm:grid-cols-2">
                        {practices.map((practice) => (
                            <div
                                key={practice.title}
                                className="p-4 bg-forest/50 border border-gold/20 rounded-xl backdrop-blur-sm"
                            >
                                <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-sage/30 text-gold mb-3">
                                    {practice.icon}
                                </div>
                                <h3 className="font-semibold text-parchment">{practice.title}</h3>
                                <p className="mt-1 text-sm text-parchment/70 leading-relaxed">
                                    {practice.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
