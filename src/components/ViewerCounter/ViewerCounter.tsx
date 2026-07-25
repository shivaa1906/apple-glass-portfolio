"use client";

import { useEffect, useState } from "react";
import { Eye } from "lucide-react";
import { connectAnalyticsSSE } from "@/lib/analyticsClient";
import { useCardState } from "@/lib/useCardState";

export const ViewerCounter = () => {
  const [count, setCount] = useState<number>(0);
  const cardState = useCardState();

  useEffect(() => {
    const fetchInitial = async () => {
      try {
        const base = (process.env.NEXT_PUBLIC_ANALYTICS_ENDPOINT || "").replace(/\/+$/, "");
        const url = base ? `${base}/analytics` : "/analytics";
        const res = await fetch(url);
        if (res.ok) {
          const j = await res.json();
          setCount(j.totalVisitors || j.visitors || 0);
        }
      } catch {
        // ignore fetch failures
      }
    };

    void fetchInitial();

    const off = connectAnalyticsSSE((ev: any) => {
      if (ev?.type === "new-visitor") {
        setCount((current) => current + 1);
      }
    });

    return () => off();
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
