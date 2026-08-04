import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Feedback",
  description: "Share feedback on the Bi Lab's intraoperative neuromonitoring (IONM) training module.",
};

export default function IonmFeedbackPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-14 space-y-8">
      <div>
        <Link href="/research/ionm" className="link-accent text-sm">
          &larr; IONM Training Module
        </Link>
        <h1 className="text-display mt-4">Feedback</h1>
      </div>
      <iframe
        src="https://docs.google.com/forms/d/e/1FAIpQLSc9GXjj9fV2l9GiRrIjg9dKTUUk5D3xQ7ulNvQhdgWcdOiUXw/viewform?embedded=true"
        title="IONM Feedback"
        className="w-full rounded"
        style={{ border: "1px solid var(--hairline)", height: "2667px" }}
        loading="lazy"
      >
        Loading&hellip;
      </iframe>
    </div>
  );
}
