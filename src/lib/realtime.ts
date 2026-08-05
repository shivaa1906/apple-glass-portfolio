// Lightweight WebSocket helper for frontend realtime events
export const connectRealtime = (onMessage: (msg: any) => void) => {
  if (typeof window === "undefined") return () => {};

  try {
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const url = `${protocol}//${window.location.host}/ws`;
    const ws = new WebSocket(url);

    ws.addEventListener("message", (ev) => {
      try {
        const data = JSON.parse(ev.data);
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
