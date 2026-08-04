"use client";

import { useRouter } from "next/navigation";

// Returns to wherever the visitor came from (Search, Matched Cohorts, a
// modality page, etc.) rather than assuming a single fixed parent page.
export default function BackLink() {
  const router = useRouter();
  return (
    <button
      onClick={() => router.back()}
      className="text-sm link-accent"
      style={{ background: "none", border: "none", padding: 0, cursor: "pointer" }}
    >
      ← Back
    </button>
  );
}
