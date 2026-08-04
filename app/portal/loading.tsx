function SkeletonBlock({ className = "", style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <div
      className={`animate-pulse rounded ${className}`}
      style={{ background: "var(--hairline)", ...style }}
    />
  );
}

export default function PortalLoading() {
  return (
    <div className="space-y-8" aria-busy="true" aria-live="polite">
      <SkeletonBlock className="h-7 w-48" />
      <div className="grid sm:grid-cols-3 gap-4">
        <SkeletonBlock className="h-32" />
        <SkeletonBlock className="h-32" />
        <SkeletonBlock className="h-32" />
      </div>
      <div className="space-y-3">
        <SkeletonBlock className="h-14" />
        <SkeletonBlock className="h-14" />
        <SkeletonBlock className="h-14" />
      </div>
    </div>
  );
}
