import Link from "next/link";
import { notFound } from "next/navigation";
import { RESEARCH_AREAS } from "@/lib/content";

export function generateStaticParams() {
  return RESEARCH_AREAS.map((area) => ({ slug: area.slug }));
}

export default async function ResearchAreaPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const area = RESEARCH_AREAS.find((a) => a.slug === slug);
  if (!area) notFound();

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-14 space-y-6">
      <Link href="/research" className="link-accent text-sm">
        &larr; All research areas
      </Link>
      <h1 className="text-display">{area.name}</h1>
      <p className="text-lg" style={{ color: "var(--ink-muted)" }}>
        {area.description}
      </p>
    </div>
  );
}
