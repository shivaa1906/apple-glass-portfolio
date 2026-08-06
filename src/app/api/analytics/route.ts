import fs from "fs/promises";
import { constants as fsConstants } from "fs";
import os from "os";
import path from "path";
import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

type VisitorPayload = {
  visitorId?: string;
  country?: string;
  region?: string;
  city?: string;
  browser?: string;
  browserVersion?: string;
  os?: string;
  deviceType?: string;
  screenResolution?: string;
  timezone?: string;
  language?: string;
  referrer?: string;
  landingPage?: string;
  currentPage?: string;
  avgSessionMs?: number;
  avgScrollPct?: number;
  buttonClicks?: Record<string, number>;
  resumeDownloads?: number;
  discordClicks?: number;
};

type VisitorRecord = {
  visitorId: string;
  firstVisit: string;
  lastVisit: string;
  visitCount: number;
  data: Partial<VisitorPayload>;
};

type AnalyticsStore = {
  visitors: VisitorRecord[];
  totalVisitors: number;
  createdAt: string;
};

type SupabaseVisitorRecord = {
  visitor_id: string;
  first_visit: string;
  last_visit: string;
  visit_count?: number;
  data?: Partial<VisitorPayload>;
};

const ANALYTICS_PATH = path.join(process.cwd(), "bot", "analytics.json");
const TMP_ANALYTICS_PATH = path.join(os.tmpdir(), "portfolio_analytics.json");
const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const initialSupabase = SUPABASE_URL && SUPABASE_KEY ? createClient(SUPABASE_URL, SUPABASE_KEY) : null;
const supabase = initialSupabase;
let supabaseEnabled = Boolean(initialSupabase);
const VISITOR_TABLE = "portfolio_visitors";

const isSupabaseConfigured = () => Boolean(SUPABASE_URL && SUPABASE_KEY && supabaseEnabled);

const disableSupabase = (reason?: string) => {
  supabaseEnabled = false;
  if (reason) {
    console.warn("Supabase analytics disabled:", reason);
  }
};

const isTableMissingError = (error: { message?: string } | null | undefined) => {
  const message = String(error?.message || "").toLowerCase();
  return /portfolio_visitors|relation .* does not exist|schema cache/i.test(message);
};

const getNow = () => new Date().toISOString();

const getAnalyticsPath = async (): Promise<string> => {
  try {
    await fs.access(ANALYTICS_PATH, fsConstants.R_OK | fsConstants.W_OK);
    return ANALYTICS_PATH;
  } catch {
    try {
      await fs.access(path.dirname(ANALYTICS_PATH), fsConstants.R_OK | fsConstants.W_OK);
      return ANALYTICS_PATH;
    } catch {
      return TMP_ANALYTICS_PATH;
    }
  }
};

const readAnalyticsLocal = async (): Promise<AnalyticsStore> => {
  const analyticsPath = await getAnalyticsPath();
  try {
    const raw = await fs.readFile(analyticsPath, "utf8");
    return JSON.parse(raw) as AnalyticsStore;
  } catch {
    const init: AnalyticsStore = { visitors: [], totalVisitors: 0, createdAt: getNow() };
    try {
      await fs.writeFile(analyticsPath, JSON.stringify(init, null, 2), "utf8");
    } catch (error) {
      console.warn("Unable to write analytics local file:", error);
    }
    return init;
  }
};

const writeAnalyticsLocal = async (data: AnalyticsStore) => {
  const analyticsPath = await getAnalyticsPath();
  try {
    await fs.writeFile(analyticsPath, JSON.stringify(data, null, 2), "utf8");
  } catch (error) {
    console.warn("Unable to persist analytics local file:", error);
  }
};

const upsertLocalVisitor = async (payload: VisitorPayload): Promise<{ totalVisitors: number; isNew: boolean }> => {
  const analytics = await readAnalyticsLocal();
  const now = getNow();
  const visitorId = payload.visitorId?.trim() || `anon-${Math.random().toString(36).slice(2)}`;
  const existing = analytics.visitors.find((visitor) => visitor.visitorId === visitorId);
  let isNew = false;

  if (existing) {
    existing.lastVisit = now;
    existing.visitCount = (existing.visitCount || 0) + 1;
    existing.data = { ...existing.data, ...payload };
  } else {
    analytics.visitors.push({
      visitorId,
      firstVisit: now,
      lastVisit: now,
      visitCount: 1,
      data: payload,
    });
    analytics.totalVisitors = analytics.visitors.length;
    isNew = true;
  }

  await writeAnalyticsLocal(analytics);
  return { totalVisitors: analytics.totalVisitors, isNew };
};

const readAnalyticsSupabase = async (): Promise<AnalyticsStore | null> => {
  if (!supabase || !isSupabaseConfigured()) return null;

  const { data, error } = await supabase
    .from(VISITOR_TABLE)
    .select("visitor_id, first_visit, last_visit, visit_count, data")
    .order("last_visit", { ascending: false });

  if (error) {
    if (isTableMissingError(error)) {
      disableSupabase(error.message);
      return null;
    }
    console.error("Supabase analytics read failed:", error.message);
    return null;
  }

  const visitors = (data || []).map((record: SupabaseVisitorRecord) => ({
    visitorId: record.visitor_id,
    firstVisit: record.first_visit,
    lastVisit: record.last_visit,
    visitCount: record.visit_count || 0,
    data: (record.data || {}) as Partial<VisitorPayload>,
  }));

  return {
    visitors,
    totalVisitors: visitors.length,
    createdAt: getNow(),
  };
};

const upsertVisitorSupabase = async (payload: VisitorPayload): Promise<{ totalVisitors: number; isNew: boolean }> => {
  if (!supabase || !isSupabaseConfigured()) {
    return upsertLocalVisitor(payload);
  }

  const visitorId = payload.visitorId?.trim() || `anon-${Math.random().toString(36).slice(2)}`;
  const now = getNow();

  const existingRes = await supabase.from(VISITOR_TABLE).select("visitor_id, visit_count, data").eq("visitor_id", visitorId).maybeSingle();
  if (existingRes.error) {
    if (isTableMissingError(existingRes.error)) {
      disableSupabase(existingRes.error.message);
      return upsertLocalVisitor(payload);
    }
    console.error("Supabase analytics lookup failed:", existingRes.error.message);
    return upsertLocalVisitor(payload);
  }

  let isNew = false;
  if (existingRes.data) {
    const mergedData = { ...(existingRes.data.data || {}), ...payload };
    const visitCount = (existingRes.data.visit_count || 0) + 1;
    const { error: updateError } = await supabase
      .from(VISITOR_TABLE)
      .update({ last_visit: now, visit_count: visitCount, data: mergedData })
      .eq("visitor_id", visitorId);

    if (updateError) {
      console.error("Supabase analytics update failed:", updateError.message);
      return upsertLocalVisitor(payload);
    }
  } else {
    const { error: insertError } = await supabase.from(VISITOR_TABLE).insert({
      visitor_id: visitorId,
      first_visit: now,
      last_visit: now,
      visit_count: 1,
      data: payload,
    });

    if (insertError) {
      console.error("Supabase analytics insert failed:", insertError.message);
      return upsertLocalVisitor(payload);
    }
    isNew = true;
  }

  const countRes = await supabase.from(VISITOR_TABLE).select("visitor_id", { count: "exact", head: true });
  if (countRes.error) {
    if (isTableMissingError(countRes.error)) {
      disableSupabase(countRes.error.message);
      return { totalVisitors: 0, isNew };
    }
    console.error("Supabase analytics count failed:", countRes.error.message);
    return { totalVisitors: 0, isNew };
  }

  const totalVisitors = countRes.count ?? 0;
  return { totalVisitors, isNew };
};

const readAnalytics = async (): Promise<AnalyticsStore> => {
  const supabaseAnalytics = await readAnalyticsSupabase();
  if (supabaseAnalytics) return supabaseAnalytics;
  return await readAnalyticsLocal();
};

export async function GET() {
  const analytics = await readAnalytics();
  return NextResponse.json(
    {
      totalVisitors: analytics.totalVisitors,
      visitors: analytics.visitors.length,
      createdAt: analytics.createdAt,
      source: "database",
    },
    {
      headers: {
        "Cache-Control": "public, max-age=0, s-maxage=60",
      },
    }
  );
}

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as VisitorPayload;
    const visitorId = payload.visitorId?.trim() || `anon-${Math.random().toString(36).slice(2)}`;
    payload.visitorId = visitorId;
    const result = await (isSupabaseConfigured() ? upsertVisitorSupabase(payload) : upsertLocalVisitor(payload));

    return NextResponse.json(
      {
        ok: true,
        visitorId,
        totalVisitors: result.totalVisitors,
        isNew: result.isNew,
        source: "database",
      },
      {
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  } catch (error) {
    console.error("/api/analytics POST failed:", error);
    return NextResponse.json({ error: "Unable to track visitor." }, { status: 500 });
  }
}
