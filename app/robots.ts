import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/portal", "/search", "/inventory", "/pilot-data"],
      },
      // Google's organic search-result thumbnail picker sometimes ignores
      // the declared OG image and grabs a prominent content image from the
      // page instead -- it chose the clinical brain-scan collage from the
      // homepage's Imaging research-area card over the actual designed
      // share card. Blocking Googlebot-Image specifically (not the regular
      // crawler, which still needs to fetch these to render/understand the
      // page) removes them as thumbnail candidates without affecting normal
      // crawling or indexing of the pages that use them.
      {
        userAgent: "Googlebot-Image",
        disallow: [
          "/research/imaging.jpg",
          "/research/immunogenomics.png",
          "/research/ionm.png",
          "/research/outcomes.jpg",
          "/research/outcome-brain-met.jpg",
          "/research/outcome-meningioma.jpg",
          "/research/outcome-pituitary.jpg",
          "/research/outcome-schwannoma.jpg",
          "/research/outcome-glioma.jpg",
          "/research/outcome-epidermoid-cyst.jpg",
        ],
      },
    ],
    sitemap: "https://wlbilab.org/sitemap.xml",
  };
}
