import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

// This route attempts to fetch Twitter profile-level reach (approximation) for a date range.
// Requires TWITTER_BEARER_TOKEN and TWITTER_USER_ID to fetch tweets and their public metrics.

export async function GET(request: Request) {
  try {
    const bearer = process.env.TWITTER_BEARER_TOKEN;
    const userId = process.env.TWITTER_USER_ID;

    const url = new URL(request.url);
    const since = url.searchParams.get("since");
    const until = url.searchParams.get("until");

    if (!bearer || !userId) {
      return NextResponse.json({ profileReach: null, since: since || null, until: until || null });
    }

    try {
      // Fetch user's recent tweets within the window (Twitter API v2). We'll request public_metrics.
      // Twitter's impression metrics may require Elevated/Ads access; as fallback we sum public engagement counts.
      const tweetsUrl = `https://api.twitter.com/2/users/${userId}/tweets?max_results=100&tweet.fields=created_at,public_metrics`;
      const resp = await fetch(tweetsUrl, { headers: { Authorization: `Bearer ${bearer}` }, cache: "no-store", next: { revalidate: 0 } });
      if (!resp.ok) {
        console.warn("Twitter tweets request failed:", await resp.text());
        return NextResponse.json({ profileReach: null, since: since || null, until: until || null });
      }

      const json = await resp.json();
      const items = Array.isArray(json?.data) ? json.data : [];

      // Filter by date range if provided
      const sinceMs = since ? Date.parse(since) : null;
      const untilMs = until ? Date.parse(until) : null;

      const filtered = items.filter((t: any) => {
        if (!t?.created_at) return false;
        const ts = Date.parse(t.created_at);
        if (sinceMs && ts < sinceMs) return false;
        if (untilMs && ts > untilMs) return false;
        return true;
      });

      // Attempt to sum impressions if available, else approximate with sum of (retweet_count + reply_count + like_count)
      let totalReach: number | null = 0;
      for (const t of filtered) {
        const pm = t.public_metrics || {};
        // impressions not available in standard v2 fields; approximate using engagement sum
        totalReach += (pm.retweet_count || 0) + (pm.reply_count || 0) + (pm.like_count || 0) + (pm.quote_count || 0);
      }

      return NextResponse.json({ profileReach: totalReach, since: since || null, until: until || null, raw: json }, { headers: { "Cache-Control": "no-store" } });
    } catch (err) {
      console.error("Twitter insights exception:", err);
      return NextResponse.json({ profileReach: null, since: since || null, until: until || null }, { status: 200 });
    }
  } catch (error) {
    console.error("/api/twitter GET failed:", error);
    return NextResponse.json({ profileReach: null }, { status: 500 });
  }
}
