import { ImageResponse } from "next/og";
import { readFileSync } from "node:fs";
import { join } from "node:path";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// The real BWH columned-building mark (the same file used as this site's
// actual favicon/apple-icon), not a redrawn approximation -- the link
// preview iMessage/SMS/Slack/etc. show when this site's URL is shared
// previously used an unrelated hand-drawn SVG squiggle with no connection
// to the brand mark used everywhere else on the site (header, footer,
// browser tab). Embedded as a data URI since next/og's ImageResponse can't
// reference /public paths directly.
const iconDataUri = (() => {
  const buf = readFileSync(join(process.cwd(), "app", "icon.png"));
  return `data:image/png;base64,${buf.toString("base64")}`;
})();

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px",
          background: "#14293e",
          color: "white",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 18, marginBottom: 36 }}>
          <img src={iconDataUri} width={56} height={56} alt="" />
          <div style={{ fontSize: 30, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: "#4dc4cc" }}>
            Bi Lab
          </div>
        </div>
        <div style={{ fontSize: 64, fontWeight: 700, lineHeight: 1.1, maxWidth: 980 }}>
          The Skull Base Tumor Laboratory
        </div>
        <div style={{ fontSize: 28, marginTop: 28, color: "#c7d6e8", maxWidth: 900 }}>
          Translational biology of skull base and brain tumors, aimed at improving clinical outcomes.
        </div>
      </div>
    ),
    { ...size }
  );
}
