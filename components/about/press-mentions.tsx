import Image from 'next/image';

interface PressMention {
    name: string;
    logo: string;
    quote?: string;
    link?: string;
}

const pressLogos: PressMention[] = [
    {
        name: 'Vogue',
        logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7d/Vogue_logo.svg/200px-Vogue_logo.svg.png',
        quote: '"A treasure trove of handcrafted wonders"',
    },
    {
        name: 'Elle',
        logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/05/Elle_logo_%28magazine%29.svg/200px-Elle_logo_%28magazine%29.svg.png',
    },
    {
        name: 'Forbes',
        logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0c/Forbes_logo.svg/200px-Forbes_logo.svg.png',
        quote: '"Leading the artisan renaissance"',
    },
    {
        name: 'Architectural Digest',
        logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/de/Architectural_Digest_logo.svg/200px-Architectural_Digest_logo.svg.png',
    },
    {
        name: 'The New York Times',
        logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/40/New_York_Times_logo_variation.jpg/200px-New_York_Times_logo_variation.jpg',
    },
    {
        name: 'Refinery29',
        logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/Refinery29_logo.svg/200px-Refinery29_logo.svg.png',
    },
];

export default function PressMentions() {
    return (
        <section className="bg-neutral-100 py-16 lg:py-24">
            <div className="container mx-auto px-4">
                <div className="text-center mb-12">
                    <span className="text-amber-600 font-medium text-sm uppercase tracking-wider">
                        In the Press
                    </span>
                    <h2 className="mt-3 text-3xl font-bold text-neutral-900 sm:text-4xl">
                        As Seen In
                    </h2>
                </div>

                {/* Logo Grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 items-center justify-items-center max-w-5xl mx-auto">
                    {pressLogos.map((press) => (
                        <div
                            key={press.name}
                            className="group relative grayscale hover:grayscale-0 opacity-60 hover:opacity-100 transition-all duration-300"
                        >
                            <div className="h-12 w-32 relative flex items-center justify-center">
                                <Image
                                    src={press.logo}
                                    alt={`${press.name} logo`}
                                    fill
                                    className="object-contain"
                                    sizes="128px"
                                />
                            </div>
                        </div>
                    ))}
                </div>

                {/* Featured Quotes */}
                <div className="mt-16 grid gap-8 md:grid-cols-2 max-w-4xl mx-auto">
                    {pressLogos
                        .filter((press) => press.quote)
                        .map((press) => (
                            <blockquote
                                key={press.name}
                                className="bg-white p-8 rounded-2xl shadow-sm relative"
                            >
                                <svg
                                    className="absolute top-6 left-6 w-8 h-8 text-amber-200"
                                    fill="currentColor"
                                    viewBox="0 0 32 32"
                                    aria-hidden="true"
                                >
                                    <path d="M9.352 4C4.456 7.456 1 13.12 1 19.36c0 5.088 3.072 8.064 6.624 8.064 3.36 0 5.856-2.688 5.856-5.856 0-3.168-2.208-5.472-5.088-5.472-.576 0-1.344.096-1.536.192.48-3.264 3.552-7.104 6.624-9.024L9.352 4zm16.512 0c-4.8 3.456-8.256 9.12-8.256 15.36 0 5.088 3.072 8.064 6.624 8.064 3.264 0 5.856-2.688 5.856-5.856 0-3.168-2.304-5.472-5.184-5.472-.576 0-1.248.096-1.44.192.48-3.264 3.456-7.104 6.528-9.024L25.864 4z" />
                                </svg>
                                <p className="text-xl font-medium text-neutral-800 italic pl-12">
                                    {press.quote}
                                </p>
                                <cite className="mt-4 block text-amber-600 font-semibold not-italic">
                                    — {press.name}
                                </cite>
                            </blockquote>
                        ))}
                </div>
            </div>
        </section>
    );
}
