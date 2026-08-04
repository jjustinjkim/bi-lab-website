import Link from "next/link";

export default function NotFound() {
  return (
    <div className="max-w-xl mx-auto px-4 sm:px-6 py-24 text-center">
      <p className="text-caption uppercase tracking-wide font-semibold mb-3" style={{ color: "var(--accent-ink)" }}>
        404
      </p>
      <h1 className="text-display">Page not found</h1>
      <p className="mt-4" style={{ color: "var(--ink-muted)" }}>
        The page you&rsquo;re looking for doesn&rsquo;t exist or may have moved.
      </p>
      <div className="mt-8 flex flex-wrap gap-3 justify-center">
        <Link href="/" className="btn btn-primary">
          Back to home
        </Link>
        <Link href="/search" className="btn btn-secondary">
          Search the site
        </Link>
      </div>
    </div>
  );
}
