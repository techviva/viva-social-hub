import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 60;

/* ══════════════════════════════════════════════════════════════
   GEMINI EDIT PROMPTS — Visual-only editing (NO text rendering)
   Text overlays are handled client-side with CSS for perfection.
   Gemini only does: color grading, lighting, effects, graphics.
   ══════════════════════════════════════════════════════════════ */

const PREMIUM_STYLES: Record<string, string> = {
  "gradient-overlay": `Edit this landscaping photo with premium visual treatment:

PHOTO EDITING (apply ALL of these):
1. CINEMATIC COLOR GRADE: Push highlights toward warm gold (#f0d078), deepen shadows to rich dark teal, add slight orange/teal split toning
2. CONTRAST: Increase by ~15%, add gentle S-curve for punchy look
3. VIGNETTE: Subtle darkening at corners (20% opacity)
4. GRADIENT OVERLAY: Add a smooth dark gradient from bottom — starts transparent at 50% height, reaches 75% black opacity at bottom edge
5. SHARPNESS: Increase clarity and micro-contrast for crisp details
6. GREEN BOOST: Saturate vegetation/grass greens by ~20%
7. GOLDEN LIGHT: Add subtle warm glow to any sky or light sources

DO NOT add any text, words, letters, logos, or watermarks.
DO NOT add any UI elements, buttons, or frames.
ONLY edit the photo visually — the result should be a beautiful edited photograph with a gradient overlay at the bottom.
Output: 1080x1080 pixels, square crop, high quality JPEG.`,

  "modern-minimal": `Edit this landscaping photo with clean modern treatment:

PHOTO EDITING (apply ALL):
1. BRIGHT AIRY GRADE: Lift shadows +25%, soft warm white balance, slight highlight bloom
2. DESATURATION: Reduce overall saturation by 10% for editorial feel
3. CLARITY: High clarity and sharpness — magazine-quality crisp
4. LIGHT LEAK: Very subtle warm light leak from top-right corner (5% opacity)
5. BOTTOM BAR: Add a solid white rectangle at the very bottom — full width, 18% of image height, with 90% opacity white fill
6. ACCENT LINE: Thin horizontal gold line (#7ab82e, 2px) at the top edge of the white rectangle

DO NOT add any text, words, letters, or watermarks.
Only the photo edit + white bar + gold accent line. No text at all.
Output: 1080x1080 pixels, square.`,

  "bold-statement": `Edit this landscaping photo with bold dramatic treatment:

PHOTO EDITING (apply ALL):
1. HIGH CONTRAST: Push contrast dramatically — deep true blacks, vivid saturated colors
2. TEAL SHADOWS: Shift shadows toward dark blue-teal for cinematic depth
3. DARK OVERLAY: Apply 35% opacity black overlay on entire image for moodiness
4. CORNER ACCENTS: Add thin L-shaped bracket lines (2px, gold #7ab82e) at top-left corner and bottom-right corner — each arm 80px long
5. VIGNETTE: Strong vignette darkening corners by 40%
6. SHARPNESS: Maximum clarity for dramatic impact

DO NOT add any text, words, letters, or watermarks.
Only the photo edit + corner bracket accents. No text at all.
Output: 1080x1080 pixels, square.`,

  "split-comparison": `Edit this landscaping photo with a split comparison effect:

PHOTO EDITING (apply ALL):
1. RIGHT HALF: Warm vibrant color grade — lush greens, golden warm light, saturated
2. LEFT HALF: Cooler desaturated treatment — slightly washed out, less vibrant, lower contrast
3. CENTER DIVIDER: Thin diagonal line (2px, gold #7ab82e) from top-center to bottom-center
4. DIAMOND ACCENT: Small gold diamond shape (12px) at the center intersection point
5. BOTTOM BANNER: Dark semi-transparent strip (full width, 12% height, 70% black opacity) at the very bottom edge

DO NOT add any text, words, labels like "before" or "after", or watermarks.
Only the split color treatment + divider line + bottom dark strip.
Output: 1080x1080 pixels, square.`,

  "luxury-showcase": `Edit this landscaping photo with luxury editorial treatment:

PHOTO EDITING (apply ALL):
1. EDITORIAL GRADE: Rich warm tones, lifted blacks (not pure black — more like #1a1a2e minimum)
2. GOLDEN HOUR: Push overall warmth, add subtle amber to highlights
3. FILM GRAIN: Very subtle fine grain texture for analog premium feel
4. INSET BORDER: Thin elegant border (2px, gold #7ab82e at 35% opacity), inset 50px from each edge
5. CORNER CARD: Small semi-transparent dark rectangle (140x80px, rgba(0,0,0,0.55), rounded corners) positioned at bottom-left, inside the inset border
6. LENS FLARE: Very subtle warm lens flare or light streak from top-right (barely visible)

DO NOT add any text, words, letters, or watermarks.
Only the photo edit + border + dark corner card rectangle (empty, no text).
Output: 1080x1080 pixels, square.`,

  "engagement-question": `Edit this landscaping photo for maximum engagement visual:

PHOTO EDITING (apply ALL):
1. VIBRANT COLORS: Boost saturation +30%, especially greens and blues
2. WARM HIGHLIGHTS: Push highlights toward orange-gold for energy
3. HIGH CLARITY: Maximum sharpness and micro-contrast
4. FROSTED GLASS: Add a frosted/blurred glass rectangle — centered, 65% width, 28% height, centered vertically — with white border (1px, 40% opacity), rounded corners (20px), and blurred/frosted fill
5. BOTTOM PILL: Small dark rounded pill shape (200x36px, rgba(0,0,0,0.6)) centered at 88% from top

DO NOT add any text, words, emojis, or watermarks.
Only the photo edit + frosted glass rectangle + bottom pill (both empty, no text inside).
Output: 1080x1080 pixels, square.`,
};

export async function POST(req: NextRequest) {
  const geminiKey = process.env.GEMINI_API_KEY;
  if (!geminiKey) return NextResponse.json({ error: "GEMINI_API_KEY no configurada" }, { status: 500 });

  let body;
  try { body = await req.json(); } catch { return NextResponse.json({ error: "Body invalido" }, { status: 400 }); }

  const { imageUrl, prompt, style } = body;
  if (!prompt?.trim() && !style) return NextResponse.json({ error: "Se necesita un prompt o estilo" }, { status: 400 });

  // No more headline/subline/cta injection — text is rendered client-side
  let fullPrompt = "";
  if (style && PREMIUM_STYLES[style]) {
    fullPrompt = PREMIUM_STYLES[style];
  } else if (prompt) {
    fullPrompt = prompt + "\n\nDO NOT add any text, words, or letters to the image. Only visual edits.";
  }

  const models = ["gemini-2.5-flash-image", "gemini-3-pro-image-preview", "gemini-3.1-flash-image-preview"];

  try {
    const parts: Record<string, unknown>[] = [];

    if (imageUrl) {
      try {
        const imgRes = await fetch(imageUrl, { signal: AbortSignal.timeout(10000) });
        if (imgRes.ok) {
          const buffer = await imgRes.arrayBuffer();
          parts.push({ inlineData: { mimeType: imgRes.headers.get("content-type") || "image/jpeg", data: Buffer.from(buffer).toString("base64") } });
        }
      } catch (e) { console.error("Image download failed:", e); }
    }

    parts.push({ text: fullPrompt });

    let lastError = "";
    for (const modelId of models) {
      try {
        const geminiRes = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${modelId}:generateContent?key=${geminiKey}`,
          { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ contents: [{ parts }], generationConfig: { responseModalities: ["IMAGE", "TEXT"] } }) }
        );

        if (!geminiRes.ok) { lastError = `${modelId}: ${geminiRes.status}`; continue; }

        const data = await geminiRes.json();
        const candidateParts = (data.candidates?.[0]?.content?.parts || []) as Array<{ inlineData?: { data: string; mimeType: string }; text?: string }>;

        let editedImage = null;
        let textResponse = "";
        for (const part of candidateParts) {
          if (part.inlineData?.data) editedImage = { data: part.inlineData.data, mimeType: part.inlineData.mimeType || "image/png" };
          if (part.text) textResponse += part.text;
        }

        if (editedImage) {
          return NextResponse.json({ image: `data:${editedImage.mimeType};base64,${editedImage.data}`, text: textResponse, model: modelId });
        }
        lastError = `${modelId}: no image - ${textResponse.substring(0, 100)}`;
      } catch (e) { lastError = `${modelId}: ${e instanceof Error ? e.message : "unknown"}`; }
    }

    return NextResponse.json({ error: `No se genero imagen. ${lastError}` }, { status: 422 });
  } catch (err) {
    return NextResponse.json({ error: `Error: ${err instanceof Error ? err.message : "desconocido"}` }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ styles: Object.keys(PREMIUM_STYLES).map((k) => ({ key: k, name: k.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()) })) });
}
