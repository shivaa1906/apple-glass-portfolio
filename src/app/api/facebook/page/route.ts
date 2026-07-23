import fs from "fs/promises";
import path from "path";
import { NextResponse } from "next/server";

type FacebookPagePayload = {
  name: string;
  username?: string;
  followers_count: number;
  fan_count: number;
  picture: string;
  cover?: string;
  link: string;
};

export const dynamic = "force-dynamic";
export const revalidate = 0;

const CACHE_PATH = path.join(process.cwd(), "bot", "facebook-page-cache.json");

const readCache = async (): Promise<FacebookPagePayload | null> => {
  try {
    const raw = await fs.readFile(CACHE_PATH, "utf8");
    return JSON.parse(raw) as FacebookPagePayload;
  } catch {
    return null;
  }
};

const writeCache = async (payload: FacebookPagePayload) => {
  try {
    await fs.writeFile(CACHE_PATH, JSON.stringify(payload, null, 2), "utf8");
  } catch {
    // Ignore cache write failures, but still return fresh data.
  }
};

export async function GET() {
  const pageId = process.env.FACEBOOK_PAGE_ID;
  const accessToken = process.env.FACEBOOK_ACCESS_TOKEN;

  if (!pageId || !accessToken) {
    return NextResponse.json(
      { error: "FACEBOOK_PAGE_ID and FACEBOOK_ACCESS_TOKEN are required." },
      { status: 500 }
    );
  }

  const url = `https://graph.facebook.com/v17.0/${encodeURIComponent(
    pageId
  )}?fields=name,username,followers_count,fan_count,picture.type(large),cover,link&access_token=${encodeURIComponent(
    accessToken
  )}`;

  try {
    const response = await fetch(url, {
      cache: "no-store",
      headers: {
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Facebook Graph API returned ${response.status}`);
    }

    const data = await response.json();
    const payload: FacebookPagePayload = {
      name: String(data.name || ""),
      username: typeof data.username === "string" && data.username.trim() ? data.username.trim() : undefined,
      followers_count: Number(data.followers_count ?? 0),
      fan_count: Number(data.fan_count ?? 0),
      picture: String(data.picture?.data?.url || ""),
      cover: typeof data.cover?.source === "string" && data.cover.source.trim() ? data.cover.source : undefined,
      link: String(data.link || ""),
    };

    await writeCache(payload);

    return NextResponse.json(payload, {
      headers: {
        "Cache-Control": "no-store",
      },
    });
  } catch {
    const cached = await readCache();
    if (cached) {
      return NextResponse.json(cached, {
        headers: {
          "Cache-Control": "public, max-age=0, s-maxage=300",
        },
      });
    }

    return NextResponse.json(
      {
        error: "Unable to load Facebook page data.",
      },
      { status: 500 }
    );
  }
}
