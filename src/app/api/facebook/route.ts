// File: app/api/facebook/route.ts
// Description: Facebook API route for page statistics and post previews.

import { NextResponse } from "next/server";
import { SOCIAL_PROFILES } from "@/data/socialData";

export async function GET() {
  const profile = SOCIAL_PROFILES.find((p) => p.id === "facebook");

  if (!profile) {
    return NextResponse.json(
      { error: "Facebook profile data is unavailable." },
      { status: 500 }
    );
  }

// Core module export or function definition that implements this feature.
  const details = profile.details ?? {};
// Core module export or function definition that implements this feature.
  const cover = typeof details.cover === "string" && details.cover.trim() ? details.cover : "/assets/profile_avatar1.jpg";
// Core module export or function definition that implements this feature.
  const avatar = profile.avatar?.trim() ? profile.avatar : "/assets/profile_avatar1.jpg";
// Core module export or function definition that implements this feature.
  const handle = profile.handle?.trim() ? profile.handle : "@facebookpage";
// Core module export or function definition that implements this feature.
  const followers = profile.stats[0]?.value?.trim() ? profile.stats[0].value : "—";
// Core module export or function definition that implements this feature.
  const likes = profile.stats[1]?.value?.trim() ? profile.stats[1].value : "—";
// Core module export or function definition that implements this feature.
  const community = profile.stats[2]?.value?.trim() ? profile.stats[2].value : "—";

// Core module export or function definition that implements this feature.
  const name = profile.name?.trim() ? profile.name : "Facebook Page";

  return NextResponse.json(
    {
      name,
      handle,
      cover,
      avatar,
      followers,
      likes,
      community,
      featuredPost: {
        text: details.featuredPost?.text || "",
        date: details.featuredPost?.date || "",
        likes: details.featuredPost?.likes || "",
        shares: details.featuredPost?.shares || "",
      },
    },
    {
      headers: {
        "Cache-Control": "public, max-age=600, s-maxage=600",
      },
    }
  );
}
