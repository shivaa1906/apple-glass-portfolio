"use client";

import { useEffect, useState } from "react";
import { connectAnalyticsSSE } from "@/lib/analyticsClient";

export const ViewerCounter = () => {
  const [count, setCount] = useState<number>(0);

  useEffect(() => {
    // fetch initial
    const fetchInitial = async () => {
      try {
        const base = (process.env.NEXT_PUBLIC_ANALYTICS_ENDPOINT || "").replace(/\/+$/,'');
        const url = base ? `${base}/analytics` : `/analytics`;
        const res = await fetch(url);
        if (res.ok) {
          const j = await res.json();
          setCount(j.totalVisitors || j.visitors || 0);
        }
      } catch (e) {}
    };
    void fetchInitial();

    const off = connectAnalyticsSSE((ev:any)=>{
      if (ev.type === 'new-visitor') {
        setCount((c)=>c+1);
      }
    });
    return () => off();
  }, []);

  return (
    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/6 border border-white/10 shadow-lg">
      <span className="text-2xl">👁</span>
      <span className="font-extrabold text-xl tracking-tight">{count.toLocaleString()}</span>
    </div>
  );
};
