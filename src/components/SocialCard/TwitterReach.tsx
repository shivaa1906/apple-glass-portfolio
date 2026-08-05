"use client";

import React from "react";
import { Eye } from "lucide-react";

export default function TwitterReach() {
  const [reach, setReach] = React.useState<number | null>(null);
  const [since, setSince] = React.useState<Date | null>(null);
  const [until, setUntil] = React.useState<Date | null>(null);

  React.useEffect(() => {
    let isMounted = true;
    const fetchReach = async () => {
      const end = new Date();
      const start = new Date();
      start.setDate(end.getDate() - 30);
      const qs = `?since=${encodeURIComponent(start.toISOString())}&until=${encodeURIComponent(end.toISOString())}`;
      try {
        const res = await fetch(`/api/twitter${qs}`, { cache: "no-store" });
        if (!res.ok) return;
        const json = await res.json();
        if (!isMounted) return;
        setReach(typeof json.profileReach === "number" ? json.profileReach : null);
        setSince(json.since ? new Date(json.since) : start);
        setUntil(json.until ? new Date(json.until) : end);
      } catch (err) {
        console.warn("Twitter reach fetch failed", err);
      }
    };
    fetchReach();
    return () => { isMounted = false; };
  }, []);

  if (reach === null || !since || !until) return null;

  return (
    <div className="text-xs text-white/50 flex items-center gap-3 mt-1">
      <span className="text-xs text-white/50">{`${since.toLocaleDateString(undefined, { month: "short", day: "numeric" })} - ${until.toLocaleDateString(undefined, { month: "short", day: "numeric" })}`}</span>
      <span className="flex items-center gap-1">
        <Eye size={14} className="text-white/60" /> {String(reach)}
      </span>
    </div>
  );
}
