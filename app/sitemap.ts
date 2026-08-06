import type { MetadataRoute } from "next";
import { FEATURED_PUBLICATIONS, CURRENT_MEMBERS, ALUMNI } from "@/lib/content";

const BASE_URL = "https://wlbilab.org";

export default function sitemap(): MetadataRoute.Sitemap {
  const teamSlugs = [...CURRENT_MEMBERS, ...ALUMNI]
    .filter((m) => m.slug)
    .map((m) => `/team/${m.slug}`);

  // /inventory is behind the portal login now -- excluded here to match
  // robots.ts's disallow, since a public sitemap advertising gated content
  // for crawling would defeat the point of gating it.
  const routes = [
    "",
    "/research",
    "/research/glioma-outcomes",
    "/research/ionm",
    "/team",
    ...teamSlugs,
    "/publications",
    ...FEATURED_PUBLICATIONS.map((pub) => `/publications/${pub.slug}`),
    "/contact",
    "/privacy",
  ];
  return routes.map((route) => ({
    url: `${BASE_URL}${route}`,
    lastModified: new Date(),
    changeFrequency: route === "" ? "weekly" : "monthly",
    priority: route === "" ? 1 : 0.7,
  }));
}
