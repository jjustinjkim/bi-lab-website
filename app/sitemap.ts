import type { MetadataRoute } from "next";
import { FEATURED_PUBLICATIONS } from "@/lib/content";

const BASE_URL = "https://wlbilab.org";

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = [
    "",
    "/research",
    "/research/glioma-outcomes",
    "/team",
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
