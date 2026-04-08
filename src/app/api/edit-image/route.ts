import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 60;

const NO_TEXT_RULE = `

CRITICAL RULES:
- DO NOT add any text, words, letters, numbers, logos, watermarks, or UI elements.
- DO NOT add any overlays with text content.
- ONLY apply visual/photographic edits to the image.
- Output must be exactly 1080x1080 pixels, square format, high quality.
- The result should look like a professionally edited photograph, NOT a social media post with text.`;

export async function POST(req: NextRequest) {
  const geminiKey = process.env.GEMINI_API_KEY;
  if (!geminiKey) return NextResponse.json({ error: "GEMINI_API_KEY no configurada" }, { status: 500 });

  let body;
  try { body = await req.json(); } catch { return NextResponse.json({ error: "Body invalido" }, { status: 400 }); }

  const { imageUrl, prompt } = body;
  if (!prompt?.trim()) return NextResponse.json({ error: "Se necesita un prompt" }, { status: 400 });

  const fullPrompt = prompt + NO_TEXT_RULE;
  const models = ["nano-banana-pro-preview", "gemini-2.5-flash-image", "gemini-3-pro-image-preview"];

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
