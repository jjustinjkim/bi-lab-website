import type { MetadataRoute } from "next";

const BASE_URL = "https://wlbilab.org";

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = ["", "/research", "/team", "/publications", "/contact"];
  return routes.map((route) => ({
    url: `${BASE_URL}${route}`,
    lastModified: new Date(),
    changeFrequency: route === "" ? "weekly" : "monthly",
    priority: route === "" ? 1 : 0.7,
  }));
}
