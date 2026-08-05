import type { MetadataRoute } from "next";
import { FEATURED_PUBLICATIONS, CURRENT_MEMBERS, ALUMNI } from "@/lib/content";
import { getAllRecords } from "@/lib/inventory/data";
import { allModalityKeys } from "@/lib/inventory/modality";

const BASE_URL = "https://wlbilab.org";

export default function sitemap(): MetadataRoute.Sitemap {
  const teamSlugs = [...CURRENT_MEMBERS, ...ALUMNI]
    .filter((m) => m.slug)
    .map((m) => `/team/${m.slug}`);
  const datasetSlugs = getAllRecords().map((r) => `/inventory/dataset/${r.id}`);
  const modalitySlugs = allModalityKeys().map((name) => `/inventory/modality/${name}`);

  const routes = [
    "",
    "/research",
    "/research/glioma-outcomes",
    "/research/ionm",
    "/team",
    ...teamSlugs,
    "/publications",
    ...FEATURED_PUBLICATIONS.map((pub) => `/publications/${pub.slug}`),
    "/tools",
    "/contact",
    "/inventory",
    ...datasetSlugs,
    ...modalitySlugs,
    "/inventory/matched-cohorts",
    "/inventory/search",
    "/inventory/institutions",
    "/inventory/methodology",
    "/privacy",
  ];
  return routes.map((route) => ({
    url: `${BASE_URL}${route}`,
    lastModified: new Date(),
    changeFrequency: route === "" ? "weekly" : "monthly",
    priority: route === "" ? 1 : 0.7,
  }));
}
