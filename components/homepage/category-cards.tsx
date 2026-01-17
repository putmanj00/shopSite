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
    description: 'Vibrant, hand-dyed textiles and apparel',
    image: 'https://images.unsplash.com/photo-1527576539890-dfa815648363?w=600&h=800&fit=crop',
    productCount: 45,
  },
  {
    handle: 'leather',
    title: 'Leather',
    description: 'Hand-tooled bags, wallets, and accessories',
    image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600&h=800&fit=crop',
    productCount: 32,
  },
  {
    handle: 'jewelry',
    title: 'Jewelry',
    description: 'Unique handcrafted pieces and gemstones',
    image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=600&h=800&fit=crop',
    productCount: 67,
  },
  {
    handle: 'art',
    title: 'Art',
    description: 'Original paintings, prints, and sculptures',
    image: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=600&h=800&fit=crop',
    productCount: 28,
  },
];

function CategoryCard({ category }: { category: Category }) {
  return (
    <Link
      href={`/collections/${category.handle}`}
      className="group relative block aspect-[3/4] overflow-hidden rounded-2xl bg-zinc-200"
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
        <h3 className="text-2xl font-bold text-white mb-2 transform transition-transform duration-300 group-hover:translate-y-0 translate-y-2">
          {category.title}
        </h3>
        <p className="text-zinc-300 text-sm mb-3 opacity-0 transform translate-y-4 transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-0">
          {category.description}
        </p>
        <div className="flex items-center justify-between">
          <span className="text-xs text-zinc-400">
            {category.productCount} Products
          </span>
          <span className="inline-flex items-center text-amber-400 text-sm font-medium opacity-0 transform translate-x-[-10px] transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0">
            Shop Now
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
      <div className="absolute inset-0 rounded-2xl border-2 border-transparent transition-colors duration-300 group-hover:border-amber-400/50" />
    </Link>
  );
}

export default function CategoryCards() {
  return (
    <section className="bg-white py-16 lg:py-24">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-zinc-900 sm:text-4xl">
            Shop by Category
          </h2>
          <p className="mt-4 text-lg text-zinc-600 max-w-2xl mx-auto">
            Explore our curated collections of handcrafted artisan goods, each
            piece telling its own unique story.
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
