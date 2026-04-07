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

export async function POST(req: NextRequest) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return NextResponse.json({ error: "ANTHROPIC_API_KEY no configurada" }, { status: 500 });

  let body;
  try { body = await req.json(); } catch { return NextResponse.json({ error: "Body invalido" }, { status: 400 }); }

  const { prompt, platform } = body;
  if (!prompt?.trim()) return NextResponse.json({ error: "Se necesita un prompt" }, { status: 400 });

  const systemPrompt = `Eres un experto en marketing de redes sociales para Viva Landscape & Design, empresa de paisajismo premium en Phoenix, Arizona.

Genera una publicacion completa de ALTO NIVEL para redes sociales.

REGLAS:
- Tono: profesional pero cercano, como hablandole a un amigo
- Idioma: español mexicano, mezcla natural de terminos en ingles de landscaping
- Copy de AGENCIA — gancho poderoso, desarrollo conciso, CTA irresistible
- IMPORTANTE: Responde UNICAMENTE con JSON puro. Sin backticks ni markdown.

FORMATO JSON:
{
  "title": "Titulo interno (no se publica)",
  "caption": "Caption completo listo para publicar con emojis, saltos de linea, gancho, desarrollo y CTA. Maximo 2200 caracteres.",
  "hashtags": "#hashtag1 #hashtag2 ... (10-15 hashtags relevantes)",
  "hook": "Primera linea del caption — el gancho",
  "headline": "Texto corto y poderoso para superponer en la imagen (5-8 palabras max)",
  "subline": "Subtexto para la imagen (una frase corta)",
  "ctaText": "Texto del boton/CTA visual (2-4 palabras)",
  "driveCategory": "Una de: ${DRIVE_CATEGORIES.join(", ")} — elige la mas relevante para buscar fotos",
  "editStyle": "Una de: gradient-overlay, modern-minimal, bold-statement, split-comparison, luxury-showcase, engagement-question — elige la mas impactante para este tema",
  "suggestedTime": "HH:MM",
  "contentType": "single | carousel | reel",
  "tags": ["tag1", "tag2"]
}`;

  const userMessage = `Genera una publicacion premium sobre: "${prompt}"
Plataforma: ${platform || "Instagram"}`;

  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-api-key": apiKey, "anthropic-version": "2023-06-01" },
      body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: 1500, system: systemPrompt, messages: [{ role: "user", content: userMessage }] }),
    });

    if (!res.ok) return NextResponse.json({ error: `API error: ${res.status}` }, { status: 502 });

    const data = await res.json();
    const rawText = data.content?.[0]?.text || "";
    if (!rawText) return NextResponse.json({ error: "Sin respuesta" }, { status: 502 });

    let post;
    try { post = JSON.parse(extractJSON(rawText)); } catch {
      return NextResponse.json({ error: "Error parseando respuesta" }, { status: 500 });
    }

    return NextResponse.json({ post });
  } catch (err) {
    return NextResponse.json({ error: `Error: ${err instanceof Error ? err.message : "desconocido"}` }, { status: 500 });
  }
}
