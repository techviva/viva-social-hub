import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 60;

/* ══════════════════════════════════════════════════════════
   PREMIUM EDIT PROMPTS — Agency-grade social media design
   ══════════════════════════════════════════════════════════ */

const TEXT_RULES = `

CRITICAL TEXT RULES (follow these exactly):
- ALL text must be FULLY VISIBLE — no text may touch or extend beyond any edge of the image
- Keep a MINIMUM 80px safe margin from all four edges
- Text must NEVER be cut off, cropped, or clipped
- Use SHORT text only — if the headline is long, break it into 2 lines max
- Font size: headline max 60pt equivalent, subline max 28pt, CTA max 22pt
- Every letter of every word must be completely legible and within the frame
- Double-check: scroll your attention to each edge — if ANY text is near an edge, move it inward
- If text won't fit, make the font smaller — NEVER let it overflow`;

const PREMIUM_STYLES: Record<string, string> = {
  "gradient-overlay": `Transform this landscaping photo into a premium social media post with these EXACT specifications:

PHOTO TREATMENT:
- Cinematic color grade: warm golden highlights (shift toward #f0d078), deep rich shadows, subtle teal (#2a6a6a) in midtones
- Increase contrast slightly, add gentle vignette darkening corners
- Boost green vegetation saturation by 15%

DESIGN OVERLAY:
- Dark gradient from bottom: starts at 0% opacity at vertical center, reaches 85% black opacity at bottom edge
- The gradient should be SMOOTH and natural, not harsh
- Add a thin horizontal line (1px, gold #d4a843) positioned at 70% from top

TEXT PLACEMENT:
- Headline: bold sans-serif white text, centered horizontally, positioned at 75% from top (inside the dark gradient zone)
- Subline: lighter weight, 60% text opacity, centered, 8px below headline
- CTA: small caps, gold #d4a843 color, centered, at 90% from top
${TEXT_RULES}

OUTPUT: exactly 1080x1080 pixels, square, high quality`,

  "modern-minimal": `Transform this landscaping photo into a clean architectural social media post:

PHOTO TREATMENT:
- Bright airy grade: lift shadows +20%, soft warm white balance, high clarity/sharpness
- Slight desaturation (-10%) for premium editorial feel
- Clean, crisp, magazine-quality look

DESIGN OVERLAY:
- Semi-transparent white rectangle: full width, height = 18% of image, anchored to bottom
- Rectangle opacity: 88% white (#ffffff with 0.88 alpha)
- Thin gold line (#d4a843, 2px) at the top edge of the white rectangle
- Small gold square (12x12px) as accent element at left margin of the text area

TEXT PLACEMENT:
- Headline: dark text (#1a1a2e), bold sans-serif, positioned inside the white rectangle, left-aligned with 60px left margin, vertically centered in the bar
- Subline: same alignment, regular weight, smaller size, gray (#666), 4px below headline
${TEXT_RULES}

OUTPUT: exactly 1080x1080 pixels, square`,

  "bold-statement": `Transform this landscaping photo into a high-impact bold social media post:

PHOTO TREATMENT:
- High dramatic contrast: deep blacks, vivid saturated colors
- Slight blue-teal shift in shadows for cinematic depth
- Dark overlay at 30% opacity over entire image to make text pop

DESIGN OVERLAY:
- Thin corner bracket frames: L-shaped lines (2px, gold #d4a843) at top-left and bottom-right corners, each arm 60px long
- NO full border — just the corner accents

TEXT PLACEMENT:
- Headline: LARGE bold white text, centered both horizontally and vertically in the image
- The headline should be the HERO element — dominant, attention-grabbing
- Text shadow: 2px 2px 8px rgba(0,0,0,0.7) for contrast
- CTA: small text at bottom center, 85% from top, gold #d4a843 color
- Keep headline to MAX 4-5 words — if provided text is longer, use only the most impactful words
${TEXT_RULES}

OUTPUT: exactly 1080x1080 pixels, square`,

  "split-comparison": `Transform this landscaping photo into a professional before/after comparison post:

PHOTO TREATMENT:
- Right side (the "AFTER"): warm, vibrant color grade — lush greens, golden light
- Left side (the "BEFORE"): slightly desaturated, cooler tones to imply the "before" state
- Both sides should still show the same photo but with different color treatments

DESIGN OVERLAY:
- Thin diagonal line from top-center to bottom-center (2px, gold #d4a843) dividing the image
- Small gold diamond shape (10px) where the diagonal meets the horizontal center

TEXT PLACEMENT:
- "BEFORE" label: white text, positioned at 25% from left, 12% from top, small caps, with dark pill background (rgba(0,0,0,0.5) rounded rectangle behind it)
- "AFTER" label: white text, positioned at 75% from left, 12% from top, same style
- Bottom banner: full width, 12% height, dark semi-transparent (#000 at 70%), with headline text centered in white
${TEXT_RULES}

OUTPUT: exactly 1080x1080 pixels, square`,

  "luxury-showcase": `Transform this landscaping photo into a luxury real estate marketing post:

PHOTO TREATMENT:
- Editorial color grade: rich warm tones, slightly lifted blacks (not pure black, more like #1a1a2e)
- Gentle warmth, golden hour feel even if original isn't golden hour
- Subtle film grain texture for premium analog feel

DESIGN OVERLAY:
- Thin elegant border: 3px inset border, 40px from each edge, color gold #d4a843 at 40% opacity
- Bottom-left corner: semi-transparent dark card (160x90px, rgba(0,0,0,0.65), rounded 8px) for project details
- Top-right: small gold Viva "V" logomark or gold dot accent

TEXT PLACEMENT:
- Inside the bottom-left card: project type in gold, location in white smaller text below
- Headline: positioned at bottom-center, just above the border line, white, medium weight
- All text must stay WELL inside the inset border
${TEXT_RULES}

OUTPUT: exactly 1080x1080 pixels, square`,

  "engagement-question": `Transform this landscaping photo into a scroll-stopping engagement post:

PHOTO TREATMENT:
- VIBRANT saturated colors: boost greens +25%, warm highlights pushed toward orange/gold
- High clarity and sharpness for screen pop
- Bright, energetic, eye-catching mood

DESIGN OVERLAY:
- Center zone: frosted glass effect rectangle (60% width, 30% height, centered) with blurred background and white border (1px, 50% opacity)
- The frosted rectangle should have rounded corners (16px radius)
- Bottom strip: small dark pill with "Comenta tu respuesta 👇" text

TEXT PLACEMENT:
- Question text: bold white, centered inside the frosted glass rectangle, maximum 2 lines
- The question should be the LARGEST text element on the image
- Text shadow for readability: 1px 1px 4px rgba(0,0,0,0.5)
- Bottom pill CTA: centered horizontally, 88% from top
${TEXT_RULES}

OUTPUT: exactly 1080x1080 pixels, square`,
};

export async function POST(req: NextRequest) {
  const geminiKey = process.env.GEMINI_API_KEY;
  if (!geminiKey) return NextResponse.json({ error: "GEMINI_API_KEY no configurada" }, { status: 500 });

  let body;
  try { body = await req.json(); } catch { return NextResponse.json({ error: "Body invalido" }, { status: 400 }); }

  const { imageUrl, prompt, style, headline, subline, cta } = body;
  if (!prompt?.trim() && !style) return NextResponse.json({ error: "Se necesita un prompt o estilo" }, { status: 400 });

  let fullPrompt = "";
  if (style && PREMIUM_STYLES[style]) {
    fullPrompt = PREMIUM_STYLES[style];
    if (headline) fullPrompt += `\n\nEXACT headline text to render: "${headline}"`;
    if (subline) fullPrompt += `\nEXACT subline text to render: "${subline}"`;
    if (cta) fullPrompt += `\nEXACT CTA text to render: "${cta}"`;
    fullPrompt += `\n\nREMINDER: Every single character of text must be fully visible within the image. No clipping.`;
  } else if (prompt) {
    fullPrompt = prompt + TEXT_RULES;
  }

  const models = ["gemini-2.5-flash-image", "gemini-3-pro-image-preview", "gemini-3.1-flash-image-preview"];

  try {
    const parts: Record<string, unknown>[] = [];

    if (imageUrl) {
      try {
        const imgRes = await fetch(imageUrl, { signal: AbortSignal.timeout(10000) });
        if (imgRes.ok) {
          const buffer = await imgRes.arrayBuffer();
          const base64 = Buffer.from(buffer).toString("base64");
          const mimeType = imgRes.headers.get("content-type") || "image/jpeg";
          parts.push({ inlineData: { mimeType, data: base64 } });
        }
      } catch (e) { console.error("Image download failed:", e); }
    }

    parts.push({ text: fullPrompt });

    let lastError = "";
    for (const modelId of models) {
      try {
        const geminiRes = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${modelId}:generateContent?key=${geminiKey}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ contents: [{ parts }], generationConfig: { responseModalities: ["IMAGE", "TEXT"] } }),
          }
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
