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

const TEMPLATE_IDS = ["cinematic-gold", "warm-editorial", "dark-luxury", "bold-center", "bold-diagonal", "bold-statement", "clean-bar", "clean-side", "whisper", "magazine-cover", "photo-journal", "editorial-grid", "promo-banner", "promo-split", "promo-stripe", "question-frosted", "engagement-pop", "poll-card", "story-spotlight", "story-vignette", "story-cinematic", "project-card", "showcase-sweep"];

export async function POST(req: NextRequest) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return NextResponse.json({ error: "ANTHROPIC_API_KEY no configurada" }, { status: 500 });

  let body;
  try { body = await req.json(); } catch { return NextResponse.json({ error: "Body invalido" }, { status: 400 }); }

  const { prompt, platform } = body;
  if (!prompt?.trim()) return NextResponse.json({ error: "Se necesita un prompt" }, { status: 400 });

  const systemPrompt = `Eres un director creativo de agencia para Viva Landscape & Design, paisajismo premium en Phoenix, Arizona.

Genera una publicacion de redes sociales Y su direccion artistica visual.

REGLAS DE COPY:
- Tono: profesional pero cercano, como hablandole a un amigo
- Idioma: español mexicano con terminos naturales de landscaping en ingles
- headline: MAXIMO 4-5 palabras, poderoso, directo
- subline: 5-8 palabras max
- ctaText: 2-3 palabras

REGLAS DE DIRECCION ARTISTICA:
- Elige un template Y genera variaciones visuales UNICAS para este post
- Los numeros de filtro deben variar cada vez — NUNCA uses los mismos valores
- PALETA VIVA: el accentColor principal es #7ab82e (verde lima Viva). Alternativas: #3c4a30 (verde oscuro), #795220 (tierra), #e3e3d2 (crema), #4d6340 (verde medio). Para promos urgentes puedes usar #e11d48. Para agua/piscinas #0ea5e9. SIEMPRE prioriza los verdes Viva.
- Varia los angulos de gradiente, la intensidad del contraste, la saturacion
- Cada post debe sentirse diferente visualmente

Responde UNICAMENTE con JSON puro.

{
  "title": "Titulo interno",
  "caption": "Caption completo con emojis, saltos de linea, gancho+desarrollo+CTA. Max 2200 chars.",
  "hashtags": "#hash1 #hash2 ... (10-15)",
  "headline": "4-5 PALABRAS MAX",
  "subline": "Subtexto corto",
  "ctaText": "CTA 2-3 palabras",
  "driveCategory": "Una de: ${DRIVE_CATEGORIES.join(", ")}",
  "templateId": "Una de: ${TEMPLATE_IDS.join(", ")}",
  "variation": {
    "accentColor": "#hex — color acento que complemente el tema",
    "gradientAngle": 150-210,
    "filterContrast": 1.0-1.35,
    "filterSaturate": 0.85-1.45,
    "filterBrightness": 0.75-1.15,
    "filterSepia": 0.0-0.15,
    "overlayOpacity": 0.4-0.85,
    "headlineColor": "#ffffff o color claro legible",
    "sublineColor": "rgba(255,255,255,0.5-0.7) o color apropiado",
    "vignetteStrength": 0.2-0.6,
    "accentWidth": 20-48,
    "borderRadius": 0-20
  },
  "suggestedTime": "HH:MM",
  "tags": ["tag1", "tag2"]
}`;

  const userMessage = `Genera publicacion premium con direccion artistica sobre: "${prompt}"
Plataforma: ${platform || "Instagram"}
Timestamp para seed de variacion: ${Date.now()}`;

  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-api-key": apiKey, "anthropic-version": "2023-06-01" },
      body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: 1800, system: systemPrompt, messages: [{ role: "user", content: userMessage }] }),
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
