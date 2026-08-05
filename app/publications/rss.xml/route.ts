import { FEATURED_PUBLICATIONS } from "@/lib/content";

export const dynamic = "force-static";

const BASE_URL = "https://wlbilab.org";

function escapeXml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export function GET() {
  const items = [...FEATURED_PUBLICATIONS]
    .sort((a, b) => (a.date < b.date ? 1 : -1))
    .map((pub) => {
      const url = `${BASE_URL}/publications/${pub.slug}`;
      const pubDate = new Date(pub.date).toUTCString();
      return `
    <item>
      <title>${escapeXml(pub.title)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <pubDate>${pubDate}</pubDate>
      <description>${escapeXml(pub.excerpt)}</description>
    </item>`;
    })
    .join("");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Bi Lab Publications</title>
    <link>${BASE_URL}/publications</link>
    <atom:link href="${BASE_URL}/publications/rss.xml" rel="self" type="application/rss+xml" />
    <description>Featured publications from the Skull Base Tumor Laboratory (Bi Lab).</description>
    <language>en-us</language>${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
    },
  });
}
