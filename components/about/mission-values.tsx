interface Value {
    icon: React.ReactNode;
    title: string;
    description: string;
}

const values: Value[] = [
    {
        icon: (
            <svg
                className="w-8 h-8"
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
        title: 'Made with Love',
        description:
            'Every product is crafted with passion and care by skilled artisans who take pride in their work.',
    },
    {
        icon: (
            <svg
                className="w-8 h-8"
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
        title: 'Quality Guaranteed',
        description:
            'We stand behind every piece with a satisfaction guarantee and commitment to excellence.',
    },
    {
        icon: (
            <svg
                className="w-8 h-8"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
            >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
            </svg>
        ),
        title: 'Supporting Artists',
        description:
            'Your purchase directly supports independent artisans and their families worldwide.',
    },
    {
        icon: (
            <svg
                className="w-8 h-8"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
            >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
            </svg>
        ),
        title: 'Globally Sourced',
        description:
            'We partner with artisans across the globe to bring you unique, culturally-rich creations.',
    },
];

export default function MissionValues() {
    return (
        <section className="bg-neutral-50 py-16 lg:py-24">
            <div className="container mx-auto px-4">
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <span className="text-amber-600 font-medium text-sm uppercase tracking-wider">
                        What We Believe
                    </span>
                    <h2 className="mt-3 text-3xl font-bold text-neutral-900 sm:text-4xl">
                        Our Mission
                    </h2>
                    <p className="mt-6 text-xl text-neutral-700 leading-relaxed">
                        We exist to celebrate the beauty of handmade craftsmanship, connect
                        talented artisans with appreciative customers, and preserve
                        traditional techniques for future generations.
                    </p>
                </div>

                <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
                    {values.map((value) => (
                        <div
                            key={value.title}
                            className="text-center p-6 bg-white rounded-2xl shadow-sm"
                        >
                            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-amber-100 text-amber-600 mb-4">
                                {value.icon}
                            </div>
                            <h3 className="text-lg font-semibold text-neutral-900">
                                {value.title}
                            </h3>
                            <p className="mt-2 text-neutral-600 text-sm leading-relaxed">
                                {value.description}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
