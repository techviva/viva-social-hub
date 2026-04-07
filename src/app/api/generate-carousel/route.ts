import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "API key not configured" }, { status: 500 });
  }

  const { topic, slideCount, notes } = await req.json();

  if (!topic || typeof topic !== "string" || topic.trim().length === 0) {
    return NextResponse.json({ error: "Topic is required" }, { status: 400 });
  }

  const count = Math.max(4, Math.min(12, Number(slideCount) || 7));

  const systemPrompt = `Eres un experto en contenido para carruseles de Instagram/LinkedIn de una empresa de paisajismo llamada Viva Landscape & Design en Phoenix, Arizona.

Tu trabajo es generar el contenido completo de un carrusel listo para diseñar.

REGLAS:
- Tono: profesional pero cercano, como hablandole a un amigo.
- Idioma: español (Mexico/Latinoamerica), mezcla natural de terminos en ingles de landscaping.
- Cada slide debe ser concisa — maximo 2 oraciones cortas o una lista de 3-4 items.
- El texto debe ser legible en un cuadrado de Instagram (poco texto, impactante).
- Responde SOLO con JSON valido, sin markdown, sin backticks, sin texto adicional.

FORMATO DE RESPUESTA (JSON):
{
  "title": "Titulo del carrusel",
  "slides": [
    {
      "type": "cover",
      "headline": "Texto principal grande y llamativo (gancho)",
      "subtext": "Subtitulo corto opcional"
    },
    {
      "type": "content",
      "headline": "Titulo del punto",
      "body": "Texto explicativo corto (1-2 oraciones o lista corta)",
      "number": 1
    },
    {
      "type": "cta",
      "headline": "Texto de cierre con llamada a la accion",
      "subtext": "Subtitulo/instruccion (ej: Guarda este post, Comenta tu favorito)"
    }
  ]
}

ESTRUCTURA:
- Slide 1: SIEMPRE type "cover" — gancho poderoso que haga swipe
- Slides 2 a ${count - 1}: type "content" — desarrollo del tema, numerados
- Slide ${count}: SIEMPRE type "cta" — cierre con llamada a la accion

Genera exactamente ${count} slides.`;

  const userMessage = `Genera un carrusel sobre: "${topic}"
Cantidad de slides: ${count}
${notes ? `Notas: ${notes}` : ""}`;

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
        max_tokens: 2048,
        system: systemPrompt,
        messages: [{ role: "user", content: userMessage }],
      }),
    });

    if (!res.ok) {
      const errBody = await res.text();
      console.error("Anthropic API error:", res.status, errBody);
      return NextResponse.json({ error: `API error: ${res.status}` }, { status: 502 });
    }

    const data = await res.json();
    const text = data.content?.[0]?.text || "";
    const carousel = JSON.parse(text);
    return NextResponse.json({ carousel });
  } catch (err) {
    console.error("Generate carousel error:", err);
    return NextResponse.json({ error: "Failed to generate carousel" }, { status: 500 });
  }
}
