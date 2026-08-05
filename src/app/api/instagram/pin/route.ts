import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = supabaseUrl && supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey) : null;

const requireSecret = (request: Request) => {
  const configured = process.env.FRONTEND_UPDATE_SECRET;
  if (!configured) return true;
  const incoming = request.headers.get("x-update-secret") || "";
  return incoming === configured;
};

export async function GET() {
  try {
    if (!supabase) return NextResponse.json({ pinned: null });

    const { data, error } = await supabase
      .from("portfolio_instagram_pins")
      .select("post_id")
      .eq("active", true)
      .order("pinned_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error("Supabase pins read failed:", error.message);
      return NextResponse.json({ pinned: null });
    }

    return NextResponse.json({ pinned: data?.post_id ?? null }, { headers: { "Cache-Control": "no-store" } });
  } catch (err) {
    console.error("/api/instagram/pin GET failed:", err);
    return NextResponse.json({ pinned: null }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    if (!requireSecret(request)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const body = (await request.json()) as { postId?: string };
    const postId = body.postId?.trim();
    if (!postId) return NextResponse.json({ error: "Missing postId" }, { status: 400 });

    if (!supabase) return NextResponse.json({ ok: true, pinned: postId });

    const { error } = await supabase.from("portfolio_instagram_pins").upsert({ post_id: postId, pinned_at: new Date().toISOString(), active: true }, { onConflict: "post_id" });
    if (error) {
      console.error("Supabase pin upsert failed:", error.message);
      return NextResponse.json({ error: "Failed to pin post" }, { status: 500 });
    }

    return NextResponse.json({ ok: true, pinned: postId }, { headers: { "Cache-Control": "no-store" } });
  } catch (err) {
    console.error("/api/instagram/pin POST failed:", err);
    return NextResponse.json({ error: "Unable to pin post" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    if (!requireSecret(request)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const body = (await request.json()) as { postId?: string };
    const postId = body?.postId?.trim();

    if (!supabase) return NextResponse.json({ ok: true });

    if (postId) {
      const { error } = await supabase.from("portfolio_instagram_pins").update({ active: false }).eq("post_id", postId);
      if (error) {
        console.error("Supabase pin remove failed:", error.message);
        return NextResponse.json({ error: "Failed to unpin post" }, { status: 500 });
      }
    } else {
      // If no postId provided, deactivate all pins
      const { error } = await supabase.from("portfolio_instagram_pins").update({ active: false }).eq("active", true);
      if (error) {
        console.error("Supabase clear pins failed:", error.message);
        return NextResponse.json({ error: "Failed to clear pins" }, { status: 500 });
      }
    }

    return NextResponse.json({ ok: true }, { headers: { "Cache-Control": "no-store" } });
  } catch (err) {
    console.error("/api/instagram/pin DELETE failed:", err);
    return NextResponse.json({ error: "Unable to remove pin" }, { status: 500 });
  }
}
