import type { Metadata } from "next";
import Link from "next/link";
import EmbedFrame from "@/components/EmbedFrame";

const FORM_URL = "https://docs.google.com/forms/d/e/1FAIpQLSc9GXjj9fV2l9GiRrIjg9dKTUUk5D3xQ7ulNvQhdgWcdOiUXw/viewform";

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
      <EmbedFrame
        src={`${FORM_URL}?embedded=true`}
        title="IONM Feedback"
        className="w-full rounded"
        style={{ height: "2667px" }}
      />
      <p className="text-xs text-center" style={{ color: "var(--ink-muted)" }}>
        Having trouble viewing this form?{" "}
        <a href={FORM_URL} target="_blank" rel="noopener noreferrer" className="link-accent">
          Open it directly
        </a>
        .
      </p>
    </div>
  );
}
