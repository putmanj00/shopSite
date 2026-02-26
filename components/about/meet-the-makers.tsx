import Image from 'next/image';

interface Maker {
    name: string;
    role: string;
    specialty: string;
    bio: string;
    image: string;
    collectionHandle?: string;
}

const makers: Maker[] = [
    {
        name: 'Karen Sifford',
        role: 'Co-Founder & Lead Artisan',
        specialty: 'Tie-Dye, Jewelry, and more',
        bio: 'With 20+ years of experience, Karen is a badass artisan who pours her heart and soul into every piece she creates.',
        image:
            'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=400&fit=crop',
        collectionHandle: 'tie-dye',
    },
    {
        name: 'James Putman',
        role: 'Co-Founder & Lead Artisan',
        specialty: 'Tie-Dye, Leather Goods, and more',
        bio: 'A maker of all things cool.',
        image:
            'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop',
        collectionHandle: 'leather',
    },
    {
        name: 'Terry Sifford',
        role: 'Jewelry Maker',
        specialty: 'Artisan Jewelry',
        bio: 'Terry is a badass artisan who pours his heart and soul into every piece he creates.',
        image:
            'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&h=400&fit=crop',
        collectionHandle: 'jewelry',
    },
];

export default function MeetTheMakers() {
    return (
        <section className="bg-parchment py-16 lg:py-24">
            <div className="container mx-auto px-4">
                <div className="text-center mb-12">
                    <span className="text-terracotta font-medium text-sm uppercase tracking-wider">
                        The Makers
                    </span>
                    <h2 className="mt-3 text-3xl font-bold font-heading text-ink-brown sm:text-4xl">
                        Meet the Makers
                    </h2>
                    <p className="mt-4 text-lg text-earth max-w-2xl mx-auto">
                        We are Wildenflower. Everything you find in our shop is made by our
                        own hands — poured with skill, intention, and a love for the craft.
                    </p>
                </div>

                <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                    {makers.map((maker) => (
                        <article
                            key={maker.name}
                            className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow duration-300"
                        >
                            <div className="aspect-square relative">
                                <Image
                                    src={maker.image}
                                    alt={`Portrait of ${maker.name}, ${maker.role}`}
                                    fill
                                    className="object-cover"
                                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                                />
                            </div>
                            <div className="p-6">
                                <h3 className="text-lg font-semibold text-ink-brown">
                                    {maker.name}
                                </h3>
                                <p className="text-terracotta text-sm font-medium">
                                    {maker.role}
                                </p>
                                <p className="text-sage text-sm mt-1">
                                    {maker.specialty}
                                </p>
                                <p className="mt-3 text-earth text-sm leading-relaxed">
                                    {maker.bio}
                                </p>
                            </div>
                        </article>
                    ))}
                </div>
            </div>
        </section>
    );
}
