// File: app/api/card-state/route.ts
// Description: API route for loading card state from the backend.
// Works on all deployment platforms (Vercel, Netlify, etc.)

import fs from "fs/promises";
import path from "path";
import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

// Type definition used to describe the structure of data in this component.
type CardState = {
  editableWebhookUrl?: string;
  botLogsEnabled?: boolean;
  discordInviteUrl?: string;
  discordSyncEnabled?: boolean;
  discordManualActivity?: string;
  twitterFollowers?: string;
  twitterFollowing?: string;
  twitterTweets?: string;
  facebookAnnouncementText?: string;
  facebookAnnouncementDate?: string;
  linkedinConnections?: string;
  linkedinFollowers?: string;
  linkedinRecommendations?: string;
  linkedinHeadline?: string;
  linkedinHeadlineBio?: string;
  heroLocation?: string;
  heroEmail?: string;
  heroStatus?: string;
  botLogChannelId?: string;
  adminUserIds?: string[];
  viewerCounterEnabled?: boolean;
};

// Core module export or function definition that implements this feature.
const STATE_PATH = path.join(process.cwd(), "bot", "card-state.json");

// Initialize Supabase (priority for deployment)
const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = supabaseUrl && supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey) : null;

// Default state - guaranteed to always have these values
const DEFAULT_STATE: CardState = {
  editableWebhookUrl: "",
  botLogsEnabled: true,
  discordInviteUrl: "https://discord.gg",
  discordSyncEnabled: true,
  discordManualActivity: "",
  twitterFollowers: "0",
  twitterFollowing: "0",
  twitterTweets: "0",
  facebookAnnouncementText: "Welcome to our latest community update. Join us for new tutorials and design conversations!",
  facebookAnnouncementDate: "July 22, 2026",
  linkedinConnections: "19",
  linkedinFollowers: "0",
  linkedinRecommendations: "0",
  linkedinHeadline: "Frontend Developer | React & Next.js Developer | Spatial Computing Enthusiast",
  linkedinHeadlineBio: "Passionate about building modern web applications, interactive 3D experiences, and continuously learning React, Next.js, and modern web technologies.",
  heroLocation: "",
  botLogChannelId: "",
  adminUserIds: [],
  viewerCounterEnabled: true,
  heroEmail: "",
  heroStatus: "Available",
};

/**
 * Read from local file (development/self-hosted only)
 */
const readLocalFile = async (): Promise<CardState | null> => {
  try {
    const raw = await fs.readFile(STATE_PATH, "utf8");
    const parsed = JSON.parse(raw) as CardState;
    
    // Merge with defaults, but skip empty values
    // This prevents empty strings from overwriting good defaults
    const cleanedParsed: Partial<CardState> = {};
    for (const [key, value] of Object.entries(parsed || {})) {
      // Only include non-empty values
      if (value !== "" && value !== null && value !== undefined) {
        cleanedParsed[key as keyof CardState] = value as never;
      }
    }
    
    return { ...DEFAULT_STATE, ...cleanedParsed };
  } catch {
    return null;
  }
};

/**
 * Read from Supabase (deployment platforms)
 */
const readSupabase = async (): Promise<CardState | null> => {
  if (!supabase) return null;

  try {
    const { data, error } = await supabase
      .from("portfolio_card_state")
      .select("value")
      .eq("id", "main")
      .maybeSingle();

    if (error) {
      console.error("Supabase error:", error.message);
      return null;
    }

    if (!data?.value) {
      return null;
    }

    const parsed = typeof data.value === "string" ? JSON.parse(data.value) : data.value;
    
    // Merge with defaults, but skip empty values from Supabase
    // This prevents empty strings from overwriting good defaults
    const cleanedParsed: Partial<CardState> = {};
    for (const [key, value] of Object.entries(parsed || {})) {
      // Only include non-empty values
      if (value !== "" && value !== null && value !== undefined) {
        cleanedParsed[key as keyof CardState] = value as never;
      }
    }
    
    return { ...DEFAULT_STATE, ...cleanedParsed };
  } catch (error) {
    console.error("Failed to read from Supabase:", error);
    return null;
  }
};

/**
 * Read state with fallback chain:
 * 1. Try Supabase (works on all platforms)
 * 2. Try local file (development)
 * 3. Return defaults (guaranteed never to fail)
 */
const readState = async (): Promise<CardState> => {
  // Try Supabase first (should work on deployment)
  if (supabase) {
    const supabaseState = await readSupabase();
    if (supabaseState) {
      console.log("✓ State loaded from Supabase");
      return supabaseState;
    }
  }

  // Fallback to local file (development)
  const localState = await readLocalFile();
  if (localState) {
    console.log("✓ State loaded from local file");
    return localState;
  }

  // Final fallback: return defaults (guaranteed to always have heroLocation & heroEmail)
  console.log("⚠ Using default state (no Supabase or local file)");
  return DEFAULT_STATE;
};

/**
 * Write state - prioritizes Supabase, falls back to file
 */
const writeState = async (state: CardState) => {
  // Try Supabase first
  if (supabase) {
    try {
      await supabase.from("portfolio_card_state").upsert({ id: "main", value: state });
      console.log("✓ State written to Supabase");
      return;
    } catch (error) {
      console.warn("Failed to write to Supabase, trying local file:", error);
    }
  }

  // Fallback to local file
  try {
    await fs.writeFile(STATE_PATH, JSON.stringify(state, null, 2), "utf8");
    console.log("✓ State written to local file");
  } catch (error) {
    console.error("Failed to write state:", error);
  }
};

export async function GET() {
  const state = await readState();
  return NextResponse.json(state, {
    headers: {
      "Cache-Control": "public, max-age=0, s-maxage=60",
    },
  });
}

export async function PATCH(request: Request) {
  try {
    // Optional security: if FRONTEND_UPDATE_SECRET is set on the server,
    // require the same value in the `x-update-secret` header for external
    // updates (this lets a deployed bot update the frontend safely).
    const configuredSecret = process.env.FRONTEND_UPDATE_SECRET;
    if (configuredSecret) {
      const incoming = request.headers.get("x-update-secret") || "";
      if (incoming !== configuredSecret) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
    }
// Core module export or function definition that implements this feature.
    const updates = (await request.json()) as Partial<CardState>;
// Core module export or function definition that implements this feature.
    const currentState = await readState();
// Core module export or function definition that implements this feature.
    const nextState = {
      ...currentState,
      ...updates,
    };
    await writeState(nextState);
    return NextResponse.json(nextState, {
      headers: {
        "Cache-Control": "public, max-age=0, s-maxage=300",
      },
    });
  } catch {
    return NextResponse.json(
      { error: "Unable to update card state." },
      { status: 500 }
    );
  }
}
