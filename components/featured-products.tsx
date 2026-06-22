import { getProducts } from '@/lib/shopify-helpers';
import { isShowableProduct } from '@/lib/product-filters';
import ProductCard from './product-card';
import Link from 'next/link';

function EmptyProducts() {
  return (
    <section className="container mx-auto px-4 py-16">
      <div className="text-center">
        <h2 className="mb-4 text-3xl font-bold text-forest font-heading">
          Freshly Gathered
        </h2>
        <p className="text-earth">
          No products available at the moment. Check back soon!
        </p>
      </div>
    </section>
  );
}

function ErrorProducts() {
  return (
    <section className="container mx-auto px-4 py-16">
      <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center">
        <h2 className="mb-2 text-xl font-semibold text-red-900">
          Failed to Load Products
        </h2>
        <p className="text-red-700">
          We encountered an error loading products. Please try again later.
        </p>
      </div>
    </section>
  );
}

export default async function FeaturedProducts() {
  let data;

  try {
    data = await getProducts({
      first: 8,
      sortKey: 'BEST_SELLING',
    });
  } catch (error) {
    console.error('Error loading featured products:', error);
    return <ErrorProducts />;
  }

  const products = data.products.edges
    .map((edge) => edge.node)
    .filter(isShowableProduct);

  if (products.length === 0) {
    return <EmptyProducts />;
  }

  return (
    <section className="container mx-auto px-4 py-16">
      <div className="mb-8 flex items-center justify-between">
        <h2 className="text-3xl font-bold text-forest md:text-4xl font-heading">
          Freshly Gathered
        </h2>
        <Link
          href="/collections/all"
          className="text-sm font-semibold text-primary-700 transition-colors hover:text-primary-800 md:text-base"
        >
          View All →
        </Link>
      </div>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}
