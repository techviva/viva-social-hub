/* ══════════════════════════════════════════════════════════
   POST DESIGN SYSTEM — Viva Landscape & Design
   Simplified, reliable layouts with Viva brand palette only.
   ══════════════════════════════════════════════════════════ */

export interface StyleVariation {
  accentColor: string;
  gradientAngle: number;
  filterContrast: number;
  filterSaturate: number;
  filterBrightness: number;
  filterSepia: number;
  overlayOpacity: number;
  headlineColor: string;
  sublineColor: string;
  vignetteStrength: number;
  accentWidth: number;
  borderRadius: number;
}

// Viva brand palette ONLY
const VIVA_ACCENTS = [
  "#7ab82e", // verde lima vibrante (primary accent)
  "#3c4a30", // verde oscuro
  "#4d6340", // verde medio
  "#8fd440", // verde claro
  "#e3e3d2", // crema
  "#795220", // tierra
  "#a07a40", // tierra claro
];

export const DEFAULT_VARIATION: StyleVariation = {
  accentColor: "#7ab82e",
  gradientAngle: 180,
  filterContrast: 1.1,
  filterSaturate: 1.15,
  filterBrightness: 0.95,
  filterSepia: 0,
  overlayOpacity: 0.75,
  headlineColor: "#ffffff",
  sublineColor: "rgba(255,255,255,0.65)",
  vignetteStrength: 0.35,
  accentWidth: 32,
  borderRadius: 0,
};

export type LayoutType =
  | "bottom-text"     // gradient bottom + text in lower third
  | "center-text"     // dark overlay + centered text
  | "top-text"        // gradient top + text at top
  | "left-panel"      // dark panel left + text inside
  | "color-bar"       // accent color bar at bottom + text
  | "frosted-card"    // frosted glass card centered
  | "cinematic"       // letterbox bars + text in lower bar
  | "frame"           // inset border + gradient bottom + text
  | "stripe"          // accent stripe across middle + text
  | "minimal";        // almost no overlay, tiny text at bottom

export interface PostTemplate {
  id: string;
  name: string;
  category: string;
  preview: string;
  layout: LayoutType;
}

export const POST_TEMPLATES: PostTemplate[] = [
  { id: "viva-classic",    name: "Viva Classic",    category: "premium",     preview: "linear-gradient(135deg, #7ab82e, #141a10)", layout: "bottom-text" },
  { id: "earth-warm",      name: "Earth Warm",      category: "premium",     preview: "linear-gradient(135deg, #a07a40, #1a1210)", layout: "bottom-text" },
  { id: "dark-forest",     name: "Dark Forest",     category: "premium",     preview: "linear-gradient(135deg, #4d6340, #0a0f08)", layout: "frame" },
  { id: "bold-center",     name: "Bold Center",     category: "bold",        preview: "linear-gradient(135deg, #eee, #222)",       layout: "center-text" },
  { id: "bold-top",        name: "Bold Top",        category: "bold",        preview: "linear-gradient(135deg, #8fd440, #111)",    layout: "top-text" },
  { id: "clean-bar",       name: "Clean Bar",       category: "minimal",     preview: "linear-gradient(135deg, #e3e3d2, #666)",    layout: "color-bar" },
  { id: "side-panel",      name: "Side Panel",      category: "editorial",   preview: "linear-gradient(135deg, #3c4a30, #111)",    layout: "left-panel" },
  { id: "cinematic",       name: "Cinematic",       category: "editorial",   preview: "linear-gradient(135deg, #333, #000)",       layout: "cinematic" },
  { id: "frosted",         name: "Frosted Glass",   category: "engagement",  preview: "linear-gradient(135deg, #7ab82e40, #111)",  layout: "frosted-card" },
  { id: "promo-stripe",    name: "Promo Stripe",    category: "promo",       preview: "linear-gradient(135deg, #7ab82e, #3c4a30)", layout: "stripe" },
  { id: "whisper",         name: "Whisper",         category: "minimal",     preview: "linear-gradient(135deg, #ccc, #888)",       layout: "minimal" },
  { id: "viva-earth",      name: "Viva Earth",      category: "premium",     preview: "linear-gradient(135deg, #795220, #141a10)", layout: "frame" },
];

export function getTemplateById(id: string): PostTemplate | undefined {
  return POST_TEMPLATES.find((t) => t.id === id);
}

export function getRandomVariation(baseAccent?: string): StyleVariation {
  // Force Viva palette — ignore any non-Viva accent
  let accent = baseAccent && VIVA_ACCENTS.includes(baseAccent) ? baseAccent : VIVA_ACCENTS[Math.floor(Math.random() * VIVA_ACCENTS.length)];

  return {
    accentColor: accent,
    gradientAngle: 170 + Math.floor(Math.random() * 20), // subtle variation, mostly bottom-up
    filterContrast: 1.05 + Math.random() * 0.2,
    filterSaturate: 1.0 + Math.random() * 0.3,
    filterBrightness: 0.85 + Math.random() * 0.2,
    filterSepia: Math.random() * 0.08,
    overlayOpacity: 0.6 + Math.random() * 0.2,
    headlineColor: "#ffffff",
    sublineColor: `rgba(255,255,255,${(0.55 + Math.random() * 0.15).toFixed(2)})`,
    vignetteStrength: 0.25 + Math.random() * 0.2,
    accentWidth: 24 + Math.floor(Math.random() * 20),
    borderRadius: 0,
  };
}
