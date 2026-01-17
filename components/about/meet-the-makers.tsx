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
        name: 'Maria Santos',
        role: 'Founder & Lead Artisan',
        specialty: 'Tie-Dye Textiles',
        bio: 'With 20+ years of experience, Maria pioneered our signature spiral patterns and mentors emerging artists.',
        image:
            'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=400&fit=crop',
        collectionHandle: 'tie-dye',
    },
    {
        name: 'James Chen',
        role: 'Master Leather Craftsman',
        specialty: 'Leather Goods',
        bio: 'A third-generation leatherworker, James brings traditional techniques to modern designs.',
        image:
            'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop',
        collectionHandle: 'leather',
    },
    {
        name: 'Amara Okonkwo',
        role: 'Jewelry Designer',
        specialty: 'Artisan Jewelry',
        bio: 'Amara combines African heritage with contemporary aesthetics in every handcrafted piece.',
        image:
            'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&h=400&fit=crop',
        collectionHandle: 'jewelry',
    },
    {
        name: 'David Rivera',
        role: 'Visual Artist',
        specialty: 'Original Artwork',
        bio: 'David\u0027s vibrant paintings capture the spirit of handmade creativity and artisan culture.',
        image:
            'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop',
        collectionHandle: 'art',
    },
];

export default function MeetTheMakers() {
    return (
        <section className="bg-neutral-50 py-16 lg:py-24">
            <div className="container mx-auto px-4">
                <div className="text-center mb-12">
                    <span className="text-amber-600 font-medium text-sm uppercase tracking-wider">
                        The Artisans
                    </span>
                    <h2 className="mt-3 text-3xl font-bold text-neutral-900 sm:text-4xl">
                        Meet the Makers
                    </h2>
                    <p className="mt-4 text-lg text-neutral-600 max-w-2xl mx-auto">
                        Every product in our collection is crafted by skilled artisans who
                        pour their passion and expertise into each piece.
                    </p>
                </div>

                <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
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
                                <h3 className="text-lg font-semibold text-neutral-900">
                                    {maker.name}
                                </h3>
                                <p className="text-amber-600 text-sm font-medium">
                                    {maker.role}
                                </p>
                                <p className="text-neutral-500 text-sm mt-1">
                                    {maker.specialty}
                                </p>
                                <p className="mt-3 text-neutral-600 text-sm leading-relaxed">
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
