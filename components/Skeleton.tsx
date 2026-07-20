/** Composants skeleton réutilisables pour les états de chargement */

export function SkeletonBox({ className = "" }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-lg bg-navy/[0.06] ${className}`}
      aria-hidden="true"
    />
  );
}

export function SkeletonCard() {
  return (
    <div className="rounded-xl border border-border bg-white p-5" aria-hidden="true">
      <SkeletonBox className="mb-3 h-1 w-8 rounded-full" />
      <SkeletonBox className="mb-2 h-4 w-3/4" />
      <SkeletonBox className="mb-1 h-3 w-full" />
      <SkeletonBox className="mb-4 h-3 w-5/6" />
      <div className="flex items-center justify-between border-t border-border pt-3">
        <SkeletonBox className="h-5 w-20 rounded-full" />
        <SkeletonBox className="h-3 w-16" />
      </div>
    </div>
  );
}

export function SkeletonHero() {
  return (
    <div className="relative overflow-hidden bg-navy/10" aria-hidden="true">
      <div className="mx-auto max-w-6xl px-5 py-16 sm:px-8 sm:py-24">
        <SkeletonBox className="mb-4 h-3 w-48" />
        <SkeletonBox className="mb-3 h-10 w-3/4 sm:h-14" />
        <SkeletonBox className="mb-2 h-4 w-1/2" />
        <SkeletonBox className="h-4 w-2/3" />
      </div>
    </div>
  );
}

export function SkeletonText({ lines = 3 }: { lines?: number }) {
  return (
    <div aria-hidden="true" className="space-y-2">
      {Array.from({ length: lines }).map((_, i) => (
        <SkeletonBox
          key={i}
          className={`h-3 ${i === lines - 1 ? "w-2/3" : "w-full"}`}
        />
      ))}
    </div>
  );
}
