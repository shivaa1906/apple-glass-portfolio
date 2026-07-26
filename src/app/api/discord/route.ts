// File: app/api/discord/route.ts
// Description: Discord presence API route to stream or fetch current status.

import fs from "fs/promises";
import path from "path";
import { NextResponse } from "next/server";

// Core module export or function definition that implements this feature.
const CACHE_PATH = path.join(process.cwd(), "bot", "discord-presence-cache.json");

// Type definition used to describe the structure of data in this component.
type DiscordPresencePayload = {
  username: string;
  displayName: string;
  avatar: string;
  status: string;
  customStatus: string;
  activity: string;
  serverCount: string;
  servers: string[];
  botOnline: boolean;
};

// Core module export or function definition that implements this feature.
const defaultResponse: DiscordPresencePayload = {
  username: "Unknown#0000",
  displayName: "Discord User",
  avatar: "/assets/profile_avatar1.jpg",
  status: "offline",
  customStatus: "",
  activity: "",
  serverCount: "0",
  servers: [],
  botOnline: false,
};

// Type definition used to describe the structure of data in this component.
type DiscordPresencePayloadInput = DiscordPresencePayload & { avatarUrl?: string };

const normalizeState = (parsed: Partial<DiscordPresencePayloadInput>): DiscordPresencePayload => ({
  username: parsed.username || defaultResponse.username,
  displayName: parsed.displayName || defaultResponse.displayName,
  avatar: parsed.avatar || parsed.avatarUrl || defaultResponse.avatar,
  status: parsed.status || defaultResponse.status,
  customStatus: parsed.customStatus || defaultResponse.customStatus,
  activity: parsed.activity || defaultResponse.activity,
  serverCount: parsed.serverCount || defaultResponse.serverCount,
  servers: Array.isArray(parsed.servers) ? parsed.servers : defaultResponse.servers,
  botOnline: typeof parsed.botOnline === "boolean" ? parsed.botOnline : parsed.status !== "offline",
});

const readCachedPresence = async (): Promise<DiscordPresencePayload> => {
  try {
// Core module export or function definition that implements this feature.
    const raw = await fs.readFile(CACHE_PATH, "utf8");
// Core module export or function definition that implements this feature.
    const parsed = JSON.parse(raw) as Partial<DiscordPresencePayload>;
    return normalizeState(parsed);
  } catch {
    // If the local cache file doesn't exist (common on static hosts like Netlify),
    // attempt to fetch presence from a remote URL if provided via env.
    const remoteUrl = process.env.DISCORD_PRESENCE_URL;
    if (remoteUrl) {
      try {
        const resp = await fetch(remoteUrl, { cache: "no-store" });
        if (resp.ok) {
          const parsed = (await resp.json()) as Partial<DiscordPresencePayload>;
          return normalizeState(parsed);
        }
      } catch {
        // fall through to default
      }
    }

    return defaultResponse;
  }
};

const streamDiscordState = () => {
// Core module export or function definition that implements this feature.
  const encoder = new TextEncoder();
  let interval: ReturnType<typeof setInterval> | null = null;
  let closed = false;

  return new ReadableStream({
    async start(controller) {
      const sendState = async () => {
        if (closed) return;
// Core module export or function definition that implements this feature.
        const state = await readCachedPresence();
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(state)}\n\n`));
      };

      controller.enqueue(encoder.encode(`retry: 3000\n\n`));
      await sendState();

      interval = setInterval(sendState, 2000);
    },
    cancel() {
      closed = true;
      if (interval) {
        clearInterval(interval);
      }
    },
  });
};

export async function GET(request: Request) {
// Core module export or function definition that implements this feature.
  const url = new URL(request.url);
// Core module export or function definition that implements this feature.
  const streamMode = request.headers.get("accept") === "text/event-stream" || url.searchParams.get("stream") === "1";

  if (streamMode) {
    return new Response(streamDiscordState(), {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
      },
    });
  }

// Core module export or function definition that implements this feature.
  const state = await readCachedPresence();
  return NextResponse.json(state, {
    headers: {
      "Cache-Control": "public, max-age=0, s-maxage=300",
    },
  });
}
