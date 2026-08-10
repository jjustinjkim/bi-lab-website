import type { Metadata } from "next";
import Link from "next/link";
import { CONTACT } from "@/lib/content";

export const metadata: Metadata = {
  title: "Support",
  description: "Support the Bi Lab's research into the translational biology of skull base and brain tumors.",
  alternates: { canonical: "/support" },
};

export default function SupportPage() {
  return (
    <div>
      <a
        href={CONTACT.supportUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="block w-full text-center py-6 text-white font-semibold uppercase tracking-wide hover:opacity-90"
        style={{ background: "var(--accent)", fontSize: "1.25rem" }}
      >
        Give to the Bi Lab
      </a>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-14 space-y-6">
        <h1 className="text-display">Support Our Research</h1>
        <p className="text-lg" style={{ color: "var(--ink-muted)" }}>
          The Bi Lab studies the translational biology of skull base and brain tumors, with the aim of
          improving clinical management and patient outcomes. Philanthropic support helps fund the lab&rsquo;s
          research into skull base and brain tumors, including meningiomas, pituitary tumors, gliomas, brain
          mets, and epidermoid cysts.
        </p>
        <p style={{ color: "var(--ink-muted)" }}>
          Gifts to the lab are made through Mass General Brigham&rsquo;s giving program. Use the link above, or
          see the <Link href="/contact" className="link-accent">Contact page</Link> to reach the lab directly
          about supporting a specific area of research.
        </p>
      </div>
    </div>
  );
}
