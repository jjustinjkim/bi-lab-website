import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/portal", "/search"],
    },
    sitemap: "https://wlbilab.org/sitemap.xml",
  };
}
