import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 30;

function extractJSON(text: string): string {
  let cleaned = text.trim();
  if (cleaned.startsWith("```")) {
    cleaned = cleaned.replace(/^```(?:json)?\s*\n?/, "").replace(/\n?```\s*$/, "");
  }
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  if (start !== -1 && end !== -1 && end > start) return cleaned.slice(start, end + 1);
  return cleaned;
}

export async function POST(req: NextRequest) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return NextResponse.json({ error: "ANTHROPIC_API_KEY no configurada" }, { status: 500 });

  let body;
  try { body = await req.json(); } catch { return NextResponse.json({ error: "Body invalido" }, { status: 400 }); }

  const { prompt, platform, style, category } = body;
  if (!prompt?.trim()) return NextResponse.json({ error: "Se necesita un prompt" }, { status: 400 });

  const systemPrompt = `Eres un experto en marketing de redes sociales para Viva Landscape & Design, empresa de paisajismo premium en Phoenix, Arizona.

Genera una publicacion completa para redes sociales.

REGLAS:
- Tono: profesional pero cercano, como hablandole a un amigo
- Idioma: español mexicano, mezcla natural de terminos en ingles de landscaping
- La publicacion debe ser de ALTO NIVEL — copy que enganche, CTA claro, hashtags relevantes
- IMPORTANTE: Responde UNICAMENTE con JSON puro. Sin backticks, sin markdown.

FORMATO JSON:
{
  "title": "Titulo interno (para organizar, no se publica)",
  "caption": "El caption completo listo para publicar. Incluye emojis relevantes, saltos de linea, y llamada a la accion.",
  "hashtags": "#hashtag1 #hashtag2 ... (10-15 hashtags relevantes)",
  "hook": "Primera linea del caption — el gancho que atrapa la atencion",
  "imagePrompt": "Descripcion detallada de como deberia editarse la foto: color grading, overlays de texto, estilo visual. Debe ser una instruccion para un editor de imagenes AI. En ingles para mejor resultado con Gemini.",
  "suggestedTime": "Hora sugerida para publicar (formato HH:MM)",
  "contentType": "single | carousel | reel",
  "tags": ["tag1", "tag2", "tag3"]
}`;

  const userMessage = `Genera una publicacion sobre: "${prompt}"
Plataforma: ${platform || "Instagram"}
Estilo visual: ${style || "premium/profesional"}
Categoria de foto: ${category || "general landscaping"}`;

  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1500,
        system: systemPrompt,
        messages: [{ role: "user", content: userMessage }],
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error("Anthropic error:", res.status, err);
      return NextResponse.json({ error: `API error: ${res.status}` }, { status: 502 });
    }

    const data = await res.json();
    const rawText = data.content?.[0]?.text || "";
    if (!rawText) return NextResponse.json({ error: "Sin respuesta de la AI" }, { status: 502 });

    let post;
    try { post = JSON.parse(extractJSON(rawText)); } catch {
      console.error("Parse error:", rawText.substring(0, 300));
      return NextResponse.json({ error: "Error parseando respuesta AI" }, { status: 500 });
    }

    return NextResponse.json({ post });
  } catch (err) {
    console.error("Generate post error:", err);
    return NextResponse.json({ error: `Error: ${err instanceof Error ? err.message : "desconocido"}` }, { status: 500 });
  }
}
