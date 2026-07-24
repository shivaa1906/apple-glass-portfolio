"use client";

// File: lib/useCardState.ts
// Description: Custom hook to load shared card state from the API.

import { useEffect, useState } from "react";

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
  heroEmail: "shivaa1906@gmail.com",
  heroStatus: "Available",
};

export const useCardState = () => {
// Core module export or function definition that implements this feature.
  const [cardState, setCardState] = useState<CardState>(DEFAULT_CARD_STATE);

  useEffect(() => {
    let mounted = true;

    const loadState = async () => {
      try {
// Core module export or function definition that implements this feature.
        const response = await fetch("/api/card-state", {
          headers: { "ngrok-skip-browser-warning": "true" },
        });
        if (!response.ok) {
          return;
        }

// Core module export or function definition that implements this feature.
        const data = (await response.json()) as CardState;
        if (!mounted) return;

        setCardState((current) => ({
          ...current,
          ...data,
        }));
      } catch {
        // ignore fetch errors
      }
    };

    void loadState();

    return () => {
      mounted = false;
    };
  }, []);

  return cardState;
};
