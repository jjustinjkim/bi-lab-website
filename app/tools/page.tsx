import type { Metadata } from "next";
import Link from "next/link";
import { TOOLS } from "@/lib/content";

export const metadata: Metadata = {
  title: "Tools",
  description: "Interactive tools and resources maintained by the Bi Lab, including the Meningioma Registry.",
};

export default function ToolsPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-14 space-y-8">
      <h1 className="text-display">Tools</h1>
      <p className="text-lg" style={{ color: "var(--ink-muted)" }}>
        Interactive tools and resources the lab builds and maintains.
      </p>

      <div className="grid sm:grid-cols-2 gap-5">
        {TOOLS.map((tool) => (
          <Link key={tool.href} href={tool.href} className="panel p-5 block hover:opacity-90">
            <h2 className="section-heading mb-2" style={{ fontSize: "1.125rem" }}>
              {tool.name}
            </h2>
            <p className="text-sm" style={{ color: "var(--ink-muted)" }}>
              {tool.description}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
