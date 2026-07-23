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

  const details = profile.details ?? {};
  const cover = typeof details.cover === "string" && details.cover.trim() ? details.cover : "/assets/profile_avatar1.jpg";
  const avatar = profile.avatar?.trim() ? profile.avatar : "/assets/profile_avatar1.jpg";
  const handle = profile.handle?.trim() ? profile.handle : "@facebookpage";
  const followers = profile.stats[0]?.value?.trim() ? profile.stats[0].value : "—";
  const likes = profile.stats[1]?.value?.trim() ? profile.stats[1].value : "—";
  const community = profile.stats[2]?.value?.trim() ? profile.stats[2].value : "—";

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
