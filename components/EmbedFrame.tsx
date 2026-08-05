"use client";

import { useState } from "react";

// Cross-origin iframes can't be inspected for whether their content actually
// loaded successfully (only whether the frame itself fired `load`), so this
// can only cover the "blank while loading" case, not detect real failures --
// callers should pair it with a visible "open directly" fallback link.
type IframePassthroughProps = Omit<
  React.IframeHTMLAttributes<HTMLIFrameElement>,
  "src" | "title" | "className" | "style" | "onLoad" | "loading"
>;

export default function EmbedFrame({
  src,
  title,
  className,
  style,
  loadingLabel = "Loading…",
  allowFullScreen,
  ...rest
}: {
  src: string;
  title: string;
  className?: string;
  style?: React.CSSProperties;
  loadingLabel?: string;
  allowFullScreen?: boolean;
} & IframePassthroughProps) {
  const [loaded, setLoaded] = useState(false);

  return (
    <div className="relative">
      {!loaded && (
        <div
          className="absolute inset-0 flex items-center justify-center rounded"
          style={{ ...style, background: "var(--paper-raised)", border: "1px solid var(--hairline)" }}
          aria-hidden="true"
        >
          <span className="text-sm animate-pulse" style={{ color: "var(--ink-muted)" }}>
            {loadingLabel}
          </span>
        </div>
      )}
      <iframe
        title={title}
        src={src}
        onLoad={() => setLoaded(true)}
        className={className}
        style={{ ...style, border: "1px solid var(--hairline)" }}
        loading="lazy"
        allowFullScreen={allowFullScreen}
        {...rest}
      />
    </div>
  );
}
