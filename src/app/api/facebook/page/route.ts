// File: app/api/facebook/page/route.ts
// Description: API route handler for the corresponding data endpoint.

import fs from "fs/promises";
import path from "path";
import { NextResponse } from "next/server";

// Type definition used to describe the structure of data in this component.
type FacebookPagePayload = {
  name: string;
  username?: string;
  followers_count: number;
  fan_count: number;
  posts_count: number;
  picture: string;
  cover?: string;
  link: string;
};

// Core module export or function definition that implements this feature.
export const dynamic = "force-dynamic";
// Core module export or function definition that implements this feature.
export const revalidate = 0;

// Core module export or function definition that implements this feature.
const CACHE_CANDIDATES = [
  path.join(process.cwd(), "bot", "facebook-page-cache.json"),
  path.join(process.cwd(), "../bot", "facebook-page-cache.json"),
  path.join(process.cwd(), "..", "bot", "facebook-page-cache.json"),
];

const CACHE_PATH = CACHE_CANDIDATES[0];

const normalizeCache = (parsed: Partial<FacebookPagePayload> | null): FacebookPagePayload | null => {
  if (!parsed) return null;
  return {
    name: String(parsed.name || ""),
    username: typeof parsed.username === "string" && parsed.username.trim() ? parsed.username.trim() : undefined,
    followers_count: Number(parsed.followers_count ?? 0),
    fan_count: Number(parsed.fan_count ?? 0),
    posts_count: Number(parsed.posts_count ?? 0),
    picture: String(parsed.picture || ""),
    cover: typeof parsed.cover === "string" && parsed.cover.trim() ? parsed.cover : undefined,
    link: String(parsed.link || ""),
  };
};

const readCache = async (): Promise<FacebookPagePayload | null> => {
  for (const candidate of CACHE_CANDIDATES) {
    try {
      const raw = await fs.readFile(candidate, "utf8");
      const parsed = JSON.parse(raw) as Partial<FacebookPagePayload>;
      return normalizeCache(parsed);
    } catch {
      // try next candidate
    }
  }
  return null;
};

const writeCache = async (payload: FacebookPagePayload) => {
  // Merge with existing cache to avoid overwriting good counts with temporary zeros
  const existing = await readCache();
  const merged: FacebookPagePayload = {
    name: payload.name || existing?.name || "",
    username: payload.username ?? existing?.username,
    followers_count: (payload.followers_count || payload.fan_count) || existing?.followers_count || 0,
    fan_count: (payload.fan_count || payload.followers_count) || existing?.fan_count || 0,
    posts_count: payload.posts_count || existing?.posts_count || 0,
    picture: payload.picture || existing?.picture || "",
    cover: payload.cover || existing?.cover,
    link: payload.link || existing?.link || "",
  };

  for (const candidate of CACHE_CANDIDATES) {
    try {
      await fs.writeFile(candidate, JSON.stringify(merged, null, 2), "utf8");
      return;
    } catch {
      // try next candidate
    }
  }
  // ignore if none writable
};

export async function GET() {
// Core module export or function definition that implements this feature.
  const pageId = process.env.FACEBOOK_PAGE_ID;
// Core module export or function definition that implements this feature.
  const accessToken = process.env.FACEBOOK_ACCESS_TOKEN;

  if (!pageId || !accessToken) {
    return NextResponse.json(
      { error: "FACEBOOK_PAGE_ID and FACEBOOK_ACCESS_TOKEN are required." },
      { status: 500 }
    );
  }

// Core module export or function definition that implements this feature.
  const url = `https://graph.facebook.com/v17.0/${encodeURIComponent(
    pageId
  )}?fields=name,username,followers_count,fan_count,posts.limit(1).summary(true),picture.type(large),cover.fields(source),link&access_token=${encodeURIComponent(
    accessToken
  )}`;

  try {
// Core module export or function definition that implements this feature.
    const response = await fetch(url, {
      cache: "no-store",
      headers: {
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      let message = `Facebook Graph API returned ${response.status}`;
      try {
        const parsed = JSON.parse(errorText);
        if (parsed?.error?.message) {
          message = parsed.error.message;
        }
      } catch {
        if (errorText) {
          message = `${message}: ${errorText}`;
        }
      }
      throw new Error(message);
    }

    const data = await response.json();
    if (data?.error) {
      const message = typeof data.error?.message === "string" ? data.error.message : "Facebook Graph API returned an error.";
      throw new Error(message);
    }
    const payload: FacebookPagePayload = {
      name: String(data.name || ""),
      username: typeof data.username === "string" && data.username.trim() ? data.username.trim() : undefined,
      followers_count: Number(data.followers_count ?? data.fan_count ?? 0),
      fan_count: Number(data.fan_count ?? data.followers_count ?? 0),
      posts_count: Number(data.posts?.summary?.total_count ?? data.posts_count ?? 0),
      picture: String(data.picture?.data?.url || ""),
      cover: typeof data.cover?.source === "string" && data.cover.source.trim() ? data.cover.source : undefined,
      link: String(data.link || ""),
    };

    // If posts_count is missing/zero, try requesting posts summary separately (some tokens return it differently)
    if (!payload.posts_count) {
      try {
        const postsUrl = `https://graph.facebook.com/v17.0/${encodeURIComponent(pageId)}/posts?limit=1&summary=true&access_token=${encodeURIComponent(accessToken)}`;
        const postsResp = await fetch(postsUrl, { cache: "no-store", headers: { Accept: "application/json" } });
        if (postsResp.ok) {
          const postsData = await postsResp.json();
          if (!postsData?.error) {
            payload.posts_count = Number(postsData?.summary?.total_count ?? postsData?.data?.length ?? payload.posts_count ?? 0);
          }
        }
      } catch {
        // ignore posts re-check failures
      }
    }

    await writeCache(payload);

    return NextResponse.json(payload, {
      headers: {
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    const cached = await readCache();
    if (cached) {
      return NextResponse.json(cached, {
        headers: {
          "Cache-Control": "public, max-age=0, s-maxage=300",
        },
      });
    }

    const message = error instanceof Error ? error.message : "Unable to load Facebook page data.";
    console.error("Facebook page route error:", message);
    return NextResponse.json(
      {
        error: message,
      },
      { status: 500 }
    );
  }
}
