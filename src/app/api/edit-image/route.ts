import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 60;

/* ── Premium edit prompt templates for landscaping industry ── */

const PREMIUM_STYLES: Record<string, string> = {
  "gradient-overlay": `Edit this landscaping photo into a premium social media post:
- Apply a rich cinematic color grade: warm golden highlights, deep shadows, slight teal in midtones
- Add a dark gradient overlay from the bottom (covering lower 40%) fading to transparent
- Place bold white headline text in the lower third area, large and impactful
- Add a thin gold accent line (#d4a843) above the headline
- Small subtext below in a lighter weight
- Ensure text has subtle drop shadow for readability
- Overall feel: luxury outdoor living magazine ad
- Output must be exactly 1080x1080 pixels, square format`,

  "modern-minimal": `Edit this landscaping photo into a clean, modern social media post:
- Apply a bright, airy color grade: lifted shadows, soft warm tones, high clarity
- Add a semi-transparent white bar across the bottom (20% height, 85% opacity)
- Place dark text (#1a1a2e) on the white bar: bold headline + thin subline
- Add a small gold (#d4a843) accent square or dot as a design element
- Keep negative space, let the photo breathe
- Overall feel: premium architecture portfolio
- Output must be exactly 1080x1080 pixels, square format`,

  "bold-statement": `Edit this landscaping photo into a bold statement social media post:
- Apply dramatic contrast: deep blacks, vivid colors, cinematic atmosphere
- Add a large, oversized bold white text centered on the image (the headline should dominate)
- Text should have a very slight dark outer glow for contrast
- Add geometric accent elements: thin lines, a corner bracket frame, or subtle shapes in gold (#d4a843)
- Small CTA text at the bottom
- Overall feel: Nike/Apple style bold advertising
- Output must be exactly 1080x1080 pixels, square format`,

  "split-comparison": `Edit this landscaping photo for a before/after style social media post:
- Create a subtle split effect with a thin diagonal gold line (#d4a843)
- Apply warm, inviting color grading to emphasize the transformation
- Add "BEFORE" and "AFTER" labels in clean white text
- Include a small banner at bottom with company context
- Overall feel: home renovation TV show quality
- Output must be exactly 1080x1080 pixels, square format`,

  "luxury-showcase": `Edit this landscaping photo into a luxury project showcase post:
- Apply editorial color grade: rich, warm, slightly desaturated for premium feel
- Add a dark semi-transparent border/frame effect (thin, elegant)
- Place project details as an overlay card in the corner: project type, location
- Add subtle lens flare or light leak effect for atmosphere
- Gold (#d4a843) accent elements: thin lines, dots, or minimal geometric shapes
- Overall feel: high-end real estate marketing
- Output must be exactly 1080x1080 pixels, square format`,

  "engagement-question": `Edit this landscaping photo into an engagement-focused social media post:
- Apply vibrant, eye-catching color grade: saturated greens, warm highlights
- Add a large question text overlay centered on image, white bold font
- Background behind text: frosted glass effect or dark gradient for readability
- Add interactive elements: "Comment below!" or emoji prompts
- Design should stop the scroll — bold, colorful, attention-grabbing
- Overall feel: viral social media content
- Output must be exactly 1080x1080 pixels, square format`,
};

const STYLE_KEYS = Object.keys(PREMIUM_STYLES);

export async function POST(req: NextRequest) {
  const geminiKey = process.env.GEMINI_API_KEY;
  if (!geminiKey) return NextResponse.json({ error: "GEMINI_API_KEY no configurada" }, { status: 500 });

  let body;
  try { body = await req.json(); } catch { return NextResponse.json({ error: "Body invalido" }, { status: 400 }); }

  const { imageUrl, prompt, style, headline, subline, cta } = body;
  if (!prompt?.trim() && !style) return NextResponse.json({ error: "Se necesita un prompt o estilo" }, { status: 400 });

  // Build the edit prompt
  let fullPrompt = "";
  if (style && PREMIUM_STYLES[style]) {
    fullPrompt = PREMIUM_STYLES[style];
    // Inject dynamic text
    if (headline) fullPrompt += `\n\nHeadline text to use: "${headline}"`;
    if (subline) fullPrompt += `\nSubline/subtext: "${subline}"`;
    if (cta) fullPrompt += `\nCTA text: "${cta}"`;
  } else {
    fullPrompt = prompt;
  }

  // Use the correct model: gemini-2.0-flash-preview-image-generation
  const modelId = "gemini-2.0-flash-preview-image-generation";

  try {
    const parts: Record<string, unknown>[] = [];

    // Download and include reference image
    if (imageUrl) {
      const imgRes = await fetch(imageUrl, { signal: AbortSignal.timeout(10000) });
      if (imgRes.ok) {
        const buffer = await imgRes.arrayBuffer();
        const base64 = Buffer.from(buffer).toString("base64");
        const mimeType = imgRes.headers.get("content-type") || "image/jpeg";
        parts.push({ inlineData: { mimeType, data: base64 } });
      }
    }

    parts.push({ text: fullPrompt });

    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${modelId}:generateContent?key=${geminiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts }],
          generationConfig: {
            responseModalities: ["IMAGE", "TEXT"],
          },
        }),
      }
    );

    if (!geminiRes.ok) {
      const errText = await geminiRes.text();
      console.error("Gemini error:", geminiRes.status, errText);

      // If model not available, try fallback
      if (geminiRes.status === 404 || errText.includes("not found")) {
        const fallbackRes = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiKey}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [{ parts }],
              generationConfig: { responseModalities: ["IMAGE", "TEXT"] },
            }),
          }
        );
        if (!fallbackRes.ok) {
          return NextResponse.json({ error: `Gemini API error: ${geminiRes.status}` }, { status: 502 });
        }
        const fallbackData = await fallbackRes.json();
        return processGeminiResponse(fallbackData);
      }

      return NextResponse.json({ error: `Gemini API error: ${geminiRes.status}` }, { status: 502 });
    }

    const data = await geminiRes.json();
    return processGeminiResponse(data);
  } catch (err) {
    console.error("Edit image error:", err);
    return NextResponse.json({ error: `Error: ${err instanceof Error ? err.message : "desconocido"}` }, { status: 500 });
  }
}

function processGeminiResponse(data: Record<string, unknown>) {
  const candidates = data.candidates as Array<{ content: { parts: Array<{ inlineData?: { data: string; mimeType: string }; text?: string }> } }> | undefined;
  const parts = candidates?.[0]?.content?.parts || [];

  let editedImage = null;
  let textResponse = "";

  for (const part of parts) {
    if (part.inlineData?.data) {
      editedImage = { data: part.inlineData.data, mimeType: part.inlineData.mimeType || "image/png" };
    }
    if (part.text) textResponse += part.text;
  }

  if (!editedImage) {
    return NextResponse.json({ error: "Gemini no genero imagen. " + (textResponse || "Sin respuesta.") }, { status: 422 });
  }

  return NextResponse.json({
    image: `data:${editedImage.mimeType};base64,${editedImage.data}`,
    text: textResponse,
    styles: STYLE_KEYS,
  });
}

export async function GET() {
  return NextResponse.json({ styles: STYLE_KEYS.map((k) => ({ key: k, name: k.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()) })) });
}
