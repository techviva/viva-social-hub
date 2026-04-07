import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  const geminiKey = process.env.GEMINI_API_KEY;
  if (!geminiKey) return NextResponse.json({ error: "GEMINI_API_KEY no configurada" }, { status: 500 });

  let body;
  try { body = await req.json(); } catch { return NextResponse.json({ error: "Body invalido" }, { status: 400 }); }

  const { imageUrl, prompt, model } = body;
  if (!prompt?.trim()) return NextResponse.json({ error: "Se necesita un prompt de edicion" }, { status: 400 });

  const modelId = model === "pro" ? "gemini-2.0-flash-exp" : "gemini-2.0-flash-exp";

  try {
    // If we have an image URL, download it and include as reference
    let imagePart = null;
    if (imageUrl) {
      const imgRes = await fetch(imageUrl);
      if (imgRes.ok) {
        const buffer = await imgRes.arrayBuffer();
        const base64 = Buffer.from(buffer).toString("base64");
        const mimeType = imgRes.headers.get("content-type") || "image/jpeg";
        imagePart = {
          inlineData: { mimeType, data: base64 },
        };
      }
    }

    const parts = [];
    if (imagePart) parts.push(imagePart);
    parts.push({ text: prompt });

    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${modelId}:generateContent?key=${geminiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts }],
          generationConfig: {
            responseModalities: ["TEXT", "IMAGE"],
          },
        }),
      }
    );

    if (!geminiRes.ok) {
      const err = await geminiRes.text();
      console.error("Gemini error:", geminiRes.status, err);
      return NextResponse.json({ error: `Gemini API error: ${geminiRes.status}` }, { status: 502 });
    }

    const data = await geminiRes.json();
    const candidate = data.candidates?.[0]?.content?.parts || [];

    let editedImage = null;
    let textResponse = "";

    for (const part of candidate) {
      if (part.inlineData) {
        editedImage = {
          data: part.inlineData.data,
          mimeType: part.inlineData.mimeType || "image/png",
        };
      }
      if (part.text) {
        textResponse += part.text;
      }
    }

    if (!editedImage) {
      return NextResponse.json({
        error: "Gemini no genero una imagen. Respuesta de texto: " + (textResponse || "vacia"),
      }, { status: 422 });
    }

    return NextResponse.json({
      image: `data:${editedImage.mimeType};base64,${editedImage.data}`,
      text: textResponse,
    });
  } catch (err) {
    console.error("Edit image error:", err);
    return NextResponse.json({ error: `Error: ${err instanceof Error ? err.message : "desconocido"}` }, { status: 500 });
  }
}
