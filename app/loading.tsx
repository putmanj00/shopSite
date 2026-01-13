import ProductCardSkeleton from '@/components/product-card-skeleton';

export default function Loading() {
  return (
    <div className="min-h-screen bg-zinc-50">
      {/* Hero skeleton */}
      <div className="h-[400px] animate-pulse bg-zinc-800 md:h-[500px] lg:h-[600px]"></div>

      {/* Featured products skeleton */}
      <section className="container mx-auto px-4 py-16">
        <div className="mb-8 flex items-center justify-between">
          <div className="h-10 w-64 animate-pulse rounded bg-zinc-200"></div>
          <div className="h-6 w-24 animate-pulse rounded bg-zinc-200"></div>
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </div>
      </section>
    </div>
  );
}
