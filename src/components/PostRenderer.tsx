"use client";

import { type PostTemplate, type StyleVariation, DEFAULT_VARIATION } from "@/lib/post-templates";

interface PostRendererProps {
  template: PostTemplate;
  variation?: StyleVariation;
  imageUrl: string;
  headline: string;
  subline?: string;
  cta?: string;
  className?: string;
  onClick?: () => void;
}

export default function PostRenderer({ template, variation, imageUrl, headline, subline, cta, className = "", onClick }: PostRendererProps) {
  const v = variation || DEFAULT_VARIATION;
  const L = template.layout;
  const filter = `contrast(${v.filterContrast}) saturate(${v.filterSaturate}) brightness(${v.filterBrightness})${v.filterSepia > 0 ? ` sepia(${v.filterSepia})` : ""}`;

  // Colors that work on dark vs light backgrounds
  const onDark = { head: "#ffffff", sub: v.sublineColor, shadow: "drop-shadow(0 2px 6px rgba(0,0,0,0.9))" };
  const onLight = { head: "#141a10", sub: "rgba(20,26,16,0.6)", shadow: "none" };
  const isLightBg = L === "color-bar" || L === "stripe";
  const c = isLightBg ? onLight : onDark;

  return (
    <div className={`relative aspect-square overflow-hidden select-none ${className}`} onClick={onClick} role={onClick ? "button" : undefined}>

      {/* Photo */}
      <img src={imageUrl} alt="" className="absolute inset-0 w-full h-full object-cover" style={{ filter }} draggable={false} />

      {/* Vignette */}
      {!["color-bar", "minimal"].includes(L) && (
        <div className="absolute inset-0" style={{ background: `radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,${v.vignetteStrength}) 100%)` }} />
      )}

      {/* ═══ OVERLAYS PER LAYOUT ═══ */}

      {L === "bottom-text" && (
        <div className="absolute inset-0" style={{ background: `linear-gradient(to top, rgba(0,0,0,${v.overlayOpacity}) 0%, rgba(0,0,0,0.2) 45%, transparent 65%)` }} />
      )}

      {L === "center-text" && (
        <div className="absolute inset-0" style={{ background: `rgba(0,0,0,${v.overlayOpacity * 0.55})` }} />
      )}

      {L === "top-text" && (
        <div className="absolute inset-0" style={{ background: `linear-gradient(to bottom, rgba(0,0,0,${v.overlayOpacity}) 0%, rgba(0,0,0,0.15) 45%, transparent 60%)` }} />
      )}

      {L === "left-panel" && (
        <div className="absolute top-0 left-0 bottom-0 w-[42%]" style={{ background: `rgba(20,26,16,${v.overlayOpacity})`, backdropFilter: "blur(4px)" }} />
      )}

      {L === "color-bar" && (
        <div className="absolute bottom-0 left-0 right-0" style={{ height: "26%", background: v.accentColor }} />
      )}

      {L === "frosted-card" && (<>
        <div className="absolute inset-0" style={{ background: "rgba(0,0,0,0.15)" }} />
        <div className="absolute inset-x-[14%] top-[30%] bottom-[30%] rounded-2xl" style={{ background: `rgba(20,26,16,${v.overlayOpacity * 0.55})`, backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", border: `1px solid rgba(122,184,46,0.15)` }} />
      </>)}

      {L === "cinematic" && (<>
        <div className="absolute top-0 left-0 right-0" style={{ height: "13%", background: "#0a0f08" }} />
        <div className="absolute bottom-0 left-0 right-0" style={{ height: "25%", background: "#0a0f08" }} />
      </>)}

      {L === "frame" && (<>
        <div className="absolute inset-0" style={{ background: `linear-gradient(to top, rgba(0,0,0,${v.overlayOpacity}) 0%, transparent 55%)` }} />
        <div className="absolute pointer-events-none" style={{ inset: "16px", border: `1.5px solid ${v.accentColor}35` }} />
      </>)}

      {L === "stripe" && (
        <div className="absolute left-0 right-0" style={{ top: "40%", height: "22%", background: v.accentColor + "ee" }} />
      )}

      {L === "minimal" && (
        <div className="absolute bottom-0 left-0 right-0" style={{ height: "12%", background: "linear-gradient(to top, rgba(0,0,0,0.5), transparent)" }} />
      )}

      {/* ═══ ACCENT LINE ═══ */}
      {!["color-bar", "stripe", "minimal"].includes(L) && (
        <div className="absolute pointer-events-none" style={{
          backgroundColor: v.accentColor,
          height: "2px",
          width: `${v.accentWidth}px`,
          borderRadius: "1px",
          ...(L === "center-text" || L === "frosted-card"
            ? { left: "50%", top: "50%", transform: "translate(-50%, -32px)" }
            : L === "top-text"
            ? { left: "32px", top: "80px" }
            : L === "left-panel"
            ? { left: "20px", top: "40%" }
            : L === "cinematic"
            ? { left: "32px", bottom: "26%" }
            : { left: "32px", bottom: "68px" } // bottom-text, frame
          ),
        }} />
      )}

      {/* Corner brackets for center-text */}
      {L === "center-text" && (
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-5 left-5 w-8 h-8 border-t-[1.5px] border-l-[1.5px]" style={{ borderColor: `${v.accentColor}50` }} />
          <div className="absolute bottom-5 right-5 w-8 h-8 border-b-[1.5px] border-r-[1.5px]" style={{ borderColor: `${v.accentColor}50` }} />
        </div>
      )}

      {/* ═══ TEXT — always perfectly positioned ═══ */}

      {/* HEADLINE */}
      {headline && (
        <div className={`absolute z-10 ${
          L === "center-text" || L === "frosted-card" ? "inset-0 flex items-center justify-center px-[16%]" :
          L === "top-text" ? "top-0 left-0 right-0 pt-[88px] px-8" :
          L === "left-panel" ? "top-0 left-0 bottom-0 w-[42%] flex items-center px-5" :
          L === "color-bar" ? "bottom-0 left-0 right-0 px-6 pb-[12%]" :
          L === "stripe" ? "left-0 right-0 flex items-center justify-center px-8" :
          L === "cinematic" ? "bottom-0 left-0 right-0 px-8 pb-[26%]" :
          L === "minimal" ? "bottom-0 left-0 right-0 px-5 pb-3" :
          "bottom-0 left-0 right-0 px-8 pb-[56px]" // bottom-text, frame
        }`}
          style={L === "stripe" ? { top: "40%", height: "22%" } : undefined}
        >
          <p className={`leading-tight ${
            L === "center-text" ? "text-2xl md:text-3xl font-black text-center uppercase" :
            L === "frosted-card" ? "text-xl md:text-2xl font-bold text-center" :
            L === "minimal" ? "text-xs font-medium" :
            L === "color-bar" || L === "stripe" ? "text-lg md:text-xl font-bold" :
            "text-xl md:text-2xl font-bold"
          }`}
            style={{
              color: c.head,
              filter: c.shadow,
              display: "-webkit-box",
              WebkitLineClamp: L === "minimal" ? 1 : 3,
              WebkitBoxOrient: "vertical" as const,
              overflow: "hidden",
            }}
          >
            {headline}
          </p>
        </div>
      )}

      {/* SUBLINE */}
      {subline && !["minimal", "stripe"].includes(L) && (
        <div className={`absolute z-10 ${
          L === "center-text" || L === "frosted-card" ? "bottom-0 left-0 right-0 text-center px-10 pb-12" :
          L === "top-text" ? "top-0 left-0 right-0 pt-[132px] px-8" :
          L === "left-panel" ? "bottom-0 left-0 w-[42%] px-5 pb-8" :
          L === "color-bar" ? "bottom-0 left-0 right-0 px-6 pb-[4%]" :
          L === "cinematic" ? "bottom-0 left-0 right-0 px-8 pb-[15%]" :
          "bottom-0 left-0 right-0 px-8 pb-9" // bottom-text, frame
        }`}>
          <p className="text-xs md:text-sm" style={{ color: c.sub }}>{subline}</p>
        </div>
      )}

      {/* CTA */}
      {cta && !["minimal", "color-bar", "stripe"].includes(L) && (
        <div className={`absolute z-10 ${
          L === "center-text" || L === "frosted-card" ? "bottom-0 left-0 right-0 pb-5 flex justify-center" :
          L === "left-panel" ? "bottom-0 left-0 w-[42%] px-5 pb-4" :
          "bottom-0 left-0 right-0 px-8 pb-3"
        }`}>
          <span className="inline-block px-4 py-1.5 text-[10px] font-bold rounded-full uppercase tracking-widest"
            style={{ background: v.accentColor, color: "#141a10" }}>{cta}</span>
        </div>
      )}
    </div>
  );
}
