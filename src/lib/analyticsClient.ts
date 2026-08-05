// Simple analytics client for the frontend
// Sends tracking events to configured analytics endpoint (Bot API on Render)

export type TrackPayload = {
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

import { getAnalyticsEndpoint } from "./env";
import { connectRealtime } from "./realtime";

const ENDPOINT = getAnalyticsEndpoint().replace(/\/+$/, "");

const getFingerprint = async (): Promise<string> => {
  try {
    // lightweight fingerprint from userAgent + screen + timezone + language
    const ua = navigator.userAgent || "";
    const screenRes = `${window.screen.width}x${window.screen.height}`;
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || "";
    const lang = navigator.language || "";
    const raw = `${ua}|${screenRes}|${tz}|${lang}`;
    const buf = new TextEncoder().encode(raw);
    const hashBuf = await crypto.subtle.digest("SHA-256", buf);
    const hashArr = Array.from(new Uint8Array(hashBuf));
    return hashArr.map((b) => b.toString(16).padStart(2, "0")).join("");
  } catch {
    return String(Math.random()).slice(2);
  }
};

export const useVisitorAnalytics = () => {
  const ensureVisitor = async () => {
    let vid = localStorage.getItem("visitorId");
    if (!vid) {
      vid = await getFingerprint();
      try { localStorage.setItem("visitorId", vid); } catch {}
    }
    return vid;
  };

  const track = async (payload: TrackPayload = {}) => {
    try {
      const vid = await ensureVisitor();
      const body = { visitorId: vid, ...payload };
      const response = await fetch(ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const result = await response.json().catch(() => null);
      if (result && typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent("visitor-count-updated", {
            detail: {
              totalVisitors: result.totalVisitors,
              isNew: result.isNew,
            },
          })
        );
      }
      return result;
    } catch {
      return null;
    }
  };

  const trackButton = async (name: string) => {
    return await track({ buttonClicks: { [name]: 1 } });
  };

  const trackDownload = async () => {
    return await track({ resumeDownloads: 1 });
  };

  return { track, trackButton, trackDownload, ensureVisitor };
};

export const connectAnalyticsSSE = (onEvent: (ev: unknown) => void) => {
  // Prefer WebSocket realtime channel when available
  const close = connectRealtime((msg) => {
    try {
      if (msg && msg.type === "analytics") {
        onEvent(msg.data);
      }
    } catch {
      // ignore
    }
  });

  return close;
};
