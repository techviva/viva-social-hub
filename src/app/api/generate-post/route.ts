import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 30;

function extractJSON(text: string): string {
  let cleaned = text.trim();
  if (cleaned.startsWith("```")) cleaned = cleaned.replace(/^```(?:json)?\s*\n?/, "").replace(/\n?```\s*$/, "");
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  if (start !== -1 && end !== -1 && end > start) return cleaned.slice(start, end + 1);
  return cleaned;
}

const DRIVE_CATEGORIES = ["best-of-viva", "before-after", "pavers", "turf", "pergolas", "softscape", "lighting", "drone", "landscape", "spotlights", "google-business"];
const TEMPLATE_IDS = ["viva-classic", "earth-warm", "dark-forest", "bold-center", "bold-top", "clean-bar", "side-panel", "cinematic", "frosted", "promo-stripe", "whisper", "viva-earth"];
const PRESET_IDS = ["gradient-text-overlay", "before-after-split", "stat-highlight", "testimonial-visual", "service-spotlight", "tip-educational", "question-engagement", "weekend-inspiration", "milestone-celebration", "close-up-detail", "seasonal-offer", "project-showcase", "comparison-focus", "bold-statement"];

/* ── The 14 production-tested prompt templates from post-design-presets.json ── */
const PRESET_PROMPTS: Record<string, string> = {
  "gradient-text-overlay": "Edit this real landscaping photo into a professional Instagram post design. Keep the original photo as the main visual — this is a REAL project photo and must remain recognizable. Apply these professional post-production edits:\n1. CINEMATIC COLOR GRADE: Enhance the colors to feel warm and premium — boost the greens, add warm golden tones to the light, deepen shadows slightly for depth. Editorial photography look.\n2. GRADIENT OVERLAY: Add a smooth dark gradient from the bottom of the image (going up about 35-40% of the image). The gradient should be dark forest green (#3c4a30) fading to transparent.\n3. TEXT OVERLAY on the gradient area: In bold white modern sans-serif font (like Montserrat Bold), write '{{HEADLINE}}' on one line, and below it '{{SUBLINE}}' in bright green (#91c039).\n4. SMALL CTA at the very bottom in thin white text: '{{CTA}}'\n5. The overall result should look like a premium social media post designed by a top marketing agency.\nIMPORTANT: The original photo must be clearly visible and recognizable — you are EDITING it, not replacing it. Square format (1:1 ratio, 1080x1080). ALL TEXT MUST BE FULLY VISIBLE within the image with minimum 60px margin from edges. If text is long, make font smaller — NEVER let text get cut off.",

  "before-after-split": "Using this real landscaping photo as the 'AFTER' side, create a professional Instagram before/after post design. Create a split-screen square image (1080x1080):\nLEFT SIDE ('BEFORE'): Show a similar Arizona backyard in its 'before' state — bare desert dirt, no landscaping, empty neglected yard, harsh flat lighting. Apply desaturated, flat, unappealing color treatment.\nRIGHT SIDE ('AFTER'): Use the original photo as reference showing the completed project. Apply warm, cinematic golden hour color grading.\nDESIGN ELEMENTS:\n- Bold white 'BEFORE' label at top-left, 'AFTER' label at top-right\n- Thin white vertical dividing line between sides\n- Bottom: semi-transparent dark bar with white text: '{{HEADLINE}}'\n- Professional quality. Square format. ALL TEXT FULLY VISIBLE.",

  "stat-highlight": "Edit this real photo of a completed landscaping project into a professional Instagram post with a data/stat highlight design. Keep the original photo clearly visible.\n1. CINEMATIC COLOR GRADE: Rich teal-and-warm treatment — enhance greens, warm tones, deep contrast.\n2. SUBTLE DARK VIGNETTE around edges.\n3. GRADIENT OVERLAY: Gentle dark overlay from top (about 30%) for text readability.\n4. LARGE STAT TEXT at top area: '{{STAT_NUMBER}}' in huge bold white typography, with '{{STAT_UNIT}}' below in bright green (#91c039).\n5. Below: '{{STAT_DETAIL}}' in clean white, smaller.\n6. Bottom: small green accent text.\nReal photo visible. Square (1:1, 1080x1080). ALL TEXT FULLY VISIBLE with 60px margin from edges.",

  "testimonial-visual": "Edit this real landscaping photo into a professional Instagram testimonial post. Keep the original photo visible.\n1. MOOD: Warm golden hour tones, soft golden light, inviting and premium.\n2. DARK OVERLAY: Semi-transparent (50-55% opacity) for readability.\n3. QUOTE MARKS: Large decorative green (#91c039) opening quotation marks upper-left.\n4. TESTIMONIAL in elegant white font: '{{QUOTE}}'\n5. Below in smaller light gray: '{{ATTRIBUTION}}'\n6. Five green (#91c039) star icons in a row.\n7. Bottom: '{{CTA}}'\nReal photo visible through overlay. Square (1:1, 1080x1080). ALL TEXT FULLY VISIBLE.",

  "service-spotlight": "Edit this real landscaping photo into a professional Instagram service spotlight post. Keep the original photo recognizable.\n1. CINEMATIC COLOR GRADE: Warm, premium, magazine quality.\n2. CLEAN BANNER: Semi-transparent dark green (#3c4a30 at 70%) horizontal banner across lower third.\n3. On banner: '{{SERVICE}}' in large bold white uppercase.\n4. Below: '{{SUBLINE}}' in bright green (#91c039).\n5. Bottom: '{{CTA}}' in small white.\nPremium service catalog feel. Square (1:1, 1080x1080). ALL TEXT FULLY VISIBLE.",

  "tip-educational": "Edit this real landscaping photo into a professional Instagram educational tip post.\n1. COLOR GRADE: Clean, crisp, authoritative. Slightly cool premium tones.\n2. DARK OVERLAY at 55% opacity for readability.\n3. TOP: Rounded badge with '{{TIP_TITLE}}' in bold bright green (#91c039).\n4. MAIN TEXT below in clean white: '{{TIP_BODY}}'\n5. BOTTOM: '{{CTA}}' in small white.\nInformative and premium. Square (1:1, 1080x1080). ALL TEXT FULLY VISIBLE.",

  "question-engagement": "Edit this real landscaping photo into a professional Instagram engagement post.\n1. CINEMATIC COLOR GRADE: Warm, dreamy, aspirational. Golden tones.\n2. LIGHT GRADIENT: Subtle dark from bottom (25%).\n3. QUESTION TEXT: Large bold white near bottom: '{{QUESTION}}'\n4. Below in small green (#91c039): 'Tell us in the comments'\nAspirational mood. Square (1:1, 1080x1080). ALL TEXT FULLY VISIBLE.",

  "weekend-inspiration": "Edit this real landscaping photo into a premium Instagram inspiration post. Photo is the star — minimal text.\n1. CINEMATIC COLOR GRADE — HEAVY: Rich golden hour, saturated greens, warm amber shadows, subtle grain. Like a premium lifestyle documentary frame.\n2. SOFT VIGNETTE at edges.\n3. MINIMAL TEXT: Very small elegant text bottom-right: '{{HEADLINE}}' in thin white.\n4. No CTA, no banner. Let the photo breathe.\nAspirational, peaceful, premium. Square (1:1, 1080x1080).",

  "milestone-celebration": "Edit this real landscaping photo into a professional milestone celebration post.\n1. WARM COLOR GRADE: Premium, celebratory, golden light.\n2. DARK OVERLAY at ~50%.\n3. LARGE NUMBER: '{{STAT_NUMBER}}' in huge bold white, centered.\n4. CONTEXT: '{{STAT_UNIT}}' in bright green (#91c039) below.\n5. DETAIL: '{{STAT_DETAIL}}' in white below.\n6. Bottom: '{{CTA}}'\nPride and accomplishment. Square (1:1, 1080x1080). ALL TEXT FULLY VISIBLE.",

  "close-up-detail": "Edit this real close-up landscaping photo into a craftsmanship Instagram post.\n1. COLOR GRADE: Clean, crisp, architectural magazine. Sharp details, premium material feel.\n2. THIN ACCENT LINE: Bright green (#91c039) L-shape in one corner.\n3. LABEL: Bottom-left, small dark (#3c4a30) pill badge with '{{SERVICE}}' in white.\n4. Bottom-right: '{{SUBLINE}}' in small elegant text.\nMinimal, clean, let craftsmanship speak. Square (1:1, 1080x1080). ALL TEXT FULLY VISIBLE.",

  "seasonal-offer": "Edit this real landscaping photo into a professional seasonal promotion post.\n1. SEASONAL COLOR GRADE: {{SEASON}} mood, premium, inviting.\n2. ACCENT BANNER: Bold horizontal upper-third — dark green (#3c4a30 at 75%).\n3. On banner: '{{SEASON}} SPECIAL' in green (#91c039), '{{OFFER}}' in large bold white.\n4. LOWER: Gradient with CTA: '{{CTA}}' in white.\nUrgency + premium, not discount-store vibes. Square (1:1, 1080x1080). ALL TEXT FULLY VISIBLE.",

  "project-showcase": "Edit this real landscaping photo into a project showcase card.\n1. CINEMATIC COLOR GRADE: Rich, warm, magazine-quality.\n2. BOTTOM CARD: Dark panel (#3c4a30 at 80%) covering bottom ~35%.\n3. On panel: '{{PROJECT_TYPE}}' in bold white.\n4. Below in green (#91c039): '{{LOCATION}}'\n5. Feature list: '{{LIST_ITEMS}}' in smaller white.\nPortfolio card feel. Square (1:1, 1080x1080). ALL TEXT FULLY VISIBLE.",

  "comparison-focus": "Edit this real photo into a comparison/feature highlight post.\n1. COLOR GRADE: Clean, bright, professional.\n2. CIRCULAR CALLOUT: Green (#91c039) focus ring highlighting key detail.\n3. CONNECTING LINE from circle to label.\n4. LABEL: '{{SERVICE}}' on dark pill badge in white.\n5. BOTTOM: '{{TIP_BODY}}' in white, '{{CTA}}' in green.\nInfoographic meets premium photography. Square (1:1, 1080x1080). ALL TEXT FULLY VISIBLE.",

  "bold-statement": "Edit this real landscaping photo into a bold typography-forward post.\n1. HEAVY DARK OVERLAY: 65-70% opacity. Photo visible but mood is dramatic.\n2. LARGE BOLD TEXT centered: '{{HEADLINE}}' in massive white bold sans-serif. Takes up 40-50% of image.\n3. One key word in bright green (#91c039) instead of white.\n4. Thin green divider line below headline.\n5. Below: '{{SUBLINE}}' in smaller white.\n6. Bottom: '{{CTA}}' in small white.\nConfident, bold, commanding. Square (1:1, 1080x1080). ALL TEXT FULLY VISIBLE with 80px margin from all edges.",
};

export async function POST(req: NextRequest) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return NextResponse.json({ error: "ANTHROPIC_API_KEY no configurada" }, { status: 500 });

  let body;
  try { body = await req.json(); } catch { return NextResponse.json({ error: "Body invalido" }, { status: 400 }); }

  const { prompt, platform, channelType, batchIndex, batchTotal } = body;
  if (!prompt?.trim()) return NextResponse.json({ error: "Se necesita un prompt" }, { status: 400 });

  const isBatch = (batchTotal || 1) > 1;

  const systemPrompt = `Eres un director creativo senior de Viva Landscape & Design, Phoenix, Arizona.

Tu trabajo: generar el COPY de la publicacion + elegir y personalizar un PRESET de diseño de nuestra biblioteca profesional.

═══ COPY ═══
- Tono: profesional pero cercano
- Idioma: español mexicano con terminos de landscaping en ingles
- headline: MAXIMO 4-5 palabras en INGLES (para la imagen)
- subline: 5-8 palabras max en ingles
- ctaText: 2-3 palabras en ingles

═══ PRESET DE DISEÑO ═══
Elige UNO de estos 14 presets y rellena sus variables:
${PRESET_IDS.map((id, i) => `${i + 1}. ${id}`).join("\n")}

Cada preset tiene variables que debes rellenar (en INGLES para la imagen):
- {{HEADLINE}}: 2-4 palabras bold (ej: "YOUR OUTDOOR PARADISE")
- {{SUBLINE}}: 1-2 palabras accent (ej: "LIVE OUTSIDE")
- {{CTA}}: call to action (ej: "Schedule Your Free Design Consultation")
- {{SERVICE}}: servicio (ej: "Artificial Turf", "Custom Pergolas")
- {{QUOTE}}: testimonial (ej: "They transformed our backyard into paradise.")
- {{ATTRIBUTION}}: nombre (ej: "— The Martinez Family, Chandler AZ")
- {{STAT_NUMBER}}: numero grande (ej: "2,400")
- {{STAT_UNIT}}: unidad (ej: "SQ FT")
- {{STAT_DETAIL}}: detalle (ej: "of outdoor living space — built in 14 days")
- {{TIP_TITLE}}: titulo tip (ej: "PRO TIP", "DID YOU KNOW?")
- {{TIP_BODY}}: contenido tip
- {{QUESTION}}: pregunta engagement
- {{SEASON}}: temporada
- {{OFFER}}: oferta activa
- {{PROJECT_TYPE}}: tipo proyecto
- {{LOCATION}}: ubicacion
- {{DURATION}}: duracion
- {{LIST_ITEMS}}: lista (ej: "Pavers • Turf • Pergola • Lighting")

REGLAS:
- Elige el preset que MEJOR se adapte al tema
- En batch, NUNCA repitas el mismo preset
- Variables en INGLES (van en la imagen)
- Caption en ESPAÑOL (va en el texto del post)

Responde UNICAMENTE con JSON puro.

{
  "title": "Titulo interno",
  "caption": "Caption en ESPAÑOL con emojis. Max 2200 chars.",
  "hashtags": "#hash1 #hash2 ... (10-15)",
  "headline": "EN INGLES 4-5 palabras",
  "subline": "EN INGLES subtexto",
  "ctaText": "EN INGLES CTA",
  "driveCategory": "Una de: ${DRIVE_CATEGORIES.join(", ")}",
  "templateId": "Una de: ${TEMPLATE_IDS.join(", ")}",
  "presetId": "Una de: ${PRESET_IDS.join(", ")}",
  "presetVariables": {
    "HEADLINE": "valor",
    "SUBLINE": "valor",
    "CTA": "valor"
  },
  "variation": {
    "accentColor": "#7ab82e",
    "gradientAngle": 180,
    "filterContrast": 1.1,
    "filterSaturate": 1.15,
    "filterBrightness": 0.95,
    "filterSepia": 0,
    "overlayOpacity": 0.7,
    "headlineColor": "#ffffff",
    "sublineColor": "rgba(255,255,255,0.6)",
    "vignetteStrength": 0.35,
    "accentWidth": 32,
    "borderRadius": 0
  },
  "suggestedTime": "HH:MM",
  "tags": ["tag1", "tag2"]
}`;

  const channelLabel = channelType ? `Tipo: ${channelType}` : "";
  const batchNote = isBatch ? `\nPost ${(batchIndex || 0) + 1} de ${batchTotal}. USA UN PRESET DIFERENTE para cada post. NUNCA repitas preset ni angulo de copy.` : "";

  const userMessage = `Publicacion sobre: "${prompt}"
Plataforma: ${platform || "igfb"} ${channelLabel}${batchNote}
Seed: ${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-api-key": apiKey, "anthropic-version": "2023-06-01" },
      body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: 2000, system: systemPrompt, messages: [{ role: "user", content: userMessage }] }),
    });

    if (!res.ok) return NextResponse.json({ error: `API error: ${res.status}` }, { status: 502 });
    const data = await res.json();
    const rawText = data.content?.[0]?.text || "";
    if (!rawText) return NextResponse.json({ error: "Sin respuesta" }, { status: 502 });

    let post;
    try { post = JSON.parse(extractJSON(rawText)); } catch {
      return NextResponse.json({ error: "Error parseando respuesta" }, { status: 500 });
    }

    // Build the final Gemini prompt by filling in preset template with variables
    const presetId = post.presetId || "gradient-text-overlay";
    let geminiPrompt = PRESET_PROMPTS[presetId] || PRESET_PROMPTS["gradient-text-overlay"];
    const vars = post.presetVariables || {};
    for (const [key, value] of Object.entries(vars)) {
      geminiPrompt = geminiPrompt.replace(new RegExp(`\\{\\{${key}\\}\\}`, "g"), value as string);
    }
    // Fill any remaining variables with defaults
    geminiPrompt = geminiPrompt.replace(/\{\{CTA\}\}/g, "Schedule Your Free Design Consultation");
    geminiPrompt = geminiPrompt.replace(/\{\{[A-Z_]+\}\}/g, ""); // remove unfilled vars

    post.geminiPrompt = geminiPrompt;
    return NextResponse.json({ post });
  } catch (err) {
    return NextResponse.json({ error: `Error: ${err instanceof Error ? err.message : "desconocido"}` }, { status: 500 });
  }
}
