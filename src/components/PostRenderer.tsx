"use client";

import { type PostTemplate } from "@/lib/post-templates";

interface PostRendererProps {
  template: PostTemplate;
  imageUrl: string;
  headline: string;
  subline?: string;
  cta?: string;
  className?: string;
  onClick?: () => void;
}

export default function PostRenderer({ template, imageUrl, headline, subline, cta, className = "", onClick }: PostRendererProps) {
  const t = template;

  return (
    <div
      className={`relative aspect-square overflow-hidden ${className}`}
      onClick={onClick}
      role={onClick ? "button" : undefined}
    >
      {/* Base photo with CSS filter */}
      <img
        src={imageUrl}
        alt=""
        className="absolute inset-0 w-full h-full object-cover"
        style={{ filter: t.photoFilter }}
      />

      {/* Overlay layers */}
      {t.overlays.map((overlay, i) => {
        const positionStyle: React.CSSProperties = {};

        if (overlay.position === "bottom") {
          positionStyle.position = "absolute";
          positionStyle.bottom = "0";
          positionStyle.left = "0";
          positionStyle.right = "0";
          // Extract height from css if specified
          const heightMatch = overlay.css.match(/height:\s*(\d+%?)/);
          positionStyle.height = heightMatch ? heightMatch[1] : "50%";
        } else if (overlay.position === "top") {
          positionStyle.position = "absolute";
          positionStyle.top = "0";
          positionStyle.left = "0";
          positionStyle.right = "0";
          const heightMatch = overlay.css.match(/height:\s*(\d+%?)/);
          positionStyle.height = heightMatch ? heightMatch[1] : "40%";
        } else if (overlay.position === "center") {
          // Frosted glass center — css has full positioning
        } else {
          positionStyle.position = "absolute";
          positionStyle.inset = "0";
        }

        // Parse the css string into background/backdrop-filter
        const bgMatch = overlay.css.match(/background:\s*([^;]+)/);
        const bdMatch = overlay.css.match(/backdrop-filter:\s*([^;]+)/);
        const borderMatch = overlay.css.match(/border:\s*([^;]+)/);
        const radiusMatch = overlay.css.match(/border-radius:\s*([^;]+)/);
        const widthMatch = overlay.css.match(/width:\s*([^;]+)/);
        const heightMatch2 = overlay.css.match(/height:\s*([^;]+)/);

        if (overlay.position === "center") {
          // Special centered frosted element
          return (
            <div key={i} className="absolute" style={{
              top: "50%", left: "50%", transform: "translate(-50%, -50%)",
              width: widthMatch ? widthMatch[1] : "70%",
              height: heightMatch2 ? heightMatch2[1] : "28%",
              background: bgMatch ? bgMatch[1] : undefined,
              backdropFilter: bdMatch ? bdMatch[1] : undefined,
              WebkitBackdropFilter: bdMatch ? bdMatch[1] : undefined,
              border: borderMatch ? borderMatch[1] : undefined,
              borderRadius: radiusMatch ? radiusMatch[1] : "16px",
            }} />
          );
        }

        return (
          <div key={i} style={{
            ...positionStyle,
            background: bgMatch ? bgMatch[1] : undefined,
            backdropFilter: bdMatch ? bdMatch[1] : undefined,
            WebkitBackdropFilter: bdMatch ? bdMatch[1] : undefined,
          }} />
        );
      })}

      {/* Decorative elements */}
      {t.decorations.map((dec, i) => {
        if (dec.type === "corner-brackets") {
          return (
            <div key={i} className="absolute inset-0 pointer-events-none">
              {/* Top-left bracket */}
              <div className="absolute top-5 left-5 w-12 h-12 border-t-2 border-l-2 border-[#d4a843]/60" />
              {/* Bottom-right bracket */}
              <div className="absolute bottom-5 right-5 w-12 h-12 border-b-2 border-r-2 border-[#d4a843]/60" />
            </div>
          );
        }
        if (dec.css) {
          return <div key={i} className={dec.css} />;
        }
        return null;
      })}

      {/* Accent element */}
      {t.text.accent && (
        <div className={`absolute ${t.text.accent.position} rounded-full`} style={{
          backgroundColor: t.text.accent.color,
          ...(t.text.accent.type === "dot" ? { borderRadius: "50%" } : {}),
        }} />
      )}

      {/* Text layers — always perfect, always readable */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Headline */}
        {headline && (
          <div className={`absolute ${t.text.headline.position}`}>
            <p className={`${t.text.headline.size} ${t.text.headline.weight} ${t.text.headline.color} ${t.text.headline.shadow} leading-tight`}
              style={{
                textTransform: (t.text.headline.transform as React.CSSProperties["textTransform"]) || "none",
                display: "-webkit-box",
                WebkitLineClamp: t.text.headline.maxLines,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
              }}>
              {headline}
            </p>
          </div>
        )}

        {/* Subline */}
        {subline && t.text.subline && (
          <div className={`absolute ${t.text.subline.position}`}>
            <p className={`${t.text.subline.size} ${t.text.subline.color} ${t.text.subline.shadow}`}>
              {subline}
            </p>
          </div>
        )}

        {/* CTA */}
        {cta && t.text.cta && (
          <div className={`absolute ${t.text.cta.position}`}>
            <span className={t.text.cta.style}>{cta}</span>
          </div>
        )}
      </div>
    </div>
  );
}
