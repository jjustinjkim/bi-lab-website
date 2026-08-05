import type { Metadata } from "next";
import Link from "next/link";
import EmbedFrame from "@/components/EmbedFrame";
import { isFormAvailable } from "@/lib/checkFormAvailable";

const FORM_URL = "https://docs.google.com/forms/d/e/1FAIpQLSdxuJcd5ekORzQqfoDDguPcAfD6THoWczpPf9eXscKOAEOFVA/viewform";

// Explicit, not just implied by the fetch's default caching -- guards
// against this quietly becoming a per-request dynamic route (a live Google
// Forms fetch on every page view) if that default ever changes.
export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "Quiz",
  description: "Self-check quiz for the Bi Lab's intraoperative neuromonitoring (IONM) training module.",
};

export default async function IonmQuizPage() {
  const available = await isFormAvailable(FORM_URL);

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-14 space-y-8">
      <div>
        <Link href="/research/ionm" className="link-accent text-sm">
          &larr; IONM Training Module
        </Link>
        <h1 className="text-display mt-4">Quiz</h1>
      </div>
      {available ? (
        <>
          <EmbedFrame
            src={`${FORM_URL}?embedded=true`}
            title="IONM Quiz"
            className="w-full rounded"
            style={{ height: "1400px" }}
          />
          <p className="text-xs text-center" style={{ color: "var(--ink-muted)" }}>
            Having trouble viewing this form?{" "}
            <a href={FORM_URL} target="_blank" rel="noopener noreferrer" className="link-accent">
              Open it directly
            </a>
            .
          </p>
        </>
      ) : (
        <div className="panel p-6 text-sm">
          <p className="font-medium mb-2" style={{ color: "var(--ink)" }}>
            This quiz isn&rsquo;t available right now.
          </p>
          <p style={{ color: "var(--ink-muted)" }}>
            The linked form has been removed or is no longer accessible. Contact the lab directly if you need to complete this step.
          </p>
        </div>
      )}
    </div>
  );
}
