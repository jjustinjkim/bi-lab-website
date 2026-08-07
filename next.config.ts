import type { NextConfig } from "next";

// script-src/style-src need 'unsafe-inline': the root layout's theme-flash
// prevention script (app/layout.tsx) is a real inline <script>, and React's
// style={{...}} props render as inline style attributes throughout this
// codebase -- neither works without it, and there's no nonce/middleware
// infrastructure here to do a stricter version. This is a real limitation
// (an injected <script> tag would still execute), so this CSP's actual value
// is the other directives: form-action (protects the login form specifically),
// frame-ancestors/object-src/base-uri (block classes of attack that don't
// need script-src at all), and a real frame-src allowlist instead of "embed
// anything" -- not a strict script-injection defense.
const CSP = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data:",
  "font-src 'self'",
  "connect-src 'self'",
  // Every third-party iframe this site actually embeds (EmbedFrame usages):
  // Google Maps (contact), Google Forms (IONM quiz/feedback), Sketchfab
  // (IONM 3D models), the BWH-hosted glioma/astrocytoma risk calculators.
  "frame-src https://www.google.com https://docs.google.com https://sketchfab.com https://skullbase.bwh.harvard.edu",
  "frame-ancestors 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
].join("; ");

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  { key: "Content-Security-Policy", value: CSP },
];

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
  // www.wlbilab.org previously served the same content as wlbilab.org at a
  // plain 200 -- both technically-live, un-redirected URLs for identical
  // content, which canonical tags alone only ask search engines to
  // consolidate (a hint, not enforced). A real 301 is the actual fix, and
  // also means any link/bookmark pointing at the www form lands on the one
  // canonical domain instead of a permanently-duplicate copy.
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [{ type: "host", value: "www.wlbilab.org" }],
        destination: "https://wlbilab.org/:path*",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
