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
    description: 'Vibrant, hand-dyed apparel for the free spirit',
    image: '/images/category-tiedye.png',
    productCount: 45,
  },
  {
    handle: 'leather',
    title: 'Leather',
    description: 'Hand-tooled bags, wallets, and treasures',
    image: '/images/category-leather.png',
    productCount: 32,
  },
  {
    handle: 'jewelry',
    title: 'Jewelry',
    description: 'Handcrafted pieces worn with intention',
    image: 'https://images.unsplash.com/photo-1599643478518-17488fbbcd75?w=800&q=80',
    productCount: 67,
  },
  {
    handle: 'crystals',
    title: 'Crystals',
    description: 'Ethically sourced stones and gems',
    image: 'https://images.unsplash.com/photo-1617116462723-5e927c692885?w=800&q=80',
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
          <span className="inline-flex items-center text-primary-300 text-sm font-medium opacity-0 transform translate-x-[-10px] transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0">
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
      <div className="absolute inset-0 rounded-2xl border-2 border-transparent transition-colors duration-300 group-hover:border-primary-400/50" />
    </Link>
  );
}

export default function CategoryCards() {
  return (
    <section className="bg-white py-16 lg:py-24">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-neutral-900 sm:text-4xl font-heading">
            Treasures Chosen with Intention
          </h2>
          <p className="mt-4 text-lg text-neutral-600 max-w-2xl mx-auto">
            Explore our curated collections of handpicked artisan goods. Each
            piece carries its own story, waiting to become part of yours.
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
