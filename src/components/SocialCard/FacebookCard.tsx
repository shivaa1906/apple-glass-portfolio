"use client";

// File: components/SocialCard/FacebookCard.tsx
// Description: Facebook social card with page stats and recent post preview.

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { SOCIAL_PROFILES } from "@/data/socialData";
import { CardContainer } from "./CardContainer";
import { Share2, ExternalLink, Globe } from "lucide-react";
import { FacebookIcon } from "@/components/Icons/SocialBrandIcons";
import PlatformBadge from "@/components/PlatformBadge/PlatformBadge";
import { useCardState } from "@/lib/useCardState";

// Type definition used to describe the structure of data in this component.
type FacebookProfileResponse = {
  name: string;
  username?: string;
  picture: string;
  cover?: string;
  link: string;
  followers_count?: number;
  fan_count?: number;
  posts_count?: number;
  warning?: string;
  source?: string;
};

type FacebookPost = {
  id: string;
  message?: string;
  created_time?: string;
  permalink_url?: string;
  shares?: { count?: number };
};

const formatNumber = (value: number) => new Intl.NumberFormat("en-US").format(value);

const resolveStatValue = (value: string | null | undefined) => {
  const normalized = value?.trim();
  return normalized ? normalized : "0";
};

const ensureHandle = (username: string) => {
  if (!username.trim()) return "";
  return username.startsWith("@") ? username : `@${username}`;
};

export const FacebookCard: React.FC = () => {
  const profile = SOCIAL_PROFILES.find((p) => p.id === "facebook")!;
// Core module export or function definition that implements this feature.
  const [facebookProfile, setFacebookProfile] = useState<FacebookProfileResponse | null>(null);
  const [facebookPosts, setFacebookPosts] = useState<FacebookPost[] | null>(null);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [displayFollowers, setDisplayFollowers] = useState(() => resolveStatValue(profile.stats[0].value));
  const [displayFollowing, setDisplayFollowing] = useState(() => resolveStatValue(profile.stats[1].value));
  const followerAnimationRef = useRef<number | null>(null);
  const followingAnimationRef = useRef<number | null>(null);
  const previousFollowersRef = useRef<number | null>(null);
  const previousFollowingRef = useRef<number | null>(null);

// Core module export or function definition that implements this feature.
  const animateValue = (
    from: number,
    to: number,
    setter: React.Dispatch<React.SetStateAction<string>>,
    frameRef: React.MutableRefObject<number | null>
  ) => {
    if (frameRef.current) {
      cancelAnimationFrame(frameRef.current);
    }

// Core module export or function definition that implements this feature.
    const duration = 500;
// Core module export or function definition that implements this feature.
    const startTime = performance.now();

    const step = (timestamp: number) => {
// Core module export or function definition that implements this feature.
      const progress = Math.min((timestamp - startTime) / duration, 1);
// Core module export or function definition that implements this feature.
      const current = Math.round(from + (to - from) * progress);
      setter(formatNumber(current));

      if (progress < 1) {
        frameRef.current = requestAnimationFrame(step);
      } else {
        frameRef.current = null;
      }
    };

    frameRef.current = requestAnimationFrame(step);
  };

  const fetchFacebookData = async () => {
    try {
// Core module export or function definition that implements this feature.
      const response = await fetch("/api/facebook/page", {
        cache: "no-store",
        headers: { "ngrok-skip-browser-warning": "true" },
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        const message = errorData?.error || "Unable to load Facebook page data.";
        throw new Error(message);
      }

      const data = await response.json();
      if (data?.error) {
        throw new Error(data.error);
      }
      setFacebookProfile(data);
      setFetchError(null);
    } catch (error) {
      // Log failures so we can see why client fetches fail in production.
      // This helps diagnose deploy/runtime issues (missing env, Graph API errors).
      // eslint-disable-next-line no-console
      console.error("Failed to load Facebook page:", error);
      setFetchError(error instanceof Error ? error.message : String(error));
    }
  };

  const fetchFacebookPosts = async () => {
    try {
      const resp = await fetch("/api/facebook/posts", { cache: "no-store" });
      if (!resp.ok) return;
      const d = await resp.json();
      setFacebookPosts(Array.isArray(d) ? d : null);
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    // Poll every 4-6 minutes (randomized) so updates happen regularly but not all at once.
    const pollMs = 240000 + Math.floor(Math.random() * 120000);
    const intervalId = window.setInterval(() => {
      void fetchFacebookData();
      void fetchFacebookPosts();
    }, pollMs);

    // initial load
    void fetchFacebookData();
    void fetchFacebookPosts();

    const onVisibility = () => {
      if (document.visibilityState === "visible") {
        void fetchFacebookData();
        void fetchFacebookPosts();
      }
    };
    document.addEventListener("visibilitychange", onVisibility);

// Core module export or function definition that implements this feature.
    const followerFrame = followerAnimationRef.current;
    const followingFrame = followingAnimationRef.current;

    return () => {
      window.clearInterval(intervalId);
      if (followerFrame !== null) cancelAnimationFrame(followerFrame);
      if (followingFrame !== null) cancelAnimationFrame(followingFrame);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  useEffect(() => {
    if (facebookProfile?.followers_count == null) {
      return;
    }

    const target = facebookProfile.followers_count;
    const previous = previousFollowersRef.current ?? target;
    if (previous !== target) {
      animateValue(previous, target, setDisplayFollowers, followerAnimationRef);
    } else {
      setDisplayFollowers(formatNumber(target));
    }
    previousFollowersRef.current = target;
  }, [facebookProfile?.followers_count]);

  useEffect(() => {
    if (facebookProfile?.fan_count == null) {
      return;
    }

    const target = facebookProfile.fan_count;
    const previous = previousFollowingRef.current ?? target;
    if (previous !== target) {
      animateValue(previous, target, setDisplayFollowing, followingAnimationRef);
    } else {
      setDisplayFollowing(formatNumber(target));
    }
    previousFollowingRef.current = target;
  }, [facebookProfile?.fan_count]);

// Core module export or function definition that implements this feature.
  const coverUrl = facebookProfile?.cover || (typeof profile.details?.cover === "string" ? profile.details.cover : facebookProfile?.picture || "/assets/profile_avatar1.jpg");
  const avatarUrl = facebookProfile?.picture || profile.avatar || "/assets/profile_avatar1.jpg";
  const proxied = (url?: string) => {
    if (!url) return "/assets/profile_avatar1.jpg";
    try {
      const u = new URL(url);
      if (u.protocol === "http:" || u.protocol === "https:") {
        // If this is a Facebook CDN or Graph URL, let the browser load it directly
        // (server-side proxy fetches to FB CDN often get blocked with 403). Use
        // direct URLs for hosts under fbcdn.net, facebook.com, or fbsbx.com.
        const host = u.hostname.toLowerCase();
        if (host.endsWith(".fbcdn.net") || host.endsWith("facebook.com") || host.endsWith(".fbsbx.com")) {
          return url;
        }

        // Otherwise use the server-side image proxy to avoid CORS and caching.
        try {
          const b64 = typeof window !== "undefined" ? btoa(url) : Buffer.from(url).toString("base64");
          const b64url = b64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
          return `/api/image/proxy/${encodeURIComponent(b64url)}`;
        } catch {
          return `/api/image/proxy/${encodeURIComponent(encodeURIComponent(url))}`;
        }
      }
    } catch {
      // ignore
    }
    return url;
  };
  const proxiedCover = proxied(coverUrl || "/assets/profile_avatar1.jpg");
  const proxiedAvatar = proxied(avatarUrl || "/assets/profile_avatar1.jpg");
  const cardState = useCardState();
  const displayName = facebookProfile?.name || profile.name;
  const displayHandle = facebookProfile?.username ? ensureHandle(facebookProfile.username) : profile.handle;
  const followersValue = facebookProfile?.followers_count != null ? displayFollowers : resolveStatValue(profile.stats[0].value);
  const followingValue = facebookProfile?.fan_count != null ? displayFollowing : resolveStatValue(profile.stats[1].value);
  const postsCount = facebookProfile?.posts_count != null
    ? String(facebookProfile.posts_count)
    : facebookPosts?.length != null
      ? String(facebookPosts.length)
      : resolveStatValue(profile.stats[2].value);

  // If there are live posts from the API, prefer the latest post as the featured announcement.
  const latest = Array.isArray(facebookPosts) && facebookPosts.length ? facebookPosts[0] : null;
  const featuredPostDetails = profile.details?.featuredPost as Record<string, unknown> | undefined;
  const featuredPost = latest
    ? {
        text: latest.message || "",
        date: latest.created_time || "",
        likes: "",
        shares: latest.shares?.count ? String(latest.shares.count) : "",
      }
    : {
        text: cardState.facebookAnnouncementText || (typeof featuredPostDetails?.text === "string" ? featuredPostDetails.text : ""),
        date: cardState.facebookAnnouncementDate || (typeof featuredPostDetails?.date === "string" ? featuredPostDetails.date : ""),
        likes: typeof featuredPostDetails?.likes === "string" ? featuredPostDetails.likes : "",
        shares: typeof featuredPostDetails?.shares === "string" ? featuredPostDetails.shares : "",
      };
// Core module export or function definition that implements this feature.
  const actionUrl = facebookProfile?.link || profile.actionUrl;

  return (
    <CardContainer id="facebook" accentGlow={profile.accentGlow}>
      <div className="flex flex-col h-full justify-between space-y-6">
        <div className="relative h-32 sm:h-40 w-full rounded-2xl overflow-hidden border border-white/10">
          <img
            src={proxiedCover}
            alt="Facebook Cover"
            loading="lazy"
            decoding="async"
            style={{ position: "absolute", height: "100%", width: "100%", left: 0, top: 0, right: 0, bottom: 0 }}
            className="object-cover brightness-75"
            onError={(e) => {
              const img = e.currentTarget as HTMLImageElement;
              if (!img.dataset.fallbackApplied) {
                img.dataset.fallbackApplied = "1";
                img.src = "/assets/profile_avatar1.jpg";
              }
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
            <div className="absolute bottom-3 left-4 flex items-center gap-2 text-xs font-semibold text-white/90 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full border border-white/15">
            <Globe size={13} className="text-blue-400" />
            <span>Official Tech & Design Community</span>
          </div>
            {fetchError ? (
              <div className="absolute top-2 right-2 bg-red-600/20 text-red-200 text-xs px-3 py-1 rounded">
                Failed to load Facebook data
              </div>
            ) : null}
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 -mt-10 px-2">
          <div className="flex items-center gap-4">
            <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-full p-1 bg-blue-600 shadow-xl shadow-blue-500/30 z-10 flex-shrink-0 aspect-square">
              <div className="relative w-full h-full rounded-full overflow-hidden border-2 border-black flex-shrink-0 aspect-square">
                <img
                  src={proxiedAvatar}
                  alt={displayName}
                  loading="lazy"
                  decoding="async"
                  style={{ width: "100%", height: "100%" }}
                  className="object-cover rounded-full"
                  onError={(e) => {
                    const img = e.currentTarget as HTMLImageElement;
                    if (!img.dataset.fallbackApplied) {
                      img.dataset.fallbackApplied = "1";
                      img.src = "/assets/profile_avatar1.jpg";
                    }
                  }}
                />
              </div>
            </div>
            <div className="pt-6 sm:pt-4">
              <div className="flex items-center gap-2">
                <h3 className="text-xl sm:text-2xl font-bold text-white">{displayName}</h3>
                <PlatformBadge
                  icon={<FacebookIcon size={14} />}
                  label="Facebook"
                  bg="rgba(24,119,242,0.12)"
                  border="rgba(24,119,242,0.24)"
                  shadow="0 0 18px rgba(24,119,242,0.12)"
                />
              </div>
              <p className="text-sm font-medium text-blue-400">{displayHandle}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={actionUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-2 px-6 py-3 rounded-full bg-blue-600 hover:bg-blue-500 text-white font-medium text-sm transition-all duration-300 shadow-lg shadow-blue-600/30 hover:scale-105"
            >
              <span>{profile.actionLabel}</span>
              <ExternalLink size={15} className="group-hover:translate-x-1 transition-transform" />
            </a>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 bg-white/[0.03] p-4 rounded-2xl border border-white/10 text-center">
          <div className="space-y-0.5">
            <div className="text-xl sm:text-2xl font-extrabold text-white">{followersValue}</div>
            <div className="text-xs text-white/50 uppercase tracking-wider font-semibold">Followers</div>
          </div>
          <div className="space-y-0.5">
            <div className="text-xl sm:text-2xl font-extrabold text-white">{followingValue}</div>
            <div className="text-xs text-white/50 uppercase tracking-wider font-semibold">Following</div>
          </div>
          <div className="space-y-0.5">
            <div className="text-xl sm:text-2xl font-extrabold text-white">{postsCount}</div>
            <div className="text-xs text-white/50 uppercase tracking-wider font-semibold">Posts</div>
          </div>
        </div>

        <div className="bg-white/[0.03] p-4 rounded-2xl border border-white/10 space-y-3">
          <div className="flex items-center justify-between text-xs text-white/50">
            <span className="font-semibold text-white/90">Latest Community Announcement</span>
            <span>{featuredPost?.date}</span>
          </div>
          <p className="text-sm text-white/80 leading-relaxed font-normal">
            {featuredPost?.text}
          </p>
          <div className="flex items-center gap-4 text-xs text-white/60 pt-2 border-t border-white/10">
            <span className="flex items-center gap-1.5 hover:text-blue-400 cursor-pointer">
              <Share2 size={14} />
              {featuredPost?.shares} Shares
            </span>
          </div>
        </div>
      </div>
    </CardContainer>
  );
};
