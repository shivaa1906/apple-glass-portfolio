// File: app/api/instagram/posts/route.ts
// Description: API route handler for the corresponding data endpoint.

import { NextResponse } from "next/server";

// Core module export or function definition that implements this feature.
export const dynamic = "force-dynamic";
// Core module export or function definition that implements this feature.
export const revalidate = 0;

// Pull the latest three Instagram posts and expose the public fields needed by the UI.
export async function GET() {
// Core module export or function definition that implements this feature.
  const accessToken = process.env.INSTAGRAM_ACCESS_TOKEN;
// Core module export or function definition that implements this feature.
  const businessId = process.env.INSTAGRAM_BUSINESS_ID;

  if (!accessToken || !businessId) {
    return NextResponse.json(
      {
        error: "Missing INSTAGRAM_ACCESS_TOKEN or INSTAGRAM_BUSINESS_ID environment variables.",
      },
      { status: 500 }
    );
  }

  try {
    // Request the public media collection from the Meta Graph API and keep only the fields
    // that are displayed inside the existing card hover overlay.
    const mediaUrl = `https://graph.facebook.com/v22.0/${businessId}/media?fields=id,caption,media_url,permalink,timestamp&access_token=${encodeURIComponent(accessToken)}`;

// Core module export or function definition that implements this feature.
    const response = await fetch(mediaUrl, {
      cache: "no-store",
      next: { revalidate: 0 },
      headers: {
        Accept: "application/json",
      },
    });

    if (!response.ok) {
// Core module export or function definition that implements this feature.
      const errorBody = await response.text();
      console.error("Instagram media Graph API error:", errorBody);

      return NextResponse.json(
        { error: "Failed to fetch latest Instagram posts." },
        { status: response.status }
      );
    }

// Core module export or function definition that implements this feature.
    const data = await response.json();
// Core module export or function definition that implements this feature.
    const rawItems: unknown[] = Array.isArray(data?.data) ? data.data : [];

// Type definition used to describe the structure of data in this component.
    type InstagramMediaItem = {
      id: string;
      caption?: string;
      media_url: string;
      permalink: string;
      timestamp: string;
    };

// Core module export or function definition that implements this feature.
    const posts = rawItems
      .filter((item): item is InstagramMediaItem =>
        typeof item === "object" &&
        item !== null &&
        typeof (item as { media_url?: unknown }).media_url === "string"
      )
      .slice(0, 3)
      .map((item: InstagramMediaItem) => ({
        id: item.id,
        caption: item.caption || "Latest Instagram post",
        media_url: item.media_url,
        permalink: item.permalink,
        timestamp: item.timestamp,
      }));

    return NextResponse.json(
      {
        posts,
      },
      {
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  } catch (error) {
    console.error("Instagram posts route exception:", error);

    return NextResponse.json(
      {
        error: "Unable to load Instagram posts right now.",
      },
      { status: 500 }
    );
  }
}
