import type { Metadata } from "next";
import Link from "next/link";
import EmbedFrame from "@/components/EmbedFrame";

const FORM_URL = "https://docs.google.com/forms/d/e/1FAIpQLSdxuJcd5ekORzQqfoDDguPcAfD6THoWczpPf9eXscKOAEOFVA/viewform";

export const metadata: Metadata = {
  title: "Quiz",
  description: "Self-check quiz for the Bi Lab's intraoperative neuromonitoring (IONM) training module.",
};

export default function IonmQuizPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-14 space-y-8">
      <div>
        <Link href="/research/ionm" className="link-accent text-sm">
          &larr; IONM Training Module
        </Link>
        <h1 className="text-display mt-4">Quiz</h1>
      </div>
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
    </div>
  );
}
