import Image from 'next/image';
import Link from 'next/link';

interface Category {
  handle: string;
  title: string;
  description: string;
  image: string;
  productCount: number;
}

// Placeholder data - will be replaced with dynamic data when collections are set up in Shopify
const categories: Category[] = [
  {
    handle: 'tie-dye',
    title: 'Tie-Dye',
    description: 'Hand-dyed in small batches. Each piece blooms differently.',
    image: '/assets/images/headers/botanical-header-small.png',
    productCount: 45,
  },
  {
    handle: 'mandala-art',
    title: 'Mandala Art',
    description: 'Drawn by hand, one patient line at a time.',
    image: '/assets/images/headers/botanical-header-large1.png',
    productCount: 32,
  },
  {
    handle: 'jewelry',
    title: 'Jewelry',
    description: 'Foraged shapes, gathered light.',
    image: '/assets/images/splash/splash-bloom-elements.png',
    productCount: 67,
  },
  {
    handle: 'crystals',
    title: 'Crystals',
    description: 'Earth-kept for years. Yours now.',
    image: '/assets/images/headers/botanical-header-large.png',
    productCount: 54,
  },
];

function CategoryCard({ category }: { category: Category }) {
  return (
    <Link
      href={`/collections/${category.handle}`}
      className="group relative block aspect-[3/4] overflow-hidden rounded-2xl bg-neutral-200"
    >
      {/* Background Image */}
      <Image
        src={category.image}
        alt={category.title}
        fill
        className="object-cover transition-transform duration-500 group-hover:scale-110"
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
        <div className="flex items-center justify-between">
          <span className="text-xs text-neutral-400">
            {category.productCount} Treasures
          </span>
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
    <section className="bg-parchment py-16 lg:py-24">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-forest sm:text-4xl font-heading">
            Find Your Wild
          </h2>
          <p className="mt-4 text-lg text-ink-brown max-w-2xl mx-auto">
            Each collection is a gathering — wild-crafted things made slowly and meant to last.
          </p>
        </div>

        {/* Category Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((category) => (
            <CategoryCard key={category.handle} category={category} />
          ))}
        </div>
      </div>
    </section>
  );
}
