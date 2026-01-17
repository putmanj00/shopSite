import Image from 'next/image';

export default function AboutHero() {
    return (
        <section className="relative bg-neutral-900 text-white overflow-hidden">
            {/* Background Image */}
            <div className="absolute inset-0">
                <Image
                    src="https://images.unsplash.com/photo-1452860606245-08befc0ff44b?w=1920&h=1080&fit=crop"
                    alt="Artisan workshop filled with handcrafted goods and tools"
                    fill
                    className="object-cover opacity-40"
                    priority
                    sizes="100vw"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-neutral-900/60 to-neutral-900/90" />
            </div>

            {/* Content */}
            <div className="relative container mx-auto px-4 py-24 lg:py-32">
                <div className="max-w-3xl">
                    <span className="text-amber-400 font-medium text-sm uppercase tracking-wider">
                        Our Story
                    </span>
                    <h1 className="mt-4 text-4xl font-bold sm:text-5xl lg:text-6xl leading-tight">
                        Where Passion Meets{' '}
                        <span className="text-amber-400">Craftsmanship</span>
                    </h1>
                    <p className="mt-6 text-xl text-neutral-300 leading-relaxed">
                        Founded in 2018, Artisan Collective began with a simple mission: to
                        connect talented craftspeople with people who appreciate the beauty
                        and quality of handmade goods. Today, we partner with over 50
                        artisans across the country, bringing their unique creations to your
                        doorstep.
                    </p>
                    <p className="mt-4 text-lg text-neutral-400 leading-relaxed">
                        Every tie-dye pattern, every leather stitch, every jewelry setting,
                        and every brushstroke tells a story of dedication, skill, and love
                        for the craft.
                    </p>
                </div>
            </div>

            {/* Decorative bottom curve */}
            <div className="absolute bottom-0 left-0 right-0">
                <svg
                    viewBox="0 0 1440 60"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-full h-auto"
                    aria-hidden="true"
                >
                    <path
                        d="M0 60V30C360 0 720 0 1080 30C1260 45 1380 52.5 1440 60V60H0Z"
                        fill="currentColor"
                        className="text-white"
                    />
                </svg>
            </div>
        </section>
    );
}
