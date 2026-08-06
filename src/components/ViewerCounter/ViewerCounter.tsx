"use client";

import { useEffect, useState } from "react";
import { connectRealtime, type RealtimeMessage } from "@/lib/realtime";
import { Eye } from "lucide-react";
import { useCardState } from "@/lib/useCardState";
import { getStoredVisitorCount, setStoredVisitorCount } from "@/lib/visitorCountStore";

export const ViewerCounter = () => {
  const [count, setCount] = useState<number>(0);
  const cardState = useCardState();

  useEffect(() => {
    const fetchInitial = async () => {
      try {
        const storedCount = getStoredVisitorCount();
        if (storedCount > 0) {
          setCount(storedCount);
        }
        
        const res = await fetch("/api/analytics", { cache: "no-store" });
        if (res.ok) {
          const j = await res.json();
          const nextCount = Number(j.totalVisitors ?? j.visitors ?? 0);
          setCount(Number.isFinite(nextCount) ? nextCount : 0);
          setStoredVisitorCount(Number.isFinite(nextCount) ? nextCount : 0);
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
        setStoredVisitorCount(totalVisitors);
      } else if (isNew) {
        setCount((current) => {
          const next = current + 1;
          setStoredVisitorCount(next);
          return next;
        });
      }
    };

    window.addEventListener("visitor-count-updated", onVisitorUpdated);
    const close = connectRealtime((msg: RealtimeMessage) => {
      try {
        if (msg.type === "analytics") {
          const data = msg.data as Record<string, unknown> | null | undefined;
          const nextCount = Number(data?.totalVisitors ?? data?.count ?? 0);
          if (Number.isFinite(nextCount) && nextCount >= 0) {
            setCount(nextCount);
            setStoredVisitorCount(nextCount);
          }
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
