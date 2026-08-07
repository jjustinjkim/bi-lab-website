import type { Metadata } from "next";
import { Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { organizationJsonLd, websiteJsonLd, jsonLdScriptProps } from "@/lib/jsonld";

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const title = "Bi Lab | Skull Base Tumor Laboratory";
const description =
  "The Bi Lab studies the translational biology of skull base and brain tumors, with the aim of improving clinical outcomes for patients.";

export const metadata: Metadata = {
  metadataBase: new URL("https://wlbilab.org"),
  title: {
    default: title,
    template: "%s | Bi Lab",
  },
  description,
  openGraph: {
    title,
    description,
    type: "website",
    siteName: "Bi Lab",
    images: ["/opengraph-image"],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["/opengraph-image"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistMono.variable} antialiased`} suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem("theme");if(t==="light"||t==="dark"){document.documentElement.setAttribute("data-theme",t);}}catch(e){}})();`,
          }}
        />
        <script type="application/ld+json" {...jsonLdScriptProps(organizationJsonLd())} />
        <script type="application/ld+json" {...jsonLdScriptProps(websiteJsonLd())} />
      </head>
      <body>
        <a href="#main-content" className="skip-link">
          Skip to content
        </a>
        <Header />
        <main id="main-content" className="w-full">
          {children}
        </main>
        <Footer />
        <Analytics />
      </body>
    </html>
  );
}
