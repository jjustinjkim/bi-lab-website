import type { MetadataRoute } from "next";
import { FEATURED_PUBLICATIONS, CURRENT_MEMBERS, ALUMNI } from "@/lib/content";

const BASE_URL = "https://wlbilab.org";

export default function sitemap(): MetadataRoute.Sitemap {
  const teamSlugs = [...CURRENT_MEMBERS, ...ALUMNI]
    .filter((m) => m.slug)
    .map((m) => `/team/${m.slug}`);

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
    "/inventory",
    "/inventory/matched-cohorts",
    "/inventory/search",
    "/inventory/institutions",
    "/inventory/methodology",
  ];
  return routes.map((route) => ({
    url: `${BASE_URL}${route}`,
    lastModified: new Date(),
    changeFrequency: route === "" ? "weekly" : "monthly",
    priority: route === "" ? 1 : 0.7,
  }));
}
