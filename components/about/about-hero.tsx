import Image from 'next/image';

export default function AboutHero() {
    return (
        <section className="relative bg-forest text-white overflow-visible">
            {/* Background Image — mushroom header */}
            <div className="absolute inset-0 overflow-hidden">
                <Image
                    src="/assets/images/headers/botanical-header-large-about.png"
                    alt="Botanical mushroom illustration"
                    fill
                    className="object-cover opacity-40"
                    priority
                    sizes="100vw"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-forest/60 to-forest/90" />
            </div>

            {/* Content */}
            <div className="relative container mx-auto px-4 py-24 lg:py-32">
                <div className="max-w-3xl">
                    <span className="text-gold font-medium text-sm uppercase tracking-wider">
                        Born from a Love of the Untamed
                    </span>
                    <h1 className="mt-4 text-4xl font-bold sm:text-5xl lg:text-6xl leading-tight font-heading">
                        Wild Beauty,{' '}
                        <span className="text-gold">Crafted with Intention</span>
                    </h1>
                    <p className="mt-6 text-xl text-parchment/80 leading-relaxed">
                        Wildenflower is a handmade shop — every piece of tie-dye, leather
                        goods, and jewelry is created by us. We pour our own hands and
                        hearts into each piece, and we wouldn&apos;t have it any other way.
                    </p>
                    <p className="mt-4 text-lg text-parchment/60 leading-relaxed">
                        Every piece we make carries intention. Like the wildflower that
                        blooms where it chooses, we celebrate the untamed beauty of things
                        made by hand — slowly, carefully, and with love.
                    </p>
                </div>
            </div>

            {/* Decorative bottom curve */}
            <div className="absolute -bottom-px left-0 right-0 z-10">
                <svg
                    viewBox="0 0 1440 60"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-full h-auto block"
                    aria-hidden="true"
                    preserveAspectRatio="none"
                >
                    <path
                        d="M0 60V30C360 0 720 0 1080 30C1260 45 1380 52.5 1440 60V60H0Z"
                        fill="currentColor"
                        className="text-parchment"
                    />
                </svg>
            </div>
        </section>
    );
}
