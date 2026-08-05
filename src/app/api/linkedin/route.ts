import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

// This route attempts to fetch LinkedIn organization/profile level reach for a given date range.
// Requires the following env vars to be set for actual API calls:
// LINKEDIN_ORGANIZATION_ID and LINKEDIN_ACCESS_TOKEN

export async function GET(request: Request) {
  try {
    const orgId = process.env.LINKEDIN_ORGANIZATION_ID;
    const token = process.env.LINKEDIN_ACCESS_TOKEN;

    const url = new URL(request.url);
    const since = url.searchParams.get("since");
    const until = url.searchParams.get("until");

    if (!orgId || !token) {
      return NextResponse.json({ profileReach: null, since: since || null, until: until || null });
    }

    // LinkedIn insights endpoints require specific analytics permissions and formats.
    // Here we attempt a best-effort call to the organizationPageStatistics endpoint.
    try {
      // convert ISO dates to epoch milliseconds
      const sinceMs = since ? Date.parse(since) : undefined;
      const untilMs = until ? Date.parse(until) : undefined;

      // Example endpoint (may require different permissions or fields in your LinkedIn account):
      const insightsUrl = `https://api.linkedin.com/v2/organizationalEntityShareStatistics?q=organizationalEntity&organizationalEntity=urn:li:organization:${orgId}${
        sinceMs && untilMs ? `&timeIntervals=(timeRange:(start:${sinceMs},end:${untilMs}))` : ""
      }`;

      const resp = await fetch(insightsUrl, {
        headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
        cache: "no-store",
        next: { revalidate: 0 },
      });

      if (!resp.ok) {
        console.warn("LinkedIn insights request failed:", await resp.text());
        return NextResponse.json({ profileReach: null, since: since || null, until: until || null });
      }

      const json = await resp.json();

      // The exact shape depends on the endpoint; attempt to extract a numeric reach total.
      // Fallback: return null so UI knows it's unavailable.
      let totalReach: number | null = null;
      try {
        // if data array with values, sum numeric values
        if (Array.isArray(json?.elements)) {
          totalReach = json.elements.reduce((s: number, el: any) => s + (Number(el?.totalShareStatistics || 0) || 0), 0);
        }
      } catch (err) {
        console.warn("Failed to parse LinkedIn insights response:", err);
      }

      return NextResponse.json({ profileReach: totalReach, since: since || null, until: until || null, raw: json }, { headers: { "Cache-Control": "no-store" } });
    } catch (err) {
      console.error("LinkedIn insights exception:", err);
      return NextResponse.json({ profileReach: null, since: since || null, until: until || null }, { status: 200 });
    }
  } catch (error) {
    console.error("/api/linkedin GET failed:", error);
    return NextResponse.json({ profileReach: null }, { status: 500 });
  }
}
