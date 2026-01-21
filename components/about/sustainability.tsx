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
                    d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
                />
            </svg>
        ),
        title: 'Natural Dyes',
        description: 'Plant-based dyes for our tie-dye collection, avoiding harmful chemicals.',
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
        title: 'Ethical Leather',
        description: 'Vegetable-tanned leather from certified sustainable sources.',
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
                    d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707"
                />
            </svg>
        ),
        title: 'Recycled Metals',
        description: 'Jewelry crafted with recycled gold and silver to reduce mining impact.',
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
        description: 'Recyclable and biodegradable packaging for all shipments.',
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
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
            </svg>
        ),
        title: 'Carbon Neutral',
        description: 'Offsetting 100% of shipping emissions through verified programs.',
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
        title: 'Fair Wages',
        description: 'All artisans receive above-market compensation for their work.',
    },
];

export default function Sustainability() {
    return (
        <section className="bg-primary-900 text-white py-16 lg:py-24">
            <div className="container mx-auto px-4">
                <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-center">
                    {/* Content */}
                    <div>
                        <span className="text-primary-300 font-medium text-sm uppercase tracking-wider">
                            Our Commitment
                        </span>
                        <h2 className="mt-3 text-3xl font-bold font-heading sm:text-4xl">
                            Sustainability & Ethical Sourcing
                        </h2>
                        <p className="mt-6 text-lg text-primary-100 leading-relaxed">
                            We believe beautiful products shouldn&apos;t come at the cost of our
                            planet or people. Every material we use is carefully selected for
                            its environmental and social impact.
                        </p>
                        <p className="mt-4 text-primary-200 leading-relaxed">
                            From natural dyes to recycled metals, we&apos;re committed to making
                            sustainable choices at every step of our supply chain.
                        </p>

                        {/* Certifications */}
                        <div className="mt-8 flex flex-wrap gap-4">
                            <span className="inline-flex items-center px-4 py-2 rounded-full bg-primary-800 text-primary-100 text-sm font-medium">
                                🌱 Certified B Corp
                            </span>
                            <span className="inline-flex items-center px-4 py-2 rounded-full bg-primary-800 text-primary-100 text-sm font-medium">
                                ♻️ 1% for the Planet
                            </span>
                            <span className="inline-flex items-center px-4 py-2 rounded-full bg-primary-800 text-primary-100 text-sm font-medium">
                                🤝 Fair Trade
                            </span>
                        </div>
                    </div>

                    {/* Practices Grid */}
                    <div className="grid gap-4 sm:grid-cols-2">
                        {practices.map((practice) => (
                            <div
                                key={practice.title}
                                className="p-4 bg-primary-800/50 rounded-xl backdrop-blur-sm"
                            >
                                <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-primary-700 text-primary-200 mb-3">
                                    {practice.icon}
                                </div>
                                <h3 className="font-semibold text-white">{practice.title}</h3>
                                <p className="mt-1 text-sm text-primary-200 leading-relaxed">
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
