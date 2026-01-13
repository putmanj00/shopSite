export default function ProductCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-lg bg-white shadow-sm">
      <div className="relative aspect-square animate-pulse bg-zinc-200"></div>
      <div className="p-4">
        <div className="mb-2 h-6 w-3/4 animate-pulse rounded bg-zinc-200"></div>
        <div className="h-7 w-1/3 animate-pulse rounded bg-zinc-200"></div>
        <div className="mt-1 h-4 w-1/2 animate-pulse rounded bg-zinc-200"></div>
      </div>
    </div>
  );
}
