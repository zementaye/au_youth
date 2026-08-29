import { ListSkeleton } from "@/components/Skeleton";

export default function Loading() {
  return (
    <div className="mx-auto max-w-3xl px-5 py-12">
      <div className="mb-8 h-4 w-40 animate-pulse rounded bg-line-soft" />
      <div className="mb-3 h-9 w-80 animate-pulse rounded bg-line-soft" />
      <div className="mb-10 h-4 w-96 animate-pulse rounded bg-line-soft" />
      <ListSkeleton count={3} />
    </div>
  );
}
