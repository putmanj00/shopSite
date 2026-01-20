interface TimelineEvent {
    year: string;
    title: string;
    description: string;
}

const events: TimelineEvent[] = [
    {
        year: '2018',
        title: 'A Seed is Planted',
        description:
            'Wildenflower began at a local crystal and artisan market, born from a passion for handcrafted treasures and spiritual connection.',
    },
    {
        year: '2019',
        title: 'Roots Take Hold',
        description:
            'Expanded to include leather goods and bohemian jewelry, partnering with our first artisan craftspeople.',
    },
    {
        year: '2020',
        title: 'Blooming Online',
        description:
            'Launched our digital home, bringing curated treasures to seekers and dreamers nationwide.',
    },
    {
        year: '2022',
        title: 'Sustainable Spirit',
        description:
            'Committed to ethical sourcing and earth-friendly practices, honoring the natural world that inspires us.',
    },
    {
        year: '2024',
        title: 'A Growing Garden',
        description:
            'Our community flourished to over 50 artisan partners, each bringing unique magic to our collection.',
    },
    {
        year: '2026',
        title: 'Ever Untamed',
        description:
            'Continuing to bloom wild and free, expanding our collection while staying true to our roots.',
    },
];

export default function BrandTimeline() {
    return (
        <section className="bg-white py-16 lg:py-24">
            <div className="container mx-auto px-4">
                <div className="text-center mb-12">
                    <span className="text-primary-600 font-medium text-sm uppercase tracking-wider">
                        Our Journey
                    </span>
                    <h2 className="mt-3 text-3xl font-bold text-neutral-900 sm:text-4xl font-heading">
                        The Wildenflower Story
                    </h2>
                </div>

                <div className="max-w-4xl mx-auto">
                    <ol className="relative border-l-2 border-primary-200 ml-4 lg:ml-0 lg:border-l-0">
                        {events.map((event, index) => (
                            <li
                                key={event.year}
                                className={`mb-10 ml-6 lg:ml-0 lg:grid lg:grid-cols-9 lg:gap-8 ${index % 2 === 0 ? '' : 'lg:text-right'
                                    }`}
                            >
                                {/* Mobile: Left timeline dot */}
                                <span
                                    className="absolute -left-3 flex h-6 w-6 items-center justify-center rounded-full bg-amber-500 ring-4 ring-white lg:hidden"
                                    aria-hidden="true"
                                >
                                    <span className="h-2 w-2 rounded-full bg-white" />
                                </span>

                                {/* Desktop: Alternating layout */}
                                <div
                                    className={`lg:col-span-4 ${index % 2 === 0 ? 'lg:order-1' : 'lg:order-3'}`}
                                >
                                    <div
                                        className={`bg-neutral-50 rounded-xl p-6 ${index % 2 === 0 ? '' : 'lg:ml-auto'}`}
                                    >
                                        <h3 className="text-lg font-semibold text-neutral-900">
                                            {event.title}
                                        </h3>
                                        <p className="mt-2 text-neutral-600 leading-relaxed">
                                            {event.description}
                                        </p>
                                    </div>
                                </div>

                                {/* Desktop: Center dot */}
                                <div className="hidden lg:flex lg:col-span-1 lg:order-2 justify-center">
                                    <div className="relative flex flex-col items-center">
                                        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-500 shadow-md">
                                            <span className="h-2 w-2 rounded-full bg-white" />
                                        </span>
                                        <span className="mt-2 text-sm font-bold text-amber-600">
                                            {event.year}
                                        </span>
                                        {index < events.length - 1 && (
                                            <div
                                                className="absolute top-10 h-24 w-0.5 bg-amber-200"
                                                aria-hidden="true"
                                            />
                                        )}
                                    </div>
                                </div>

                                {/* Mobile: Year badge */}
                                <time className="mb-2 text-sm font-bold text-amber-600 lg:hidden">
                                    {event.year}
                                </time>

                                {/* Desktop: Empty space for alternating */}
                                <div
                                    className={`hidden lg:block lg:col-span-4 ${index % 2 === 0 ? 'lg:order-3' : 'lg:order-1'}`}
                                />
                            </li>
                        ))}
                    </ol>
                </div>
            </div>
        </section>
    );
}
