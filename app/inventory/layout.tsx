import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./inventory.css";
import Header from "@/components/inventory/Header";
import Footer from "@/components/inventory/Footer";

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
};

export default function InventoryLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={`${geistSans.variable} inventory-scope`}>
      <Header />
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-10">{children}</main>
      <Footer />
    </div>
  );
}
