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
  const layout = template.layout;

  const photoFilter = `contrast(${v.filterContrast}) saturate(${v.filterSaturate}) brightness(${v.filterBrightness})${v.filterSepia > 0 ? ` sepia(${v.filterSepia})` : ""}`;
  const L = layout as string; // for flexible comparisons with template IDs

  return (
    <div className={`relative aspect-square overflow-hidden select-none ${className}`} onClick={onClick} role={onClick ? "button" : undefined} style={{ borderRadius: `${v.borderRadius}px` }}>

      {/* Base photo */}
      <img src={imageUrl} alt="" className="absolute inset-0 w-full h-full object-cover" style={{ filter: photoFilter }} draggable={false} />

      {/* ── LAYOUT-SPECIFIC OVERLAYS ── */}

      {/* Vignette (most layouts) */}
      {!["bottom-bar", "side-panel", "minimal-caption"].includes(L) && (
        <div className="absolute inset-0" style={{ background: `radial-gradient(ellipse at center, transparent 35%, rgba(0,0,0,${v.vignetteStrength}) 100%)` }} />
      )}

      {/* BOTTOM GRADIENT */}
      {(L === "bottom-gradient" || L === "fullbleed-subtle") && (
        <div className="absolute inset-0" style={{ background: `linear-gradient(${v.gradientAngle}deg, transparent ${L === "fullbleed-subtle" ? "55%" : "40%"}, rgba(0,0,0,${v.overlayOpacity}) 100%)` }} />
      )}

      {/* CENTER HERO */}
      {L === "center-hero" && (
        <div className="absolute inset-0" style={{ background: `rgba(0,0,0,${v.overlayOpacity * 0.6})` }} />
      )}

      {/* TOP HEADLINE */}
      {L === "top-headline" && (
        <div className="absolute top-0 left-0 right-0 h-[40%]" style={{ background: `linear-gradient(to bottom, rgba(0,0,0,${v.overlayOpacity}) 0%, transparent 100%)` }} />
      )}

      {/* SIDE PANEL */}
      {L === "side-panel" && (
        <div className="absolute top-0 left-0 bottom-0 w-[40%]" style={{ background: `rgba(0,0,0,${v.overlayOpacity})`, backdropFilter: "blur(2px)" }} />
      )}

      {/* BOTTOM BAR */}
      {L === "bottom-bar" && (
        <div className="absolute bottom-0 left-0 right-0 h-[24%]" style={{ background: v.accentColor }} />
      )}

      {/* FROSTED CENTER */}
      {L === "frosted-center" && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[72%] py-8 px-6 rounded-2xl" style={{ background: `rgba(0,0,0,${v.overlayOpacity * 0.5})`, backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.12)" }} />
      )}

      {/* DIAGONAL SPLIT */}
      {L === "diagonal-split" && (
        <div className="absolute inset-0" style={{ background: `linear-gradient(${v.gradientAngle - 30}deg, rgba(0,0,0,${v.overlayOpacity}) 0%, rgba(0,0,0,${v.overlayOpacity}) 45%, transparent 45%)` }} />
      )}

      {/* FRAME INSET */}
      {L === "frame-inset" && (<>
        <div className="absolute inset-0" style={{ background: `linear-gradient(to top, rgba(0,0,0,${v.overlayOpacity}) 0%, transparent 50%)` }} />
        <div className="absolute pointer-events-none" style={{ inset: "14px", border: `1.5px solid ${v.accentColor}30` }} />
      </>)}

      {/* BANNER STRIPE */}
      {L === "banner-stripe" && (
        <div className="absolute left-0 right-0 top-[38%] h-[24%]" style={{ background: v.accentColor + "e6" }} />
      )}

      {/* CORNER CARD */}
      {L === "corner-card" && (<>
        <div className="absolute inset-0" style={{ background: `linear-gradient(to top, rgba(0,0,0,${v.overlayOpacity * 0.4}) 0%, transparent 40%)` }} />
        <div className="absolute bottom-4 left-4 right-4 p-4 rounded-xl" style={{ background: `rgba(0,0,0,${v.overlayOpacity})`, backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)", border: `1px solid ${v.accentColor}30` }} />
      </>)}

      {/* FLOATING PILL */}
      {L === "floating-pill" && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 px-8 py-5 rounded-full" style={{ background: `rgba(0,0,0,${v.overlayOpacity * 0.6})`, backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)", border: `1.5px solid ${v.accentColor}40` }} />
      )}

      {/* MAGAZINE GRID */}
      {L === "magazine-grid" && (<>
        <div className="absolute inset-0" style={{ background: `linear-gradient(to top, rgba(0,0,0,${v.overlayOpacity}) 0%, transparent 50%)` }} />
        <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: `linear-gradient(${v.accentColor}10 1px, transparent 1px), linear-gradient(90deg, ${v.accentColor}10 1px, transparent 1px)`, backgroundSize: "33.33% 33.33%" }} />
      </>)}

      {/* GRADIENT SWEEP */}
      {L === "gradient-sweep" && (
        <div className="absolute inset-0" style={{ background: `linear-gradient(${v.gradientAngle}deg, ${v.accentColor}cc 0%, transparent 60%)` }} />
      )}

      {/* SPOTLIGHT CIRCLE */}
      {L === "spotlight-circle" && (
        <div className="absolute inset-0" style={{ background: `radial-gradient(circle at 50% 50%, transparent 20%, rgba(0,0,0,${v.overlayOpacity}) 70%)` }} />
      )}

      {/* CINEMATIC BARS */}
      {L === "cinematic-bars" && (<>
        <div className="absolute top-0 left-0 right-0 h-[12%]" style={{ background: "black" }} />
        <div className="absolute bottom-0 left-0 right-0 h-[22%]" style={{ background: "black" }} />
      </>)}

      {/* SPLIT VERTICAL */}
      {L === "split-vertical" && (
        <div className="absolute top-0 left-0 bottom-0 w-[44%]" style={{ background: `rgba(0,0,0,${v.overlayOpacity})` }} />
      )}

      {/* MINIMAL CAPTION — almost no overlay */}
      {L === "minimal-caption" && (
        <div className="absolute bottom-0 left-0 right-0 h-[10%]" style={{ background: `linear-gradient(to top, rgba(0,0,0,0.6), transparent)` }} />
      )}

      {/* TEXT BLOCK */}
      {L === "text-block" && (
        <div className="absolute bottom-6 left-6 right-6 p-5 rounded-xl" style={{ background: `${v.accentColor}e6` }} />
      )}

      {/* DUAL TONE */}
      {L === "dual-tone" && (
        <div className="absolute inset-0" style={{ background: `linear-gradient(to right, ${v.accentColor}40 0%, ${v.accentColor}40 50%, transparent 50%)`, mixBlendMode: "multiply" }} />
      )}

      {/* BOTTOM WAVE */}
      {L === "bottom-wave" && (
        <div className="absolute bottom-0 left-0 right-0 h-[35%]" style={{ background: `linear-gradient(to top, rgba(0,0,0,${v.overlayOpacity}), transparent)` }} />
      )}

      {/* ── ACCENT LINE ── */}
      {!["bottom-bar", "banner-stripe", "minimal-caption", "floating-pill"].includes(L) && (
        <div className="absolute pointer-events-none" style={
          L === "top-headline"
            ? { top: "86px", left: "32px", width: `${v.accentWidth}px`, height: "2px", backgroundColor: v.accentColor }
            : L === "center-hero" || L === "frosted-center" || L === "spotlight-circle" || L === "vignette-focus"
            ? { top: "50%", left: "50%", transform: "translate(-50%, -42px)", width: `${v.accentWidth}px`, height: "2px", backgroundColor: v.accentColor }
            : L === "side-panel" || L === "split-vertical" || L === "diagonal-split"
            ? { top: "37%", left: "24px", width: `${v.accentWidth}px`, height: "2px", backgroundColor: v.accentColor }
            : { bottom: "70px", left: "32px", width: `${v.accentWidth}px`, height: "2px", backgroundColor: v.accentColor }
        } />
      )}

      {/* ── CORNER BRACKETS (bold layouts) ── */}
      {L === "center-hero" && (
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-5 left-5 w-10 h-10 border-t-2 border-l-2" style={{ borderColor: `${v.accentColor}60` }} />
          <div className="absolute bottom-5 right-5 w-10 h-10 border-b-2 border-r-2" style={{ borderColor: `${v.accentColor}60` }} />
        </div>
      )}

      {/* ── TEXT LAYERS ── */}
      <div className="absolute inset-0 pointer-events-none flex flex-col">

        {/* Headline */}
        {headline && (() => {
          const pos =
            L === "center-hero" || L === "frosted-center" || L === "floating-pill" || L === "spotlight-circle" || L === "vignette-focus"
              ? "inset-0 flex items-center justify-center text-center px-10"
            : L === "top-headline"
              ? "top-0 left-0 right-0 pt-8 px-8"
            : L === "side-panel" || L === "split-vertical" || L === "diagonal-split"
              ? "top-0 left-0 w-[40%] h-full flex items-center px-6"
            : L === "bottom-bar"
              ? "bottom-0 left-0 right-0 px-6 pb-[11%]"
            : L === "banner-stripe"
              ? "left-0 right-0 top-[38%] h-[24%] flex items-center justify-center px-8"
            : L === "corner-card"
              ? "bottom-4 left-4 right-4 p-4 flex items-end"
            : L === "text-block"
              ? "bottom-6 left-6 right-6 p-5"
            : L === "cinematic-bars"
              ? "bottom-[22%] left-0 right-0 px-8"
            : L === "minimal-caption"
              ? "bottom-0 left-0 right-0 px-4 pb-2"
            : "bottom-0 left-0 right-0 px-8 pb-16";

          const size =
            L === "center-hero" || L === "bold-statement" ? "text-2xl md:text-4xl"
            : L === "minimal-caption" ? "text-xs"
            : L === "bottom-bar" || L === "corner-card" ? "text-base md:text-lg"
            : "text-xl md:text-2xl";

          const weight = ["center-hero", "bold-statement", "banner-stripe", "cinematic-bars"].includes(L) ? "font-black" : "font-bold";
          const transform = ["center-hero", "bold-statement", "cinematic-bars"].includes(L) ? "uppercase" : "none";
          const color = L === "bottom-bar" ? "#0a0a0f" : L === "banner-stripe" ? "#0a0a0f" : L === "text-block" ? "#0a0a0f" : v.headlineColor;
          const shadow = ["bottom-bar", "banner-stripe", "text-block"].includes(L) ? "none" : "0 2px 8px rgba(0,0,0,0.9)";

          return (
            <div className={`absolute ${pos}`}>
              <p className={`${size} ${weight} leading-tight`} style={{ color, textTransform: transform as React.CSSProperties["textTransform"], filter: shadow !== "none" ? `drop-shadow(${shadow})` : undefined, display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical" as const, overflow: "hidden" }}>
                {headline}
              </p>
            </div>
          );
        })()}

        {/* Subline */}
        {subline && (() => {
          const pos =
            L === "center-hero" || L === "frosted-center" ? "bottom-0 left-0 right-0 text-center pb-14 px-8"
            : L === "top-headline" ? "top-0 left-0 right-0 pt-[88px] px-8"
            : L === "side-panel" || L === "split-vertical" ? "bottom-0 left-0 w-[40%] px-6 pb-10"
            : L === "bottom-bar" ? "bottom-0 left-0 right-0 px-6 pb-[4%]"
            : L === "corner-card" ? "bottom-4 left-4 right-4 px-4 pb-2"
            : L === "banner-stripe" ? "left-0 right-0 top-[62%] text-center px-8"
            : L === "minimal-caption" ? "hidden"
            : "bottom-0 left-0 right-0 px-8 pb-10";

          if (pos === "hidden") return null;
          const color = ["bottom-bar", "banner-stripe"].includes(L) ? "rgba(10,10,15,0.6)" : v.sublineColor;
          return (
            <div className={`absolute ${pos}`}>
              <p className="text-xs md:text-sm" style={{ color }}>{subline}</p>
            </div>
          );
        })()}

        {/* CTA */}
        {cta && (() => {
          const pos =
            L === "center-hero" ? "bottom-0 left-0 right-0 pb-8 flex justify-center"
            : L === "side-panel" || L === "split-vertical" ? "bottom-0 left-0 w-[40%] px-6 pb-5"
            : L === "frosted-center" ? "bottom-0 left-0 right-0 pb-6 flex justify-center"
            : L === "bottom-bar" || L === "minimal-caption" || L === "banner-stripe" ? "hidden"
            : "bottom-0 left-0 right-0 px-8 pb-4";

          if (pos === "hidden") return null;
          const style = L === "promo-split" || L === "promo-stripe"
            ? { background: v.accentColor, color: "#0a0a0f" }
            : { background: v.accentColor, color: "#0a0a0f" };

          return (
            <div className={`absolute ${pos}`}>
              <span className="inline-block px-4 py-1.5 text-[10px] font-bold rounded-full uppercase tracking-widest" style={style}>{cta}</span>
            </div>
          );
        })()}
      </div>
    </div>
  );
}
