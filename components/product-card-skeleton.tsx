export default function ProductCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-lg bg-cream border border-gold/25">
      <div className="relative aspect-square animate-pulse bg-parchment"></div>
      <div className="p-4">
        <div className="mb-2 h-6 w-3/4 animate-pulse rounded bg-parchment"></div>
        <div className="h-7 w-1/3 animate-pulse rounded bg-parchment"></div>
        <div className="mt-1 h-4 w-1/2 animate-pulse rounded bg-parchment"></div>
      </div>
    </div>
  );
}
