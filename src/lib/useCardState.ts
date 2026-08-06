"use client";

// File: lib/useCardState.ts
// Description: Custom hook to load shared card state from the API.

import { useEffect, useState } from "react";
import { connectRealtime, type RealtimeMessage } from "./realtime";

export type CardState = {
  editableWebhookUrl?: string;
  botLogsEnabled?: boolean;
  discordInviteUrl?: string;
  discordSyncEnabled?: boolean;
  discordManualActivity?: string;
  twitterFollowers?: string;
  twitterFollowing?: string;
  twitterTweets?: string;
  facebookAnnouncementText?: string;
  facebookAnnouncementDate?: string;
  linkedinConnections?: string;
  linkedinFollowers?: string;
  linkedinRecommendations?: string;
  linkedinHeadline?: string;
  linkedinHeadlineBio?: string;
  heroLocation?: string;
  heroEmail?: string;
  heroStatus?: string;
  heroStatusVisible?: boolean;
  botLogChannelId?: string;
  adminUserIds?: string[];
  viewerCounterEnabled?: boolean;
};

// Core module export or function definition that implements this feature.
const DEFAULT_CARD_STATE: CardState = {
  editableWebhookUrl: "",
  botLogsEnabled: true,
  discordInviteUrl: "https://discord.gg",
  discordSyncEnabled: true,
  discordManualActivity: "",
  twitterFollowers: "0",
  twitterFollowing: "0",
  twitterTweets: "0",
  facebookAnnouncementText:
    "Welcome to our latest community update. Join us for new tutorials and design conversations!",
  facebookAnnouncementDate: "July 22, 2026",
  linkedinConnections: "19",
  linkedinFollowers: "0",
  linkedinRecommendations: "0",
  linkedinHeadline: "Frontend Developer | React & Next.js Developer | Spatial Computing Enthusiast",
  linkedinHeadlineBio:
    "Passionate about building modern web applications, interactive 3D experiences, and continuously learning React, Next.js, and modern web technologies.",
  heroLocation: "",
  botLogChannelId: "",
  adminUserIds: [],
  viewerCounterEnabled: true,
  heroEmail: "",
  heroStatus: "",
  heroStatusVisible: true,
};

const sanitizeCardState = (state: CardState): CardState => {
  const { botLogsEnabled, botLogChannelId, editableWebhookUrl, adminUserIds, ...publicState } = state;
  return publicState;
};

const readPersistedCardState = (): CardState => {
  if (typeof window === "undefined") return DEFAULT_CARD_STATE;
  try {
    const raw = window.sessionStorage.getItem("portfolio-card-state");
    if (!raw) return DEFAULT_CARD_STATE;
    const parsed = JSON.parse(raw) as CardState;
    return { ...DEFAULT_CARD_STATE, ...sanitizeCardState(parsed) };
  } catch {
    return DEFAULT_CARD_STATE;
  }
};

export const useCardState = () => {
// Core module export or function definition that implements this feature.
  const [cardState, setCardState] = useState<CardState>(DEFAULT_CARD_STATE);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
    let mounted = true;

    const loadState = async () => {
      try {
        const response = await fetch("/api/card-state", {
          headers: { "ngrok-skip-browser-warning": "true" },
        });

        if (!response.ok) {
          const persisted = readPersistedCardState();
          if (mounted) {
            setCardState((current) => ({ ...current, ...persisted }));
          }
          return;
        }

        const data = (await response.json()) as CardState;
        if (!mounted) return;
        const publicData = sanitizeCardState(data);

        // Use the server response as the authoritative source of truth.
        // This ensures bot updates for hero location, email, status, and other fields
        // are immediately reflected in the portfolio instead of being overwritten by stale
        // session storage values.
        const cleanedData: Partial<CardState> = {};
        for (const [key, value] of Object.entries(publicData || {})) {
          if (value !== "" && value !== null && value !== undefined) {
            const typedKey = key as keyof CardState;
            if (typeof value === "string" || typeof value === "boolean" || Array.isArray(value)) {
              (cleanedData as Record<keyof CardState, unknown>)[typedKey] = value as never;
            }
          }
        }

        setCardState((current) => {
          const next = { ...current, ...cleanedData };
          try {
            window.sessionStorage.setItem("portfolio-card-state", JSON.stringify(sanitizeCardState(next)));
          } catch {}
          return next;
        });
      } catch {
        const persisted = readPersistedCardState();
        if (mounted) {
          setCardState((current) => ({ ...current, ...persisted }));
        }
      }
    };

    void loadState();

    if (mounted) {
      const persisted = readPersistedCardState();
      if (Object.keys(persisted).length > 0) {
        setCardState((current) => ({ ...current, ...persisted }));
      }
    }

    // subscribe to realtime card-state updates
    const close = connectRealtime((msg: RealtimeMessage) => {
      try {
        if (msg.type === "card-state" && msg.data) {
          const data = msg.data as Record<string, unknown>;
          setCardState((current) => {
            const next = { ...current, ...data };
            try { window.sessionStorage.setItem("portfolio-card-state", JSON.stringify(next)); } catch {}
            return next;
          });
        }
      } catch {}
    });

    return () => {
      mounted = false;
      try { close(); } catch {}
    };
  }, []);

  useEffect(() => {
    if (!hydrated || typeof window === "undefined") return;
    try {
      window.sessionStorage.setItem("portfolio-card-state", JSON.stringify(sanitizeCardState(cardState)));
    } catch {
      // ignore storage errors
    }
  }, [cardState, hydrated]);

  return cardState;
};
