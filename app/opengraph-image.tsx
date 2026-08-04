import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

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
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 36 }}>
          <svg width="52" height="52" viewBox="0 0 32 32">
            <rect width="32" height="32" rx="6" fill="#ffffff" />
            <path
              d="M10 7 L22 7 M10 25 L22 25 M11 7 L21 25 M21 7 L11 25 M13 12 L19 12 M12.3 16 L19.7 16 M13 20 L19 20"
              stroke="#14293e"
              strokeWidth="1.3"
              strokeLinecap="round"
              fill="none"
            />
          </svg>
          <div style={{ fontSize: 30, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: "#8fb0d6" }}>
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
