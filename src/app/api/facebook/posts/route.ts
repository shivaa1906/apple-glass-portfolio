// File: app/api/facebook/posts/route.ts
// Description: Fetch recent posts for the configured Facebook page.

import fs from "fs/promises";
import path from "path";
import { NextResponse } from "next/server";

type FacebookPost = {
  id: string;
  message?: string;
  created_time?: string;
  permalink_url?: string;
  shares?: { count?: number };
};

const CACHE_PATH = path.join(process.cwd(), "bot", "facebook-posts-cache.json");

const readCache = async (): Promise<FacebookPost[] | null> => {
  try {
    const raw = await fs.readFile(CACHE_PATH, "utf8");
    return JSON.parse(raw) as FacebookPost[];
  } catch {
    return null;
  }
};

const writeCache = async (payload: FacebookPost[]) => {
  try {
    await fs.writeFile(CACHE_PATH, JSON.stringify(payload, null, 2), "utf8");
  } catch {
    // ignore
  }
};

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  const pageId = process.env.FACEBOOK_PAGE_ID;
  const accessToken = process.env.FACEBOOK_ACCESS_TOKEN;

  if (!pageId || !accessToken) {
    return NextResponse.json({ error: "FACEBOOK_PAGE_ID and FACEBOOK_ACCESS_TOKEN are required." }, { status: 500 });
  }

  // request recent posts (message and created_time)
  const url = `https://graph.facebook.com/v17.0/${encodeURIComponent(pageId)}/posts?fields=message,created_time,permalink_url,shares.limit(0).summary(true)&limit=5&access_token=${encodeURIComponent(
    accessToken
  )}`;

  try {
    const resp = await fetch(url, { cache: "no-store", headers: { Accept: "application/json" } });
    if (!resp.ok) throw new Error(`Facebook posts API ${resp.status}`);
    const data = await resp.json();
    const posts = (data.data || []).map((p: { id: string; message?: string; created_time?: string; permalink_url?: string; shares?: { summary?: { total_count?: number } } }) => ({
      id: p.id,
      message: p.message,
      created_time: p.created_time,
      permalink_url: p.permalink_url,
      shares: p.shares?.summary ? { count: p.shares.summary.total_count } : undefined,
    }));

    await writeCache(posts);

    return NextResponse.json(posts, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    const cached = await readCache();
    if (cached) {
      return NextResponse.json(cached, { headers: { "Cache-Control": "public, max-age=0, s-maxage=300" } });
    }
    console.error("Facebook posts route error:", error);
    return NextResponse.json({ error: "Unable to load Facebook posts." }, { status: 500 });
  }
}
