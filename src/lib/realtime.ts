// Lightweight WebSocket helper for frontend realtime events
import { getRealtimeEndpoint } from "./env";

export type RealtimeMessage = {
  type?: string;
  data?: Record<string, unknown> | unknown[] | null;
};

export const connectRealtime = (onMessage: (msg: RealtimeMessage) => void) => {
  if (typeof window === "undefined") return () => {};

  try {
    const endpoint = getRealtimeEndpoint();
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const url = endpoint.startsWith("ws")
      ? endpoint
      : `${protocol}//${window.location.host}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;
    const ws = new WebSocket(url);

    ws.addEventListener("message", (ev) => {
      try {
        const data = JSON.parse(ev.data) as RealtimeMessage;
        onMessage(data);
      } catch {
        // ignore parse errors
      }
    });

    ws.addEventListener("close", () => {
      // no-op
    });

    return () => {
      try { ws.close(); } catch {}
    };
  } catch {
    return () => {};
  }
};
