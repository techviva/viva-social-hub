import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 30;

const CURATED_HUB_ID = "1cUtR0Yo1FyAs6uwvaIi1j9G1LE1zak6j";
const DEFAULT_FOLDER = "1ctL3zmqcDYd"; // 01 Best of Viva (first 12 chars from debug)

// Map category keywords to folder name fragments for matching
const CATEGORY_MATCH: Record<string, string> = {
  "best-of-viva": "best of viva",
  "before-after": "before",
  "pavers": "pavers",
  "turf": "turf",
  "pergolas": "pergolas",
  "softscape": "softscape",
  "lighting": "lighting",
  "drone": "drone",
  "landscape": "landscape-general",
  "walkthroughs": "walkthroughs",
  "spotlights": "project-spotlight",
  "google-business": "google-business",
  "testimonials": "testimonials",
};

async function getAccessToken(): Promise<string> {
  const clientId = process.env.GOOGLE_DRIVE_CLIENT_ID || process.env.GOOGLE_CLIENT_ID || process.env.GOOGLE_ADS_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_DRIVE_CLIENT_SECRET || process.env.GOOGLE_CLIENT_SECRET || process.env.GOOGLE_ADS_CLIENT_SECRET;
  const refreshToken = process.env.GOOGLE_DRIVE_REFRESH_TOKEN || process.env.GOOGLE_REFRESH_TOKEN || process.env.GOOGLE_ADS_REFRESH_TOKEN;

  if (!clientId || !clientSecret || !refreshToken) throw new Error("Google Drive credentials not configured");

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ client_id: clientId, client_secret: clientSecret, refresh_token: refreshToken, grant_type: "refresh_token" }),
  });

  if (!res.ok) throw new Error(`Token refresh failed: ${res.status}`);
  return (await res.json()).access_token;
}

async function listSubfolders(token: string): Promise<{ id: string; name: string }[]> {
  const res = await fetch(
    `https://www.googleapis.com/drive/v3/files?q='${CURATED_HUB_ID}'+in+parents+and+mimeType='application/vnd.google-apps.folder'+and+trashed=false&fields=files(id,name)&orderBy=name&pageSize=20`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  const data = await res.json();
  return data.files || [];
}

async function listImages(token: string, folderId: string, limit: number) {
  const query = `'${folderId}' in parents and (mimeType contains 'image/') and trashed=false`;
  const res = await fetch(
    `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}&fields=files(id,name,mimeType,thumbnailLink,createdTime)&pageSize=${limit}&orderBy=createdTime+desc`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  if (!res.ok) { console.error("Drive list error:", await res.text()); return []; }
  const data = await res.json();
  return (data.files || []).map((f: { id: string; name: string; mimeType: string; thumbnailLink?: string; createdTime?: string }) => ({
    id: f.id,
    name: f.name,
    mime: f.mimeType,
    thumbnail: f.thumbnailLink?.replace("=s220", "=s400") || `https://drive.google.com/thumbnail?id=${f.id}&sz=w400`,
    previewUrl: `https://lh3.googleusercontent.com/d/${f.id}=w800`,
    createdAt: f.createdTime,
  }));
}

export async function GET(req: NextRequest) {
  const category = req.nextUrl.searchParams.get("category") || "";
  const folderId = req.nextUrl.searchParams.get("folderId") || "";
  const limit = Math.min(Number(req.nextUrl.searchParams.get("limit")) || 20, 50);

  try {
    const token = await getAccessToken();
    const subfolders = await listSubfolders(token);

    // Determine which folder to search
    let targetFolderId = "";

    if (folderId) {
      targetFolderId = folderId;
    } else if (category && CATEGORY_MATCH[category]) {
      const match = subfolders.find((f) => f.name.toLowerCase().includes(CATEGORY_MATCH[category]));
      if (match) targetFolderId = match.id;
    }

    // Default: try "Best of Viva" folder
    if (!targetFolderId) {
      const bestOf = subfolders.find((f) => f.name.toLowerCase().includes("best"));
      targetFolderId = bestOf?.id || subfolders[0]?.id || CURATED_HUB_ID;
    }

    const photos = await listImages(token, targetFolderId, limit);

    // Build categories list
    const categories = subfolders
      .filter((f) => !f.name.toLowerCase().includes("archive"))
      .map((f) => ({
        key: f.name.replace(/^\d+[-\s]*/, "").toLowerCase().replace(/\s+/g, "-").replace(/[&]/g, ""),
        name: f.name.replace(/^\d+[-\s]*/, ""),
        id: f.id,
      }));

    return NextResponse.json({ photos, categories });
  } catch (err) {
    console.error("Drive photos error:", err);
    return NextResponse.json({ error: `Error: ${err instanceof Error ? err.message : "desconocido"}` }, { status: 500 });
  }
}
