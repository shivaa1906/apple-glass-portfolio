// File: app/api/instagram/route.ts
// Description: Instagram API route for profile and posts data.

import { NextResponse } from "next/server";

// Core module export or function definition that implements this feature.
export const dynamic = "force-dynamic";
// Core module export or function definition that implements this feature.
export const revalidate = 0;

// The Graph API returns the current business account metadata for the live card.
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
    // Request only the profile fields needed by the card UI.
    const profileUrl = `https://graph.facebook.com/v22.0/${businessId}?fields=username,followers_count,follows_count,media_count,profile_picture_url&access_token=${encodeURIComponent(accessToken)}`;

// Core module export or function definition that implements this feature.
    const response = await fetch(profileUrl, {
      cache: "no-store",
      next: { revalidate: 0 },
      headers: {
        Accept: "application/json",
      },
    });

    if (!response.ok) {
// Core module export or function definition that implements this feature.
      const errorBody = await response.text();
      console.error("Instagram profile Graph API error:", errorBody);

      return NextResponse.json(
        { error: "Failed to fetch Instagram profile information." },
        { status: response.status }
      );
    }

// Core module export or function definition that implements this feature.
    const data = await response.json();

    return NextResponse.json(
      {
        username: data.username || "",
        followers_count: Number(data.followers_count || 0),
        follows_count: Number(data.follows_count || 0),
        media_count: Number(data.media_count || 0),
        profile_picture_url: data.profile_picture_url || "",
      },
      {
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  } catch (error) {
    console.error("Instagram profile route exception:", error);

    return NextResponse.json(
      {
        error: "Unable to load Instagram profile right now.",
      },
      { status: 500 }
    );
  }
}
