export function CardSkeletonGrid({ count = 6 }: { count?: number }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="card-raised animate-pulse rounded-lg p-5">
          <div className="h-4 w-2/3 rounded bg-line-soft" />
          <div className="mt-3 h-3 w-1/2 rounded bg-line-soft" />
          <div className="mt-4 h-3 w-full rounded bg-line-soft" />
          <div className="mt-2 h-3 w-5/6 rounded bg-line-soft" />
        </div>
      ))}
    </div>
  );
}

export function ListSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="card-raised animate-pulse rounded-lg p-5">
          <div className="h-3 w-24 rounded bg-line-soft" />
          <div className="mt-3 h-4 w-2/3 rounded bg-line-soft" />
          <div className="mt-3 h-3 w-full rounded bg-line-soft" />
          <div className="mt-2 h-3 w-4/5 rounded bg-line-soft" />
        </div>
      ))}
    </div>
  );
}
