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

const PRESET_PROMPTS: Record<string, string> = {
  "gradient-text-overlay": "Edit this real landscaping photo into a professional Instagram post design. Keep the original photo as the main visual — this is a REAL project photo and must remain recognizable. Apply these professional post-production edits:\n1. CINEMATIC COLOR GRADE: Enhance the colors to feel warm and premium — boost the greens, add warm golden tones to the light, deepen shadows slightly for depth. Editorial photography look.\n2. GRADIENT OVERLAY: Add a smooth dark gradient from the bottom of the image (going up about 35-40% of the image). The gradient should be dark forest green (#3c4a30) fading to transparent.\n3. TEXT OVERLAY on the gradient area: In bold white modern sans-serif font (like Montserrat Bold), write '{{HEADLINE}}' on one line, and below it '{{SUBLINE}}' in bright green (#91c039).\n4. SMALL CTA at the very bottom in thin white text: '{{CTA}}'\n5. The overall result should look like a premium social media post designed by a top marketing agency.\nIMPORTANT: The original photo must be clearly visible and recognizable — you are EDITING it, not replacing it. Square format (1:1 ratio, 1080x1080). ALL TEXT MUST BE FULLY VISIBLE within the image with minimum 60px margin from edges.",
  "before-after-split": "Using this real landscaping photo as the 'AFTER' side, create a professional Instagram before/after post design. Create a split-screen square image (1080x1080):\nLEFT SIDE ('BEFORE'): Show a similar Arizona backyard in its 'before' state — bare desert dirt, no landscaping, empty neglected yard, harsh flat lighting. Apply desaturated, flat treatment.\nRIGHT SIDE ('AFTER'): Use the original photo showing the completed project. Apply warm, cinematic golden hour color grading.\nDESIGN ELEMENTS:\n- Bold white 'BEFORE' label at top-left, 'AFTER' label at top-right\n- Thin white vertical dividing line\n- Bottom: semi-transparent dark bar with white text: '{{HEADLINE}}'\nSquare format. ALL TEXT FULLY VISIBLE.",
  "stat-highlight": "Edit this real landscaping project photo into a professional Instagram stat highlight post. Keep the original photo visible.\n1. CINEMATIC COLOR GRADE: Rich teal-and-warm treatment.\n2. SUBTLE DARK VIGNETTE.\n3. GRADIENT OVERLAY from top (about 30%).\n4. LARGE STAT TEXT at top: '{{STAT_NUMBER}}' in huge bold white, '{{STAT_UNIT}}' below in green (#91c039).\n5. Below: '{{STAT_DETAIL}}' in white.\nSquare (1080x1080). ALL TEXT FULLY VISIBLE with 60px margin.",
  "testimonial-visual": "Edit this real landscaping photo into a professional testimonial post.\n1. Warm golden hour tones, inviting.\n2. DARK OVERLAY at 50-55% opacity.\n3. Large green (#91c039) quotation marks upper-left.\n4. Testimonial in white: '{{QUOTE}}'\n5. Below in gray: '{{ATTRIBUTION}}'\n6. Five green star icons.\n7. Bottom: '{{CTA}}'\nSquare (1080x1080). ALL TEXT FULLY VISIBLE.",
  "service-spotlight": "Edit this real landscaping photo into a service spotlight post.\n1. Warm premium color grade.\n2. Semi-transparent dark green (#3c4a30 at 70%) banner across lower third.\n3. '{{SERVICE}}' in large bold white uppercase on banner.\n4. '{{SUBLINE}}' in green (#91c039) below.\n5. '{{CTA}}' at bottom in white.\nSquare (1080x1080). ALL TEXT FULLY VISIBLE.",
  "tip-educational": "Edit this real landscaping photo into an educational tip post.\n1. Clean, crisp, authoritative color grade.\n2. DARK OVERLAY at 55%.\n3. Rounded badge with '{{TIP_TITLE}}' in green (#91c039).\n4. Main text in white: '{{TIP_BODY}}'\n5. Bottom: '{{CTA}}'\nSquare (1080x1080). ALL TEXT FULLY VISIBLE.",
  "question-engagement": "Edit this real landscaping photo into an engagement post.\n1. Warm, dreamy, aspirational color grade.\n2. Subtle dark gradient from bottom (25%).\n3. Large bold white question text: '{{QUESTION}}'\n4. Below in green (#91c039): 'Tell us in the comments'\nSquare (1080x1080). ALL TEXT FULLY VISIBLE.",
  "weekend-inspiration": "Edit this real landscaping photo into a premium inspiration post. Photo is the star — minimal text.\n1. HEAVY cinematic golden hour grade. Saturated greens, warm amber, subtle grain.\n2. Soft vignette.\n3. Very small elegant text bottom-right: '{{HEADLINE}}' in thin white.\n4. No CTA, no banner. Let the photo breathe.\nSquare (1080x1080).",
  "milestone-celebration": "Edit this real landscaping photo into a milestone celebration post.\n1. Premium celebratory color grade.\n2. Dark overlay at ~50%.\n3. LARGE '{{STAT_NUMBER}}' in huge bold white, centered.\n4. '{{STAT_UNIT}}' in green (#91c039) below.\n5. '{{STAT_DETAIL}}' in white.\n6. '{{CTA}}' at bottom.\nSquare (1080x1080). ALL TEXT FULLY VISIBLE.",
  "close-up-detail": "Edit this real close-up landscaping photo into a craftsmanship post.\n1. Clean, crisp, architectural magazine grade.\n2. Green (#91c039) L-shape accent in one corner.\n3. Small dark (#3c4a30) pill badge with '{{SERVICE}}' in white.\n4. '{{SUBLINE}}' in small elegant text.\nMinimal and clean. Square (1080x1080). ALL TEXT FULLY VISIBLE.",
  "seasonal-offer": "Edit this real landscaping photo into a seasonal promotion post.\n1. {{SEASON}} mood color grade, premium.\n2. Bold banner upper-third — dark green (#3c4a30 at 75%).\n3. '{{SEASON}} SPECIAL' in green (#91c039), '{{OFFER}}' in large bold white.\n4. Gradient bottom with '{{CTA}}' in white.\nSquare (1080x1080). ALL TEXT FULLY VISIBLE.",
  "project-showcase": "Edit this real landscaping photo into a project showcase card.\n1. Rich, warm, magazine-quality grade.\n2. Dark panel (#3c4a30 at 80%) covering bottom ~35%.\n3. '{{PROJECT_TYPE}}' in bold white.\n4. '{{LOCATION}}' in green (#91c039).\n5. '{{LIST_ITEMS}}' in smaller white.\nSquare (1080x1080). ALL TEXT FULLY VISIBLE.",
  "comparison-focus": "Edit this real photo into a comparison/feature highlight post.\n1. Clean, bright, professional grade.\n2. Green (#91c039) focus ring highlighting key detail.\n3. Connecting line to label.\n4. '{{SERVICE}}' on dark pill badge.\n5. '{{TIP_BODY}}' in white, '{{CTA}}' in green.\nSquare (1080x1080). ALL TEXT FULLY VISIBLE.",
  "bold-statement": "Edit this real landscaping photo into a bold typography-forward post.\n1. HEAVY DARK OVERLAY at 65-70%.\n2. LARGE BOLD TEXT centered: '{{HEADLINE}}' in massive white sans-serif. Takes up 40-50% of image.\n3. One key word in green (#91c039).\n4. Thin green divider line below.\n5. '{{SUBLINE}}' in smaller white.\n6. '{{CTA}}' at bottom.\nSquare (1080x1080). ALL TEXT FULLY VISIBLE with 80px margin.",
};

export async function POST(req: NextRequest) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return NextResponse.json({ error: "ANTHROPIC_API_KEY not configured" }, { status: 500 });

  let body;
  try { body = await req.json(); } catch { return NextResponse.json({ error: "Invalid body" }, { status: 400 }); }

  const { prompt, platform, channelType, batchIndex, batchTotal } = body;
  if (!prompt?.trim()) return NextResponse.json({ error: "Prompt required" }, { status: 400 });

  const isBatch = (batchTotal || 1) > 1;

  const systemPrompt = `You are a senior creative director at a top marketing agency for Viva Landscape & Design, a premium landscaping company in Phoenix, Arizona.

Generate a complete social media post with copy AND select a design preset.

═══ COPY RULES ═══
- Language: ENGLISH (US audience)
- Tone: professional but friendly, like talking to a neighbor
- headline: MAX 4-5 words, powerful, direct
- subline: 5-8 words max
- ctaText: 2-3 words
- caption: full caption with emojis, line breaks, hook + body + CTA. Max 2200 chars.

═══ DESIGN PRESET ═══
Pick ONE preset and fill its variables (ALL IN ENGLISH):
${PRESET_IDS.map((id, i) => `${i + 1}. ${id}`).join("\n")}

Variables to fill:
- {{HEADLINE}}: 2-4 bold words (e.g. "YOUR OUTDOOR PARADISE")
- {{SUBLINE}}: 1-2 accent words (e.g. "LIVE OUTSIDE")
- {{CTA}}: call to action (e.g. "Schedule Your Free Design Consultation")
- {{SERVICE}}: service name (e.g. "Artificial Turf", "Custom Pergolas")
- {{QUOTE}}: client testimonial
- {{ATTRIBUTION}}: name + location (e.g. "— The Martinez Family, Chandler AZ")
- {{STAT_NUMBER}}: big number (e.g. "2,400")
- {{STAT_UNIT}}: unit (e.g. "SQ FT")
- {{STAT_DETAIL}}: detail line
- {{TIP_TITLE}}: tip header (e.g. "PRO TIP")
- {{TIP_BODY}}: tip content
- {{QUESTION}}: engagement question
- {{SEASON}}: season name
- {{OFFER}}: active offer text
- {{PROJECT_TYPE}}: project type
- {{LOCATION}}: project location
- {{LIST_ITEMS}}: bullet list (e.g. "Pavers • Turf • Pergola • Lighting")

RULES:
- In batch mode, NEVER repeat the same preset
- ALL text in ENGLISH
- BRAND COLORS for variation.accentColor: #7ab82e, #3c4a30, #4d6340, #8fd440, #795220, #a07a40, #e3e3d2

Respond with PURE JSON only. No backticks.

{
  "title": "Internal title",
  "caption": "Full English caption with emojis. Max 2200 chars.",
  "hashtags": "#hash1 #hash2 ... (10-15)",
  "headline": "4-5 WORDS MAX",
  "subline": "Short subtext",
  "ctaText": "CTA 2-3 words",
  "driveCategory": "one of: ${DRIVE_CATEGORIES.join(", ")}",
  "templateId": "one of: ${TEMPLATE_IDS.join(", ")}",
  "presetId": "one of: ${PRESET_IDS.join(", ")}",
  "presetVariables": { "HEADLINE": "value", "SUBLINE": "value", "CTA": "value" },
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

  const channelLabel = channelType ? `Type: ${channelType}` : "";
  const batchNote = isBatch ? `\nPost ${(batchIndex || 0) + 1} of ${batchTotal}. Use a DIFFERENT preset for each post. NEVER repeat preset or copy angle.` : "";

  const userMessage = `Create a post about: "${prompt}"
Platform: ${platform || "igfb"} ${channelLabel}${batchNote}
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
    if (!rawText) return NextResponse.json({ error: "No response" }, { status: 502 });

    let post;
    try { post = JSON.parse(extractJSON(rawText)); } catch {
      return NextResponse.json({ error: "Parse error" }, { status: 500 });
    }

    // Build Gemini prompt from preset + variables
    const presetId = post.presetId || "gradient-text-overlay";
    let geminiPrompt = PRESET_PROMPTS[presetId] || PRESET_PROMPTS["gradient-text-overlay"];
    const vars = post.presetVariables || {};
    for (const [key, value] of Object.entries(vars)) {
      geminiPrompt = geminiPrompt.replace(new RegExp(`\\{\\{${key}\\}\\}`, "g"), value as string);
    }
    geminiPrompt = geminiPrompt.replace(/\{\{CTA\}\}/g, "Schedule Your Free Design Consultation");
    geminiPrompt = geminiPrompt.replace(/\{\{[A-Z_]+\}\}/g, "");

    post.geminiPrompt = geminiPrompt;
    return NextResponse.json({ post });
  } catch (err) {
    return NextResponse.json({ error: `Error: ${err instanceof Error ? err.message : "unknown"}` }, { status: 500 });
  }
}
