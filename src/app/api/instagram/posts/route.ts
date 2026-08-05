// File: app/api/instagram/posts/route.ts
// Description: API route handler for the corresponding data endpoint.

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

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
    // For videos, also request thumbnail_url and media_type so we can show an image preview.
    // Initialize Supabase (optional) so we can check for a pinned post
    const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const supabase = supabaseUrl && supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey) : null;

    // If a pinned post exists in Supabase, fetch it and keep it for priority insertion
    let pinnedItem: { id: string; caption: string; media_url: string; permalink: string; timestamp: string; like_count: number; comments_count: number; reach_count: number } | null = null;
    try {
      if (supabase) {
        const pinRes = await supabase
          .from("portfolio_instagram_pins")
          .select("post_id")
          .eq("active", true)
          .order("pinned_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        const pinnedId = pinRes.data?.post_id;
        if (pinnedId) {
                const pinnedUrl = `https://graph.facebook.com/v22.0/${pinnedId}?fields=id,caption,media_url,thumbnail_url,media_type,permalink,timestamp,like_count,comments_count,insights.metric(reach,impressions)&access_token=${encodeURIComponent(
            accessToken
          )}`;
          const pinnedResp = await fetch(pinnedUrl, { cache: "no-store", next: { revalidate: 0 }, headers: { Accept: "application/json" } });
          if (pinnedResp.ok) {
            const pinnedData = await pinnedResp.json();
            const isVideo = pinnedData.media_type === "VIDEO" || pinnedData.media_type === "CAROUSEL_VIDEO";
            const imageUrl = isVideo ? pinnedData.thumbnail_url || pinnedData.media_url : pinnedData.media_url;
            if (imageUrl) {
              const pInsights = pinnedData.insights?.data || [];
              const pReachEntry = pInsights.find((d: any) => d.name === "reach");
              const pImprEntry = pInsights.find((d: any) => d.name === "impressions");
              const pReachVal = pReachEntry?.values?.[0]?.value;
              const pImprVal = pImprEntry?.values?.[0]?.value;
              pinnedItem = {
                id: pinnedData.id,
                caption: pinnedData.caption || "Pinned Instagram post",
                media_url: imageUrl,
                like_count: typeof pinnedData.like_count === "number" ? pinnedData.like_count : 0,
                comments_count: typeof pinnedData.comments_count === "number" ? pinnedData.comments_count : 0,
                reach_count: typeof pReachVal === "number" ? pReachVal : typeof pImprVal === "number" ? pImprVal : 0,
                permalink: pinnedData.permalink,
                timestamp: pinnedData.timestamp,
              };
            }
          }
        }
      }
    } catch (err) {
      console.warn("Failed to load pinned Instagram post:", err);
    }

    const mediaUrl = `https://graph.facebook.com/v22.0/${businessId}/media?fields=id,caption,media_url,thumbnail_url,media_type,permalink,timestamp,like_count,comments_count,insights.metric(reach,impressions)&access_token=${encodeURIComponent(accessToken)}`;

    const response = await fetch(mediaUrl, {
      cache: "no-store",
      next: { revalidate: 0 },
      headers: {
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error("Instagram media Graph API error:", errorBody);

      let errorMessage = "Failed to fetch latest Instagram posts.";
      try {
        const parsed = JSON.parse(errorBody);
        if (parsed?.error?.message) {
          errorMessage = parsed.error.message;
        }
      } catch {
        // ignore parse failures
      }

      return NextResponse.json(
        { error: errorMessage },
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
      media_url?: string;
      thumbnail_url?: string;
      media_type?: string;
      permalink: string;
      timestamp: string;
      like_count?: number;
      comments_count?: number;
      insights?: {
        data?: Array<{ name?: string; values?: Array<{ value?: number }>; }>
      };
    };

// Core module export or function definition that implements this feature.
    let posts = rawItems
      .filter((item): item is InstagramMediaItem =>
        typeof item === "object" &&
        item !== null &&
        typeof (item as { permalink?: unknown }).permalink === "string"
      )
      .map((item: InstagramMediaItem) => {
        const isVideo = item.media_type === "VIDEO" || item.media_type === "CAROUSEL_VIDEO";
        const imageUrl = isVideo ? item.thumbnail_url || item.media_url : item.media_url;

        return {
          id: item.id,
          caption: item.caption || "Latest Instagram post",
          media_url: imageUrl || "",
          like_count: typeof item.like_count === "number" ? item.like_count : 0,
          comments_count: typeof item.comments_count === "number" ? item.comments_count : 0,
          reach_count: (() => {
            try {
              const insights = item.insights?.data || [];
              const reachEntry = insights.find((d) => d.name === "reach");
              const impressionsEntry = insights.find((d) => d.name === "impressions");
              const reachVal = reachEntry?.values?.[0]?.value;
              const impressionsVal = impressionsEntry?.values?.[0]?.value;
              return typeof reachVal === "number" ? reachVal : typeof impressionsVal === "number" ? impressionsVal : 0;
            } catch {
              return 0;
            }
          })(),
          permalink: item.permalink,
          timestamp: item.timestamp,
        };
      })
      .filter((item) => item.media_url)
      .slice(0, 10); // keep a small buffer so we can insert pinned without losing count

    // If we have a pinned item, place it at the front and dedupe
    if (pinnedItem) {
      posts = [pinnedItem, ...posts.filter((p) => p.id !== pinnedItem!.id)];
    }

    // Aggregate totals across the fetched list (including pinned if present)
    const totalLikes = posts.reduce((sum, p) => sum + (p.like_count || 0), 0);
    const totalComments = posts.reduce((sum, p) => sum + (p.comments_count || 0), 0);
    const totalReach = posts.reduce((sum, p) => sum + ((p as any).reach_count || 0), 0);

    // Finally cap to the UI limit (3)
    posts = posts.slice(0, 3);

    return NextResponse.json(
      {
        posts,
        totalLikes: totalLikes,
        totalComments: totalComments,
        totalReach: totalReach,
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
