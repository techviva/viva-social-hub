/* ══════════════════════════════════════════════════════════════════
   POST DESIGN TEMPLATES — Production-grade CSS post designs
   Each template defines the complete visual treatment:
   - Photo filter (CSS filter + mix-blend)
   - Overlay layers (gradients, shapes, frosted glass)
   - Typography (position, size, weight, color, shadow)
   - Decorative elements (lines, dots, frames)
   All rendering is pure CSS — zero AI dependency, 100% consistent.
   ══════════════════════════════════════════════════════════════════ */

export interface PostTemplate {
  id: string;
  name: string;
  category: "premium" | "bold" | "minimal" | "editorial" | "promo" | "engagement";
  preview: string; // CSS gradient for selector thumbnail
  // Photo treatment
  photoFilter: string; // CSS filter value
  photoBrightness?: number;
  // Overlay layers (bottom to top)
  overlays: OverlayLayer[];
  // Text config
  text: TextConfig;
  // Decorative elements
  decorations: DecorationElement[];
}

interface OverlayLayer {
  type: "gradient" | "solid" | "frosted" | "vignette";
  css: string; // Full CSS for the overlay div
  position: "full" | "bottom" | "top" | "center";
}

interface TextConfig {
  headline: {
    position: string; // Tailwind classes for positioning
    size: string;
    weight: string;
    color: string;
    shadow: string;
    maxLines: number;
    transform?: string;
  };
  subline?: {
    position: string;
    size: string;
    color: string;
    shadow: string;
  };
  cta?: {
    position: string;
    style: string; // Full Tailwind classes
  };
  accent?: {
    type: "line" | "dot" | "bracket";
    color: string;
    position: string;
  };
}

interface DecorationElement {
  type: "line" | "corner-brackets" | "border-inset" | "circle" | "pill" | "diamond";
  css: string;
}

/* ── TEMPLATE DEFINITIONS ── */

export const POST_TEMPLATES: PostTemplate[] = [
  // ═══════════ PREMIUM ═══════════
  {
    id: "cinematic-gold",
    name: "Cinematic Gold",
    category: "premium",
    preview: "linear-gradient(135deg, #d4a843, #0a0a0f)",
    photoFilter: "contrast(1.1) saturate(1.15) brightness(0.95)",
    overlays: [
      { type: "vignette", position: "full", css: "background: radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.5) 100%)" },
      { type: "gradient", position: "bottom", css: "background: linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.4) 40%, transparent 70%)" },
    ],
    text: {
      headline: { position: "bottom-0 left-0 right-0 px-8 pb-16", size: "text-2xl md:text-3xl", weight: "font-bold", color: "text-white", shadow: "drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]", maxLines: 2 },
      subline: { position: "bottom-0 left-0 right-0 px-8 pb-10", size: "text-xs md:text-sm", color: "text-white/60", shadow: "drop-shadow-[0_1px_4px_rgba(0,0,0,0.8)]" },
      cta: { position: "bottom-0 left-0 right-0 px-8 pb-4", style: "inline-block px-4 py-1.5 bg-[#d4a843] text-black text-[11px] font-bold rounded-full uppercase tracking-widest" },
      accent: { type: "line", color: "#d4a843", position: "bottom-0 left-8 mb-[72px] w-10 h-[2px]" },
    },
    decorations: [],
  },
  {
    id: "warm-editorial",
    name: "Warm Editorial",
    category: "premium",
    preview: "linear-gradient(135deg, #e8a87c, #1a1210)",
    photoFilter: "contrast(1.05) saturate(1.2) sepia(0.1) brightness(1.05)",
    overlays: [
      { type: "gradient", position: "bottom", css: "background: linear-gradient(to top, rgba(26,18,16,0.9) 0%, rgba(26,18,16,0.3) 50%, transparent 75%)" },
    ],
    text: {
      headline: { position: "bottom-0 left-0 right-0 px-8 pb-14", size: "text-xl md:text-2xl", weight: "font-bold", color: "text-[#fce4c4]", shadow: "drop-shadow-[0_2px_6px_rgba(0,0,0,0.9)]", maxLines: 2 },
      subline: { position: "bottom-0 left-0 right-0 px-8 pb-9", size: "text-xs", color: "text-[#c4a080]/70", shadow: "" },
      accent: { type: "line", color: "#e8a87c", position: "bottom-0 left-8 mb-[60px] w-8 h-[2px]" },
    },
    decorations: [
      { type: "border-inset", css: "absolute inset-[16px] border border-[#e8a87c]/15 rounded-lg pointer-events-none" },
    ],
  },
  {
    id: "dark-luxury",
    name: "Dark Luxury",
    category: "premium",
    preview: "linear-gradient(135deg, #f0d078, #12121a)",
    photoFilter: "contrast(1.2) brightness(0.85) saturate(1.1)",
    overlays: [
      { type: "solid", position: "full", css: "background: rgba(10,10,15,0.3)" },
      { type: "gradient", position: "bottom", css: "background: linear-gradient(to top, rgba(10,10,15,0.95) 0%, transparent 60%)" },
    ],
    text: {
      headline: { position: "bottom-0 left-0 right-0 px-8 pb-20", size: "text-2xl md:text-3xl", weight: "font-extrabold", color: "text-white", shadow: "drop-shadow-[0_2px_8px_rgba(0,0,0,0.95)]", maxLines: 2, transform: "uppercase" },
      subline: { position: "bottom-0 left-0 right-0 px-8 pb-14", size: "text-xs", color: "text-[#d4a843]", shadow: "" },
      cta: { position: "bottom-0 left-0 right-0 px-8 pb-5", style: "inline-block px-5 py-2 border border-[#d4a843] text-[#d4a843] text-[10px] font-bold rounded uppercase tracking-[0.2em]" },
      accent: { type: "line", color: "#d4a843", position: "bottom-0 left-8 mb-[88px] w-12 h-[1px]" },
    },
    decorations: [],
  },

  // ═══════════ BOLD ═══════════
  {
    id: "bold-center",
    name: "Bold Center",
    category: "bold",
    preview: "linear-gradient(135deg, #fff, #111)",
    photoFilter: "contrast(1.3) brightness(0.7) saturate(1.1)",
    overlays: [
      { type: "solid", position: "full", css: "background: rgba(0,0,0,0.45)" },
    ],
    text: {
      headline: { position: "inset-0 flex items-center justify-center px-10", size: "text-3xl md:text-4xl", weight: "font-black", color: "text-white", shadow: "drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)]", maxLines: 3, transform: "uppercase" },
      cta: { position: "bottom-0 left-0 right-0 pb-8 flex justify-center", style: "px-5 py-2 bg-[#d4a843] text-black text-[11px] font-bold rounded-full uppercase tracking-widest" },
    },
    decorations: [
      { type: "corner-brackets", css: "" }, // Handled specially in renderer
    ],
  },
  {
    id: "bold-diagonal",
    name: "Bold Diagonal",
    category: "bold",
    preview: "linear-gradient(135deg, #ff6b35, #111)",
    photoFilter: "contrast(1.2) brightness(0.8) saturate(1.3)",
    overlays: [
      { type: "gradient", position: "full", css: "background: linear-gradient(135deg, rgba(0,0,0,0.7) 0%, transparent 50%, rgba(0,0,0,0.5) 100%)" },
    ],
    text: {
      headline: { position: "top-0 left-0 right-0 pt-16 px-8", size: "text-3xl md:text-4xl", weight: "font-black", color: "text-white", shadow: "drop-shadow-[0_3px_10px_rgba(0,0,0,0.9)]", maxLines: 3, transform: "uppercase" },
      subline: { position: "bottom-0 left-0 right-0 px-8 pb-12", size: "text-sm", color: "text-white/70", shadow: "drop-shadow-[0_1px_4px_rgba(0,0,0,0.8)]" },
      accent: { type: "line", color: "#d4a843", position: "top-0 left-8 mt-[60px] w-16 h-[3px]" },
    },
    decorations: [],
  },

  // ═══════════ MINIMAL ═══════════
  {
    id: "clean-bar",
    name: "Clean Bar",
    category: "minimal",
    preview: "linear-gradient(135deg, #f8f8f8, #888)",
    photoFilter: "contrast(1.05) brightness(1.08) saturate(0.9)",
    overlays: [
      { type: "solid", position: "bottom", css: "background: rgba(255,255,255,0.92); height: 22%" },
    ],
    text: {
      headline: { position: "bottom-0 left-0 right-0 px-6 pb-[11%]", size: "text-base md:text-lg", weight: "font-bold", color: "text-[#1a1a2e]", shadow: "", maxLines: 2 },
      subline: { position: "bottom-0 left-0 right-0 px-6 pb-[4%]", size: "text-[10px]", color: "text-[#666]", shadow: "" },
      accent: { type: "dot", color: "#d4a843", position: "bottom-0 left-6 mb-[19%] w-2 h-2" },
    },
    decorations: [
      { type: "line", css: "absolute bottom-[22%] left-0 right-0 h-[2px] bg-[#d4a843]" },
    ],
  },
  {
    id: "clean-side",
    name: "Clean Side",
    category: "minimal",
    preview: "linear-gradient(135deg, #e8e8e8, #555)",
    photoFilter: "contrast(1.05) brightness(1.1) saturate(0.85)",
    overlays: [
      { type: "solid", position: "full", css: "background: linear-gradient(to right, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.95) 38%, transparent 38%)" },
    ],
    text: {
      headline: { position: "inset-0 flex items-center px-6 w-[36%]", size: "text-lg md:text-xl", weight: "font-bold", color: "text-[#1a1a2e]", shadow: "", maxLines: 4 },
      subline: { position: "bottom-0 left-0 px-6 pb-6 w-[36%]", size: "text-[10px]", color: "text-[#888]", shadow: "" },
      accent: { type: "line", color: "#d4a843", position: "top-0 left-6 mt-[38%] w-6 h-[2px]" },
    },
    decorations: [],
  },

  // ═══════════ EDITORIAL ═══════════
  {
    id: "magazine-cover",
    name: "Magazine Cover",
    category: "editorial",
    preview: "linear-gradient(135deg, #2d5a27, #0a0a0f)",
    photoFilter: "contrast(1.1) saturate(1.25) brightness(0.95)",
    overlays: [
      { type: "vignette", position: "full", css: "background: radial-gradient(ellipse at center, transparent 30%, rgba(0,0,0,0.6) 100%)" },
      { type: "gradient", position: "top", css: "background: linear-gradient(to bottom, rgba(0,0,0,0.6) 0%, transparent 40%); height: 40%" },
    ],
    text: {
      headline: { position: "top-0 left-0 right-0 pt-10 px-8", size: "text-3xl md:text-4xl", weight: "font-black", color: "text-white", shadow: "drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]", maxLines: 2, transform: "uppercase" },
      subline: { position: "bottom-0 left-0 right-0 px-8 pb-8", size: "text-xs", color: "text-white/50", shadow: "" },
      accent: { type: "line", color: "#d4a843", position: "top-0 left-8 mt-[92px] w-10 h-[2px]" },
    },
    decorations: [
      { type: "border-inset", css: "absolute inset-[20px] border border-white/10 pointer-events-none" },
    ],
  },
  {
    id: "photo-journal",
    name: "Photo Journal",
    category: "editorial",
    preview: "linear-gradient(135deg, #a0876c, #1a1a1a)",
    photoFilter: "contrast(1.08) saturate(0.9) brightness(1.02) sepia(0.08)",
    overlays: [
      { type: "gradient", position: "bottom", css: "background: linear-gradient(to top, rgba(20,18,16,0.95) 0%, rgba(20,18,16,0.5) 35%, transparent 55%)" },
    ],
    text: {
      headline: { position: "bottom-0 left-0 right-0 px-8 pb-16", size: "text-lg md:text-xl", weight: "font-semibold", color: "text-white", shadow: "", maxLines: 2 },
      subline: { position: "bottom-0 left-0 right-0 px-8 pb-10", size: "text-[11px]", color: "text-white/40", shadow: "" },
      accent: { type: "line", color: "#a0876c", position: "bottom-0 left-8 mb-[70px] w-6 h-[1px]" },
    },
    decorations: [],
  },

  // ═══════════ PROMO ═══════════
  {
    id: "promo-banner",
    name: "Promo Banner",
    category: "promo",
    preview: "linear-gradient(135deg, #d4a843, #2a1a00)",
    photoFilter: "contrast(1.15) brightness(0.9) saturate(1.2)",
    overlays: [
      { type: "gradient", position: "full", css: "background: linear-gradient(160deg, rgba(180,130,40,0.3) 0%, transparent 40%, rgba(0,0,0,0.7) 100%)" },
      { type: "solid", position: "bottom", css: "background: linear-gradient(to top, rgba(212,168,67,0.95) 0%, rgba(212,168,67,0.85) 100%); height: 28%" },
    ],
    text: {
      headline: { position: "bottom-0 left-0 right-0 px-6 pb-[14%]", size: "text-xl md:text-2xl", weight: "font-black", color: "text-[#0a0a0f]", shadow: "", maxLines: 2, transform: "uppercase" },
      subline: { position: "bottom-0 left-0 right-0 px-6 pb-[5%]", size: "text-[11px]", color: "text-[#0a0a0f]/70", shadow: "" },
      accent: { type: "line", color: "#0a0a0f", position: "bottom-0 left-6 mb-[24%] w-8 h-[2px]" },
    },
    decorations: [],
  },
  {
    id: "promo-split",
    name: "Promo Split",
    category: "promo",
    preview: "linear-gradient(135deg, #22c55e, #0a0a0f)",
    photoFilter: "contrast(1.1) brightness(0.95) saturate(1.3)",
    overlays: [
      { type: "solid", position: "full", css: "background: linear-gradient(to right, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.85) 42%, transparent 42%)" },
    ],
    text: {
      headline: { position: "inset-0 flex items-center px-6 w-[40%]", size: "text-xl md:text-2xl", weight: "font-black", color: "text-white", shadow: "", maxLines: 4, transform: "uppercase" },
      subline: { position: "bottom-0 left-0 px-6 pb-12 w-[40%]", size: "text-[10px]", color: "text-[#22c55e]", shadow: "" },
      cta: { position: "bottom-0 left-0 px-6 pb-5 w-[40%]", style: "inline-block px-4 py-1.5 bg-[#22c55e] text-black text-[10px] font-bold rounded-full uppercase tracking-wider" },
      accent: { type: "line", color: "#22c55e", position: "top-0 left-6 mt-[36%] w-8 h-[2px]" },
    },
    decorations: [
      { type: "line", css: "absolute top-0 bottom-0 left-[42%] w-[2px] bg-[#d4a843]/30" },
    ],
  },

  // ═══════════ ENGAGEMENT ═══════════
  {
    id: "question-frosted",
    name: "Question Frosted",
    category: "engagement",
    preview: "linear-gradient(135deg, #3b82f6, #0a0a0f)",
    photoFilter: "contrast(1.1) saturate(1.35) brightness(1.05)",
    overlays: [
      { type: "frosted", position: "center", css: "background: rgba(0,0,0,0.4); backdrop-filter: blur(16px); border: 1px solid rgba(255,255,255,0.15); border-radius: 20px; width: 75%; height: 30%; position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%)" },
    ],
    text: {
      headline: { position: "inset-0 flex items-center justify-center text-center px-16", size: "text-xl md:text-2xl", weight: "font-bold", color: "text-white", shadow: "drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)]", maxLines: 3 },
      cta: { position: "bottom-0 left-0 right-0 pb-6 flex justify-center", style: "px-4 py-1.5 bg-black/50 backdrop-blur-sm text-white/80 text-[10px] font-medium rounded-full border border-white/10" },
    },
    decorations: [],
  },
  {
    id: "engagement-pop",
    name: "Engagement Pop",
    category: "engagement",
    preview: "linear-gradient(135deg, #f59e0b, #0a0a0f)",
    photoFilter: "contrast(1.15) saturate(1.4) brightness(1.05)",
    overlays: [
      { type: "gradient", position: "full", css: "background: linear-gradient(to bottom, transparent 30%, rgba(0,0,0,0.8) 100%)" },
    ],
    text: {
      headline: { position: "bottom-0 left-0 right-0 px-6 pb-20", size: "text-2xl md:text-3xl", weight: "font-black", color: "text-[#fbbf24]", shadow: "drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]", maxLines: 2 },
      subline: { position: "bottom-0 left-0 right-0 px-6 pb-12", size: "text-sm", color: "text-white/80", shadow: "drop-shadow-[0_1px_4px_rgba(0,0,0,0.8)]" },
      cta: { position: "bottom-0 left-0 right-0 px-6 pb-4", style: "inline-block px-4 py-1.5 bg-[#fbbf24] text-black text-[10px] font-bold rounded-full uppercase" },
    },
    decorations: [],
  },
];

export function getTemplateById(id: string): PostTemplate | undefined {
  return POST_TEMPLATES.find((t) => t.id === id);
}

export function getTemplatesByCategory(category: PostTemplate["category"]): PostTemplate[] {
  return POST_TEMPLATES.filter((t) => t.category === category);
}

export function getRandomTemplate(): PostTemplate {
  return POST_TEMPLATES[Math.floor(Math.random() * POST_TEMPLATES.length)];
}
