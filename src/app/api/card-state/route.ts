// File: app/api/card-state/route.ts
// Description: API route for loading card state from the backend.

import fs from "fs/promises";
import path from "path";
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
};

// Core module export or function definition that implements this feature.
const STATE_PATH = path.join(process.cwd(), "bot", "card-state.json");

// Core module export or function definition that implements this feature.
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
  heroEmail: "shivaa1906@gmail.com",
  heroStatus: "Available",
};

const readState = async (): Promise<CardState> => {
  try {
// Core module export or function definition that implements this feature.
    const raw = await fs.readFile(STATE_PATH, "utf8");
// Core module export or function definition that implements this feature.
    const parsed = JSON.parse(raw) as CardState;
    return {
      ...DEFAULT_STATE,
      ...parsed,
    };
  } catch {
    try {
      await fs.writeFile(STATE_PATH, JSON.stringify(DEFAULT_STATE, null, 2), "utf8");
    } catch {
      // ignore
    }
    return DEFAULT_STATE;
  }
};

const writeState = async (state: CardState) => {
  await fs.writeFile(STATE_PATH, JSON.stringify(state, null, 2), "utf8");
};

export async function GET() {
// Core module export or function definition that implements this feature.
  const state = await readState();
  return NextResponse.json(state, {
    headers: {
      "Cache-Control": "public, max-age=0, s-maxage=300",
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
