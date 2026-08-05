import type { Metadata } from "next";
import { CONTACT } from "@/lib/content";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How wlbilab.org handles data: what's collected, what third-party embeds are used, and how to get in touch about it.",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-14 space-y-8">
      <h1 className="text-display">Privacy Policy</h1>
      <p className="text-sm" style={{ color: "var(--ink-muted)" }}>Last updated August 2026.</p>

      <div className="space-y-6" style={{ color: "var(--ink-muted)" }}>
        <section>
          <h2 className="text-subtitle mb-2" style={{ color: "var(--ink)" }}>What this site collects</h2>
          <p>
            This site does not use tracking cookies or sell data. We use Vercel Analytics, a
            cookieless, aggregated analytics service, to understand overall traffic (which pages
            are visited, roughly how much traffic, and from what general region). It does not
            identify individual visitors.
          </p>
          <p className="mt-2">
            Your light/dark theme preference is stored in your browser&rsquo;s local storage. It
            never leaves your device and isn&rsquo;t sent to us.
          </p>
        </section>

        <section>
          <h2 className="text-subtitle mb-2" style={{ color: "var(--ink)" }}>The Lab Portal</h2>
          <p>
            The gated Lab Portal, used by lab members for internal project management, uses a
            session cookie to keep you signed in. It is not accessible to the public, is excluded
            from search engine indexing, and is unrelated to your browsing of the public site.
          </p>
        </section>

        <section>
          <h2 className="text-subtitle mb-2" style={{ color: "var(--ink)" }}>Third-party embeds</h2>
          <p>
            Some pages embed content from other services, each governed by that service&rsquo;s
            own privacy policy, not ours:
          </p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>Google Forms, for the IONM training module&rsquo;s quiz and feedback forms</li>
            <li>Sketchfab, for the interactive 3D models in the IONM training module</li>
            <li>Google Maps, for the map on the Contact page</li>
            <li>
              The lab&rsquo;s glioma outcome risk calculators, hosted on skullbase.bwh.harvard.edu
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-subtitle mb-2" style={{ color: "var(--ink)" }}>Contact</h2>
          <p>
            Questions about this policy or how the site handles data can be sent to{" "}
            <a href={`mailto:${CONTACT.email}`} className="link-accent">
              {CONTACT.email}
            </a>
            .
          </p>
        </section>
      </div>
    </div>
  );
}
