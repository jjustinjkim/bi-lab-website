"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="max-w-xl mx-auto px-4 sm:px-6 py-24 text-center">
      <p className="text-caption uppercase tracking-wide font-semibold mb-3" style={{ color: "var(--accent-2-ink)" }}>
        Something went wrong
      </p>
      <h1 className="text-display">Unexpected error</h1>
      <p className="mt-4" style={{ color: "var(--ink-muted)" }}>
        This page hit an unexpected error. You can try again, or head back to the homepage.
      </p>
      <div className="mt-8 flex flex-wrap gap-3 justify-center">
        <button type="button" onClick={reset} className="btn btn-primary">
          Try again
        </button>
        <Link href="/" className="btn btn-secondary">
          Back to home
        </Link>
      </div>
    </div>
  );
}
