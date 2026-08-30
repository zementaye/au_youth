export default function Loading() {
  return (
    <div className="mx-auto max-w-5xl px-5 py-12">
      <div className="mb-8 h-4 w-40 animate-pulse rounded bg-line-soft" />
      <div className="mb-8 h-9 w-64 animate-pulse rounded bg-line-soft" />
      <div className="card-raised h-96 animate-pulse rounded-none" />
    </div>
  );
}
