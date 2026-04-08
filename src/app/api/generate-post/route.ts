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

export async function POST(req: NextRequest) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return NextResponse.json({ error: "ANTHROPIC_API_KEY no configurada" }, { status: 500 });

  let body;
  try { body = await req.json(); } catch { return NextResponse.json({ error: "Body invalido" }, { status: 400 }); }

  const { prompt, platform, channelType, batchIndex, batchTotal } = body;
  if (!prompt?.trim()) return NextResponse.json({ error: "Se necesita un prompt" }, { status: 400 });

  const isBatch = (batchTotal || 1) > 1;

  const systemPrompt = `Eres un director creativo senior de agencia para Viva Landscape & Design, paisajismo premium en Phoenix, Arizona.

Tu trabajo: generar el COPY de la publicacion + la DIRECCION ARTISTICA para que un editor de imagenes AI (Gemini) edite la foto.

═══ COPY ═══
- Tono: profesional pero cercano, como hablandole a un amigo
- Idioma: español mexicano con terminos naturales de landscaping en ingles
- headline: MAXIMO 4-5 palabras
- subline: 5-8 palabras max
- ctaText: 2-3 palabras

═══ DIRECCION ARTISTICA (geminiPrompt) ═══
Este es el campo MAS IMPORTANTE. Escribe un prompt DETALLADO y UNICO en INGLES para que Gemini edite la foto.

PALETA VIVA OBLIGATORIA para cualquier elemento de color:
- #7ab82e (verde lima Viva)
- #3c4a30 (verde oscuro bosque)
- #4d6340 (verde medio)
- #795220 (tierra/brown)
- #e3e3d2 (crema calido)

TIPOS DE EDICION AVANZADA que puedes pedir (combina 3-4 por post, variando cada vez):
1. COLOR GRADING: cinematic warm, desert golden hour, cool morning, moody twilight, film emulation (Kodak Portra, Fuji), cross-processing, bleach bypass, orange-teal split tone
2. LIGHT EFFECTS: lens flare, sun rays, bokeh orbs, light leaks, caustics, rim lighting, golden backlight, volumetric haze
3. ATMOSPHERE: fog/mist overlay, dust particles, smoke, heat shimmer, dew drops, rain effect
4. TEXTURE: film grain, paper texture, linen overlay, concrete texture, subtle noise
5. FRAMING: organic vine/leaf border, geometric frame lines, circular crop mask, architectural framing, natural shadow framing
6. ARTISTIC: double exposure with nature, selective color pop (only greens vivid), tilt-shift miniature, infrared look, painterly soft focus edges
7. COMPOSITING: subtle gradient color wash, duotone treatment, color channel shift, prismatic refraction at edges

REGLA CRITICA: Cada geminiPrompt DEBE ser diferente. NUNCA repitas la misma combinacion de efectos.
REGLA CRITICA: NO pidas texto, letras, palabras, logos ni watermarks en el geminiPrompt.

Responde UNICAMENTE con JSON puro.

{
  "title": "Titulo interno",
  "caption": "Caption completo con emojis, saltos de linea. Max 2200 chars.",
  "hashtags": "#hash1 #hash2 ... (10-15)",
  "headline": "4-5 PALABRAS MAX",
  "subline": "Subtexto corto",
  "ctaText": "CTA 2-3 palabras",
  "driveCategory": "Una de: ${DRIVE_CATEGORIES.join(", ")}",
  "templateId": "Una de: ${TEMPLATE_IDS.join(", ")}",
  "geminiPrompt": "Prompt DETALLADO en ingles para Gemini. 4-6 lineas describiendo la edicion visual exacta. Combina 3-4 tecnicas de la lista. Se MUY especifico con colores, intensidades, posiciones. NUNCA pidas texto.",
  "variation": {
    "accentColor": "Uno de: #7ab82e, #3c4a30, #4d6340, #8fd440, #795220, #a07a40, #e3e3d2",
    "gradientAngle": 170-190,
    "filterContrast": 1.0-1.2,
    "filterSaturate": 1.0-1.3,
    "filterBrightness": 0.85-1.05,
    "filterSepia": 0.0-0.08,
    "overlayOpacity": 0.6-0.8,
    "headlineColor": "#ffffff",
    "sublineColor": "rgba(255,255,255,0.55-0.70)",
    "vignetteStrength": 0.25-0.45,
    "accentWidth": 24-40,
    "borderRadius": 0
  },
  "suggestedTime": "HH:MM",
  "tags": ["tag1", "tag2"]
}`;

  const channelLabel = channelType ? `Tipo: ${channelType}` : "";
  const batchNote = isBatch ? `\nPost ${(batchIndex || 0) + 1} de ${batchTotal}. CADA uno COMPLETAMENTE DIFERENTE: distinto angulo de copy, distinta combinacion de efectos visuales en geminiPrompt, distinto template.` : "";

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
    return NextResponse.json({ post });
  } catch (err) {
    return NextResponse.json({ error: `Error: ${err instanceof Error ? err.message : "desconocido"}` }, { status: 500 });
  }
}
