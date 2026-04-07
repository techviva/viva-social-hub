import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 30;

function extractJSON(text: string): string {
  // Strip markdown code fences if present
  let cleaned = text.trim();
  if (cleaned.startsWith("```")) {
    cleaned = cleaned.replace(/^```(?:json)?\s*\n?/, "").replace(/\n?```\s*$/, "");
  }
  // Find the first { and last }
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  if (start !== -1 && end !== -1 && end > start) {
    return cleaned.slice(start, end + 1);
  }
  return cleaned;
}

export async function POST(req: NextRequest) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "ANTHROPIC_API_KEY no esta configurada en el servidor" }, { status: 500 });
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Request body invalido" }, { status: 400 });
  }

  const { topic, platform, duration, notes } = body;

  if (!topic || typeof topic !== "string" || topic.trim().length === 0) {
    return NextResponse.json({ error: "El tema es requerido" }, { status: 400 });
  }

  const systemPrompt = `Eres un experto creador de contenido para redes sociales de una empresa de paisajismo y diseño exterior llamada Viva Landscape & Design en Phoenix, Arizona.

Tu trabajo es generar guiones de video completos y listos para grabar.

REGLAS:
- Tono: profesional pero cercano, como hablandole a un amigo. Natural, sin sonar corporativo.
- Idioma: español (de Mexico/Latinoamerica), pero puedes mezclar terminos en ingles cuando sea natural en el contexto de landscaping.
- El guion debe estar listo para leer frente a camara.
- IMPORTANTE: Responde UNICAMENTE con JSON puro. Sin backticks, sin markdown, sin texto antes ni despues del JSON.

FORMATO DE RESPUESTA (JSON):
{
  "title": "Titulo atractivo del video",
  "hook": "El gancho inicial (primeros 3-5 segundos para atrapar la atencion). Debe ser una frase directa y poderosa.",
  "keyPoints": [
    {
      "point": "Titulo del punto",
      "script": "El texto exacto que se dice en camara para este punto. 2-4 oraciones."
    }
  ],
  "cta": "Cierre con llamada a la accion clara. Invitar a seguir, comentar, pedir cotizacion, etc.",
  "duration": "Duracion estimada en formato legible (ej: '45-60 segundos', '2-3 minutos')",
  "format": "reel | video_largo | historia",
  "formatReason": "Explicacion breve de por que este formato es el mejor para este tema",
  "tips": ["Tip visual o de produccion 1", "Tip 2", "Tip 3"]
}

- Para "keyPoints" genera entre 3 y 6 puntos dependiendo de la profundidad del tema.
- "format" debe ser uno de: "reel" (< 90 seg), "video_largo" (> 2 min), "historia" (15-60 seg, vertical, efimero).
- Elige el formato basado en el tema y la plataforma destino.`;

  const userMessage = `Genera un guion para un video sobre: "${topic}"
Plataforma destino: ${platform || "cualquiera"}
Duracion preferida: ${duration || "la que mejor funcione"}
${notes ? `Notas adicionales: ${notes}` : ""}`;

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
      return NextResponse.json({ error: `Error de la API de Anthropic: ${res.status}` }, { status: 502 });
    }

    const data = await res.json();
    const rawText = data.content?.[0]?.text || "";

    if (!rawText) {
      return NextResponse.json({ error: "La API no devolvio contenido" }, { status: 502 });
    }

    const jsonStr = extractJSON(rawText);

    let script;
    try {
      script = JSON.parse(jsonStr);
    } catch (parseErr) {
      console.error("JSON parse error. Raw text:", rawText.substring(0, 500));
      return NextResponse.json({ error: "Error al parsear la respuesta de la AI. Intenta de nuevo." }, { status: 500 });
    }

    return NextResponse.json({ script });
  } catch (err) {
    console.error("Generate script error:", err);
    return NextResponse.json(
      { error: `Error interno: ${err instanceof Error ? err.message : "desconocido"}` },
      { status: 500 }
    );
  }
}
