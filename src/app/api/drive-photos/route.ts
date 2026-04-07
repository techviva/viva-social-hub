import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 30;

// Curated Media Hub folder IDs
const FOLDERS: Record<string, string> = {
  "best-of-viva":    "FOLDER_BEST_OF_VIVA",
  "before-after":    "FOLDER_BEFORE_AFTER",
  "pavers":          "FOLDER_PAVERS",
  "turf":            "FOLDER_TURF",
  "pergolas":        "FOLDER_PERGOLAS",
  "softscape":       "FOLDER_SOFTSCAPE",
  "walkthroughs":    "FOLDER_WALKTHROUGHS",
  "project-spotlights": "FOLDER_SPOTLIGHTS",
  "google-business": "FOLDER_GOOGLE_BUSINESS",
};

const CURATED_HUB_ID = "1cUtR0Yo1FyAs6uwvaIi1j9G1LE1zak6j";

async function getAccessToken(): Promise<string> {
  const clientId = process.env.GOOGLE_DRIVE_CLIENT_ID || process.env.GOOGLE_CLIENT_ID || process.env.GOOGLE_ADS_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_DRIVE_CLIENT_SECRET || process.env.GOOGLE_CLIENT_SECRET || process.env.GOOGLE_ADS_CLIENT_SECRET;
  const refreshToken = process.env.GOOGLE_DRIVE_REFRESH_TOKEN || process.env.GOOGLE_REFRESH_TOKEN || process.env.GOOGLE_ADS_REFRESH_TOKEN;

  if (!clientId || !clientSecret || !refreshToken) {
    throw new Error("Google Drive credentials not configured");
  }

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type: "refresh_token",
    }),
  });

  if (!res.ok) {
    throw new Error(`Token refresh failed: ${res.status}`);
  }

  const data = await res.json();
  return data.access_token;
}

export async function GET(req: NextRequest) {
  const category = req.nextUrl.searchParams.get("category") || "";
  const limit = Math.min(Number(req.nextUrl.searchParams.get("limit")) || 20, 50);

  try {
    const token = await getAccessToken();

    // Determine folder to search
    let folderId = CURATED_HUB_ID;
    if (category && FOLDERS[category]) {
      // First, list subfolders of the hub to find the actual folder ID
      const subRes = await fetch(
        `https://www.googleapis.com/drive/v3/files?q='${CURATED_HUB_ID}'+in+parents+and+mimeType='application/vnd.google-apps.folder'&fields=files(id,name)&pageSize=20`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const subData = await subRes.json();
      const match = subData.files?.find((f: { name: string }) =>
        f.name.toLowerCase().includes(category.replace(/-/g, " ").replace("best of viva", "best"))
      );
      if (match) folderId = match.id;
    }

    // Search for images in the folder (recursively via includeItemsFromAllDrives)
    const query = `'${folderId}' in parents and (mimeType contains 'image/') and trashed=false`;
    const res = await fetch(
      `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}&fields=files(id,name,mimeType,thumbnailLink,webContentLink,createdTime)&pageSize=${limit}&orderBy=createdTime+desc`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    if (!res.ok) {
      const err = await res.text();
      console.error("Drive API error:", err);
      return NextResponse.json({ error: "Error accediendo a Google Drive" }, { status: 502 });
    }

    const data = await res.json();
    const photos = (data.files || []).map((f: { id: string; name: string; mimeType: string; thumbnailLink?: string; createdTime?: string }) => ({
      id: f.id,
      name: f.name,
      mime: f.mimeType,
      thumbnail: f.thumbnailLink?.replace("=s220", "=s400") || `https://drive.google.com/thumbnail?id=${f.id}&sz=w400`,
      downloadUrl: `https://drive.google.com/uc?export=download&id=${f.id}`,
      previewUrl: `https://lh3.googleusercontent.com/d/${f.id}=w800`,
      createdAt: f.createdTime,
    }));

    // Also list available categories from subfolders
    let categories: { key: string; name: string; id: string }[] = [];
    if (!category) {
      const catRes = await fetch(
        `https://www.googleapis.com/drive/v3/files?q='${CURATED_HUB_ID}'+in+parents+and+mimeType='application/vnd.google-apps.folder'+and+trashed=false&fields=files(id,name)&orderBy=name&pageSize=20`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const catData = await catRes.json();
      categories = (catData.files || []).map((f: { id: string; name: string }) => ({
        key: f.name.replace(/^\d+\s*/, "").toLowerCase().replace(/\s+/g, "-").replace(/[&]/g, ""),
        name: f.name.replace(/^\d+\s*/, ""),
        id: f.id,
      }));
    }

    return NextResponse.json({ photos, categories });
  } catch (err) {
    console.error("Drive photos error:", err);
    return NextResponse.json(
      { error: `Error: ${err instanceof Error ? err.message : "desconocido"}` },
      { status: 500 }
    );
  }
}
