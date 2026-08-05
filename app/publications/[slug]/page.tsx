import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { FEATURED_PUBLICATIONS } from "@/lib/content";
import { scholarlyArticleJsonLd, jsonLdScriptProps } from "@/lib/jsonld";

export function generateStaticParams() {
  return FEATURED_PUBLICATIONS.map((pub) => ({ slug: pub.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const pub = FEATURED_PUBLICATIONS.find((p) => p.slug === slug);
  if (!pub) return {};
  return { title: pub.title, description: pub.excerpt };
}

export default async function FeaturedPublicationPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const pub = FEATURED_PUBLICATIONS.find((p) => p.slug === slug);
  if (!pub) notFound();

  const date = new Date(pub.date);
  const formattedDate = date.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-14 space-y-8">
      <script type="application/ld+json" {...jsonLdScriptProps(scholarlyArticleJsonLd(pub))} />

      <Link href="/publications" className="link-accent text-sm">
        &larr; All publications
      </Link>

      <div>
        <div className="text-caption uppercase tracking-wide font-semibold mb-2" style={{ color: "var(--accent-ink)" }}>
          {pub.journal} &middot; {formattedDate}
        </div>
        <h1 className="text-display">{pub.title}</h1>
      </div>

      <Image
        src={pub.image}
        alt={`First page of "${pub.title}" in ${pub.journal}`}
        width={pub.imageWidth}
        height={pub.imageHeight}
        className="w-full h-auto max-w-xs mx-auto rounded"
        style={{ border: "1px solid var(--hairline)" }}
        priority
      />

      <p className="text-lg" style={{ color: "var(--ink-muted)" }}>
        {pub.body}
      </p>

      <div className="panel p-5">
        <div className="field-label">Published in</div>
        <a href={pub.journalUrl} target="_blank" rel="noopener noreferrer" className="link-accent">
          {pub.journal}
        </a>
      </div>
    </div>
  );
}
