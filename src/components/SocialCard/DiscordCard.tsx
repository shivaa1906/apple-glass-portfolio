"use client";

// File: components/SocialCard/DiscordCard.tsx
// Description: Discord social card component displaying presence and server info.

import { type FC, useEffect, useState } from "react";
import Image from "next/image";
import { SOCIAL_PROFILES } from "@/data/socialData";
import { CardContainer } from "./CardContainer";
import { Copy, ShieldCheck, Terminal } from "lucide-react";
import { DiscordIcon } from "@/components/Icons/SocialBrandIcons";
import { useCardState } from "@/lib/useCardState";

// Type definition used to describe the structure of data in this component.
type DiscordPresence = {
  username: string;
  displayName: string;
  avatar: string;
  status: string;
  customStatus: string;
  activity: string;
  serverCount: string;
  servers: string[];
  botOnline?: boolean;
};

export const DiscordCard: FC = () => {
  const profile = SOCIAL_PROFILES.find((p) => p.id === "discord")!;
// Core module export or function definition that implements this feature.
  const cardState = useCardState();
// Core module export or function definition that implements this feature.
  const [hasMounted, setHasMounted] = useState(false);
// Core module export or function definition that implements this feature.
  const [presence, setPresence] = useState<DiscordPresence>({
    username: profile.handle || "root_roy",
    displayName: profile.name || "Shiva gopi",
    avatar: profile.avatar || "/assets/profile_avatar1.jpg",
    status: "online",
    customStatus: profile.details?.customStatus || "Developing Next.js 15 Apple Glass Portfolio 🚀",
    activity: "Coding in VS Code",
    serverCount: "3",
    servers: profile.details?.servers || ["Spatial Engineers Hub", "Framer Motion Guild", "Vercel Developers"],
    botOnline: true,
  });

  useEffect(() => {
    const timeoutId = window.setTimeout(() => setHasMounted(true), 0);
    return () => window.clearTimeout(timeoutId);
  }, []);

  useEffect(() => {
    let isSubscribed = true;
    let eventSource: EventSource | null = null;
    let intervalId: number | null = null;

    const updatePresence = (data: DiscordPresence) => {
      if (!isSubscribed) return;
      setPresence((current) => ({
        ...current,
        username: data.username || current.username,
        displayName: data.displayName || current.displayName,
        avatar: data.avatar || current.avatar,
        status: data.status || current.status,
        customStatus: data.customStatus || current.customStatus,
        activity: data.activity || current.activity,
        serverCount: data.serverCount && data.serverCount !== "0" ? data.serverCount : current.serverCount,
        servers: Array.isArray(data.servers) && data.servers.length > 0 ? data.servers : current.servers,
        botOnline: data.botOnline ?? current.botOnline,
      }));
    };

    const fetchPresence = async () => {
      try {
// Core module export or function definition that implements this feature.
        const response = await fetch("/api/discord", {
          cache: "no-store",
          headers: { "ngrok-skip-browser-warning": "true" },
        });
        if (!response.ok) return;

// Core module export or function definition that implements this feature.
        const data: DiscordPresence = await response.json();
        updatePresence(data);
      } catch {
        // keep existing presence state
      }
    };

    const initEventSource = () => {
      if (typeof window === "undefined" || typeof EventSource === "undefined") {
        return null;
      }

      try {
// Core module export or function definition that implements this feature.
        const source = new EventSource("/api/discord?stream=1");

        source.onmessage = (event) => {
          try {
// Core module export or function definition that implements this feature.
            const data = JSON.parse(event.data) as DiscordPresence;
            updatePresence(data);
          } catch {
            // ignore malformed SSE payloads
          }
        };

        source.onerror = () => {
          source.close();
          if (intervalId === null && isSubscribed) {
            fetchPresence();
            intervalId = window.setInterval(fetchPresence, 30000);
          }
        };

        return source;
      } catch {
        return null;
      }
    };

    fetchPresence();
    eventSource = initEventSource();

    if (!eventSource) {
      intervalId = window.setInterval(fetchPresence, 30000);
    }

    return () => {
      isSubscribed = false;
      if (eventSource) {
        eventSource.close();
      }
      if (intervalId !== null) {
        window.clearInterval(intervalId);
      }
    };
  }, []);

// Core module export or function definition that implements this feature.
  const rawStatus = presence.status || "online";
// Core module export or function definition that implements this feature.
  const displayStatus = rawStatus === "dnd" ? "Do Not Disturb" : rawStatus === "invisible" ? "Invisible" : rawStatus.charAt(0).toUpperCase() + rawStatus.slice(1);
// Core module export or function definition that implements this feature.
  const statusDotColor =
    rawStatus === "online"
      ? "bg-emerald-500"
      : rawStatus === "idle"
      ? "bg-amber-400"
      : rawStatus === "dnd"
      ? "bg-rose-500"
      : "bg-emerald-500";
// Core module export or function definition that implements this feature.
  const statusGlowEffect =
    rawStatus === "online"
      ? "drop-shadow-[0_0_12px_rgba(16,185,129,0.8)]"
      : rawStatus === "idle"
      ? "drop-shadow-[0_0_12px_rgba(251,146,60,0.8)]"
      : rawStatus === "dnd"
      ? "drop-shadow-[0_0_12px_rgba(244,63,94,0.8)]"
      : "drop-shadow-[0_0_12px_rgba(16,185,129,0.8)]";

// Core module export or function definition that implements this feature.
  const activityText = presence.activity || (hasMounted && cardState.discordManualActivity) || "Coding in VS Code";
// Core module export or function definition that implements this feature.
  const inviteUrl = cardState.discordInviteUrl || profile.actionUrl || "https://discord.gg/zjq6VYAX7h";
// Core module export or function definition that implements this feature.
  const statusLabel = displayStatus;
// Core module export or function definition that implements this feature.
  const serverCount = presence.serverCount && presence.serverCount !== "0" ? presence.serverCount : "3";
// Core module export or function definition that implements this feature.
  const servers = presence.servers.length > 0 ? presence.servers : ["Spatial Engineers Hub", "Framer Motion Guild", "Vercel Developers"];
// Core module export or function definition that implements this feature.
  const customStatus = presence.customStatus || "Developing Next.js 15 Apple Glass Portfolio 🚀";
// Core module export or function definition that implements this feature.
  const botOnline = presence.botOnline !== false;
// Core module export or function definition that implements this feature.
  const discordBadgeClasses = botOnline
    ? "discord-loading-glow p-1.5 rounded-full bg-indigo-500/40 text-white border border-indigo-400/40 flex items-center gap-1 text-xs font-semibold px-2.5 shadow-[0_0_22px_rgba(88,101,242,0.35)]"
    : "p-1.5 rounded-full bg-indigo-500/30 text-white/80 border border-indigo-500/30 flex items-center gap-1 text-xs font-semibold px-2.5";
// Core module export or function definition that implements this feature.
  const stats = profile.stats;

  return (
    <CardContainer id="discord" accentGlow={profile.accentGlow}>
      <div className="flex flex-col h-full justify-between space-y-5 sm:space-y-6" suppressHydrationWarning>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-5 sm:pb-6 border-b border-white/10">
          <div className="flex items-center gap-3.5 sm:gap-4">
            <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-full p-1 bg-indigo-600 shadow-lg shadow-indigo-500/30 flex-shrink-0 aspect-square">
              <div className="relative w-full h-full rounded-full overflow-hidden border-2 border-black flex-shrink-0 aspect-square">
                <Image
                  src={presence.avatar || "/assets/profile_avatar1.jpg"}
                  alt={presence.displayName}
                  fill
                  sizes="80px"
                  className="object-cover rounded-full"
                />
              </div>
              <div className={`absolute bottom-0 right-0 w-5 h-5 rounded-full ${statusDotColor} border-2 border-black flex items-center justify-center flex-shrink-0 aspect-square`}>
                <span className="w-2 h-2 rounded-full bg-white animate-ping" />
              </div>
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-xl sm:text-2xl font-bold text-white">{presence.displayName}</h3>
                <span className={discordBadgeClasses}>
                  <DiscordIcon size={14} />
                  DISCORD
                </span>
              </div>
              <p className="text-sm font-medium text-indigo-300">@{presence.username}</p>
              {customStatus ? (
                <p className="text-xs text-white/70 mt-1">{customStatus}</p>
              ) : null}
              <p className="text-xs text-white/60 mt-1 max-w-lg">{profile.bio}</p>
            </div>
          </div>

          <a
            href={inviteUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex items-center gap-2 px-6 py-3 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm transition-all duration-300 shadow-lg shadow-indigo-500/30 hover:scale-105 active:scale-95"
          >
            <Copy size={16} />
            <span>Join Discord</span>
          </a>
        </div>

        <div className="bg-white/[0.03] p-4 rounded-2xl border border-white/10 space-y-2">
          <div className="flex items-center gap-2 text-xs text-indigo-200 font-semibold uppercase tracking-wide">
            <Terminal size={14} className="text-emerald-300" />
            Current Activity
          </div>
          <p className="text-sm sm:text-base text-white font-extrabold leading-tight break-words whitespace-pre-wrap">
            {activityText}
          </p>
        </div>

        <div className="grid grid-cols-3 gap-3 bg-white/[0.16] sm:bg-white/[0.03] p-4 rounded-2xl border border-white/10 text-center">
          {stats.map((stat) => (
            <div key={stat.label} className="space-y-0.5">
              <div className={`text-xl sm:text-2xl font-extrabold text-white ${
                stat.label === "Status" ? statusGlowEffect : ""
              }`}>
                {stat.label === "Status"
                  ? statusLabel
                  : stat.label === "Servers"
                  ? serverCount
                  : stat.label === "Roles"
                  ? "Admin"
                  : stat.value}
              </div>
              <div className="text-xs text-white/90 sm:text-white/50 uppercase tracking-wider font-semibold">{stat.label}</div>
            </div>
          ))}
        </div>

        <div className="space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-1.5">
            <ShieldCheck size={14} />
            Verified Communities & Badges
          </h4>
          <div className="flex flex-wrap gap-2">
            {servers.map((server, idx) => (
              <span
                key={idx}
                className="px-3.5 py-2 rounded-xl bg-white/[0.20] sm:bg-white/[0.04] border border-white/10 text-xs text-white/80 font-medium flex items-center gap-2 hover:border-indigo-500/40 transition-colors"
              >
                <span className="w-2 h-2 rounded-full bg-indigo-400" />
                {server}
              </span>
            ))}
          </div>
        </div>
      </div>
    </CardContainer>
  );
};
