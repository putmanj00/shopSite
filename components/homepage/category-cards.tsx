import Image from 'next/image';
import Link from 'next/link';

interface Category {
  handle: string;
  title: string;
  description: string;
  image: string;
  imageClassName?: string;
  cardClassName?: string;
}

// The 6 canonical categories (see AGENTS.md) — handles must match Shopify collections
const categories: Category[] = [
  {
    handle: 'tie-dye',
    title: 'Tie-Dye',
    description: 'Hand-dyed in small batches. Each piece blooms differently.',
    image: '/assets/images/icons/categories/icon-sunburst-v2.png',
    imageClassName: 'object-cover',
    cardClassName: 'bg-[#EFE8D6]',
  },
  {
    handle: 'leather',
    title: 'Leather',
    description: 'Tooled by hand, worn for decades.',
    image: '/assets/images/icons/categories/icon-leather-v2.png',
    imageClassName: 'object-0',
    cardClassName: 'bg-[#EFE8D6]',
  },
  {
    handle: 'jewelry',
    title: 'Jewelry',
    description: 'Foraged shapes, gathered light.',
    image: '/assets/images/icons/categories/icon-jewelry.jpeg',
    imageClassName: 'object-0',
    cardClassName: 'bg-[#EFE8D6]',
  },
  {
    handle: 'crystals',
    title: 'Crystals',
    description: 'Earth-kept for years. Yours now.',
    image: '/assets/images/icons/categories/icon-crystal-v2.jpeg',
    imageClassName: 'object-0',
    cardClassName: 'bg-[#EFE8D6]',
  },
  {
    handle: 'artwork',
    title: 'Artwork',
    description: 'Original pieces — no prints, no copies.',
    image: '/assets/images/icons/categories/icon-artwork.png',
    imageClassName: 'object-0',
    cardClassName: 'bg-[#EFE8D6]',
  },
  {
    handle: 'ceramics',
    title: 'Ceramics',
    description: 'Thrown on the wheel, fired with care.',
    image: '/assets/images/icons/categories/icon-ceramics.jpeg',
    imageClassName: 'object-cover',
    cardClassName: 'bg-[#EFE8D6]',
  },
];

function CategoryCard({ category }: { category: Category }) {
  return (
    <Link
      href={`/collections/${category.handle}`}
      className={`group relative block aspect-[3/4] overflow-hidden rounded-2xl ${category.cardClassName || 'bg-neutral-200'}`}
    >
      {/* Background Image */}
      <Image
        src={category.image}
        alt={category.title}
        fill
        className={`transition-transform duration-500 group-hover:scale-110 ${category.imageClassName || 'object-cover'}`}
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
      />

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent transition-opacity group-hover:opacity-90" />

      {/* Content */}
      <div className="absolute inset-0 flex flex-col justify-end p-6">
        <h3 className="text-2xl font-bold text-white mb-2 transform transition-transform duration-300 group-hover:translate-y-0 translate-y-2 font-heading">
          {category.title}
        </h3>
        <p className="text-neutral-300 text-sm mb-3 opacity-0 transform translate-y-4 transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-0">
          {category.description}
        </p>
        <div className="flex items-center justify-end">
          <span className="inline-flex items-center text-gold text-sm font-medium opacity-0 transform translate-x-[-10px] transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0">
            Explore
            <svg
              className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 8l4 4m0 0l-4 4m4-4H3"
              />
            </svg>
          </span>
        </div>
      </div>

      {/* Hover Border Effect */}
      <div className="absolute inset-0 rounded-2xl border-2 border-transparent transition-colors duration-300 group-hover:border-gold/50" />
    </Link>
  );
}

export default function CategoryCards() {
  return (
    <section className="bg-parchment pt-4 pb-16 lg:pb-24">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-forest sm:text-4xl font-heading">
            Find Your Wild
          </h2>
          <p className="mt-2 text-lg text-ink-brown max-w-2xl mx-auto">
            Each collection is a gathering — wild-crafted things made slowly and meant to last.
          </p>
        </div>

        {/* Category Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category) => (
            <CategoryCard key={category.handle} category={category} />
          ))}
        </div>
      </div>
    </section>
  );
}
