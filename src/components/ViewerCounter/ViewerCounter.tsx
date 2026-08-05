"use client";

import { useEffect, useState } from "react";
import { connectRealtime } from "@/lib/realtime";
import { Eye } from "lucide-react";
import { useCardState } from "@/lib/useCardState";

export const ViewerCounter = () => {
  const [count, setCount] = useState<number>(0);
  const cardState = useCardState();

  useEffect(() => {
    const fetchInitial = async () => {
      try {
        const res = await fetch("/api/analytics");
        if (res.ok) {
          const j = await res.json();
          setCount(j.totalVisitors || j.visitors || 0);
        }
      } catch {
        // ignore fetch failures
      }
    };

    void fetchInitial();
  }, []);

  useEffect(() => {
    const onVisitorUpdated = (event: Event) => {
      const customEvent = event as CustomEvent<{ totalVisitors?: number; isNew?: boolean }>;
      const { totalVisitors, isNew } = customEvent.detail || {};
      if (typeof totalVisitors === "number") {
        setCount(totalVisitors);
      } else if (isNew) {
        setCount((current) => current + 1);
      }
    };

    window.addEventListener("visitor-count-updated", onVisitorUpdated);
    const close = connectRealtime((msg) => {
      try {
        if (msg && msg.type === "analytics" && msg.data?.type === "new-visitor") {
          setCount((c) => c + 1);
        }
      } catch {
        // ignore
      }
    });

    return () => {
      window.removeEventListener("visitor-count-updated", onVisitorUpdated);
      close();
    };
  }, []);

  if (cardState.viewerCounterEnabled === false) {
    return null;
  }

  return (
    <div className="inline-flex items-center gap-2 text-white/80 text-sm">
      <Eye size={16} className="text-cyan-400" />
      <span className="font-semibold tracking-tight">{count.toLocaleString()}</span>
    </div>
  );
};
