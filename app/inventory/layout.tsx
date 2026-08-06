import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Geist } from "next/font/google";
import "./inventory.css";
import Header from "@/components/inventory/Header";
import Footer from "@/components/inventory/Footer";
import { isMemberSession } from "@/lib/auth";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const title = "Meningioma Dataset Registry";
const description = "Every publicly discoverable meningioma molecular dataset, verified and tracked in one place, maintained by the Bi Lab.";

export const metadata: Metadata = {
  title: { default: title, template: "%s | Meningioma Dataset Registry" },
  description,
  openGraph: { title, description, type: "website", siteName: "Meningioma Dataset Registry" },
  // Now behind the portal login (see proxy.ts) -- noindex/nofollow as a
  // second, independent signal alongside robots.ts's disallow, in case this
  // is ever linked to from somewhere robots.txt doesn't cover.
  robots: { index: false, follow: false },
};

// The real per-request auth check (proxy.ts only does a cheap
// cookie-presence check before this ever runs) -- centralized here rather
// than on each of the 190+ individual pages under this layout, since none
// of them had their own auth logic to begin with, unlike the portal's own
// pages which each already call requireMember()/requireAdmin() themselves.
export default async function InventoryLayout({ children }: { children: React.ReactNode }) {
  if (!(await isMemberSession())) redirect("/portal/login");

  return (
    <div className={`${geistSans.variable} inventory-scope`}>
      <Header />
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-10">{children}</main>
      <Footer />
    </div>
  );
}
